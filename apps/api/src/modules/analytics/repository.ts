import crypto from "node:crypto";
import { sql, type Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface AnalyticsEventInput {
  actorUserId?: string;
  eventName: "listing_view" | "favorite_added" | "contact_started";
  targetType?: "listing" | "user";
  targetId?: string;
  metadata?: Record<string, unknown>;
}

export async function recordAnalyticsEvent(db: Kysely<Database>, input: AnalyticsEventInput) {
  if (input.actorUserId) {
    const preference = await db.selectFrom("analytics_preferences").select("allow_personalized_events").where("user_id", "=", input.actorUserId).executeTakeFirst();
    if (preference && !preference.allow_personalized_events) return;
  }
  await db.insertInto("analytics_events").values({
    id: crypto.randomUUID(),
    actor_user_id: input.actorUserId ?? null,
    event_name: input.eventName,
    target_type: input.targetType ?? null,
    target_id: input.targetId ?? null,
    metadata_json: input.metadata ?? null,
    created_at: new Date()
  }).execute();
}

const LISTING_VIEW_WINDOW_MS = 24 * 60 * 60 * 1000;

export async function recordListingView(db: Kysely<Database>, input: { contentId: string; actorUserId?: string; viewerHash: string }) {
  return db.transaction().execute(async (trx) => {
    const content = await trx.selectFrom("market_contents").select(["owner_user_id"]).where("id", "=", input.contentId).where("deleted_at", "is", null).executeTakeFirst();
    if (!content || (input.actorUserId && content.owner_user_id === input.actorUserId)) return false;

    const lockKey = `listing-view:${input.contentId}:${input.viewerHash}`;
    await sql`select pg_advisory_xact_lock(hashtext(${lockKey}))`.execute(trx);
    const cutoff = new Date(Date.now() - LISTING_VIEW_WINDOW_MS);
    const recent = await trx.selectFrom("analytics_events")
      .select("id")
      .where("event_name", "=", "listing_view")
      .where("target_type", "=", "listing")
      .where("target_id", "=", input.contentId)
      .where("created_at", ">=", cutoff)
      .where(sql<boolean>`metadata_json->>'viewer_hash' = ${input.viewerHash}`)
      .executeTakeFirst();
    if (recent) return false;

    await trx.insertInto("analytics_events").values({
      id: crypto.randomUUID(), actor_user_id: input.actorUserId ?? null, event_name: "listing_view",
      target_type: "listing", target_id: input.contentId, metadata_json: { viewer_hash: input.viewerHash }, created_at: new Date()
    }).execute();
    return true;
  });
}

export async function getAnalyticsPreferences(db: Kysely<Database>, userId: string) {
  const row = await db.selectFrom("analytics_preferences").selectAll().where("user_id", "=", userId).executeTakeFirst();
  return { allow_personalized_events: row?.allow_personalized_events ?? true };
}

export async function setAnalyticsPreferences(db: Kysely<Database>, userId: string, allowPersonalizedEvents: boolean) {
  await db.insertInto("analytics_preferences").values({ user_id: userId, allow_personalized_events: allowPersonalizedEvents, updated_at: new Date() })
    .onConflict((oc) => oc.column("user_id").doUpdateSet({ allow_personalized_events: allowPersonalizedEvents, updated_at: new Date() })).execute();
  return getAnalyticsPreferences(db, userId);
}

export async function deleteUserAnalyticsEvents(db: Kysely<Database>, userId: string) {
  const result = await db.deleteFrom("analytics_events").where("actor_user_id", "=", userId).executeTakeFirst();
  return Number(result.numDeletedRows);
}

export async function getOwnerAnalyticsSummary(db: Kysely<Database>, userId: string) {
  const rows = await db.selectFrom("analytics_events").innerJoin("market_contents", "market_contents.id", "analytics_events.target_id")
    .select(["analytics_events.event_name", "analytics_events.target_id", "market_contents.title", (eb) => eb.fn.countAll<number>().as("count")])
    .where("market_contents.owner_user_id", "=", userId).where("analytics_events.target_type", "=", "listing")
    .groupBy(["analytics_events.event_name", "analytics_events.target_id", "market_contents.title"]).execute();
  const byListing = new Map<string, { id: string; title: string; views: number; favorites: number; contacts: number }>();
  for (const row of rows) {
    if (!row.target_id) continue;
    const current = byListing.get(row.target_id) ?? { id: row.target_id, title: row.title, views: 0, favorites: 0, contacts: 0 };
    if (row.event_name === "listing_view") current.views = Number(row.count);
    if (row.event_name === "favorite_added") current.favorites = Number(row.count);
    if (row.event_name === "contact_started") current.contacts = Number(row.count);
    byListing.set(row.target_id, current);
  }
  const listings = [...byListing.values()].sort((a, b) => (b.contacts - a.contacts) || (b.views - a.views));
  return { totals: listings.reduce((total, listing) => ({ views: total.views + listing.views, favorites: total.favorites + listing.favorites, contacts: total.contacts + listing.contacts }), { views: 0, favorites: 0, contacts: 0 }), listings };
}

export async function cleanupAnalyticsEvents(db: Kysely<Database>, retentionDays: number) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const result = await db.deleteFrom("analytics_events").where("created_at", "<", cutoff).executeTakeFirst();
  return Number(result.numDeletedRows);
}
