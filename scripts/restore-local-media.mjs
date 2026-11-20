import { createHash } from "node:crypto";
import { cp, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const backupPath = process.env.MEDIA_BACKUP_PATH;
const targetDir = path.resolve(root, process.env.MEDIA_RESTORE_TARGET ?? "data/media");

if (!backupPath) throw new Error("MEDIA_BACKUP_PATH is required; point it to a verified backup folder.");
if (process.env.MEDIA_RESTORE_CONFIRM !== "YES") {
  throw new Error("Set MEDIA_RESTORE_CONFIRM=YES to allow restore. Existing files may be overwritten.");
}

const backupDir = path.resolve(root, backupPath);
const manifest = JSON.parse(await readFile(path.join(backupDir, "MANIFEST.json"), "utf8"));
await mkdir(targetDir, { recursive: true });

for (const entry of manifest.files) {
  const source = inside(backupDir, path.resolve(backupDir, entry.path));
  const destination = inside(targetDir, path.resolve(targetDir, entry.path));
  if (await sha256(source) !== entry.sha256) throw new Error(`Backup checksum mismatch: ${entry.path}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, { force: true });
}

for (const entry of manifest.files) {
  const destination = inside(targetDir, path.resolve(targetDir, entry.path));
  if (await sha256(destination) !== entry.sha256) throw new Error(`Restore checksum mismatch: ${entry.path}`);
}

console.log(`Media restore verified: ${targetDir}`);
console.log(`Files: ${manifest.files.length}; bytes: ${manifest.total_bytes}`);

function inside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  if (relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`Unsafe media path: ${candidate}`);
  return candidate;
}

async function sha256(file) {
  await stat(file);
  return createHash("sha256").update(await readFile(file)).digest("hex");
}
