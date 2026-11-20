const baseUrl = (process.env.HOSTED_API_BASE_URL ?? "https://api.4dbazar.ir").replace(/\/$/, "");
const webOrigin = process.env.HOSTED_WEB_ORIGIN ?? "https://4dbazar.ir";
const timeoutMs = Number(process.env.HOSTED_SMOKE_TIMEOUT_MS ?? 15000);

const checks = [
  { name: "live health", method: "GET", path: "/health/live", expected: 200, shape: (body) => body?.status === "ok" },
  { name: "ready health", method: "GET", path: "/health/ready", expected: 200, shape: (body) => ["ok", "degraded"].includes(body?.status) },
  { name: "categories", method: "GET", path: "/api/v1/categories", expected: 200, shape: (body) => Array.isArray(body?.data) },
  { name: "cities", method: "GET", path: "/api/v1/regions/4d/cities", expected: 200, shape: (body) => Array.isArray(body?.data) },
  { name: "feed", method: "GET", path: "/api/v1/feed", expected: 200, shape: (body) => Array.isArray(body?.data) },
  { name: "captcha challenge", method: "GET", path: "/api/v1/auth/captcha-challenge", expected: 200, shape: (body) => Boolean(body?.data?.challenge_id && Number.isInteger(body?.data?.target) && Number.isInteger(body?.data?.y)) }
];

let failed = 0;
for (const check of checks) {
  const result = await request(check);
  const json = result.body ? parseJson(result.body) : null;
  const shapeOk = !check.shape || check.shape(json);
  const ok = result.status === check.expected && !result.error && shapeOk;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${check.name}: HTTP ${result.status ?? "ERR"}${result.error ? ` (${result.error})` : shapeOk ? "" : " (unexpected JSON shape)"}`);
  if (result.body && process.env.HOSTED_SMOKE_VERBOSE === "1") console.log(`  ${result.body.slice(0, 400)}`);
}

function parseJson(value) {
  try { return JSON.parse(value); } catch { return null; }
}

const cors = await request({
  name: "CORS preflight",
  method: "OPTIONS",
  path: "/api/v1/me/profile",
  expected: 204,
  headers: {
    Origin: webOrigin,
    "Access-Control-Request-Method": "PUT",
    "Access-Control-Request-Headers": "content-type, authorization"
  }
});
const allowOrigin = cors.headers?.get("access-control-allow-origin");
const allowMethods = cors.headers?.get("access-control-allow-methods") ?? "";
const corsOk = cors.status === 204 && allowOrigin === webOrigin && /\bPUT\b/.test(allowMethods);
if (!corsOk) failed += 1;
console.log(`${corsOk ? "PASS" : "FAIL"} CORS preflight: HTTP ${cors.status ?? "ERR"} origin=${allowOrigin ?? "missing"}`);

if (failed) {
  console.error(`Hosted smoke failed: ${failed} check(s).`);
  process.exitCode = 1;
} else {
  console.log(`Hosted smoke passed against ${baseUrl}.`);
}

async function request(check) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: check.method,
      headers: { Accept: "application/json", ...(check.headers ?? {}) },
      signal: controller.signal
    });
    return { status: response.status, headers: response.headers, body: await response.text() };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}
