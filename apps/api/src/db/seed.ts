import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { runSqlFiles } from "./sql-runner.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const config = loadConfig();
const databaseHost = new URL(config.DATABASE_URL).hostname;
if (config.NODE_ENV === "production" || !["localhost", "127.0.0.1", "::1"].includes(databaseHost) || process.env.ALLOW_DEMO_SEED !== "true") {
  throw new Error("Demo seeds require ALLOW_DEMO_SEED=true and a local non-production database");
}

await runSqlFiles(config.DATABASE_URL, path.join(rootDir, "db/seeds"), false);
console.info("Seeds applied.");
