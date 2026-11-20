import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const requiredFiles = [
  "package-lock.json",
  "apps/api/dist/main.js",
  "apps/web/dist/index.html",
  "apps/web/dist/manifest.webmanifest",
  "apps/web/dist/service-worker.js"
];

const failures = [];
for (const relativePath of requiredFiles) {
  if (!existsSync(path.join(root, relativePath))) failures.push(`missing artifact: ${relativePath}`);
}

const example = readFileSync(path.join(root, ".env.example"), "utf8");
if (/VAPID_PRIVATE_KEY=(?!generate-with-npm-run-push-vapid|$)[^\r\n]+/.test(example)) {
  failures.push(".env.example must not contain a real VAPID private key");
}
if (/SMS_API_KEY=(?!$)[^\r\n]+/.test(example)) failures.push(".env.example must not contain a real SMS API key");

const strict = process.env.RELEASE_PREFLIGHT_STRICT === "1";
if (strict) {
  const requiredProductionEnv = ["DATABASE_URL", "SESSION_SECRET", "SMS_API_KEY", "VAPID_PRIVATE_KEY"];
  for (const name of requiredProductionEnv) {
    if (!process.env[name]) failures.push(`production env missing: ${name}`);
  }
  if (process.env.SESSION_SECRET === "development-secret") failures.push("production SESSION_SECRET uses development default");
  if (process.env.NODE_ENV !== "production") failures.push("strict release check requires NODE_ENV=production");
}

if (failures.length) {
  console.error("Release preflight failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Release preflight passed${strict ? " (strict production env mode)" : " (artifact and secret-hygiene mode)"}.`);
}
