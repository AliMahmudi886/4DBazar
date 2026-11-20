import "dotenv/config";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { createDatabase } from "./database.js";
import { loadConfig } from "../config.js";
import { cleanupAnalyticsEvents } from "../modules/analytics/repository.js";

loadDotenv({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });
loadDotenv({ path: path.resolve(process.cwd(), ".env"), quiet: true });
const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);
try {
  const deleted = await cleanupAnalyticsEvents(db, config.ANALYTICS_RETENTION_DAYS);
  console.info(`Analytics cleanup deleted ${deleted} event(s).`);
} finally {
  await db.destroy();
}
