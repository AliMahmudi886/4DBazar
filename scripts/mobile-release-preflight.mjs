import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const mobileRoot = path.join(root, "apps", "mobile");
const app = JSON.parse(readFileSync(path.join(mobileRoot, "app.json"), "utf8")).expo;
const eas = JSON.parse(readFileSync(path.join(mobileRoot, "eas.json"), "utf8"));
const failures = [];

if (!app?.android?.package) failures.push("Android package is missing");
if (!app?.ios?.bundleIdentifier) failures.push("iOS bundle identifier is missing");
if (!app?.extra?.eas?.projectId || app.extra.eas.projectId.includes("REPLACE")) failures.push("EAS projectId is not configured");
for (const asset of [app.icon, app.splash?.image, app.android?.adaptiveIcon?.foregroundImage]) {
  if (!asset || !existsSync(path.join(mobileRoot, asset))) failures.push(`missing mobile asset: ${asset ?? "<empty>"}`);
}

for (const [profile, config] of Object.entries(eas.build ?? {})) {
  const apiUrl = config.env?.EXPO_PUBLIC_API_BASE_URL ?? "";
  if (!/^https:\/\//.test(apiUrl) || /localhost|127\.0\.0\.1/.test(apiUrl)) {
    failures.push(`${profile} profile must use a public HTTPS API URL`);
  }
}

if (failures.length) {
  console.error("Mobile release preflight failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Mobile release preflight passed: ${app.slug} ${app.version} (Android ${app.android.versionCode}).`);
}
