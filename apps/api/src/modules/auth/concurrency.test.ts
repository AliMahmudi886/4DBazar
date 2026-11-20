import assert from "node:assert/strict";
import test from "node:test";
import { createDatabase } from "../../db/database.js";
import { createOtpChallenge, verifyOtpChallenge, ensureVerifiedUser, createSessionPair, rotateSessionPair } from "./repository.js";

const databaseUrl = process.env.FOURD_TEST_DATABASE_URL;
test("isolated PostgreSQL: OTP single consumption, attempt cap, disabled account and refresh race", { skip: !databaseUrl }, async () => {
  const url = new URL(databaseUrl!);
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit", "Never run against real application data");
  const db = createDatabase(databaseUrl!);
  const phone = `audit-${Date.now()}`;
  try {
    await createOtpChallenge(db, { phoneNumber: phone, codeHash: "fixture", expiresAt: new Date(Date.now() + 60000), maxAttempts: 5 });
    const results = await Promise.all(Array.from({ length: 12 }, () => verifyOtpChallenge(db, { phoneNumber: phone, codeHash: "fixture" })));
    assert.equal(results.filter(Boolean).length, 1);
    await createOtpChallenge(db, { phoneNumber: phone + "-wrong", codeHash: "fixture", expiresAt: new Date(Date.now() + 60000), maxAttempts: 5 });
    await Promise.all(Array.from({ length: 12 }, () => verifyOtpChallenge(db, { phoneNumber: phone + "-wrong", codeHash: "wrong" })));
    const attempts = await db.selectFrom("otp_challenges").select("attempts").where("phone_number", "=", phone + "-wrong").executeTakeFirstOrThrow();
    assert.equal(attempts.attempts, 5);
    const user = await ensureVerifiedUser(db, phone);
    await db.updateTable("users").set({ status: "suspended" }).where("id", "=", user.id).execute();
    assert.equal((await ensureVerifiedUser(db, phone)).status, "suspended");
    await db.updateTable("users").set({ status: "active" }).where("id", "=", user.id).execute();
    const session = await createSessionPair(db, user.id, `fixture-${phone}`, "test-secret");
    const refreshed = await Promise.all(Array.from({ length: 12 }, () => rotateSessionPair(db, session.refreshToken, "test-secret")));
    assert.equal(refreshed.filter(Boolean).length, 1);
    const rollbackPhone = phone + "-rollback";
    const challenge = { phoneNumber: rollbackPhone, codeHash: "fixture" };
    await createOtpChallenge(db, { ...challenge, expiresAt: new Date(Date.now() + 60000), maxAttempts: 5 });
    await assert.rejects(db.transaction().execute(async (trx) => {
      assert.equal(await verifyOtpChallenge(trx, challenge), true);
      await createSessionPair(trx, user.id, "rollback-fixture", "test-secret");
      throw new Error("simulated issuance failure");
    }), /simulated issuance failure/);
    assert.equal(await verifyOtpChallenge(db, challenge), true);
    assert.equal(await db.selectFrom("sessions").select("id").where("token_hash", "=", "rollback-fixture").executeTakeFirst(), undefined);
  } finally { await db.destroy(); }
});
