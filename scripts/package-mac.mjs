import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
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
const packageJson = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8'));
const version = typeof packageJson.version === 'string' ? packageJson.version : '0.0.0';
const appOnly = process.argv.includes('--app-only');
const electronApp = path.join(rootDir, 'node_modules', 'electron', 'dist', 'Electron.app');
const stagingRoot = path.join(os.tmpdir(), `beauty-hermes-gui-package-${process.pid}-${Date.now()}`);
const stagingOutDir = path.join(stagingRoot, `${appName}-darwin-${arch}`);
const appBundle = path.join(stagingOutDir, `${appName}.app`);
const finalOutDir = path.join(releaseDir, `${appName}-darwin-${arch}`);
const finalAppBundle = path.join(finalOutDir, `${appName}.app`);
const resourcesDir = path.join(appBundle, 'Contents', 'Resources');
const packagedAppDir = path.join(resourcesDir, 'app');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDir,
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    if (options.allowFailure) {
      return result;
    }

    const details = [result.stdout, result.stderr].filter(Boolean).join('\n').slice(0, 4000);
    throw new Error(`${command} ${args.join(' ')} failed\n${details}`);
  }

  return result;
}

function stripMacMetadata(target) {
  run('dot_clean', ['-m', target], { stdio: 'ignore', allowFailure: true });
  run('xattr', ['-cr', target], { stdio: 'ignore', allowFailure: true });
  run('find', [target, '!', '-type', 'l', '-exec', 'xattr', '-c', '{}', ';'], {
    stdio: 'ignore',
    allowFailure: true,
  });

  for (const attr of [
    'com.apple.FinderInfo',
    'com.apple.ResourceFork',
    'com.apple.provenance',
    'com.apple.fileprovider.fpfs#P',
  ]) {
    run('xattr', ['-dr', attr, target], { stdio: 'ignore', allowFailure: true });
    run('find', [target, '!', '-type', 'l', '-exec', 'xattr', '-d', attr, '{}', ';'], {
      stdio: 'ignore',
      allowFailure: true,
    });
  }
}

if (!existsSync(electronApp)) {
  throw new Error(`Electron runtime not found: ${electronApp}`);
}

await rm(releaseDir, { recursive: true, force: true });
await rm(stagingRoot, { recursive: true, force: true });
await mkdir(stagingOutDir, { recursive: true });
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

stripMacMetadata(appBundle);
run('codesign', ['--force', '--deep', '--sign', '-', appBundle]);

await mkdir(releaseDir, { recursive: true });

if (appOnly) {
  run('ditto', [stagingOutDir, finalOutDir], { stdio: 'ignore' });
  stripMacMetadata(finalAppBundle);
} else {
  const zipName = `${appName.replace(/\s+/g, '-')}-${version}-mac-${arch}.zip`;
  const stagedZipPath = path.join(stagingRoot, zipName);
  const zipPath = path.join(releaseDir, zipName);
  run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', appBundle, stagedZipPath], {
    stdio: 'inherit',
  });
  await cp(stagedZipPath, zipPath);
  console.log(`Created ${zipPath}`);
}

await rm(stagingRoot, { recursive: true, force: true });

console.log(`Created ${appOnly ? finalAppBundle : releaseDir}`);
