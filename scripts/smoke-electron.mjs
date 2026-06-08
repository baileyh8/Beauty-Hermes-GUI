import { spawn } from 'node:child_process';
import { existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const capturePath = path.join(tmpdir(), 'beauty-hermes-electron-smoke.png');
rmSync(capturePath, { force: true });

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron', '.'], {
  cwd: new URL('..', import.meta.url),
  env: {
    ...process.env,
    BEAUTY_HERMES_CAPTURE_PATH: capturePath,
    BEAUTY_HERMES_SKIP_GATEWAY: '1',
    ELECTRON_ENABLE_LOGGING: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let exited = false;
let exitCode = 0;

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

child.on('exit', (code, signal) => {
  exited = true;
  if (code !== 0 && signal !== 'SIGTERM') {
    exitCode = code ?? 1;
  }
});

await wait(5000);

if (exited) {
  console.error('Electron exited before smoke window was stable.');
  console.error(output.slice(0, 4000));
  process.exit(exitCode || 1);
}

if (!output.includes('[beauty-hermes] window-ready')) {
  console.error('Electron smoke did not observe a ready BrowserWindow.');
  console.error(output.slice(0, 4000));
  child.kill('SIGTERM');
  await wait(1000);
  process.exit(1);
}

if (!output.includes('[beauty-hermes] capture-ready') || !existsSync(capturePath) || statSync(capturePath).size < 10000) {
  console.error('Electron smoke did not capture a rendered window.');
  console.error(output.slice(0, 4000));
  child.kill('SIGTERM');
  await wait(1000);
  process.exit(1);
}

child.kill('SIGTERM');
await wait(1000);

if (/Security Warning|failed to install correctly|ERR_FILE_NOT_FOUND/i.test(output)) {
  console.error(output.slice(0, 4000));
  process.exit(1);
}

console.log('Electron smoke passed.');
