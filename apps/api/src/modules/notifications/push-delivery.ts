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
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tokens.map((item) => ({ to: item.token, title: input.title, body: input.body, sound: "default", data: { conversationId: input.tag, url: input.url ?? "/profile" } })))
  });
  if (!response.ok) throw new Error(`expo_push_http_${response.status}`);
  const tickets = parseExpoPushTickets(await response.json());
  let sent = 0;
  let revoked = 0;
  let failed = 0;
  const ticketIds: string[] = [];
  await Promise.all(tokens.map(async (item, index) => {
    const ticket = tickets[index];
    if (ticket?.status === "ok") sent += 1;
    if (ticket?.id) ticketIds.push(ticket.id);
    if (ticket?.status === "error") failed += 1;
    if (ticket?.details?.error === "DeviceNotRegistered") { await revokeNativePushTokenById(db, item.id); revoked += 1; }
  }));
  if (ticketIds.length) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const receiptResponse = await fetch(`${config.EXPO_PUSH_API_URL}/getReceipts`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: ticketIds }) });
      if (receiptResponse.ok) {
        const receipts = await receiptResponse.json() as { data?: Record<string, { status?: string; details?: { error?: string } }> };
        for (const [ticketId, receipt] of Object.entries(receipts.data ?? {})) {
          if (receipt.status === "error") failed += 1;
          if (receipt.details?.error === "DeviceNotRegistered") {
            const index = tickets.findIndex((ticket) => ticket.id === ticketId);
            const token = index >= 0 ? tokens[index] : undefined;
            if (token) { await revokeNativePushTokenById(db, token.id); revoked += 1; }
          }
        }
      }
    } catch { /* receipt polling is best-effort */ }
  }
  return { attempted: tokens.length, sent, revoked, failed };
}

export async function sendUserPushNotification(
  db: Kysely<Database>,
  config: AppConfig,
  input: PushNotificationInput
): Promise<PushDeliveryResult> {
  const native = await sendNativePushNotifications(db, config, input).catch(() => ({ attempted: 0, sent: 0, revoked: 0, failed: 0 }));
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
