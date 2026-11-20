// Create a separate, allowlisted source snapshot. Never modify the working tree
// or copy its Git history, environment files, customer media or QA artifacts.
import { readdir, readFile, writeFile, mkdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const destination = path.resolve(root, 'release', 'reviewed-github-source');
const blockedDirectories = new Set(['node_modules', '.git', '.expo', '.gradle', '.cxx', 'build', 'dist', 'dist-types', 'dist-export', 'data', 'uploads', 'coverage']);
const roots = ['apps', 'packages', 'db', 'scripts', '.github', 'docs'];
const rootFiles = ['package.json', 'package-lock.json', 'tsconfig.json', 'tsconfig.base.json', '.gitignore', '.easignore', '.env.example', 'app.json', 'eas.json', 'docker-compose.yml', 'README.md', 'AGENTS.md', 'PROJECT_STATUS_FA.md'];
const textExtensions = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.css', '.html', '.md', '.sql', '.yml', '.yaml', '.xml', '.svg', '.webmanifest', '.txt', '.properties', '.gradle', '.kt', '.java', '.bat', '.pro']);
const files = [];
async function collect(relative) {
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const name = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      if (!blockedDirectories.has(entry.name)) await collect(name);
    } else if (!(/^(?:\.env(?:\..*)?|credentials\.json|google-services\.json|local\.properties)$/.test(entry.name) && entry.name !== '.env.example')
      && !/\.(?:keystore|jks|p12|pem|key|log|tsbuildinfo|apk|aab|zip|map)$/.test(entry.name)
      && !entry.name.startsWith('tmp-')
      && (textExtensions.has(path.extname(entry.name)) || ['.env.example', '.gitignore', '.easignore', 'gradlew'].includes(entry.name)
        || /^(?:apps\/mobile\/assets\/|apps\/web\/public\/)/.test(name) && /\.(png|webp|jpg|woff2?)$/.test(name)
        || name.endsWith('/gradle-wrapper.jar'))) {
      if (!name.startsWith('docs/') || name.endsWith('.md')) files.push(name);
    }
  }
}
for (const directory of roots) await collect(directory);
files.push(...rootFiles);
try { await stat(destination); throw new Error('Snapshot already exists; inspect it instead of overwriting it.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const prohibited = [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, /gh[pousr]_[A-Za-z0-9]{30,}/, /sk-[A-Za-z0-9_-]{30,}/, /AKIA[0-9A-Z]{16}/];
for (const relative of files.sort()) {
  const target = path.join(destination, relative);
  await mkdir(path.dirname(target), { recursive: true });
  const extension = path.extname(relative);
  if (textExtensions.has(extension) || path.basename(relative).startsWith('.') || relative.endsWith('/gradlew')) {
    let content = await readFile(path.join(root, relative), 'utf8');
    if (prohibited.some(pattern => pattern.test(content))) throw new Error(`Secret pattern found; export stopped: ${relative}`);
    if (relative.startsWith('docs/')) content = content.replace(/(?:\+?98|0)9\d{9}\b/g, '[REDACTED_PHONE]');
    await writeFile(target, content);
  } else await copyFile(path.join(root, relative), target);
}
console.log(`Exported ${files.length} reviewed-path files to ${destination}. Perform final secret review before committing.`);
