import webPush, { type PushSubscription } from "web-push";
import type { Kysely } from "kysely";
import type { AppConfig } from "../../config.js";
import type { Database } from "../../db/types.js";
import { normalizePushEndpoint } from "../../security/push-endpoint.js";
import { listDeliverableNativePushTokens, listDeliverablePushSubscriptions, revokeNativePushTokenById, revokePushSubscriptionById } from "./repository.js";

export interface PushMessageNotificationInput {
  userId: string;
  conversationId: string;
  title: string;
  body: string;
}

export interface PushNotificationInput {
  userId: string;
  title: string;
  body: string;
  tag: string;
  url?: string;
}

export interface PushDeliveryResult {
  attempted: number;
  sent: number;
  skipped: boolean;
  revoked: number;
  native_attempted: number;
  native_sent: number;
  native_revoked: number;
  native_failed: number;
}

export interface ExpoPushTicket { id?: string; status?: string; details?: { error?: string } }

export async function reconcileNativePushReceipts(db: Kysely<Database>, config: AppConfig) {
  const now = new Date();
  await db.updateTable("native_push_receipts").set({ status: "expired" })
    .where("status", "=", "pending").where("expires_at", "<=", now).execute();
  const pending = await db.selectFrom("native_push_receipts").select(["ticket_id", "token_id"])
    .where("status", "=", "pending").where("next_check_at", "<=", now)
    .orderBy("next_check_at").limit(100).execute();
  if (!pending.length) return;
  const ids = pending.map(row => row.ticket_id);
  await db.updateTable("native_push_receipts").set({ next_check_at: new Date(now.getTime() + 5 * 60_000) })
    .where("status", "=", "pending").where("ticket_id", "in", ids).execute();
  const response = await fetch(`${config.EXPO_PUSH_API_URL}/getReceipts`, {
    method: "POST", signal: AbortSignal.timeout(10000),
    headers: { "content-type": "application/json" }, body: JSON.stringify({ ids })
  }).catch(() => null);
  if (!response?.ok) return;
  const result = await response.json().catch(() => null) as { data?: Record<string, ExpoPushTicket> } | null;
  await db.transaction().execute(async trx => {
    for (const row of pending) {
      const receipt = result?.data?.[row.ticket_id];
      if (receipt?.status !== "ok" && receipt?.status !== "error") continue;
      const providerError = receipt.details?.error ?? null;
      const updated = await trx.updateTable("native_push_receipts").set({
        status: receipt.status === "ok" ? "accepted" : "error",
        provider_error: typeof providerError === "string" ? providerError.slice(0, 120) : null
      }).where("ticket_id", "=", row.ticket_id).where("status", "=", "pending").executeTakeFirst();
      if (updated.numUpdatedRows && providerError === "DeviceNotRegistered") await revokeNativePushTokenById(trx, row.token_id);
    }
  });
}

export function parseExpoPushTickets(value: unknown): ExpoPushTicket[] {
  if (!value || typeof value !== "object" || !("data" in value) || !Array.isArray(value.data)) return [];
  return value.data.filter((item): item is ExpoPushTicket => Boolean(item && typeof item === "object"));
}

export function isPushDeliveryConfigured(config: Pick<AppConfig, "VAPID_PUBLIC_KEY" | "VAPID_PRIVATE_KEY" | "VAPID_SUBJECT">) {
  return Boolean(config.VAPID_PUBLIC_KEY && config.VAPID_PRIVATE_KEY && config.VAPID_SUBJECT);
}

export async function sendMessagePushNotification(
  db: Kysely<Database>,
  config: AppConfig,
  input: PushMessageNotificationInput
): Promise<PushDeliveryResult> {
  return sendUserPushNotification(db, config, {
    userId: input.userId,
    title: "پیام جدید در 4D",
    body: `${input.title}: ${input.body}`,
    tag: input.conversationId,
    url: "/profile"
  });
}

async function sendNativePushNotifications(db: Kysely<Database>, config: AppConfig, input: PushNotificationInput) {
  const tokens = await listDeliverableNativePushTokens(db, input.userId);
  if (!tokens.length) return { attempted: 0, sent: 0, revoked: 0, failed: 0 };
  const response = await fetch(`${config.EXPO_PUSH_API_URL}/send`, {
    signal: AbortSignal.timeout(10000),
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tokens.map((item) => ({ to: item.token, title: input.title, body: input.body, sound: "default", data: { conversationId: input.tag, url: input.url ?? "/profile" } })))
  }).catch(() => null);
  if (!response?.ok) return { attempted: tokens.length, sent: 0, revoked: 0, failed: tokens.length };
  const tickets = parseExpoPushTickets(await response.json().catch(() => null));
  let sent = 0;
  let revoked = 0;
  let failed = 0;
  const receiptRows: Array<{ ticket_id: string; token_id: string }> = [];
  await Promise.all(tokens.map(async (item, index) => {
    const ticket = tickets[index];
    if (ticket?.status === "ok") sent += 1;
    if (ticket?.status === "ok" && ticket.id) receiptRows.push({ ticket_id: ticket.id, token_id: item.id });
    if (ticket?.status !== "ok") failed += 1;
    if (ticket?.details?.error === "DeviceNotRegistered") { await revokeNativePushTokenById(db, item.id); revoked += 1; }
  }));
  if (receiptRows.length) {
    const now = Date.now();
    await db.insertInto("native_push_receipts").values(receiptRows.map(row => ({
      ...row, status: "pending", provider_error: null,
      next_check_at: new Date(now + 15 * 60_000), expires_at: new Date(now + 24 * 60 * 60_000)
    }))).onConflict(conflict => conflict.column("ticket_id").doNothing()).execute();
  }
  return { attempted: tokens.length, sent, revoked, failed };
}

export async function sendUserPushNotification(
  db: Kysely<Database>,
  config: AppConfig,
  input: PushNotificationInput,
  options: { requireNativeLookup?: boolean } = {}
): Promise<PushDeliveryResult> {
  const native = await sendNativePushNotifications(db, config, input).catch((error: unknown) => {
    if (options.requireNativeLookup) throw error;
    return { attempted: 0, sent: 0, revoked: 0, failed: 0 };
  });
  if (!isPushDeliveryConfigured(config)) return { attempted: 0, sent: 0, skipped: native.attempted === 0, revoked: 0, native_attempted: native.attempted, native_sent: native.sent, native_revoked: native.revoked, native_failed: native.failed };
  webPush.setVapidDetails(config.VAPID_SUBJECT, config.VAPID_PUBLIC_KEY!, config.VAPID_PRIVATE_KEY!);
  const subscriptions = await listDeliverablePushSubscriptions(db, input.userId);
  const payload = JSON.stringify({ title: input.title, body: input.body, tag: input.tag, url: input.url ?? "/profile" });
  let sent = 0;
  let revoked = 0;

  await Promise.all(
    subscriptions.map(async (subscription) => {
      if (!normalizePushEndpoint(subscription.endpoint)) {
        await revokePushSubscriptionById(db, subscription.id);
        revoked += 1;
        return;
      }
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh!,
              auth: subscription.auth!
            }
          } satisfies PushSubscription,
          payload,
          { TTL: 60 * 60 }
        );
        sent += 1;
      } catch (error) {
        const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : 0;
        if (statusCode === 404 || statusCode === 410) {
          await revokePushSubscriptionById(db, subscription.id);
          revoked += 1;
        }
      }
    })
  );

  return { attempted: subscriptions.length, sent, skipped: false, revoked, native_attempted: native.attempted, native_sent: native.sent, native_revoked: native.revoked, native_failed: native.failed };
}
