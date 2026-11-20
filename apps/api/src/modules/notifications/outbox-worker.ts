import type { Kysely } from "kysely";
import type { AppConfig } from "../../config.js";
import type { Database } from "../../db/types.js";
import { sendUserPushNotification } from "./push-delivery.js";
import { listPendingNotifications, markNotificationProcessing, markNotificationRetry, markNotificationSent, recoverStuckNotifications } from "./repository.js";

export async function processNotificationOutbox(db: Kysely<Database>, config: AppConfig, limit = 20) {
  const recovered = await recoverStuckNotifications(db);
  const jobs = await listPendingNotifications(db, limit);
  let processed = 0;
  for (const job of jobs) {
    if (!(await markNotificationProcessing(db, job.id))) continue;
    try {
      await sendUserPushNotification(db, config, { userId: job.user_id, title: job.title, body: job.body, tag: job.tag, ...(job.url ? { url: job.url } : {}) });
      await markNotificationSent(db, job.id);
      processed += 1;
    } catch (error) {
      const delayMs = Math.min(15 * 60_000, 30_000 * (2 ** Math.max(0, job.attempts - 1)));
      await markNotificationRetry(db, job.id, error instanceof Error ? error.message : "notification_delivery_failed", delayMs);
    }
  }
  return { recovered, claimed: jobs.length, processed };
}
