const baseUrl = (process.env.HOSTED_API_BASE_URL ?? "https://api.4dbazar.ir").replace(/\/$/, "");
const token = process.env.HOSTED_AUTH_TOKEN?.trim();
const timeoutMs = Number(process.env.HOSTED_SMOKE_TIMEOUT_MS ?? 15000);

if (!token) {
  console.error("HOSTED_AUTH_TOKEN is required. The token is read from the environment and never printed.");
  process.exit(1);
}

const checks = [
  ["authenticated user", "/api/v1/me", 200],
  ["profile", "/api/v1/me/profile", 200],
  ["my listings", "/api/v1/me/contents", 200],
  ["my conversations", "/api/v1/me/conversations", 200]
];
let failed = 0;

for (const [name, path, expected] of checks) {
  const result = await request(path);
  const ok = result.status === expected;
  if (!ok) failed += 1;
  console.log(`${ok ? "PASS" : "FAIL"} ${name}: HTTP ${result.status ?? "ERR"}${result.error ? ` (${result.error})` : ""}`);
}

if (failed) {
  console.error(`Authenticated hosted smoke failed: ${failed} check(s).`);
  process.exitCode = 1;
} else {
  console.log(`Authenticated hosted smoke passed against ${baseUrl}.`);
}

async function request(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      signal: controller.signal
    });
    return { status: response.status };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  } finally {
    clearTimeout(timer);
  }
}
