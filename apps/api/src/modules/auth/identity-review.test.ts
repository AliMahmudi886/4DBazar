import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../../config.js";
import { createDatabase } from "../../db/database.js";
import { buildServer } from "../../server.js";
import { createSessionPair, ensureVerifiedUser, grantUserRole, hashSessionToken } from "./repository.js";

test("identity approval and revocation update the account after an authorized review", { skip: !process.env.FOURD_TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.FOURD_TEST_DATABASE_URL!);
  assert.ok(["127.0.0.1", "localhost"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit");
  const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: url.href });
  const db = createDatabase(url.href);
  const app = buildServer(config);

  async function session(admin = false) {
    const suffix = String(crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000_000).padStart(9, "0");
    const user = await ensureVerifiedUser(db, `+989${suffix}`);
    if (admin) await grantUserRole(db, user.id, "admin");
    const token = crypto.randomUUID();
    await createSessionPair(db, user.id, hashSessionToken(token, config.SESSION_SECRET), config.SESSION_SECRET);
    return { authorization: `Bearer ${token}` };
  }

  try {
    const applicant = await session();
    const reviewer = await session(true);
    const submitted = await app.inject({
      method: "POST", url: "/api/v1/me/identity-verification", headers: applicant,
      payload: {
        document_type: "national_card",
        document_data_url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aWQAAAABJRU5ErkJggg=="
      }
    });
    assert.equal(submitted.statusCode, 201);
    const path = `/api/v1/admin/identity-verifications/${submitted.json().data.id}/decision`;
    const decide = (headers: typeof reviewer, decision: "approve" | "revoke") =>
      app.inject({ method: "POST", url: path, headers, payload: { decision } });
    const account = () => app.inject({ method: "GET", url: "/api/v1/me", headers: applicant });

    assert.equal((await decide(applicant, "approve")).statusCode, 403);
    assert.equal((await decide(reviewer, "approve")).statusCode, 200);
    assert.equal((await account()).json().data.identity_verification_status, "verified");
    assert.equal((await decide(reviewer, "approve")).statusCode, 409);
    assert.equal((await decide(reviewer, "revoke")).statusCode, 200);
    assert.equal((await account()).json().data.identity_verification_status, "rejected");
  } finally {
    await app.close();
    await db.destroy();
  }
});
