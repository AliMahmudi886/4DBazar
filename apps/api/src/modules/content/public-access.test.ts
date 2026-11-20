import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { createDatabase } from "../../db/database.js";
import { ensureVerifiedUser } from "../auth/repository.js";
import { assertPublicContent } from "./public-access.js";
import { addFavorite, listUserFavoriteIds, removeFavorite } from "./favorites.js";

test("isolated PostgreSQL: publication boundaries and idempotent favorites", { skip: !process.env.FOURD_TEST_DATABASE_URL }, async () => {
  const url = new URL(process.env.FOURD_TEST_DATABASE_URL!);
  assert.ok(["localhost", "127.0.0.1"].includes(url.hostname));
  assert.equal(url.pathname, "/fourd_audit");
  const db = createDatabase(url.toString());
  try {
    const owner = await ensureVerifiedUser(db, `audit-${Date.now()}`);
    const category = crypto.randomUUID();
    await db.insertInto("categories").values({ id: category, parent_id: null, slug: category, name_fa: "آزمایشی", content_types: JSON.stringify(["listing"]), sort_order: 0, is_active: true }).execute();
    const id = crypto.randomUUID();
    await db.insertInto("market_contents").values({ id, owner_user_id: owner.id, category_id: category, city_id: "00000000-0000-4000-8000-000000000101", content_type: "listing", title: "Fixture", description: "Fixture", status: "submitted", created_at: new Date(), updated_at: new Date(), deleted_at: null, expires_at: null, published_at: null, search_text: "fixture" }).execute();
    await assert.rejects(assertPublicContent(db, id));
    await db.updateTable("market_contents").set({ status: "approved" }).where("id", "=", id).execute();
    await assertPublicContent(db, id);
    await Promise.all(Array.from({ length: 8 }, () => addFavorite(db, owner.id, id)));
    assert.deepEqual(await listUserFavoriteIds(db, owner.id), [id]);
    await Promise.all([removeFavorite(db, owner.id, id), removeFavorite(db, owner.id, id)]);
    assert.deepEqual(await listUserFavoriteIds(db, owner.id), []);
    await db.updateTable("market_contents").set({ deleted_at: new Date() }).where("id", "=", id).execute();
    await assert.rejects(assertPublicContent(db, id));
    await db.updateTable("market_contents").set({ deleted_at: null, expires_at: new Date(0) }).where("id", "=", id).execute();
    await assert.rejects(assertPublicContent(db, id));
    await assert.rejects(assertPublicContent(db, "invalid-id"));
  } finally { await db.destroy(); }
});
