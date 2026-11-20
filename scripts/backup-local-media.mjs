import { createHash } from "node:crypto";
import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const mode = process.argv[2] ?? "backup";
const root = process.cwd();
const sourceDir = path.resolve(root, process.env.MEDIA_SOURCE ?? "data/media");
const backupRoot = path.resolve(root, process.env.MEDIA_BACKUP_ROOT ?? "backups/media");

if (mode === "backup") await backup();
else if (mode === "verify") await verifyLatest();
else throw new Error("Usage: node scripts/backup-local-media.mjs [backup|verify]");

async function backup() {
  await ensureDirectory(sourceDir, "مسیر media پیدا نشد");
  const files = await listFiles(sourceDir);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const targetDir = path.join(backupRoot, timestamp);
  assertDistinct(sourceDir, targetDir);
  await mkdir(targetDir, { recursive: true });
  for (const file of files) {
    const relative = path.relative(sourceDir, file);
    const destination = path.join(targetDir, relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await cp(file, destination);
  }
  const manifest = await createManifest(targetDir);
  await writeFile(path.join(targetDir, "MANIFEST.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Media backup created: ${targetDir}`);
  console.log(`Files: ${manifest.files.length}; bytes: ${manifest.total_bytes}`);
}

async function verifyLatest() {
  const candidates = (await readdir(backupRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(backupRoot, entry.name))
    .sort()
    .reverse();
  const latest = candidates[0];
  if (!latest) throw new Error(`هیچ backupای در ${backupRoot} پیدا نشد.`);
  const manifest = JSON.parse(await readFile(path.join(latest, "MANIFEST.json"), "utf8"));
  for (const entry of manifest.files) {
    if ((await sha256(path.join(latest, entry.path))) !== entry.sha256) throw new Error(`Checksum mismatch: ${entry.path}`);
  }
  console.log(`Media backup verified: ${latest}`);
  console.log(`Files: ${manifest.files.length}; bytes: ${manifest.total_bytes}`);
}

async function createManifest(directory) {
  const files = await listFiles(directory);
  const entries = [];
  let totalBytes = 0;
  for (const file of files) {
    const relative = path.relative(directory, file).replaceAll(path.sep, "/");
    if (relative === "MANIFEST.json") continue;
    const info = await stat(file);
    totalBytes += info.size;
    entries.push({ path: relative, bytes: info.size, sha256: await sha256(file) });
  }
  return { created_at: new Date().toISOString(), source: sourceDir, total_bytes: totalBytes, files: entries };
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await listFiles(fullPath));
    else if (entry.isFile()) result.push(fullPath);
  }
  return result.sort();
}

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

async function ensureDirectory(directory, message) {
  try {
    if (!(await stat(directory)).isDirectory()) throw new Error(message);
  } catch {
    throw new Error(`${message}: ${directory}`);
  }
}

function assertDistinct(source, target) {
  const relative = path.relative(source, target);
  if (!relative.startsWith("..") && !path.isAbsolute(relative)) throw new Error("MEDIA_BACKUP_ROOT نباید داخل MEDIA_SOURCE باشد.");
}
