import "dotenv/config";
import path from "node:path";
import { config as loadDotenv } from "dotenv";
import { createDatabase } from "./database.js";
import { loadConfig } from "../config.js";
import { cleanupOtpChallenges } from "../modules/auth/repository.js";

loadDotenv({ path: path.resolve(process.cwd(), "../../.env"), quiet: true });
loadDotenv({ path: path.resolve(process.cwd(), ".env"), quiet: true });

const config = loadConfig();
const db = createDatabase(config.DATABASE_URL);

try {
  const deleted = await cleanupOtpChallenges(db);
  console.info(`OTP cleanup deleted ${deleted} challenge(s).`);
} finally {
  await db.destroy();
}
