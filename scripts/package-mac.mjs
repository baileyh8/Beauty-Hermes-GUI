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
const bundleId = 'com.baileyh8.beauty-hermes-gui';
const version = '0.1.0';
const appOnly = process.argv.includes('--app-only');
const electronApp = path.join(rootDir, 'node_modules', 'electron', 'dist', 'Electron.app');
const outDir = path.join(releaseDir, `${appName}-darwin-${arch}`);
const appBundle = path.join(outDir, `${appName}.app`);
const resourcesDir = path.join(appBundle, 'Contents', 'Resources');
const packagedAppDir = path.join(resourcesDir, 'app');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 4000);
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`);
  }

  return result;
}

if (!existsSync(electronApp)) {
  throw new Error(`Electron runtime not found: ${electronApp}`);
}

await rm(releaseDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
run('/bin/cp', ['-R', electronApp, appBundle]);

const oldExecutable = path.join(appBundle, 'Contents', 'MacOS', 'Electron');
const newExecutable = path.join(appBundle, 'Contents', 'MacOS', appName);
await rename(oldExecutable, newExecutable);

const plist = path.join(appBundle, 'Contents', 'Info.plist');
const plistValues = [
  ['CFBundleName', appName],
  ['CFBundleDisplayName', appName],
  ['CFBundleExecutable', appName],
  ['CFBundleIdentifier', bundleId],
  ['CFBundleShortVersionString', version],
  ['CFBundleVersion', version],
  ['LSApplicationCategoryType', 'public.app-category.developer-tools'],
];

for (const [key, value] of plistValues) {
  run('plutil', ['-replace', key, '-string', value, plist]);
}

await rm(path.join(resourcesDir, 'default_app.asar'), { force: true });
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

run('xattr', ['-cr', appBundle], { stdio: 'ignore' });
run('codesign', ['--force', '--deep', '--sign', '-', appBundle]);

if (!appOnly) {
  const zipName = `${appName.replace(/\s+/g, '-')}-${version}-mac-${arch}.zip`;
  const zipPath = path.join(releaseDir, zipName);
  run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appBundle, zipPath], {
    stdio: 'inherit',
  });
  console.log(`Created ${zipPath}`);
}

console.log(`Created ${appBundle}`);
