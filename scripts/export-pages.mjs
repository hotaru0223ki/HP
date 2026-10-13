import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

// GitHub Pages serves main / (root). Keep editable sources and dist, and
// put an identical copy of only the generated site at the publishing root.
const root = fileURLToPath(new URL('../', import.meta.url));
const env = { ...process.env, SITE_BASE_PATH: process.env.SITE_BASE_PATH || '/HP/' };
for (const script of ['build.mjs', 'check.mjs']) {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', script)], { cwd: root, env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const files = [
  'index.html', 'tomoshibi.html', 'hanabi.html', 'sony.html', '404.html', '.nojekyll',
  'assets/styles.css', 'assets/navigation.js', 'assets/intro-index.svg'
];
for (const file of files) {
  await mkdir(path.dirname(path.join(root, file)), { recursive: true });
  await copyFile(path.join(root, 'dist', file), path.join(root, file));
  assert.deepEqual(await readFile(path.join(root, file)), await readFile(path.join(root, 'dist', file)), `${file}: Pages export`);
}
console.log('Pages export complete: publishing root matches dist (9 files)');
