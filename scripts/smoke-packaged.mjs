import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
const releaseDir = process.env.BEAUTY_HERMES_RELEASE_DIR
  ? path.resolve(process.env.BEAUTY_HERMES_RELEASE_DIR)
  : path.join(os.tmpdir(), 'beauty-hermes-gui-release');
const executable = path.join(
  releaseDir,
  `Beauty Hermes GUI-darwin-${arch}`,
  'Beauty Hermes GUI.app',
  'Contents',
  'MacOS',
  'Beauty Hermes GUI',
);
const appDir = path.join(
  releaseDir,
  `Beauty Hermes GUI-darwin-${arch}`,
  'Beauty Hermes GUI.app',
  'Contents',
  'Resources',
  'app',
);
const distIndex = path.join(appDir, 'dist', 'index.html');

if (!existsSync(executable)) {
  console.error(`Packaged executable not found: ${executable}`);
  process.exit(1);
}

if (!existsSync(distIndex)) {
  console.error(`Packaged dist index not found: ${distIndex}`);
  process.exit(1);
}

const html = readFileSync(distIndex, 'utf8');
if (/(src|href)="\/assets\//.test(html)) {
  console.error('Packaged index.html uses absolute /assets paths; this white-screens under file://.');
  process.exit(1);
}

const assetRefs = Array.from(html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g), ([, ref]) => ref);
const missingAssets = assetRefs.filter((ref) => !existsSync(path.join(appDir, 'dist', ref)));
if (missingAssets.length > 0) {
  console.error(`Packaged index.html references missing assets: ${missingAssets.join(', ')}`);
  process.exit(1);
}

const child = spawn(executable, [], {
  env: {
    ...process.env,
    BEAUTY_HERMES_SKIP_GATEWAY: '1',
    ELECTRON_ENABLE_LOGGING: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let exited = false;

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

child.on('exit', () => {
  exited = true;
});

await wait(5000);

if (exited) {
  console.error('Packaged app exited before smoke window was stable.');
  console.error(output.slice(0, 4000));
  process.exit(1);
}

child.kill('SIGTERM');
await wait(1000);

if (/Security Warning|ERR_FILE_NOT_FOUND|Uncaught/i.test(output)) {
  console.error(output.slice(0, 4000));
  process.exit(1);
}

console.log('Packaged app smoke passed.');
