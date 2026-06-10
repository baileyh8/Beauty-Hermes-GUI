import http from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createGatewayManager } = require('../electron/gateway-manager.cjs');

const token = 'remote-smoke-token-123456';
let statusRequests = 0;
let rejectedRequests = 0;

const server = http.createServer((request, response) => {
  const url = new URL(request.url || '/', 'http://127.0.0.1');

  if (url.pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(`<script>window.__HERMES_SESSION_TOKEN__ = "${token}"</script>`);
    return;
  }

  if (url.pathname === '/api/status') {
    statusRequests += 1;
    if (request.headers['x-hermes-session-token'] !== token) {
      rejectedRequests += 1;
      response.writeHead(401, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'unauthorized' }));
      return;
    }

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ gateway_running: true, version: 'remote-smoke' }));
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('not found');
});

function listen(serverInstance) {
  return new Promise((resolve, reject) => {
    serverInstance.once('error', reject);
    serverInstance.listen(0, '127.0.0.1', () => resolve(serverInstance.address()));
  });
}

function close(serverInstance) {
  return new Promise((resolve) => serverInstance.close(() => resolve()));
}

const hermesHome = await mkdtemp(path.join(os.tmpdir(), 'beauty-hermes-remote-'));
const previousHermesHome = process.env.HERMES_HOME;

try {
  const address = await listen(server);
  if (!address || typeof address === 'string') {
    throw new Error('Remote smoke server did not expose a TCP port');
  }

  const baseUrl = `http://127.0.0.1:${address.port}`;
  process.env.HERMES_HOME = hermesHome;
  await writeFile(
    path.join(hermesHome, 'desktop.json'),
    `${JSON.stringify({
      connectionMode: 'remote',
      remoteGatewayToken: token,
      remoteGatewayUrl: baseUrl,
    }, null, 2)}\n`,
  );

  const manager = createGatewayManager();
  const connection = await manager.start({ force: true });

  if (connection.status !== 'connected' || connection.mode !== 'remote' || connection.source !== 'remote') {
    throw new Error(`Expected remote connection, got ${JSON.stringify(connection)}`);
  }
  if (connection.baseUrl !== baseUrl) {
    throw new Error(`Remote baseUrl mismatch: ${connection.baseUrl}`);
  }
  if ('token' in connection || connection.tokenPreview === token) {
    throw new Error('Sanitized remote connection leaked the raw token');
  }

  const status = await manager.api({ path: '/api/status', timeoutMs: 5000 });
  if (status?.version !== 'remote-smoke') {
    throw new Error('Remote manager API did not reach the configured gateway');
  }

  const wsUrl = await manager.getGatewayWsUrl();
  const parsedWs = new URL(wsUrl);
  if (parsedWs.protocol !== 'ws:' || parsedWs.host !== `127.0.0.1:${address.port}` || parsedWs.searchParams.get('token') !== token) {
    throw new Error(`Unexpected remote WebSocket URL: ${wsUrl}`);
  }

  const stopped = manager.stop();
  if (stopped?.source !== 'remote' || stopped?.status !== 'exited') {
    throw new Error('Stopping remote gateway should clear the connection without killing a local process');
  }

  if (statusRequests < 2 || rejectedRequests !== 0) {
    throw new Error(`Unexpected remote auth behavior: status=${statusRequests} rejected=${rejectedRequests}`);
  }

  console.log(`Remote gateway smoke passed. ${JSON.stringify({ baseUrl, statusRequests })}`);
} catch (error) {
  console.error('Remote gateway smoke failed.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  if (previousHermesHome === undefined) {
    delete process.env.HERMES_HOME;
  } else {
    process.env.HERMES_HOME = previousHermesHome;
  }
  await close(server).catch(() => undefined);
  await rm(hermesHome, { force: true, recursive: true }).catch(() => undefined);
}
