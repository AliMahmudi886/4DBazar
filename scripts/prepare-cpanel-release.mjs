import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const releaseRoot = path.join(root, "release", "cpanel");
// Keep the default aligned with the current release train; CI/deploys may still override it explicitly.
const releaseVersion = process.env.RELEASE_VERSION || "0.1.36";
const releaseDate = process.env.RELEASE_DATE || new Date().toISOString().slice(0, 10);
const releaseLabel = `v${releaseVersion}-${releaseDate}`;
const stagingRoot = path.join(releaseRoot, `.staging-${releaseLabel}`);
const webOutput = path.join(stagingRoot, "web");
const apiOutput = path.join(stagingRoot, "api");
const webZip = path.join(releaseRoot, `4d-web-${releaseLabel}.zip`);
const apiZip = path.join(releaseRoot, `4d-api-${releaseLabel}.zip`);
const manifestPath = path.join(releaseRoot, `4d-release-manifest-${releaseLabel}.txt`);
const apiBaseUrl = process.env.VITE_API_BASE_URL ?? "https://api.4dbazar.ir";

assertInsideRoot(releaseRoot);
runNpm(["run", "build"], { ...process.env, VITE_API_BASE_URL: apiBaseUrl });

// Keep prior versioned ZIPs and manifests for rollback/audit. Only this run's staging is disposable.
rmSync(stagingRoot, { recursive: true, force: true });
mkdirSync(webOutput, { recursive: true });
mkdirSync(apiOutput, { recursive: true });

copyRequired("apps/web/dist", webOutput);
copyRequired("apps/api/dist", path.join(apiOutput, "apps", "api", "dist"));
copyRequired("packages/shared/dist", path.join(apiOutput, "packages", "shared", "dist"));
copyRequired("packages/shared/package.json", path.join(apiOutput, "packages", "shared", "package.json"));
const standaloneApiServer = path.join(apiOutput, "apps", "api", "dist", "server.js");
const standaloneApiServerSource = readFileSync(standaloneApiServer, "utf8");
writeFileSync(
  standaloneApiServer,
  standaloneApiServerSource.replaceAll('from "@four-d/shared"', 'from "../../../packages/shared/dist/index.js"')
);
copyRequired("db/migrations", path.join(apiOutput, "db", "migrations"));
copyRequired("db/seeds", path.join(apiOutput, "db", "seeds"));
copyRequired("scripts/backup-local-media.mjs", path.join(apiOutput, "scripts", "backup-local-media.mjs"));
copyRequired("scripts/restore-local-media.mjs", path.join(apiOutput, "scripts", "restore-local-media.mjs"));
mkdirSync(path.join(apiOutput, "data", "media"), { recursive: true });

const apiPackage = JSON.parse(readFileSync(path.join(root, "apps", "api", "package.json"), "utf8"));
const rootLock = JSON.parse(readFileSync(path.join(root, "package-lock.json"), "utf8"));
const pinnedDependencies = Object.fromEntries(
  Object.keys(apiPackage.dependencies)
    .filter((name) => name !== "@four-d/shared")
    .map((name) => {
      const version = rootLock.packages?.[`node_modules/${name}`]?.version
        ?? rootLock.packages?.[`apps/api/node_modules/${name}`]?.version;
      if (!version) throw new Error(`Cannot pin API dependency from package-lock.json: ${name}`);
      return [name, version];
    })
);
const standalonePackage = {
  name: "four-d-api-cpanel",
  version: apiPackage.version,
  private: true,
  type: "module",
  engines: { node: ">=20" },
  scripts: {
    start: "node apps/api/dist/main.js",
    "db:migrate": "node apps/api/dist/db/migrate.js",
    "db:seed": "node apps/api/dist/db/seed.js",
    "db:cleanup:market": "node apps/api/dist/db/cleanup-market.js",
    "media:backup": "node scripts/backup-local-media.mjs backup",
    "media:verify": "node scripts/backup-local-media.mjs verify",
    "media:restore": "node scripts/restore-local-media.mjs",
    "notifications:worker": "node apps/api/dist/scripts/notifications-worker.js"
  },
  dependencies: {
    ...pinnedDependencies
  }
};

