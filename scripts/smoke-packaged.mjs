import { existsSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
const releaseDir = process.env.BEAUTY_HERMES_RELEASE_DIR
  ? path.resolve(process.env.BEAUTY_HERMES_RELEASE_DIR)
  : path.join(os.tmpdir(), 'beauty-hermes-gui-release');
const packagePlatform = process.env.BEAUTY_HERMES_PACKAGE_PLATFORM || process.platform;
const supportedPackagePlatforms = new Set(['darwin', 'win32']);
if (!supportedPackagePlatforms.has(packagePlatform)) {
  console.error(`Unsupported packaged smoke platform: ${packagePlatform}`);
  process.exit(1);
}
const appName = 'Beauty Hermes GUI';
const windowsExecutableName = 'Beauty Hermes GUI.exe';
const packageJson = JSON.parse(readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
const version = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';
const packageRoot = path.join(releaseDir, `${appName}-${packagePlatform}-${arch}`);

function pathsFromPackageRoot(root) {
  return packagePlatform === 'win32'
    ? {
        executable: path.join(root, windowsExecutableName),
        appDir: path.join(root, 'resources', 'app'),
      }
    : {
        executable: path.join(root, `${appName}.app`, 'Contents', 'MacOS', appName),
        appDir: path.join(root, `${appName}.app`, 'Contents', 'Resources', 'app'),
      };
}

function pathsFromExtractedZip(root) {
  return packagePlatform === 'win32'
    ? {
        executable: path.join(root, windowsExecutableName),
        appDir: path.join(root, 'resources', 'app'),
      }
    : {
        executable: path.join(root, `${appName}.app`, 'Contents', 'MacOS', appName),
        appDir: path.join(root, `${appName}.app`, 'Contents', 'Resources', 'app'),
      };
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: 'pipe',
    encoding: 'utf8',
    shell: packagePlatform === 'win32' && command.endsWith('.ps1'),
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 4000);
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`);
  }

  return result;
}

let { executable, appDir } = pathsFromPackageRoot(packageRoot);
let extractedRoot = '';

if (!existsSync(executable)) {
  const zipName = packagePlatform === 'win32'
    ? `${appName.replace(/\s+/g, '-')}-${version}-windows-${arch}.zip`
    : `${appName.replace(/\s+/g, '-')}-${version}-mac-${arch}.zip`;
  const zipPath = path.join(releaseDir, zipName);

  if (existsSync(zipPath)) {
    extractedRoot = mkdtempSync(path.join(os.tmpdir(), 'beauty-hermes-packaged-smoke-'));

    if (packagePlatform === 'win32') {
      run('powershell.exe', [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        `Expand-Archive -Path ${JSON.stringify(zipPath)} -DestinationPath ${JSON.stringify(extractedRoot)} -Force`,
      ]);
    } else {
      run('ditto', ['-x', '-k', zipPath, extractedRoot]);
    }

    ({ executable, appDir } = pathsFromExtractedZip(extractedRoot));
  }
}

const distIndex = path.join(appDir, 'dist', 'index.html');
const capturePath = path.join(os.tmpdir(), 'beauty-hermes-packaged-smoke.png');
rmSync(capturePath, { force: true });

if (!existsSync(executable)) {
  console.error(`Packaged executable not found: ${executable}`);
  process.exit(1);
}

if (!existsSync(distIndex)) {
  console.error(`Packaged dist index not found: ${distIndex}`);
  process.exit(1);
}

if (packagePlatform === 'darwin') {
  const appBundle = path.join(path.dirname(path.dirname(path.dirname(executable))));
  const verify = spawnSync('codesign', ['--verify', '--deep', '--strict', '--verbose=2', appBundle], {
    cwd: rootDir,
    stdio: 'pipe',
    encoding: 'utf8',
  });

  if (verify.status !== 0) {
    console.error([verify.stdout, verify.stderr].filter(Boolean).join('\n').slice(0, 4000));
    process.exit(1);
  }
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

const executableArgs = packagePlatform === 'win32' ? ['--disable-gpu'] : [];
const child = spawn(executable, executableArgs, {
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

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

child.on('exit', () => {
  exited = true;
});

const deadline = Date.now() + 45000;
while (
  Date.now() < deadline
  && !exited
  && (
    !output.includes('[beauty-hermes] window-ready')
    || !output.includes('[beauty-hermes] capture-ready')
    || !existsSync(capturePath)
  )
) {
  await wait(250);
}

if (exited) {
  console.error('Packaged app exited before smoke window was stable.');
  console.error(output.slice(0, 4000));
  process.exit(1);
}

if (!output.includes('[beauty-hermes] window-ready')) {
  console.error('Packaged app smoke did not observe a ready BrowserWindow.');
  console.error(output.slice(0, 4000));
  child.kill('SIGTERM');
  await wait(1000);
  process.exit(1);
}

if (!output.includes('[beauty-hermes] capture-ready') || !existsSync(capturePath) || statSync(capturePath).size < 10000) {
  console.error('Packaged app smoke did not capture a rendered window.');
  console.error(output.slice(0, 4000));
  child.kill('SIGTERM');
  await wait(1000);
  process.exit(1);
}

child.kill('SIGTERM');
await wait(1000);

if (/Security Warning|ERR_FILE_NOT_FOUND|Uncaught/i.test(output)) {
  console.error(output.slice(0, 4000));
  process.exit(1);
}

if (extractedRoot) {
  rmSync(extractedRoot, { recursive: true, force: true });
}

console.log('Packaged app smoke passed.');
