import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../../config.js";
import { createDatabase } from "../../db/database.js";
import { ensureVerifiedUser } from "../auth/repository.js";
import { reconcileNativePushReceipts } from "./push-delivery.js";

test("isolated PostgreSQL: delayed provider receipt revokes an unregistered token", { skip: !process.env.FOURD_TEST_DATABASE_URL }, async context => {
  const url = new URL(process.env.FOURD_TEST_DATABASE_URL!);
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit");
  const db = createDatabase(url.href);
  const now = new Date();
  const tokenId = crypto.randomUUID();
  const ticketId = crypto.randomUUID();
  const config = loadConfig({ NODE_ENV: "test" });
  const fetchMock = context.mock.method(globalThis, "fetch", async () => Response.json({ data: {} }));
  try {
    const user = await ensureVerifiedUser(db, `receipt-${ticketId.slice(0, 16)}`);
    await db.insertInto("native_push_tokens").values({
      id: tokenId, user_id: user.id, token: "isolated-receipt-fixture", platform: "android",
      provider: "expo", status: "active", created_at: now, updated_at: now, last_seen_at: now
    }).execute();
    await db.insertInto("native_push_receipts").values({
      ticket_id: ticketId, token_id: tokenId, status: "pending", provider_error: null,
      next_check_at: now, expires_at: new Date(now.getTime() + 60_000)
    }).execute();
    await reconcileNativePushReceipts(db, config);
    const receipt = () => db.selectFrom("native_push_receipts").selectAll().where("ticket_id", "=", ticketId).executeTakeFirstOrThrow();
    assert.equal((await receipt()).status, "pending");
    await db.updateTable("native_push_receipts").set({ next_check_at: now }).where("ticket_id", "=", ticketId).execute();
    fetchMock.mock.mockImplementation(async () => Response.json({ data: { [ticketId]: { status: "error", details: { error: "DeviceNotRegistered" } } } }));
    await reconcileNativePushReceipts(db, config);
    assert.equal((await receipt()).provider_error, "DeviceNotRegistered");
    assert.equal((await db.selectFrom("native_push_tokens").select("status").where("id", "=", tokenId).executeTakeFirstOrThrow()).status, "revoked");
  } finally {
    await db.deleteFrom("native_push_tokens").where("id", "=", tokenId).execute();
    await db.destroy();
  }
});
