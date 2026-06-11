import { existsSync } from 'node:fs';
import { cp, mkdir, rename, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const releaseDir = process.env.BEAUTY_HERMES_RELEASE_DIR
  ? path.resolve(process.env.BEAUTY_HERMES_RELEASE_DIR)
  : path.join(os.tmpdir(), 'beauty-hermes-gui-release');
const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
const appName = 'Beauty Hermes GUI';
const executableName = 'Beauty Hermes GUI.exe';
const version = '0.1.0';
const appOnly = process.argv.includes('--app-only');
const electronDist = path.join(rootDir, 'node_modules', 'electron', 'dist');
const electronExe = path.join(electronDist, 'electron.exe');
const outDir = path.join(releaseDir, `${appName}-win32-${arch}`);
const outElectronExe = path.join(outDir, 'electron.exe');
const appExe = path.join(outDir, executableName);
const resourcesDir = path.join(outDir, 'resources');
const packagedAppDir = path.join(resourcesDir, 'app');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
    shell: options.shell ?? false,
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 4000);
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`);
  }

  return result;
}

if (process.platform !== 'win32') {
  throw new Error('Windows packaging must run on a Windows runner so electron.exe is available.');
}

if (!existsSync(electronExe)) {
  throw new Error(`Electron Windows runtime not found: ${electronExe}`);
}

await rm(releaseDir, { recursive: true, force: true });
await mkdir(releaseDir, { recursive: true });
await cp(electronDist, outDir, { recursive: true });
if (!existsSync(path.join(outDir, 'LICENSES.chromium.html'))) {
  throw new Error('Windows Electron runtime copy is incomplete: LICENSES.chromium.html is missing.');
}
await rm(path.join(resourcesDir, 'default_app.asar'), { force: true });
await rm(appExe, { force: true });
await rename(outElectronExe, appExe);
await rm(packagedAppDir, { recursive: true, force: true });
await mkdir(packagedAppDir, { recursive: true });
await cp(path.join(rootDir, 'dist'), path.join(packagedAppDir, 'dist'), { recursive: true });
await cp(path.join(rootDir, 'electron'), path.join(packagedAppDir, 'electron'), { recursive: true });
await writeFile(
  path.join(packagedAppDir, 'package.json'),
  JSON.stringify(
    {
      name: 'beauty-hermes-gui',
      version,
      private: true,
      main: 'electron/main.cjs',
    },
    null,
    2,
  ),
);

if (!appOnly) {
  const zipName = `${appName.replace(/\s+/g, '-')}-${version}-windows-${arch}.zip`;
  const zipPath = path.join(releaseDir, zipName);
  await rm(zipPath, { force: true });
  run('powershell.exe', [
    '-NoProfile',
    '-ExecutionPolicy',
    'Bypass',
    '-Command',
    `Compress-Archive -Path ${JSON.stringify(path.join(outDir, '*'))} -DestinationPath ${JSON.stringify(zipPath)} -Force`,
  ], { stdio: 'inherit' });
  console.log(`Created ${zipPath}`);
}

console.log(`Created ${outDir}`);
