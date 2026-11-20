import crypto from "node:crypto";
import type { Kysely } from "kysely";
import type { Database } from "../../db/types.js";

export interface UpsertPushSubscriptionInput {
  userId: string;
  endpoint: string;
  p256dh?: string;
  auth?: string;
  userAgent?: string;
}

export async function listActivePushSubscriptions(db: Kysely<Database>, userId: string) {
  return db
    .selectFrom("push_subscriptions")
    .select(["id", "endpoint", "status", "created_at", "updated_at"])
    .where("user_id", "=", userId)
    .where("status", "=", "active")
    .orderBy("updated_at", "desc")
    .execute();
}

export async function listDeliverablePushSubscriptions(db: Kysely<Database>, userId: string) {
  return db
    .selectFrom("push_subscriptions")
    .select(["id", "endpoint", "p256dh", "auth"])
    .where("user_id", "=", userId)
    .where("status", "=", "active")
    .where("p256dh", "is not", null)
    .where("auth", "is not", null)
    .orderBy("updated_at", "desc")
    .execute();
}

export async function upsertPushSubscription(db: Kysely<Database>, input: UpsertPushSubscriptionInput) {
  const now = new Date();

  await db
    .insertInto("push_subscriptions")
    .values({
      id: crypto.randomUUID(),
      user_id: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh ?? null,
      auth: input.auth ?? null,
      user_agent: input.userAgent ?? null,
      status: "active",
      created_at: now,
      updated_at: now
    })
    .onConflict((oc) =>
      oc.columns(["user_id", "endpoint"]).doUpdateSet({
        p256dh: input.p256dh ?? null,
        auth: input.auth ?? null,
        user_agent: input.userAgent ?? null,
        status: "active",
        updated_at: now
      })
    )
    .execute();

  return db
    .selectFrom("push_subscriptions")
    .select(["id", "endpoint", "status", "created_at", "updated_at"])
    .where("user_id", "=", input.userId)
    .where("endpoint", "=", input.endpoint)
    .executeTakeFirstOrThrow();
}

export async function revokePushSubscription(db: Kysely<Database>, userId: string, endpoint: string) {
  const now = new Date();
  await db
    .updateTable("push_subscriptions")
    .set({ status: "revoked", updated_at: now })
    .where("user_id", "=", userId)
    .where("endpoint", "=", endpoint)
    .execute();
}

export async function revokePushSubscriptionById(db: Kysely<Database>, id: string) {
  const now = new Date();
  await db
    .updateTable("push_subscriptions")
    .set({ status: "revoked", updated_at: now })
    .where("id", "=", id)
    .execute();
}

export interface UpsertNativePushTokenInput {
  userId: string;
  token: string;
  platform: string;
  provider?: string;
}

export async function upsertNativePushToken(db: Kysely<Database>, input: UpsertNativePushTokenInput) {
  const now = new Date();
  await db.insertInto("native_push_tokens").values({
    id: crypto.randomUUID(),
    user_id: input.userId,
    token: input.token,
    platform: input.platform,
    provider: input.provider ?? "expo",
    status: "active",
    last_seen_at: now,
    created_at: now,
    updated_at: now
  }).onConflict((oc) => oc.columns(["user_id", "token"]).doUpdateSet({
    platform: input.platform,
    provider: input.provider ?? "expo",
    status: "active",
    last_seen_at: now,
    updated_at: now
  })).execute();
  return db.selectFrom("native_push_tokens").select(["id", "platform", "provider", "status", "last_seen_at", "created_at", "updated_at"]).where("user_id", "=", input.userId).where("token", "=", input.token).executeTakeFirstOrThrow();
}

export async function revokeNativePushToken(db: Kysely<Database>, userId: string, token: string) {
  await db.updateTable("native_push_tokens").set({ status: "revoked", updated_at: new Date() }).where("user_id", "=", userId).where("token", "=", token).execute();
}

export async function listDeliverableNativePushTokens(db: Kysely<Database>, userId: string) {
  return db.selectFrom("native_push_tokens").select(["id", "token", "provider"]).where("user_id", "=", userId).where("status", "=", "active").orderBy("updated_at", "desc").execute();
}

export async function revokeNativePushTokenById(db: Kysely<Database>, id: string) {
  await db.updateTable("native_push_tokens").set({ status: "revoked", updated_at: new Date() }).where("id", "=", id).execute();
}

export interface EnqueueNotificationInput {
  userId: string;
  title: string;
  body: string;
  tag: string;
  url?: string;
}

export async function enqueueNotification(db: Kysely<Database>, input: EnqueueNotificationInput) {
  const now = new Date();
  return db.insertInto("notification_outbox").values({
    id: crypto.randomUUID(), user_id: input.userId, channel: "push", title: input.title,
    body: input.body, tag: input.tag, url: input.url ?? null, status: "pending", attempts: 0,
    available_at: now, locked_at: null, sent_at: null, last_error: null, created_at: now, updated_at: now
  }).returningAll().executeTakeFirstOrThrow();
}

export async function listPendingNotifications(db: Kysely<Database>, limit = 20) {
  return db.selectFrom("notification_outbox").selectAll().where("status", "=", "pending").where("available_at", "<=", new Date()).orderBy("created_at", "asc").limit(limit).execute();
}

export async function recoverStuckNotifications(db: Kysely<Database>, lockTimeoutMs = 5 * 60_000) {
  const cutoff = new Date(Date.now() - lockTimeoutMs);
  const result = await db.updateTable("notification_outbox").set({ status: "pending", locked_at: null, available_at: new Date(), last_error: "worker_lock_timeout", updated_at: new Date() }).where("status", "=", "processing").where("locked_at", "<", cutoff).returning("id").execute();
  return result.length;
}

export async function markNotificationProcessing(db: Kysely<Database>, id: string) {
  const result = await db.updateTable("notification_outbox").set({ status: "processing", locked_at: new Date(), updated_at: new Date() }).set((eb) => ({ attempts: eb("attempts", "+", 1) })).where("id", "=", id).where("status", "=", "pending").returning("id").executeTakeFirst();
  return Boolean(result);
}

export async function markNotificationSent(db: Kysely<Database>, id: string) {
  const now = new Date();
  await db.updateTable("notification_outbox").set({ status: "sent", sent_at: now, updated_at: now }).where("id", "=", id).execute();
}

export async function markNotificationRetry(db: Kysely<Database>, id: string, error: string, delayMs = 60_000) {
  const now = new Date();
  await db.updateTable("notification_outbox").set({ status: "pending", available_at: new Date(now.getTime() + delayMs), locked_at: null, last_error: error.slice(0, 500), updated_at: now }).where("id", "=", id).execute();
}

export async function getNotificationOutboxSummary(db: Kysely<Database>) {
  const counts = await db.selectFrom("notification_outbox").select(["status", db.fn.countAll<number>().as("count")]).groupBy("status").execute();
  const lastFailures = await db.selectFrom("notification_outbox").select(["id", "user_id", "attempts", "last_error", "updated_at"]).where("last_error", "is not", null).orderBy("updated_at", "desc").limit(10).execute();
  return { counts: Object.fromEntries(counts.map((item) => [item.status, Number(item.count)])), last_failures: lastFailures };
}
