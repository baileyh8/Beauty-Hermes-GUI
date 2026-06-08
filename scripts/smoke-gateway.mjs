import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createGatewayManager } = require('../electron/gateway-manager.cjs');

const manager = createGatewayManager();

function requestRpc(wsUrl, method, params = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch {
        // Ignore close failures during timeout cleanup.
      }
      reject(new Error(`RPC timed out: ${method}`));
    }, timeoutMs);

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({ id: 1, jsonrpc: '2.0', method, params }));
    });

    ws.addEventListener('message', (event) => {
      let frame;

      try {
        frame = JSON.parse(String(event.data));
      } catch {
        return;
      }

      if (frame.id !== 1) {
        return;
      }

      clearTimeout(timer);
      ws.close();

      if (frame.error) {
        reject(new Error(frame.error.message || `${method} failed`));
      } else {
        resolve(frame.result);
      }
    });

    ws.addEventListener('error', () => {
      clearTimeout(timer);
      reject(new Error('WebSocket connection failed'));
    });
  });
}

try {
  const connection = await manager.start({ force: true });

  if (connection.status !== 'connected') {
    throw new Error(`Gateway did not connect: ${connection.status}`);
  }

  const status = await manager.api({ path: '/api/status', timeoutMs: 30000 });
  const wsUrl = await manager.getGatewayWsUrl();

  if (!wsUrl.startsWith('ws://127.0.0.1:')) {
    throw new Error(`Unexpected gateway WebSocket URL: ${wsUrl}`);
  }

  const created = await requestRpc(wsUrl, 'session.create', { cols: 96 });
  if (!created || typeof created.session_id !== 'string') {
    throw new Error('session.create did not return a runtime session_id');
  }

  await requestRpc(wsUrl, 'session.close', { session_id: created.session_id }).catch(() => undefined);

  console.log(
    [
      'Gateway smoke passed.',
      `baseUrl=${connection.baseUrl}`,
      `source=${connection.source}`,
      `version=${typeof status?.version === 'string' ? status.version : 'unknown'}`,
      `session=${created.session_id}`,
    ].join('\n'),
  );
} catch (error) {
  console.error('Gateway smoke failed.');
  console.error(error instanceof Error ? error.message : String(error));
  console.error(manager.getLogs().slice(-20).join('\n'));
  process.exitCode = 1;
} finally {
  manager.dispose();
}
