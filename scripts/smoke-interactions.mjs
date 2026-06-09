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
    const startNewTaskFromPage = async (label) => {
      findButton('新建任务')?.click();
      await waitFor(() => document.querySelector('[data-testid="composer"]'), `${label} return to chat`);
      await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), `${label} chat title`);
      await waitFor(() => document.querySelector('[data-testid="message-list"]')?.querySelectorAll('.message').length === 0, `${label} clears transcript`);
      await waitFor(() => document.querySelector('.toastNotice')?.textContent?.includes('已开始新任务'), `${label} new task feedback`);
      return {
        sendButton: document.querySelector('.sendButton'),
        textarea: document.querySelector('textarea[aria-label="消息"]'),
      };
    };

    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'composer');
    await waitFor(() => document.querySelectorAll('.emptyHints button').length === 3, 'empty prompt action buttons');
    if (!Array.from(document.querySelectorAll('.emptyHints button')).every((button) => button.disabled)) {
      throw new Error('Empty prompt action buttons should be disabled while gateway is skipped.');
    }

    let textarea = document.querySelector('textarea[aria-label="消息"]');
    setNativeValue(textarea, '/');
    await waitFor(() => document.querySelector('.slashMenu')?.textContent?.includes('/help'), 'slash menu');
    setNativeValue(textarea, '/mess');
    await waitFor(() => document.querySelector('.slashMenu')?.textContent?.includes('/messaging'), 'slash messaging suggestion');

    setNativeValue(textarea, '/help');
    await sleep(120);
    let sendButton = document.querySelector('.sendButton');
    if (sendButton.disabled) {
      throw new Error('Send button stayed disabled for local /help command.');
    }
    sendButton.click();
    await waitFor(() => document.body.innerText.includes('/skills [关键词]'), 'local slash output');

    textarea = document.querySelector('textarea[aria-label="消息"]');
    sendButton = document.querySelector('.sendButton');
    setNativeValue(textarea, '/summary');
    await sleep(120);
    sendButton.click();
    await waitFor(
      () => document.querySelector('.markdownTableWrap table')?.textContent?.includes('当前模型'),
      'summary markdown table rendering',
    );

    setNativeValue(textarea, '/agents');
    await sleep(120);
    if (sendButton.disabled) {
      throw new Error('Send button stayed disabled for /agents command.');
    }
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Agents'), 'slash agents navigation');
    ({ textarea, sendButton } = await startNewTaskFromPage('slash agents'));

    setNativeValue(textarea, '/settings 外观');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('设置'), 'slash settings navigation');
    await waitFor(() => document.body.innerText.includes('界面密度'), 'slash settings appearance section');
    ({ textarea, sendButton } = await startNewTaskFromPage('slash settings'));

    setNativeValue(textarea, '/messaging');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('消息网关'), 'slash messaging navigation');
    await waitFor(() => document.body.innerText.includes('Messaging Gateway'), 'slash messaging content');
    ({ textarea, sendButton } = await startNewTaskFromPage('slash messaging'));

    setNativeValue(textarea, '/diagnostics');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('诊断与更新'), 'slash diagnostics navigation');
    await waitFor(() => document.body.innerText.includes('Desktop shell'), 'slash diagnostics content');
    ({ textarea, sendButton } = await startNewTaskFromPage('slash diagnostics'));

    setNativeValue(textarea, '/profiles');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Profiles'), 'slash profiles navigation');
    await waitFor(() => document.body.innerText.includes('工作身份'), 'slash profiles content');
    ({ textarea, sendButton } = await startNewTaskFromPage('slash profiles'));

    setNativeValue(textarea, '/workbench terminal');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('Hermes Gateway'), 'slash workbench terminal navigation');

    findButton('添加')?.click();
    await waitFor(() => findButton('添加')?.getAttribute('aria-expanded') === 'true', 'attachment aria expanded');
    await waitFor(() => document.querySelector('.attachmentMenu')?.textContent?.includes('URL...'), 'attachment menu');
    findButton('URL...', document.querySelector('.attachmentMenu'))?.click();
    await waitFor(() => document.querySelector('.menuUrlForm input'), 'url form');
    findButton('添加', document.querySelector('.menuUrlForm'))?.click();
    await waitFor(() => document.querySelector('.menuStatus')?.textContent?.includes('请输入 URL'), 'empty url feedback');
    setNativeValue(document.querySelector('.menuUrlForm input'), 'not-a-url');
    findButton('添加', document.querySelector('.menuUrlForm'))?.click();
    await waitFor(() => document.querySelector('.menuStatus')?.textContent?.includes('http(s) URL'), 'invalid url feedback');
    setNativeValue(document.querySelector('.menuUrlForm input'), 'https://example.com/spec');
    findButton('添加', document.querySelector('.menuUrlForm'))?.click();
    await waitFor(() => textarea.value.includes('https://example.com/spec'), 'url inserted');
    await waitFor(() => document.querySelector('.composerNotice')?.textContent?.includes('URL 已添加'), 'url inserted feedback');
    setNativeValue(textarea, '');

    const firstSessionButton = document.querySelector('.sessionMain[data-session-id]');
    if (firstSessionButton) {
      firstSessionButton.click();
      await waitFor(
        () => document.querySelector('.toastNotice')?.textContent?.includes('正在打开')
          || document.querySelector('.toastNotice')?.textContent?.includes('已打开')
          || document.querySelector('.toastNotice')?.textContent?.includes('打开会话失败'),
        'session selection toast feedback',
      );
    }

    const firstDeleteButton = document.querySelector('.sessionMain[data-session-id]')?.closest('.sessionRow')?.querySelector('.rowActions button[aria-label="删除"]')
      ?? document.querySelector('.sessionRow .rowActions button[aria-label="删除"]');
    if (firstDeleteButton) {
      firstDeleteButton.click();
      await waitFor(
        () => document.querySelector('.toastNotice')?.textContent?.includes('再次点击')
          && document.querySelector('.sessionRow.confirmDelete .rowActions button[aria-label="确认删除"]'),
        'sidebar inline delete confirmation',
      );
    }

    findButton('语音输入')?.click();
    await waitFor(
      () => document.querySelector('.composerNotice')?.textContent?.includes('语音') || document.querySelector('.ghostIcon.active'),
      'voice input feedback',
    );
    findButton('停止语音输入')?.click();

    await openCommandCenter();
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center close');

    await openCommandCenter('打开终端');
    let commandInput = document.querySelector('[data-testid="command-center"] input');
    await waitFor(() => {
      const activeId = commandInput?.getAttribute('aria-activedescendant');
      const activeRow = activeId ? document.getElementById(activeId) : null;
      return activeRow?.getAttribute('aria-selected') === 'true' && activeRow.textContent?.includes('打开终端');
    }, 'command center aria selected row');
    commandInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter' }));
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center enter action close');
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('Hermes Gateway'), 'command center enter opens terminal');

    await openCommandCenter();
    commandInput = document.querySelector('[data-testid="command-center"] input');
    commandInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'End' }));
    await waitFor(() => {
      const activeId = commandInput?.getAttribute('aria-activedescendant');
      const activeRow = activeId ? document.getElementById(activeId) : null;
      return activeRow?.getAttribute('aria-selected') === 'true' && activeId !== 'command-option-0';
    }, 'command center end key selection');
    commandInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Home' }));
    await waitFor(() => {
      const activeId = commandInput?.getAttribute('aria-activedescendant');
      const activeRow = activeId ? document.getElementById(activeId) : null;
      return activeId === 'command-option-0' && activeRow?.getAttribute('aria-selected') === 'true';
    }, 'command center home key selection');
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center keyboard test close');

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
      if (tab === '文件') {
        findButton('复制摘要', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => {
          const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
          return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
        }, 'files copy feedback');
      }
      if (tab === '终端') {
        findButton('停止', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('停止'), 'terminal stop feedback');
      }
      if (tab === '预览') {
        findButton('刷新', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('刷新'), 'preview refresh feedback');
        const openGatewayButton = findButton('打开 Gateway', document.querySelector('[data-testid="right-workbench"]'));
        if (openGatewayButton && !openGatewayButton.disabled) {
          openGatewayButton.click();
          await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('Gateway'), 'preview open gateway feedback');
        }
      }
    }
    findButton('查看审批超时态', document.querySelector('[data-testid="right-workbench"]'))?.click();
    await waitFor(() => document.querySelector('[data-testid="approval-modal"]')?.textContent?.includes('审批已超时'), 'timeout approval modal');
    findButton('重新请求审批', document.querySelector('[data-testid="approval-modal"]'))?.click();
    await waitFor(() => document.querySelector('[data-testid="approval-modal"] .modalStatus')?.textContent?.includes('重新标记'), 'timeout approval feedback');
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="approval-modal"]'), 'timeout approval close');
    findButton('收起工作区')?.click();
    await waitFor(() => !document.querySelector('[data-testid="right-workbench"]') && document.querySelector('.floatingWorkbenchButton'), 'workbench collapse');
    findButton('展开工作区')?.click();
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]'), 'workbench expand');

    const pages = [
      ['Profiles', '工作身份'],
      ['技能库', '读取本机 Hermes skills'],
      ['自动化', '后台调度'],
      ['消息网关', 'Messaging Gateway'],
      ['设置', '界面密度'],
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
        if (label === '自动化') {
          const cronDeleteButton = document.querySelector('.automationRow button[aria-label="删除自动化任务"]');
          if (cronDeleteButton) {
            cronDeleteButton.click();
            await waitFor(
              () => document.querySelector('.automationRow.confirmDelete button[aria-label="确认删除自动化任务"]')
                && document.body.innerText.includes('再次点击删除'),
              'cron inline delete confirmation',
            );
          }
        }
      } catch (error) {
        failures.push(`${label}: ${error.message}`);
      }
    }

    if (failures.length) {
      throw new Error(failures.join('; '));
    }

    findButton('Profiles')?.click();
    await waitFor(() => document.body.innerText.includes('工作身份'), 'profiles feedback page');
    const profileRow = await waitFor(
      () => Array.from(document.querySelectorAll('.profileRow')).find((item) => !item.disabled),
      'selectable profile row',
    );
    profileRow.click();
    await waitFor(() => document.querySelector('.panelStatus')?.textContent?.includes('已选择'), 'profile selection feedback');
    const profileCopyButton = await waitFor(
      () => Array.from(document.querySelectorAll('.detailActions button'))
        .find((item) => item.textContent?.includes('复制 setup 命令') && !item.disabled),
      'profile copy setup action',
    );
    profileCopyButton.click();
    await waitFor(
      () => {
        const text = document.querySelector('.panelStatus')?.textContent || '';
        return text.includes('setup 命令已复制')
          || text.includes('当前环境无法访问剪贴板')
          || text.includes('没有可复制的 setup 命令')
          || text.includes('复制失败');
      },
      'profile copy feedback',
    );

    findButton('自动化')?.click();
    await waitFor(() => document.body.innerText.includes('后台调度'), 'automation feedback page');
    const automationRefreshButton = await waitFor(
      () => Array.from(document.querySelectorAll('.automationRow button.rowTextAction'))
        .find((item) => item.textContent?.includes('刷新') && !item.disabled),
      'automation row refresh action',
    );
    automationRefreshButton.click();
    await waitFor(() => document.querySelector('.surfaceStatus')?.textContent?.includes('刷新'), 'automation row refresh feedback');

    findButton('诊断')?.click();
    await waitFor(() => document.body.innerText.includes('诊断与更新'), 'diagnostics feedback page');
    findButton('重新诊断')?.click();
    await waitFor(() => document.querySelector('.diagnostics .surfaceStatus')?.textContent?.includes('重新诊断'), 'diagnostics refresh feedback');

    findButton('技能库')?.click();
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'skills copy page');
    const skillCopyButton = await waitFor(
      () => Array.from(document.querySelectorAll('.skillCard button')).find((item) => item.textContent?.includes('复制') && !item.disabled),
      'enabled skill copy action',
    );
    if (!skillCopyButton) {
      throw new Error('Missing skill copy action');
    }
    skillCopyButton.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('已复制')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('无法访问剪贴板')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('复制失败'),
      'skill copy feedback',
    );

    await openCommandCenter('项目');
    await waitFor(() => findCommandRow('项目'), 'projects command row');
    findCommandRow('项目')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'project command center auto close');
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page');
    const projectMoreButton = Array.from(document.querySelectorAll('.projectCard .iconButton'))
      .find((item) => item.getAttribute('aria-label')?.includes('Hermes Gateway 更多操作'));
    projectMoreButton?.click();
    await waitFor(() => document.querySelector('[data-testid="command-center"]'), 'project more command center');
    await waitFor(
      () => document.querySelector('[data-testid="command-center"] input')?.value.includes('Hermes Gateway'),
      'project more contextual query',
    );
    document.querySelector('.overlayBackdrop')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'project command center close');
    findButton('项目设置')?.click();
    await waitFor(() => document.querySelector('.settingsSurface'), 'project settings navigation');

    await openCommandCenter('Agents');
    await waitFor(() => findCommandRow('Agents'), 'agents command row');
    findCommandRow('Agents')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'agents command center auto close');
    await waitFor(() => document.body.innerText.includes('运行中工具'), 'agents page');
    findButton('刷新状态')?.click();
    await waitFor(() => document.querySelector('.surfaceStatus')?.textContent?.includes('Agents 状态'), 'agents refresh feedback');
    const staticAgentCard = await waitFor(() => document.querySelector('.agentCard.static'), 'static agent cards');
    if (staticAgentCard.tagName.toLowerCase() === 'button') {
      throw new Error('Static agent card should not be rendered as a button.');
    }
    findButton('新建任务')?.click();
    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'agents new task target');

    findButton('设置')?.click();
    await waitFor(() => document.querySelector('.settingsSurface'), 'settings surface');
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
    const findSettingButton = (rowLabel, buttonLabel) => {
      const row = settingRow(rowLabel);
      if (!row) {
        throw new Error(`Missing setting row ${rowLabel}`);
      }
      const button = findButton(buttonLabel, row);
      if (!button) {
        throw new Error(`Missing setting ${rowLabel} button ${buttonLabel}`);
      }
      return button;
    };

    await selectSettingsSection('外观', '界面密度');
    findSettingButton('界面密度', '舒适').click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-density') === 'compact', 'compact density applied');
    findSettingButton('主题', '浅色').click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-theme') === 'soft', 'soft theme applied');
    await waitFor(() => document.body.innerText.includes('主题已切换为柔和'), 'theme status feedback');

    await selectSettingsSection('集成', 'Gateway');
    findSettingButton('Plugins', '查看').click();
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'plugins settings navigation');
    findButton('设置')?.click();
    await waitFor(() => document.body.innerText.includes('Gateway'), 'settings integrations return');
    findSettingButton('消息平台', '管理').click();
    await waitFor(() => document.body.innerText.includes('Messaging Gateway'), 'messaging settings navigation');
    findButton('设置')?.click();
    await waitFor(() => document.body.innerText.includes('Gateway'), 'settings integrations return again');

    await selectSettingsSection('权限', '命令审批');
    findSettingButton('命令审批', '手动确认').click();
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
      settingsDeepLinks: ['Plugins', '消息平台'],
      settings: settingsSections.map(([label]) => label),
      slash: true,
      slashNavigation: ['/agents', '/settings', '/messaging', '/diagnostics', '/profiles', '/workbench'],
      uxHoles: ['voice-feedback', 'static-agent-card', 'skill-copy-feedback', 'command-center-close', 'workbench-feedback', 'diagnostics-feedback', 'project-actions-feedback', 'agents-automation-feedback', 'profile-feedback', 'command-keyboard-a11y', 'workbench-file-preview-feedback', 'approval-feedback', 'attachment-url-feedback', 'session-selection-feedback', 'inline-delete-confirmation', 'markdown-table-rendering', 'empty-prompt-actions'],
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
