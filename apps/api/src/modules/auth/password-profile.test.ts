import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../../config.js";
import { createDatabase } from "../../db/database.js";
import { buildServer } from "../../server.js";
import { createSessionPair, ensureVerifiedUser, hashSessionToken } from "./repository.js";

test("a profile password saved with a valid session works on the next login", { skip: !process.env.FOURD_TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.FOURD_TEST_DATABASE_URL!);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit");
  const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: url.href });
  const db = createDatabase(url.href);
  const app = buildServer(config);
  try {
    const phone = `+989${String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000_000).padStart(9, "0")}`;
    const user = await ensureVerifiedUser(db, phone);
    const token = crypto.randomUUID();
    await createSessionPair(db, user.id, hashSessionToken(token, config.SESSION_SECRET), config.SESSION_SECRET);
    const password = crypto.randomUUID();
    const saved = await app.inject({
      method: "PUT", url: "/api/v1/me/profile", headers: { authorization: `Bearer ${token}` },
      payload: { first_name: "Test", last_name: "Account", primary_city_id: "00000000-0000-4000-8000-000000000101", password }
    });
    assert.equal(saved.statusCode, 200);
    assert.equal(saved.json().data.password_set, true);
    const login = await app.inject({
      method: "POST", url: "/api/v1/auth/password-login",
      payload: { phone_number: phone, password }
    });
    assert.equal(login.statusCode, 201);
    assert.ok(login.json().data.token);
  } finally {
    await app.close();
    await db.destroy();
  }
});
