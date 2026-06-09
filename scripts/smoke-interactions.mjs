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
    const findButton = (label, root = document) => Array.from(root.querySelectorAll('button'))
      .find((item) => item.textContent?.includes(label) || item.getAttribute('aria-label')?.includes(label));
    const findCommandRow = (title) => Array.from(document.querySelectorAll('.commandRow'))
      .find((item) => item.querySelector('strong')?.textContent?.trim() === title);
    const openCommandCenter = async (query = '') => {
      document.querySelector('.searchBox.asButton')?.click();
      await waitFor(() => document.querySelector('[data-testid="command-center"]'), 'command center');
      const input = document.querySelector('[data-testid="command-center"] input');
      setNativeValue(input, query);
      await sleep(120);
      return document.querySelector('[data-testid="command-center"]');
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

    findButton('添加')?.click();
    await waitFor(() => document.querySelector('.attachmentMenu')?.textContent?.includes('URL...'), 'attachment menu');
    findButton('URL...', document.querySelector('.attachmentMenu'))?.click();
    await waitFor(() => document.querySelector('.menuUrlForm input'), 'url form');
    setNativeValue(document.querySelector('.menuUrlForm input'), 'https://example.com/spec');
    findButton('添加', document.querySelector('.menuUrlForm'))?.click();
    await waitFor(() => textarea.value.includes('https://example.com/spec'), 'url inserted');
    setNativeValue(textarea, '');

    await openCommandCenter();
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center close');

    await waitFor(() => document.querySelector('[data-testid="right-workbench"]'), 'right workbench');
    const workbenchChecks = [
      ['文件', '变更文件'],
      ['终端', 'Hermes Gateway'],
      ['预览', '暂无预览产物'],
      ['活动', '当前任务'],
    ];
    for (const [tab, expected] of workbenchChecks) {
      findButton(tab, document.querySelector('[data-testid="right-workbench"]'))?.click();
      await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes(expected), `${tab} tab`);
    }
    findButton('收起工作区')?.click();
    await waitFor(() => !document.querySelector('[data-testid="right-workbench"]') && document.querySelector('.floatingWorkbenchButton'), 'workbench collapse');
    findButton('展开工作区')?.click();
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]'), 'workbench expand');

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

    await openCommandCenter('项目');
    await waitFor(() => findCommandRow('项目'), 'projects command row');
    findCommandRow('项目')?.click();
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page');
    const projectMoreButton = Array.from(document.querySelectorAll('.projectCard .iconButton'))
      .find((item) => item.getAttribute('aria-label')?.includes('更多操作'));
    projectMoreButton?.click();
    await waitFor(() => document.querySelector('[data-testid="command-center"]'), 'project more command center');
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'project command center close');

    await openCommandCenter('Agents');
    await waitFor(() => findCommandRow('Agents'), 'agents command row');
    findCommandRow('Agents')?.click();
    await waitFor(() => document.body.innerText.includes('运行中工具'), 'agents page');
    findButton('新建任务')?.click();
    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'agents new task target');

    findButton('设置')?.click();
    await waitFor(() => document.body.innerText.includes('启动行为'), 'settings general');
    const settingsSections = [
      ['模型', '默认模型'],
      ['权限', '命令审批'],
      ['集成', 'Gateway'],
      ['外观', '界面密度'],
      ['高级', 'Hermes Home'],
      ['通用', '启动行为'],
    ];
    for (const [section, expected] of settingsSections) {
      const button = Array.from(document.querySelectorAll('.settingNavItem')).find((item) => item.textContent?.includes(section));
      if (!button) {
        throw new Error(`Missing settings section ${section}`);
      }
      button.click();
      await waitFor(() => document.body.innerText.includes(expected), `${section} settings`);
    }

    const selectSettingsSection = async (section, expected) => {
      const button = Array.from(document.querySelectorAll('.settingNavItem')).find((item) => item.textContent?.includes(section));
      if (!button) {
        throw new Error(`Missing settings section ${section}`);
      }
      button.click();
      await waitFor(() => document.body.innerText.includes(expected), `${section} settings`);
    };
    const settingRow = (label) => Array.from(document.querySelectorAll('.settingRow')).find((row) => row.textContent?.includes(label));

    await selectSettingsSection('外观', '界面密度');
    const densityRow = settingRow('界面密度');
    findButton('舒适', densityRow)?.click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-density') === 'compact', 'compact density applied');
    const themeRow = settingRow('主题');
    findButton('浅色', themeRow)?.click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-theme') === 'soft', 'soft theme applied');

    await selectSettingsSection('权限', '命令审批');
    findButton('手动确认', settingRow('命令审批'))?.click();
    await waitFor(() => document.querySelector('[data-testid="approval-modal"]')?.textContent?.includes('缺少 macOS 系统权限'), 'permission approval modal');
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="approval-modal"]'), 'permission approval close');

    await openCommandCenter('首次启动');
    await waitFor(() => document.querySelector('[data-testid="command-center"]')?.innerText.includes('首次启动'), 'onboarding command');
    await waitFor(() => findCommandRow('首次启动'), 'onboarding command row');
    findCommandRow('首次启动')?.click();
    await waitFor(() => document.querySelector('.onboardingSurface'), 'onboarding page');
    document.querySelector('.choiceGrid button:nth-child(2)')?.click();
    await waitFor(() => document.querySelector('.primaryButtonInline.wide')?.textContent?.includes('配置 Gateway'), 'remote onboarding action');
    document.querySelector('.primaryButtonInline.wide')?.click();
    await waitFor(() => document.body.innerText.includes('Hermes Agent 与本地服务') && document.body.innerText.includes('Gateway'), 'remote onboarding target');

    await openCommandCenter('首次启动');
    await waitFor(() => findCommandRow('首次启动'), 'onboarding command row again');
    findCommandRow('首次启动')?.click();
    await waitFor(() => document.querySelector('.onboardingSurface'), 'onboarding page again');
    document.querySelector('.choiceGrid button:nth-child(3)')?.click();
    await waitFor(() => document.querySelector('.primaryButtonInline.wide')?.textContent?.includes('查看诊断'), 'status onboarding action');
    document.querySelector('.primaryButtonInline.wide')?.click();
    await waitFor(() => document.body.innerText.includes('诊断与更新'), 'status onboarding target');

    return {
      commandCenter: true,
      pages: pages.map(([label]) => label),
      projectAgents: ['项目', 'Agents'],
      preferences: ['density', 'theme', 'permission-modal'],
      settings: settingsSections.map(([label]) => label),
      slash: true,
      workbench: workbenchChecks.map(([label]) => label),
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
