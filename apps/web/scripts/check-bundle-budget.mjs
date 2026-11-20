import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const assetDir = fileURLToPath(new URL("../dist/assets/", import.meta.url));
const maxJavaScriptChunkBytes = Number(process.env.WEB_MAX_JS_CHUNK_BYTES ?? 500_000);
// Keep a bounded total budget while allowing the current admin/profile route chunks.
const maxTotalJavaScriptBytes = Number(process.env.WEB_MAX_TOTAL_JS_BYTES ?? 720_000);

async function collectJavaScriptAssets() {
  try {
    const entries = await readdir(assetDir, { withFileTypes: true });
    const assets = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
        .map(async (entry) => {
          const fullPath = join(assetDir, entry.name);
          const details = await stat(fullPath);
          return { name: entry.name, bytes: details.size };
        })
    );

    return assets.sort((a, b) => b.bytes - a.bytes);
  } catch (error) {
    throw new Error("Web dist assets were not found. Run `npm run build -w @four-d/web` before bundle:check.", {
      cause: error
    });
  }
}

function formatBytes(bytes) {
  return `${Math.round(bytes / 1024)}KB`;
}

const assets = await collectJavaScriptAssets();
const largest = assets[0];
const totalJavaScriptBytes = assets.reduce((sum, asset) => sum + asset.bytes, 0);

if (!largest) {
  throw new Error("No JavaScript chunks were found in the web build output.");
}

console.log("Web JS bundle budget:");
for (const asset of assets) {
  console.log(`- ${asset.name}: ${formatBytes(asset.bytes)}`);
}
console.log(`Total JS: ${formatBytes(totalJavaScriptBytes)}`);

const failures = [];
const productionBundleText = await Promise.all(
  assets.map((asset) => readFile(join(assetDir, asset.name), "utf8"))
).then((chunks) => chunks.join("\n"));
if (/127\.0\.0\.1:4000|localhost:4000|4dbazar\.ir:4000|http:\/\/4dbazar\.ir/.test(productionBundleText)) {
  failures.push("production bundle contains a local API origin");
}
if (largest.bytes > maxJavaScriptChunkBytes) {
  failures.push(
    `largest chunk ${largest.name} is ${formatBytes(largest.bytes)}, above ${formatBytes(maxJavaScriptChunkBytes)}`
  );
}
if (totalJavaScriptBytes > maxTotalJavaScriptBytes) {
  failures.push(
    `total JS is ${formatBytes(totalJavaScriptBytes)}, above ${formatBytes(maxTotalJavaScriptBytes)}`
  );
}

if (failures.length) {
  throw new Error(`Bundle budget failed: ${failures.join("; ")}.`);
}

console.log("Bundle budget passed.");
