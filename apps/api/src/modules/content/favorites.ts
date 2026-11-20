import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";
import { assertPublicContent } from "./public-access.js";

export async function listUserFavoriteIds(db: Kysely<Database>, userId: string) {
  const rows = await db.selectFrom("favorites").select("content_id").where("user_id", "=", userId).orderBy("created_at", "desc").execute();
  return rows.map((row) => row.content_id);
}

export async function addFavorite(db: Kysely<Database>, userId: string, contentId: string) {
  await assertPublicContent(db, contentId);
  await db.insertInto("favorites").values({ user_id: userId, content_id: contentId, created_at: new Date() }).onConflict((oc) => oc.columns(["user_id", "content_id"]).doNothing()).execute();
  return { content_id: contentId, is_favorite: true };
}

export async function removeFavorite(db: Kysely<Database>, userId: string, contentId: string) {
  await db.deleteFrom("favorites").where("user_id", "=", userId).where("content_id", "=", contentId).execute();
  return { content_id: contentId, is_favorite: false };
}
