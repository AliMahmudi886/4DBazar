import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "../config.js";
import { runSqlFiles } from "./sql-runner.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const config = loadConfig();

await runSqlFiles(config.DATABASE_URL, path.join(rootDir, "db/migrations"), true);
console.info("Migrations applied.");
