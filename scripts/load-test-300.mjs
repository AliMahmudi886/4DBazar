import { mkdir, writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const baseUrl = (process.env.LOAD_TEST_BASE_URL ?? "http://127.0.0.1:4000").replace(/\/$/, "");
const maxUsers = Number(process.env.LOAD_TEST_USERS ?? 300);
const timeoutMs = Number(process.env.LOAD_TEST_TIMEOUT_MS ?? 10_000);
const stages = (process.env.LOAD_TEST_STAGES ?? "10,25,50,100,150,200,250,300").split(",").map(Number);
const holdMs = Number(process.env.LOAD_TEST_HOLD_MS ?? 5_000);
const tokens = (process.env.LOAD_TEST_TOKENS ?? "").split(",").map((value) => value.trim()).filter(Boolean);

if (!isLocalTarget(baseUrl)) {
  throw new Error(`Refusing load test target outside local/test network: ${baseUrl}`);
}
if (!Number.isInteger(maxUsers) || maxUsers < 1 || maxUsers > 300) {
  throw new Error("LOAD_TEST_USERS must be an integer between 1 and 300.");
}

const routes = [
  ["health", "/health/live"],
  ["ready", "/health/ready"],
  ["cities", "/api/v1/regions/4d/cities"],
  ["categories", "/api/v1/categories"],
  ["feed", "/api/v1/feed"],
  ["captcha", "/api/v1/auth/captcha-challenge"]
];
const allSamples = [];
const startedAt = new Date().toISOString();

console.log(`Load test target: ${baseUrl}`);
console.log(`Virtual users: ${maxUsers}; stages: ${stages.join(", ")}; authenticated tokens: ${tokens.length}`);

for (const requestedUsers of stages) {
  const users = Math.min(requestedUsers, maxUsers);
  const stageSamples = await Promise.all(Array.from({ length: users }, (_, index) => runVirtualUser(index, users)));
  allSamples.push(...stageSamples.flat());
  printStage(users, stageSamples.flat());
  if (holdMs > 0 && users < maxUsers) await delay(holdMs);
}

const report = summarize(allSamples);
await mkdir("docs/testing/results", { recursive: true });
const filename = `docs/testing/results/load-${new Date().toISOString().replaceAll(":", "-")}.json`;
await writeFile(filename, JSON.stringify({ startedAt, finishedAt: new Date().toISOString(), target: baseUrl, maxUsers, stages, report, samples: allSamples }, null, 2));
console.log(`Result JSON: ${filename}`);
console.log(`Overall: ${report.requests} requests, ${report.errors} errors, P95 ${report.p95}ms, error rate ${report.errorRate}%`);

async function runVirtualUser(userIndex, activeUsers) {
  const token = tokens.length ? tokens[userIndex % tokens.length] : "";
  const userSamples = [];
  const selected = routes.slice(0, 4 + (userIndex % 3));
  for (const [name, path] of selected) userSamples.push(await request(userIndex, activeUsers, name, path, token));
  if (token && userIndex % 3 === 0) {
    userSamples.push(await request(userIndex, activeUsers, "me", "/api/v1/me", token));
    userSamples.push(await request(userIndex, activeUsers, "my-listings", "/api/v1/me/contents", token));
    userSamples.push(await request(userIndex, activeUsers, "conversations", "/api/v1/me/conversations", token));
  }
  return userSamples;
}

async function request(userIndex, activeUsers, name, path, token) {
  const started = performance.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { accept: "application/json", "x-load-test-user": String(userIndex), "x-load-test-active-users": String(activeUsers), ...(token ? { authorization: `Bearer ${token}` } : {}) },
      signal: controller.signal
    });
    await response.arrayBuffer();
    return { userIndex, activeUsers, name, path, status: response.status, ok: response.status >= 200 && response.status < 300, durationMs: round(performance.now() - started) };
  } catch (error) {
    return { userIndex, activeUsers, name, path, status: 0, ok: false, durationMs: round(performance.now() - started), error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}

function printStage(users, samples) {
  const summary = summarize(samples);
  console.log(`Stage ${users}: ${summary.requests} requests | P50 ${summary.p50}ms | P95 ${summary.p95}ms | P99 ${summary.p99}ms | errors ${summary.errors} (${summary.errorRate}%)`);
}

function summarize(samples) {
  const durations = samples.map((sample) => sample.durationMs).sort((a, b) => a - b);
  const errors = samples.filter((sample) => !sample.ok).length;
  const serverErrors = samples.filter((sample) => sample.status >= 500 || sample.status === 0).length;
  const clientErrors = samples.filter((sample) => sample.status >= 400 && sample.status < 500).length;
  const rateLimited = samples.filter((sample) => sample.status === 429).length;
  return {
    requests: samples.length,
    errors,
    serverErrors,
    clientErrors,
    rateLimited,
    errorRate: samples.length ? round((errors / samples.length) * 100, 2) : 0,
    p50: percentile(durations, 0.5),
    p90: percentile(durations, 0.9),
    p95: percentile(durations, 0.95),
    p99: percentile(durations, 0.99)
  };
}

function percentile(values, ratio) {
  if (!values.length) return 0;
  return values[Math.min(values.length - 1, Math.ceil(values.length * ratio) - 1)];
}

function isLocalTarget(value) {
  try {
    const url = new URL(value);
    return ["127.0.0.1", "localhost", "::1"].includes(url.hostname) || url.hostname.endsWith(".test");
  } catch {
    return false;
  }
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
