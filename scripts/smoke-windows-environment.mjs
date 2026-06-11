import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const gatewayManager = require('../electron/gateway-manager.cjs');

assert.equal(typeof gatewayManager.windowsPathToWslPathFallback, 'function');
assert.equal(typeof gatewayManager.createGatewayLaunchPlan, 'function');
assert.equal(typeof gatewayManager.gatewayStartPorts, 'function');
assert.equal(typeof gatewayManager.detectHermesEnvironment, 'function');
assert.equal(typeof gatewayManager.redactGatewayLog, 'function');
assert.equal(typeof gatewayManager.shellQuoteForSh, 'function');

assert.equal(
  gatewayManager.windowsPathToWslPathFallback('C:\\Users\\Bailey\\.hermes'),
  '/mnt/c/Users/Bailey/.hermes',
);
assert.equal(
  gatewayManager.windowsPathToWslPathFallback('D:/Projects/Hermes Agent'),
  '/mnt/d/Projects/Hermes Agent',
);
assert.equal(gatewayManager.windowsPathToWslPathFallback('/home/bailey/.hermes'), '/home/bailey/.hermes');
assert.equal(gatewayManager.shellQuoteForSh("Hermes Bailey's"), "'Hermes Bailey'\"'\"'s'");
assert.deepEqual(gatewayManager.gatewayStartPorts(9122, 'windows-native'), [9122]);
assert.deepEqual(gatewayManager.gatewayStartPorts(9122, 'wsl', 4), [9122, 9120, 9121, 9123]);

const nativePlan = gatewayManager.createGatewayLaunchPlan({
  deployment: 'windows-native',
  hermesCommand: 'C:\\Users\\Bailey\\AppData\\Roaming\\Python\\Python311\\Scripts\\hermes.exe',
  hermesHome: 'C:\\Users\\Bailey\\.hermes',
  platform: 'win32',
  port: 9120,
  token: 'native-token',
});

assert.equal(nativePlan.deployment, 'windows-native');
assert.equal(nativePlan.command, 'C:\\Users\\Bailey\\AppData\\Roaming\\Python\\Python311\\Scripts\\hermes.exe');
assert.deepEqual(nativePlan.args, ['dashboard', '--no-open', '--host', '127.0.0.1', '--port', '9120']);
assert.equal(nativePlan.env.HERMES_HOME, 'C:\\Users\\Bailey\\.hermes');
assert.equal(nativePlan.env.HERMES_DASHBOARD_SESSION_TOKEN, 'native-token');

const wslPlan = gatewayManager.createGatewayLaunchPlan({
  deployment: 'wsl',
  hermesCommand: '/home/bailey/.local/bin/hermes',
  hermesHome: 'C:\\Users\\Bailey\\.hermes',
  platform: 'win32',
  port: 9121,
  token: 'wsl-token',
  wslDistro: 'Ubuntu',
  wslHermesHome: '/home/bailey/.hermes',
});

assert.equal(wslPlan.deployment, 'wsl');
assert.equal(wslPlan.command, 'wsl.exe');
assert.deepEqual(wslPlan.args.slice(0, 4), ['-d', 'Ubuntu', '-e', 'sh']);
assert.match(wslPlan.args.at(-1), /HERMES_DASHBOARD_SESSION_TOKEN='wsl-token'/);
assert.match(wslPlan.args.at(-1), /HERMES_HOME='\/home\/bailey\/\.hermes'/);
assert.match(wslPlan.args.at(-1), /\/home\/bailey\/\.local\/bin\/hermes dashboard --no-open --host 127\.0\.0\.1 --port 9121/);

const forcedWslEnvironment = gatewayManager.detectHermesEnvironment({
  env: {
    BEAUTY_HERMES_FORCE_WSL: '1',
    HERMES_WSL_CLI: '/usr/bin/hermes',
    HERMES_WSL_HOME: '/home/bailey/.hermes',
  },
  hermesHome: 'C:\\Users\\Bailey\\.hermes',
  platform: 'win32',
});
assert.equal(forcedWslEnvironment.deployment, 'wsl');
assert.equal(forcedWslEnvironment.hermesCommand, '/usr/bin/hermes');
assert.equal(forcedWslEnvironment.wslHermesHome, '/home/bailey/.hermes');

const defaultWslEnvironment = gatewayManager.detectHermesEnvironment({
  env: {
    BEAUTY_HERMES_FORCE_WSL: '1',
    HERMES_WSL_CLI: '/usr/bin/hermes',
  },
  hermesHome: 'C:\\Users\\Bailey\\.hermes',
  platform: 'win32',
});
assert.equal(defaultWslEnvironment.deployment, 'wsl');
assert.equal(defaultWslEnvironment.wslHermesHome, '');

const missingEnvironment = gatewayManager.detectHermesEnvironment({
  env: {},
  hermesHome: 'C:\\Users\\Bailey\\.hermes',
  platform: 'win32',
});
assert.equal(missingEnvironment.deployment, 'windows-missing');

const remoteEnvironment = gatewayManager.detectHermesEnvironment({
  platform: 'win32',
  skipLocalProbe: true,
});
assert.equal(remoteEnvironment.deployment, 'remote');
assert.equal(remoteEnvironment.hermesCommand, '');

assert.equal(
  gatewayManager.redactGatewayLog("Starting HERMES_DASHBOARD_SESSION_TOKEN='secret-token' hermes dashboard"),
  'Starting HERMES_DASHBOARD_SESSION_TOKEN=<redacted> hermes dashboard',
);

let probeCount = 0;
const cachedManager = gatewayManager.createGatewayManager({
  detectHermesEnvironment: () => {
    probeCount += 1;
    return {
      deployment: 'windows-native',
      hermesCommand: 'hermes.exe',
      hermesHome: 'C:\\Users\\Bailey\\.hermes',
      platform: 'win32',
      wslAvailable: false,
      wslDistro: '',
      wslHermesHome: '',
    };
  },
});
assert.equal(cachedManager.getEnvironment({ platform: 'win32' }).deployment, 'windows-native');
assert.equal(cachedManager.getEnvironment({ platform: 'win32' }).deployment, 'windows-native');
assert.equal(probeCount, 1);
assert.equal(cachedManager.getEnvironment({ platform: 'win32', preferredDeployment: 'wsl' }).deployment, 'windows-native');
assert.equal(probeCount, 2);
cachedManager.dispose();

console.log('Windows environment smoke passed.');
