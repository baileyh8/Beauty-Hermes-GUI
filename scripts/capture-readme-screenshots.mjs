import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const outputDir = path.join(rootDir, 'docs', 'screenshots');
const port = 9400 + Math.floor(Math.random() * 300);

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
  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

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
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result?.value;
}

async function waitFor(client, expression, label, timeout = 7000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (await evaluate(client, expression)) {
      return;
    }
    await wait(120);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function clickText(client, text, selector = 'button') {
  const ok = await evaluate(client, `(() => {
    const text = ${JSON.stringify(text)};
    const selector = ${JSON.stringify(selector)};
    const node = Array.from(document.querySelectorAll(selector)).find((item) => {
      const label = item.textContent || item.getAttribute('aria-label') || '';
      return label.includes(text);
    });
    if (!node) return false;
    node.click();
    return true;
  })()`);
  if (!ok) {
    throw new Error(`Could not click ${text}`);
  }
  await wait(600);
}

async function setViewport(client) {
  await client.send('Emulation.setDeviceMetricsOverride', {
    deviceScaleFactor: 1,
    height: 960,
    mobile: false,
    width: 1440,
  });
  await client.send('Emulation.setVisibleSize', { height: 960, width: 1440 });
}

async function capture(client, name) {
  await wait(400);
  const result = await client.send('Page.captureScreenshot', {
    captureBeyondViewport: false,
    format: 'png',
  });
  await writeFile(path.join(outputDir, `${name}.png`), Buffer.from(result.data, 'base64'));
  console.log(`Captured docs/screenshots/${name}.png`);
}

let client;
try {
  await mkdir(outputDir, { recursive: true });
  client = createCdpClient(await waitForTarget());
  await client.send('Runtime.enable');
  await client.send('Page.enable');
  await setViewport(client);
  await evaluate(client, `(() => {
    localStorage.removeItem('beauty-hermes-ui-density');
    localStorage.removeItem('beauty-hermes-ui-theme');
    window.dispatchEvent(new Event('resize'));
    return true;
  })()`);
  await waitFor(client, `Boolean(document.querySelector('[data-testid="composer"]'))`, 'composer');

  await capture(client, 'chat-workbench');

  await clickText(client, '项目', '.sidebar button, .sidebarFooter button');
  await waitFor(client, `document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('项目')`, 'projects page');
  await capture(client, 'projects');

  await clickText(client, '设置', '.sidebar button, .sidebarFooter button');
  await waitFor(client, `document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('设置')`, 'settings page');
  await capture(client, 'settings');

  await evaluate(client, `(() => {
    const button = Array.from(document.querySelectorAll('button')).find((item) => item.textContent?.includes('消息网关'));
    if (button) {
      button.click();
      return true;
    }
    return false;
  })()`);
  await waitFor(client, `document.body.innerText.includes('消息平台') || document.body.innerText.includes('Telegram')`, 'messaging page');
  await capture(client, 'messaging');

  await clickText(client, '新建任务', 'button');
  await waitFor(client, `Boolean(document.querySelector('[data-testid="composer"]'))`, 'composer after new task');
  await evaluate(client, `(() => {
    const input = document.querySelector('.searchBox.asButton');
    input?.click();
    return Boolean(input);
  })()`);
  await waitFor(client, `Boolean(document.querySelector('[data-testid="command-center"]'))`, 'command center');
  await capture(client, 'command-center');
} finally {
  if (client) {
    await client.close();
  }
  if (!child.killed) {
    child.kill('SIGTERM');
  }
  await wait(500);
}
