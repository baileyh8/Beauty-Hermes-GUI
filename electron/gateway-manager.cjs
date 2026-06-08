const { spawn } = require('node:child_process');
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

function resolveHermesCommand() {
  const candidates = [
    process.env.HERMES_CLI,
    path.join(os.homedir(), '.local', 'bin', 'hermes'),
    '/opt/homebrew/bin/hermes',
    '/usr/local/bin/hermes',
    'hermes',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === 'hermes') {
      return candidate;
    }

    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return 'hermes';
}

function resolveHermesHome() {
  return process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
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
    mode: 'local',
    pid: connection.pid ?? null,
    source: connection.source,
    status: connection.status,
    tokenPreview: connection.token ? `${connection.token.slice(0, 4)}...${connection.token.slice(-4)}` : null,
    wsUrl: connection.wsUrl,
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

function createGatewayManager() {
  const logs = [];
  let child = null;
  let connection = null;
  let startPromise = null;

  async function waitForSpawnedGateway(baseUrl, token) {
    for (let attempt = 0; attempt < 90; attempt += 1) {
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
          mode: 'local',
          pid: child?.pid ?? null,
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

  async function spawnGateway() {
    const port = await findFreePort();
    const token = generateToken();
    const command = resolveHermesCommand();
    const args = ['dashboard', '--no-open', '--host', '127.0.0.1', '--port', String(port)];
    const baseUrl = `http://127.0.0.1:${port}`;

    appendLog(logs, `Starting Hermes gateway: ${command} ${args.join(' ')}`);

    child = spawn(command, args, {
      env: {
        ...process.env,
        HERMES_DASHBOARD_SESSION_TOKEN: token,
        HERMES_DASHBOARD_TUI: '1',
        HERMES_HOME: resolveHermesHome(),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    attachProcessLogs(child, logs);
    child.on('exit', (code, signal) => {
      appendLog(logs, `Hermes gateway process exited: ${code ?? signal ?? 'unknown'}`);
      if (connection?.source === 'spawned') {
        connection = {
          ...connection,
          status: 'exited',
        };
      }
    });

    return waitForSpawnedGateway(baseUrl, token);
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
      connection = await findExistingGateway(logs);
      if (!connection) {
        connection = await spawnGateway();
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

  function dispose() {
    if (child && !child.killed) {
      child.kill('SIGTERM');
      child = null;
    }
  }

  return {
    api,
    dispose,
    getConnection,
    getGatewayWsUrl,
    start,
    getLogs: () => [...logs],
    packageUrl: pathToFileURL(__dirname).toString(),
  };
}

module.exports = { createGatewayManager };
