import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { createGatewayManager } = require('../electron/gateway-manager.cjs');

const manager = createGatewayManager();
const PROMPT =
  process.env.BEAUTY_HERMES_SMOKE_PROMPT ||
  '请只回复一句中文：Hermes GUI 真实后端测试通过。不要调用工具。';
const TIMEOUT_MS = Number(process.env.BEAUTY_HERMES_SMOKE_PROMPT_TIMEOUT_MS || 180000);

class GatewaySocket {
  constructor(wsUrl) {
    this.events = [];
    this.nextId = 0;
    this.pending = new Map();
    this.socket = new WebSocket(wsUrl);
  }

  async open() {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket open timed out')), 15000);

      this.socket.addEventListener(
        'open',
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );
      this.socket.addEventListener(
        'error',
        () => {
          clearTimeout(timer);
          reject(new Error('WebSocket connection failed'));
        },
        { once: true },
      );
    });

    this.socket.addEventListener('message', (event) => this.handleMessage(event.data));
    this.socket.addEventListener('close', () => {
      for (const [, pending] of this.pending) {
        clearTimeout(pending.timer);
        pending.reject(new Error('WebSocket closed'));
      }
      this.pending.clear();
    });
  }

  close() {
    this.socket.close();
  }

  request(method, params = {}, timeoutMs = 60000) {
    const id = ++this.nextId;

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.delete(id)) {
          reject(new Error(`RPC timed out: ${method}`));
        }
      }, timeoutMs);

      this.pending.set(id, { reject, resolve, timer });
      this.socket.send(JSON.stringify({ id, jsonrpc: '2.0', method, params }));
    });
  }

  waitForComplete(sessionId, timeoutMs) {
    let assistantText = '';
    const seen = new Set();

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Prompt did not complete within ${timeoutMs}ms. Partial: ${assistantText.slice(0, 500)}`));
      }, timeoutMs);

      const onEvent = (event) => {
        if (event.session_id && event.session_id !== sessionId) {
          return;
        }

        seen.add(event.type);
        const payload = event.payload && typeof event.payload === 'object' ? event.payload : {};

        if (event.type === 'message.delta') {
          assistantText += textFromPayload(payload);
        }

        if (event.type === 'message.complete') {
          const finalText = textFromPayload(payload) || assistantText;
          cleanup();
          resolve({ events: [...seen], text: finalText.trim() });
        }

        if (event.type === 'error') {
          cleanup();
          reject(new Error(textFromPayload(payload) || 'Gateway emitted error event'));
        }
      };

      const cleanup = () => {
        clearTimeout(timer);
        this.events = this.events.filter((handler) => handler !== onEvent);
      };

      this.events.push(onEvent);
    });
  }

  handleMessage(data) {
    let frame;

    try {
      frame = JSON.parse(String(data));
    } catch {
      return;
    }

    if (frame.id !== undefined && frame.id !== null) {
      const pending = this.pending.get(Number(frame.id));
      if (!pending) {
        return;
      }

      clearTimeout(pending.timer);
      this.pending.delete(Number(frame.id));

      if (frame.error) {
        pending.reject(new Error(frame.error.message || 'RPC request failed'));
      } else {
        pending.resolve(frame.result);
      }

      return;
    }

    if (frame.method === 'event' && frame.params?.type) {
      for (const handler of [...this.events]) {
        handler(frame.params);
      }
    }
  }
}

function textFromPayload(payload) {
  const value = payload.text ?? payload.rendered ?? payload.message ?? payload.error ?? '';

  if (typeof value === 'string') {
    return value;
  }

  if (value == null) {
    return '';
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

try {
  const connection = await manager.start({ force: true });
  if (connection.status !== 'connected') {
    throw new Error(`Gateway did not connect: ${connection.status}`);
  }

  const wsUrl = await manager.getGatewayWsUrl();
  const gateway = new GatewaySocket(wsUrl);
  await gateway.open();

  let created;
  try {
    created = await gateway.request('session.create', { cols: 96 }, 60000);
    if (!created || typeof created.session_id !== 'string') {
      throw new Error('session.create did not return a runtime session_id');
    }

    const completion = gateway.waitForComplete(created.session_id, TIMEOUT_MS);
    await gateway.request('prompt.submit', { session_id: created.session_id, text: PROMPT }, 30000);
    const result = await completion;

    if (!result.text) {
      throw new Error('Prompt completed without assistant text');
    }

    console.log(
      [
        'Real prompt smoke passed.',
        `baseUrl=${connection.baseUrl}`,
        `session=${created.session_id}`,
        `events=${result.events.join(',')}`,
        `assistant=${result.text.slice(0, 1000)}`,
      ].join('\n'),
    );
  } finally {
    if (created?.session_id) {
      await gateway.request('session.close', { session_id: created.session_id }, 10000).catch(() => undefined);
    }
    gateway.close();
  }
} catch (error) {
  console.error('Real prompt smoke failed.');
  console.error(error instanceof Error ? error.message : String(error));
  console.error(manager.getLogs().slice(-25).join('\n'));
  process.exitCode = 1;
} finally {
  manager.dispose();
}