writeFileSync(path.join(apiOutput, "package.json"), `${JSON.stringify(standalonePackage, null, 2)}\n`);
writeFileSync(
  path.join(apiOutput, "ENVIRONMENT_VARIABLES_FA.txt"),
  [
    "این فایل فقط فهرست نام متغیرهاست؛ secret واقعی را داخل cPanel وارد کن.",
    "NODE_ENV=production",
    "API_HOST=0.0.0.0",
    "DATABASE_URL=<cpanel-postgresql-url>",
    "SESSION_SECRET=<long-random-secret>",
    "OTP_PROVIDER=sms",
    "SMS_VENDOR=kavenegar",
    "SMS_API_KEY=<secret>",
    "SMS_SENDER=<sender>",
    "SMS_API_IP=<optional-dns-workaround>",
    "MEDIA_STORAGE_PROVIDER=s3",
    "MEDIA_S3_BUCKET=<bucket>",
    "MEDIA_S3_REGION=<region>",
    "MEDIA_S3_ACCESS_KEY_ID=<secret>",
    "MEDIA_S3_SECRET_ACCESS_KEY=<secret>",
    "MEDIA_S3_PUBLIC_BASE_URL=<https-public-media-origin>",
    "MEDIA_STORAGE_DIR=data/media",
    "MEDIA_PUBLIC_PATH=/media",
    "VAPID_PUBLIC_KEY=<public-key>",
    "VAPID_PRIVATE_KEY=<secret>",
    "VAPID_SUBJECT=mailto:admin@4dbazar.ir",
    "CORS_ORIGINS=https://4dbazar.ir",
    "AI_PROVIDER=<optional>",
    "AI_API_URL=<optional>",
    "AVALAI_API_KEY=<optional-secret>",
    "AI_MODEL=<optional>"
  ].join("\n") + "\n"
);

createZip(webOutput, webZip);
createZip(apiOutput, apiZip);
const webZipSha256 = sha256(webZip);
const apiZipSha256 = sha256(apiZip);

const manifest = [
  "بسته انتشار cPanel بازار 4D",
  `Version: ${releaseVersion}`,
  `Release date: ${releaseDate}`,
  "",
  `Frontend API routing: ${apiBaseUrl || "same-origin /api via Apache reverse proxy"}`,
  `${path.basename(webZip)} SHA-256: ${webZipSha256}`,
  `${path.basename(apiZip)} SHA-256: ${apiZipSha256}`,
  "",
  "1) وب:",
  `   ${path.basename(webZip)} را داخل public_html هاست وب extract و محتویات قبلی build را جایگزین کن.`,
  "   فایل مخفی .htaccess هم باید آپلود شود.",
  "",
  "2) API:",
  `   ${path.basename(apiZip)} را داخل /home/a4dbazarir/4d-api extract و فایل‌های هم‌نام را جایگزین کن.`,
  "   پوشه data/media موجود روی سرور را حذف نکن؛ عکس‌های قبلی آنجاست.",
  "   startup file در cPanel: apps/api/dist/main.js",
  "   بعد از آپلود: npm install --omit=dev، سپس Restart App.",
  "   migration فقط وقتی db/migrations تغییر کرده اجرا شود: npm run db:migrate",
  "",
  "3) آپلود نکن:",
  "   فایل .env واقعی، node_modules محلی، سورس TypeScript، پوشه apps/web/src و کل repository.",
  "",
  "4) تست نهایی:",
  "   https://api.4dbazar.ir/health/live => {\"status\":\"ok\"}",
  "   https://api.4dbazar.ir/health/ready => database ok",
  "   Chrome DevTools > Application > Service Workers > Update (فقط اولین انتشار این نسخه)."
].join("\n");
writeFileSync(manifestPath, `${manifest}\n`);
rmSync(stagingRoot, { recursive: true, force: true });

console.log(
  `cPanel release prepared:\n- ${webOutput}\n- ${apiOutput}\n- ${webZip}\n- ${apiZip}\n- ${manifestPath}`
);

function copyRequired(relativeSource, target) {
  const source = path.join(root, relativeSource);
  if (!existsSync(source)) throw new Error(`Missing build input: ${relativeSource}`);
  mkdirSync(path.dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}

function runNpm(args, env) {
  runNpmCommand(root, args, env);
}

function runNpmCommand(cwd, args, env) {
  if (process.platform === "win32") {
    execFileSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], {
      cwd,
      env,
      stdio: "inherit"
    });
    return;
  }
  execFileSync("npm", args, { cwd, env, stdio: "inherit" });
}

function assertInsideRoot(target) {
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe release path: ${target}`);
  }
}

function createZip(sourceDirectory, outputFile) {
  assertInsideRoot(sourceDirectory);
  assertInsideRoot(outputFile);

  if (process.platform === "win32") {
    const escapedSource = sourceDirectory.replaceAll("'", "''");
    const escapedOutput = outputFile.replaceAll("'", "''");
    execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        `Compress-Archive -Path '${escapedSource}\\*' -DestinationPath '${escapedOutput}' -CompressionLevel Optimal -Force`
      ],
      { stdio: "inherit" }
    );
    return;
  }

  execFileSync("zip", ["-q", "-r", outputFile, "."], { cwd: sourceDirectory, stdio: "inherit" });
}

function sha256(filePath) {
  return createHash("sha256").update(readFileSync(filePath)).digest("hex");
}
