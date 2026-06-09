import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const rootDir = new URL('..', import.meta.url);
const port = 9300 + Math.floor(Math.random() * 400);

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron', `--remote-debugging-port=${port}`, '.'], {
  cwd: rootDir,
  env: {
    ...process.env,
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

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function waitForTarget() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && !exited) {
    try {
      const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      // DevTools endpoint is not ready yet.
    }
    await wait(250);
  }

  throw new Error(`DevTools target was not ready.\n${output.slice(0, 4000)}`);
}

function createCdpClient(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data.toString());
    if (!message.id || !pending.has(message.id)) {
      return;
    }

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return {
    async close() {
      ws.close();
    },
    async send(method, params = {}) {
      await opened;
      const messageId = ++id;
      const promise = new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return promise;
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
    userGesture: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  }

  return result.result?.value;
}

let client = null;
try {
  const wsUrl = await waitForTarget();
  client = createCdpClient(wsUrl);
  await client.send('Runtime.enable');

  const result = await evaluate(client, `(${async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitFor = async (predicate, label, timeout = 5000) => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        const value = predicate();
        if (value) {
          return value;
        }
        await sleep(80);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };
    const setNativeValue = (element, value) => {
      const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;
      setter.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
    };

    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'composer');

    const textarea = document.querySelector('textarea[aria-label="消息"]');
    setNativeValue(textarea, '/');
    await waitFor(() => document.querySelector('.slashMenu')?.textContent?.includes('/help'), 'slash menu');

    setNativeValue(textarea, '/help');
    await sleep(120);
    const sendButton = document.querySelector('.sendButton');
    if (sendButton.disabled) {
      throw new Error('Send button stayed disabled for local /help command.');
    }
    sendButton.click();
    await waitFor(() => document.body.innerText.includes('/skills [关键词]'), 'local slash output');

    document.querySelector('.searchBox.asButton')?.click();
    await waitFor(() => document.querySelector('[data-testid="command-center"]'), 'command center');
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center close');

    const pages = [
      ['Profiles', '工作身份'],
      ['技能库', '读取本机 Hermes skills'],
      ['自动化', '后台调度'],
      ['消息网关', 'Messaging Gateway'],
      ['设置', '启动行为'],
      ['诊断', '诊断与更新'],
    ];

    const failures = [];
    for (const [label, expected] of pages) {
      const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.includes(label));
      if (!button) {
        failures.push(`${label}: missing button`);
        continue;
      }
      button.click();
      try {
        await waitFor(() => document.body.innerText.includes(expected), `${label} content`, 2500);
      } catch (error) {
        failures.push(`${label}: ${error.message}`);
      }
    }

    if (failures.length) {
      throw new Error(failures.join('; '));
    }

    return {
      commandCenter: true,
      pages: pages.map(([label]) => label),
      slash: true,
    };
  }})()`);

  console.log(`Interaction smoke passed. ${JSON.stringify(result)}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(output.slice(0, 4000));
  process.exitCode = 1;
} finally {
  if (client) {
    await client.close().catch(() => undefined);
  }
  child.kill('SIGTERM');
  await wait(1000);
}
