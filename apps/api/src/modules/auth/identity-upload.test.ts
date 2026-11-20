import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../../config.js";
import { createDatabase } from "../../db/database.js";
import { buildServer } from "../../server.js";
import { createSessionPair, ensureVerifiedUser, hashSessionToken } from "./repository.js";

test("isolated PostgreSQL: a signed-in account submits and retrieves PDF review status", { skip: !process.env.FOURD_TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.FOURD_TEST_DATABASE_URL!);
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit");
  const config = loadConfig({ NODE_ENV: "test", DATABASE_URL: url.href });
  const db = createDatabase(url.href);
  const app = buildServer(config);
  try {
    const token = crypto.randomUUID();
    const user = await ensureVerifiedUser(db, `pdf-${token.slice(0, 20)}`);
    await createSessionPair(db, user.id, hashSessionToken(token, config.SESSION_SECRET), config.SESSION_SECRET);
    const endpoint = "/api/v1/me/identity-verification";
    const pdf = Buffer.from("%PDF-1.4\n%%EOF\n");
    const payload = { document_type: "passport", document_data_url: `data:application/pdf;base64,${pdf.toString("base64")}` };
    assert.equal((await app.inject({ method: "POST", url: endpoint, payload })).statusCode, 401);
    const headers = { authorization: `Bearer ${token}` };
    const submitted = await app.inject({ method: "POST", url: endpoint, headers, payload });
    assert.equal(submitted.statusCode, 201);
    const stored = await db.selectFrom("identity_verification_requests").select(["document_data", "document_mime_type"])
      .where("id", "=", submitted.json().data.id).executeTakeFirstOrThrow();
    assert.equal(stored.document_mime_type, "application/pdf");
    assert.deepEqual(stored.document_data, pdf);
    const current = await app.inject({ url: endpoint, headers });
    assert.equal(current.json().data.status, "pending");
    assert.equal(current.json().data.document_data, undefined);
  } finally {
    await app.close();
    await db.destroy();
  }
});
