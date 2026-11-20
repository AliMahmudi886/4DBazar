import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

async function tests(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const lists = await Promise.all(entries.map(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? tests(filename) : filename.endsWith('.test.ts') ? [filename] : [];
  }));
  return lists.flat();
}
const files = (await Promise.all(['apps/api/src', 'packages/shared/src'].map(tests))).flat().sort();
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
