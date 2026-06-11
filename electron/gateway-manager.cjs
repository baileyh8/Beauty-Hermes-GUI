const { spawn, spawnSync } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const GATEWAY_PORT_START = 9120;
const GATEWAY_PORT_END = 9200;
const PROBE_PORTS = [
  ...Array.from({ length: GATEWAY_PORT_END - GATEWAY_PORT_START }, (_, index) => GATEWAY_PORT_START + index),
  9119,
];
const TOKEN_RE = /__HERMES_SESSION_TOKEN__\s*=\s*"([^"]+)"/;
const MAX_LOG_LINES = 120;
const ENVIRONMENT_CACHE_MS = 15000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateToken() {
  return crypto.randomBytes(24).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function appendLog(logs, line) {
  const normalized = String(line).replace(/\r/g, '').trimEnd();
  if (!normalized) {
    return;
  }

  for (const row of normalized.split('\n')) {
    logs.push(row);
  }

  if (logs.length > MAX_LOG_LINES) {
    logs.splice(0, logs.length - MAX_LOG_LINES);
  }
}

function listWindowsUserScriptHermesCandidates(env = process.env) {
  const appData = env.APPDATA;
  if (!appData) {
    return [];
  }

  const pythonRoot = path.join(appData, 'Python');
  const candidates = [path.join(pythonRoot, 'Scripts', 'hermes.exe')];

  try {
    for (const name of fs.readdirSync(pythonRoot)) {
      if (/^Python\d+/i.test(name)) {
        candidates.push(path.join(pythonRoot, name, 'Scripts', 'hermes.exe'));
      }
    }
  } catch {
    // The Python user-base directory is optional.
  }

  return candidates;
}

function resolveHermesCommand({ env = process.env, homeDir = os.homedir(), platform = process.platform } = {}) {
  const candidates = [
    env.HERMES_CLI,
    path.join(homeDir, '.local', 'bin', platform === 'win32' ? 'hermes.exe' : 'hermes'),
    ...(platform === 'win32' ? listWindowsUserScriptHermesCandidates(env) : []),
    '/opt/homebrew/bin/hermes',
    '/usr/local/bin/hermes',
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, platform === 'win32' ? fs.constants.F_OK : fs.constants.X_OK);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  const commandFromPath = resolveCommandFromPath('hermes', platform, env);
  if (commandFromPath) {
    return commandFromPath;
  }

  return 'hermes';
}

function resolveHermesHome() {
  return process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
}

function resolveCommandFromPath(command, platform = process.platform, env = process.env) {
  try {
    const result = spawnSync(platform === 'win32' ? 'where.exe' : 'which', [command], {
      encoding: 'utf8',
      env,
      timeout: 2500,
      windowsHide: true,
    });
    if (result.status === 0) {
      return String(result.stdout || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || '';
    }
  } catch {
    // PATH lookup is best-effort only.
  }

  return '';
}

function resolveExistingHermesCommand(platform = process.platform, env = process.env) {
  const command = resolveHermesCommand({ env, platform });
  if (platform !== 'win32') {
    return command;
  }

  if (command && command !== 'hermes') {
    return command;
  }

  return resolveCommandFromPath('hermes', platform, env);
}

function windowsPathToWslPathFallback(value) {
  const raw = String(value || '').trim();
  const match = raw.match(/^([A-Za-z]):[\\/](.*)$/);
  if (!match) {
    return raw.replace(/\\/g, '/');
  }

  const drive = match[1].toLowerCase();
  const rest = match[2].replace(/\\/g, '/');
  return `/mnt/${drive}/${rest}`;
}

function shellQuoteForSh(value) {
  return `'${String(value ?? '').replace(/'/g, `'\"'\"'`)}'`;
}

function shellCommandForSh(command) {
  const value = String(command || 'hermes').trim() || 'hermes';
  return /^[A-Za-z0-9_./:-]+$/.test(value) ? value : shellQuoteForSh(value);
}

function wslBaseArgs(distro) {
  const normalized = String(distro || '').trim();
  return normalized ? ['-d', normalized, '-e', 'sh', '-lc'] : ['-e', 'sh', '-lc'];
}

function resolveWslHermesCommand({ env = process.env, platform = process.platform, wslDistro = '' } = {}) {
  if (platform !== 'win32') {
    return '';
  }

  if (env.HERMES_WSL_CLI) {
    return env.HERMES_WSL_CLI;
  }

  try {
    const result = spawnSync('wsl.exe', [...wslBaseArgs(wslDistro), 'command -v hermes'], {
      encoding: 'utf8',
      timeout: 5000,
      windowsHide: true,
    });
    if (result.status === 0) {
      return String(result.stdout || '').split(/\r?\n/).map((line) => line.trim()).find(Boolean) || 'hermes';
    }
  } catch {
    // WSL is optional and may not be installed.
  }

  return '';
}

function resolveWslHermesHome({ env = process.env, platform = process.platform, wslDistro = '' } = {}) {
  if (env.HERMES_WSL_HOME) {
    return env.HERMES_WSL_HOME;
  }

  if (platform === 'win32') {
    try {
      const result = spawnSync('wsl.exe', [...wslBaseArgs(wslDistro), 'printf "%s" "${HERMES_HOME:-$HOME/.hermes}"'], {
        encoding: 'utf8',
        timeout: 5000,
        windowsHide: true,
      });
      const detected = String(result.stdout || '').trim();
      if (result.status === 0 && detected) {
        return detected;
      }
    } catch {
      // Fall through to deterministic fallback.
    }
  }

  return '';
}

function detectHermesEnvironment({
  env = process.env,
  hermesHome = resolveHermesHome(),
  platform = process.platform,
  preferredDeployment = '',
  skipLocalProbe = false,
  wslDistro = env.HERMES_WSL_DISTRO || '',
} = {}) {
  if (skipLocalProbe) {
    return {
      deployment: 'remote',
      hermesCommand: '',
      hermesHome,
      platform,
      wslAvailable: false,
      wslDistro: '',
      wslHermesHome: '',
    };
  }

  const wantsWsl = ['wsl', 'windows-wsl'].includes(String(preferredDeployment || env.HERMES_DEPLOYMENT || '').toLowerCase())
    || env.BEAUTY_HERMES_FORCE_WSL === '1';
  const nativeCommand = wantsWsl ? '' : resolveExistingHermesCommand(platform, env);

  if (platform === 'win32') {
    const shouldProbeWsl = wantsWsl || !nativeCommand;
    const wslCommand = shouldProbeWsl ? resolveWslHermesCommand({ env, platform, wslDistro }) : '';
    if ((wantsWsl || !nativeCommand) && wslCommand) {
      return {
        deployment: 'wsl',
        hermesCommand: wslCommand,
        hermesHome,
        platform,
        wslAvailable: true,
        wslDistro,
        wslHermesHome: resolveWslHermesHome({ env, platform, wslDistro }),
      };
    }

    if (nativeCommand) {
      return {
        deployment: 'windows-native',
        hermesCommand: nativeCommand,
        hermesHome,
        platform,
        wslAvailable: Boolean(wslCommand),
        wslDistro,
        wslHermesHome: resolveWslHermesHome({ env, platform, wslDistro }),
      };
    }

    return {
      deployment: 'windows-missing',
      hermesCommand: '',
      hermesHome,
      platform,
      wslAvailable: Boolean(wslCommand),
      wslDistro,
      wslHermesHome: resolveWslHermesHome({ env, platform, wslDistro }),
    };
  }

  return {
    deployment: 'local',
    hermesCommand: nativeCommand || 'hermes',
    hermesHome,
    platform,
    wslAvailable: false,
    wslDistro: '',
    wslHermesHome: '',
  };
}

function redactGatewayLog(value) {
  return String(value || '')
    .replace(/HERMES_DASHBOARD_SESSION_TOKEN=(?:'[^']*'|"[^"]*"|\S+)/g, 'HERMES_DASHBOARD_SESSION_TOKEN=<redacted>');
}

function gatewayStartPorts(firstPort, deployment, limit = 6) {
  const ports = [
    firstPort,
    ...PROBE_PORTS.filter((port) => port !== firstPort),
  ];
  return deployment === 'wsl' ? ports.slice(0, Math.max(1, limit)) : [firstPort];
}

function environmentCacheKey(options = {}) {
  const env = options.env || process.env;
  return JSON.stringify({
    deployment: options.preferredDeployment || '',
    forceWsl: env.BEAUTY_HERMES_FORCE_WSL || '',
    hermesCli: env.HERMES_CLI || '',
    hermesDeployment: env.HERMES_DEPLOYMENT || '',
    hermesHome: options.hermesHome || process.env.HERMES_HOME || '',
    platform: options.platform || process.platform,
    skipLocalProbe: Boolean(options.skipLocalProbe),
    wslCli: env.HERMES_WSL_CLI || '',
    wslDistro: options.wslDistro || env.HERMES_WSL_DISTRO || '',
    wslHome: env.HERMES_WSL_HOME || '',
  });
}

function createGatewayLaunchPlan({
  deployment = '',
  env = process.env,
  hermesCommand = '',
  hermesHome = resolveHermesHome(),
  platform = process.platform,
  port,
  token,
  wslDistro = '',
  wslHermesHome = '',
} = {}) {
  const args = ['dashboard', '--no-open', '--host', '127.0.0.1', '--port', String(port)];
  const baseUrl = `http://127.0.0.1:${port}`;
  const resolvedDeployment = deployment || (platform === 'win32' ? 'windows-native' : 'local');

  if (platform === 'win32' && resolvedDeployment === 'wsl') {
    const envAssignments = [
      `HERMES_DASHBOARD_SESSION_TOKEN=${shellQuoteForSh(token)}`,
      'HERMES_DASHBOARD_TUI=1',
    ];
    if (wslHermesHome) {
      envAssignments.push(`HERMES_HOME=${shellQuoteForSh(wslHermesHome)}`);
    }

    const script = `${envAssignments.join(' ')} ${shellCommandForSh(hermesCommand || 'hermes')} ${args.join(' ')}`;
    return {
      args: [...wslBaseArgs(wslDistro), script],
      baseUrl,
      command: 'wsl.exe',
      deployment: 'wsl',
      env: { ...env },
      platform,
    };
  }

  return {
    args,
    baseUrl,
    command: hermesCommand || resolveHermesCommand({ env, platform }),
    deployment: resolvedDeployment,
    env: {
      ...env,
      HERMES_DASHBOARD_SESSION_TOKEN: token,
      HERMES_DASHBOARD_TUI: '1',
      HERMES_HOME: hermesHome,
    },
    platform,
  };
}

function readDesktopConfig() {
  const configPath = path.join(resolveHermesHome(), 'desktop.json');

  try {
    const value = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

function normalizeRemoteGatewayUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('Remote Hermes Gateway URL is invalid');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Remote Hermes Gateway URL must start with http:// or https://');
  }

  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

function buildWsUrl(baseUrl, token) {
  const url = new URL('/api/ws', baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('token', token);
  return url.toString();
}

async function fetchText(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      ...options,
      signal: controller.signal,
    });
    const text = await response.text();

    return { ok: response.ok, status: response.status, text };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url, options = {}, timeoutMs = 5000) {
  const { ok, status, text } = await fetchText(url, options, timeoutMs);

  if (!ok) {
    throw new Error(text || `HTTP ${status}`);
  }

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function canBindPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function findFreePort() {
  for (let port = GATEWAY_PORT_START; port < GATEWAY_PORT_END; port += 1) {
    if (await canBindPort(port)) {
      return port;
    }
  }

  throw new Error(`No free Hermes gateway port in ${GATEWAY_PORT_START}-${GATEWAY_PORT_END - 1}`);
}

function sanitizeConnection(connection) {
  if (!connection) {
    return null;
  }

  return {
    authMode: 'token',
    baseUrl: connection.baseUrl,
    deployment: connection.deployment || null,
    mode: connection.mode || 'local',
    pid: connection.pid ?? null,
    platform: connection.platform || process.platform,
    source: connection.source,
    status: connection.status,
    tokenPreview: connection.token ? `${connection.token.slice(0, 4)}...${connection.token.slice(-4)}` : null,
    wsUrl: connection.wsUrl,
  };
}

function sanitizeEnvironment(environment) {
  if (!environment) {
    return null;
  }

  return {
    deployment: environment.deployment,
    hermesCommand: environment.hermesCommand || '',
    hermesHome: environment.hermesHome || '',
    platform: environment.platform || process.platform,
    wslAvailable: Boolean(environment.wslAvailable),
    wslDistro: environment.wslDistro || '',
    wslHermesHome: environment.wslHermesHome || '',
  };
}

async function probeGatewayAtPort(port, logs) {
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const root = await fetchText(baseUrl, {}, 900);
    if (!root.ok) {
      return null;
    }

    const token = root.text.match(TOKEN_RE)?.[1];
    if (!token) {
      return null;
    }

    await fetchJson(
      `${baseUrl}/api/status`,
      {
        headers: {
          Accept: 'application/json',
          'X-Hermes-Session-Token': token,
        },
      },
      1100,
    );

    appendLog(logs, `Reusing Hermes gateway at ${baseUrl}`);

    return {
      authMode: 'token',
      baseUrl,
      mode: 'local',
      source: 'existing',
      status: 'connected',
      token,
      wsUrl: buildWsUrl(baseUrl, token),
    };
  } catch {
    return null;
  }
}

async function probeRemoteGateway(config, logs) {
  const baseUrl = normalizeRemoteGatewayUrl(config.remoteGatewayUrl);
  if (!baseUrl) {
    throw new Error('Remote Hermes Gateway URL is not configured');
  }

  let token = String(config.remoteGatewayToken || '').trim();
  if (!token) {
    try {
      const root = await fetchText(baseUrl, {}, 2500);
      token = root.text.match(TOKEN_RE)?.[1] || '';
    } catch {
      token = '';
    }
  }

  if (!token) {
    throw new Error('Remote Hermes Gateway token is not configured');
  }

  await fetchJson(
    new URL('/api/status', `${baseUrl}/`).toString(),
    {
      headers: {
        Accept: 'application/json',
        'X-Hermes-Session-Token': token,
      },
    },
    5000,
  );

  appendLog(logs, `Connected remote Hermes gateway at ${baseUrl}`);

  return {
    authMode: 'token',
    baseUrl,
    mode: 'remote',
    pid: null,
    source: 'remote',
    status: 'connected',
    token,
    wsUrl: buildWsUrl(baseUrl, token),
  };
}

async function findExistingGateway(logs) {
  for (const port of PROBE_PORTS) {
    const connection = await probeGatewayAtPort(port, logs);
    if (connection) {
      return connection;
    }
  }

  return null;
}

function attachProcessLogs(child, logs) {
  child.stdout?.on('data', (chunk) => appendLog(logs, chunk.toString()));
  child.stderr?.on('data', (chunk) => appendLog(logs, `[stderr] ${chunk.toString()}`));
}

function createGatewayManager(options = {}) {
  const environmentDetector = options.detectHermesEnvironment || detectHermesEnvironment;
  const logs = [];
  let cachedEnvironment = null;
  let child = null;
  let connection = null;
  let spawnError = null;
  let startPromise = null;

  async function waitForSpawnedGateway(baseUrl, token, launchPlan) {
    for (let attempt = 0; attempt < 90; attempt += 1) {
      if (spawnError) {
        throw new Error(`Hermes gateway failed to start: ${spawnError.message}`);
      }

      if (child) {
        const status = child.exitCode;
        if (status !== null) {
          throw new Error(`Hermes gateway exited before it was ready: ${status}`);
        }
      }

      try {
        await fetchJson(
          `${baseUrl}/api/status`,
          {
            headers: {
              Accept: 'application/json',
              'X-Hermes-Session-Token': token,
            },
          },
          1200,
        );

        let actualToken = token;
        try {
          const root = await fetchText(baseUrl, {}, 1500);
          actualToken = root.text.match(TOKEN_RE)?.[1] || token;
        } catch {
          actualToken = token;
        }

        return {
          authMode: 'token',
          baseUrl,
          deployment: launchPlan.deployment,
          mode: 'local',
          pid: child?.pid ?? null,
          platform: launchPlan.platform,
          source: 'spawned',
          status: 'connected',
          token: actualToken,
          wsUrl: buildWsUrl(baseUrl, actualToken),
        };
      } catch {
        await delay(500);
      }
    }

    throw new Error(`Hermes gateway did not become ready at ${baseUrl}`);
  }

  async function spawnGateway(desktopConfig = {}) {
    const firstPort = await findFreePort();
    const environment = environmentDetector({
      preferredDeployment: desktopConfig.hermesDeployment || desktopConfig.deployment || '',
    });

    if (environment.deployment === 'windows-missing') {
      throw new Error('Hermes CLI was not found in Windows PATH or WSL. Install Hermes natively, install it inside WSL, or set HERMES_CLI/HERMES_WSL_CLI.');
    }

    appendLog(logs, `Detected Hermes deployment: ${environment.deployment}`);

    let lastError = null;
    for (const port of gatewayStartPorts(firstPort, environment.deployment)) {
      if (port !== firstPort && !(await canBindPort(port))) {
        appendLog(logs, `Skipping Hermes gateway port ${port}; it is already in use on Windows host`);
        continue;
      }

      const token = generateToken();
      const launchPlan = createGatewayLaunchPlan({
        ...environment,
        port,
        token,
      });

      appendLog(logs, redactGatewayLog(`Starting Hermes gateway: ${launchPlan.command} ${launchPlan.args.join(' ')}`));

      spawnError = null;
      child = spawn(launchPlan.command, launchPlan.args, {
        env: launchPlan.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      attachProcessLogs(child, logs);
      child.on('error', (error) => {
        spawnError = error;
        appendLog(logs, `Hermes gateway process failed to start: ${error.message}`);
      });
      child.on('exit', (code, signal) => {
        appendLog(logs, `Hermes gateway process exited: ${code ?? signal ?? 'unknown'}`);
        if (connection?.source === 'spawned') {
          connection = {
            ...connection,
            status: 'exited',
          };
        }
      });

      try {
        return await waitForSpawnedGateway(launchPlan.baseUrl, token, launchPlan);
      } catch (error) {
        lastError = error;
        appendLog(logs, `Hermes gateway start attempt on port ${port} failed: ${error.message}`);
        if (child && !child.killed) {
          child.kill('SIGTERM');
        }
        child = null;
        spawnError = null;
        if (environment.deployment !== 'wsl') {
          throw error;
        }
      }
    }

    throw lastError || new Error('Hermes gateway did not start on any candidate port');
  }

  async function start(options = {}) {
    if (process.env.BEAUTY_HERMES_SKIP_GATEWAY === '1') {
      connection = {
        authMode: 'token',
        baseUrl: '',
        mode: 'local',
        source: 'skipped',
        status: 'skipped',
        token: '',
        wsUrl: '',
      };
      appendLog(logs, 'Hermes gateway startup skipped by BEAUTY_HERMES_SKIP_GATEWAY=1');
      return { ...sanitizeConnection(connection), logs: [...logs] };
    }

    if (connection?.status === 'connected' && !options.force) {
      return { ...sanitizeConnection(connection), logs: [...logs] };
    }

    if (startPromise && !options.force) {
      return startPromise;
    }

    startPromise = (async () => {
      const desktopConfig = readDesktopConfig();
      if (desktopConfig.connectionMode === 'remote') {
        connection = await probeRemoteGateway(desktopConfig, logs);
        return { ...sanitizeConnection(connection), logs: [...logs] };
      }

      connection = await findExistingGateway(logs);
      if (!connection) {
        connection = await spawnGateway(desktopConfig);
      }

      return { ...sanitizeConnection(connection), logs: [...logs] };
    })();

    try {
      return await startPromise;
    } finally {
      startPromise = null;
    }
  }

  async function api(request) {
    const active = connection?.status === 'connected' ? connection : await start();
    const rawPath = String(request?.path || '');

    if (!rawPath.startsWith('/')) {
      throw new Error(`Invalid Hermes API path: ${rawPath}`);
    }

    if (!active.baseUrl || !connection?.token) {
      throw new Error('Hermes gateway is not connected');
    }

    const method = String(request?.method || 'GET').toUpperCase();
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'X-Hermes-Session-Token': connection.token,
    };

    let body;
    if (request && Object.prototype.hasOwnProperty.call(request, 'body') && request.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(request.body);
    }

    return fetchJson(
      new URL(rawPath, active.baseUrl).toString(),
      {
        method,
        headers,
        body,
      },
      Number(request?.timeoutMs || 30000),
    );
  }

  async function getGatewayWsUrl() {
    const active = connection?.status === 'connected' ? connection : await start();
    if (!active.wsUrl) {
      throw new Error('Hermes gateway WebSocket URL is unavailable');
    }

    return active.wsUrl;
  }

  function getConnection() {
    return { ...sanitizeConnection(connection), logs: [...logs] };
  }

  function getEnvironment(options = {}) {
    const cacheKey = environmentCacheKey(options);
    const now = Date.now();
    if (cachedEnvironment && cachedEnvironment.key === cacheKey && now - cachedEnvironment.time < ENVIRONMENT_CACHE_MS) {
      return sanitizeEnvironment(cachedEnvironment.value);
    }

    const value = environmentDetector(options);
    cachedEnvironment = {
      key: cacheKey,
      time: now,
      value,
    };
    return sanitizeEnvironment(value);
  }

  function dispose() {
    if (child && !child.killed) {
      child.kill('SIGTERM');
      child = null;
    }
  }

  function stop() {
    if (connection?.source === 'remote') {
      appendLog(logs, 'Clearing remote Hermes gateway connection');
      connection = {
        ...connection,
        status: 'exited',
      };
      return getConnection();
    }

    if (child && !child.killed) {
      appendLog(logs, 'Stopping spawned Hermes gateway');
      child.kill('SIGTERM');
      child = null;
    } else {
      appendLog(logs, 'No spawned Hermes gateway to stop');
    }

    if (connection?.source === 'spawned') {
      connection = {
        ...connection,
        status: 'exited',
      };
    }

    return getConnection();
  }

  return {
    api,
    dispose,
    getConnection,
    getEnvironment,
    getGatewayWsUrl,
    start,
    stop,
    getLogs: () => [...logs],
    packageUrl: pathToFileURL(__dirname).toString(),
  };
}

module.exports = {
  createGatewayManager,
  createGatewayLaunchPlan,
  detectHermesEnvironment,
  environmentCacheKey,
  gatewayStartPorts,
  redactGatewayLog,
  shellQuoteForSh,
  windowsPathToWslPathFallback,
};
