import { loadConfig } from "../config.js";
import { createDatabase } from "../db/database.js";
import { processNotificationOutbox } from "../modules/notifications/outbox-worker.js";

const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);
const result = await processNotificationOutbox(db, config);
console.log(`Notification outbox processed: ${result.processed}/${result.claimed}; recovered: ${result.recovered}`);
await db.destroy();
