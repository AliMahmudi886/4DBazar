import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../config.js";
import { buildServer } from "../server.js";

const headers = { "x-4d-user-id": "fixture-user", "x-4d-roles": "admin,moderator", "x-4d-mobile-verified": "true" };
for (const environment of ["development", "test", "production"] as const) {
  test(`${environment} runtime rejects spoofed identity headers`, async () => {
    const config = { ...loadConfig({ NODE_ENV: "test" }), NODE_ENV: environment };
    const app = buildServer(config);
    try {
      for (const url of ["/api/v1/me", "/api/v1/admin/users", "/api/v1/admin/identity-verifications"]) {
        const response = await app.inject({ method: "GET", url, headers });
        assert.equal(response.statusCode, 401);
      }
    } finally { await app.close(); }
  });
}
test("fixture authentication cannot be enabled in development", () => {
  assert.throws(() => buildServer(loadConfig({ NODE_ENV: "development" }), { testHeaderAuth: true }), /requires NODE_ENV=test/);
});
test("fixture server rejects network listening", async () => {
  const app = buildServer(loadConfig({ NODE_ENV: "test" }), { testHeaderAuth: true });
  try { assert.throws(() => app.listen({ port: 0 }), /cannot listen/); }
  finally { await app.close(); }
});
