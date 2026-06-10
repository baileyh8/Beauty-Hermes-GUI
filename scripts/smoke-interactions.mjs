import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const rootDir = new URL('..', import.meta.url);
const previewFixturePath = fileURLToPath(new URL('../package.json', import.meta.url));
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
  await evaluate(client, `(() => {
    localStorage.removeItem('beauty-hermes-ui-density');
    localStorage.removeItem('beauty-hermes-pinned-sessions');
    localStorage.removeItem('beauty-hermes-project-configs');
    localStorage.removeItem('beauty-hermes-ui-theme');
    window.setTimeout(() => window.location.reload(), 0);
    return true;
  })()`);
  await wait(1000);

  const result = await evaluate(client, `window.__beautyPreviewFixturePath = ${JSON.stringify(previewFixturePath)}; (${async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const previewFixturePath = window.__beautyPreviewFixturePath;
    const waitFor = async (predicate, label, timeout = 8000) => {
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
    const findNavButton = (label) => Array.from(document.querySelectorAll('.sidebar button, .sidebarFooter button'))
      .find((item) => item.textContent?.includes(label) || item.getAttribute('aria-label')?.includes(label));
    const findSidebarProject = (label) => {
      const section = Array.from(document.querySelectorAll('.navSection'))
        .find((item) => item.querySelector('h2')?.textContent?.trim() === '项目');
      return section ? Array.from(section.querySelectorAll('.sessionMain'))
        .find((item) => item.textContent?.includes(label)) : null;
    };
    const findCommandRow = (title) => Array.from(document.querySelectorAll('.commandRow'))
      .find((item) => item.querySelector('strong')?.textContent?.trim() === title);
    const findProjectCard = (title) => Array.from(document.querySelectorAll('.projectCard'))
      .find((item) => item.querySelector('h3')?.textContent?.trim() === title);
    const findProjectAction = (title, label) => {
      const card = findProjectCard(title);
      return card ? Array.from(card.querySelectorAll('button')).find((item) => item.textContent?.includes(label)) : null;
    };
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
      const feedbackSeen = waitFor(
        () => document.querySelector('.toastNotice')?.textContent?.includes('已开始新任务'),
        `${label} new task feedback`,
        3000,
      );
      await waitFor(() => document.querySelector('[data-testid="composer"]'), `${label} return to chat`);
      await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), `${label} chat title`);
      await waitFor(() => document.querySelector('[data-testid="message-list"]')?.querySelectorAll('.message').length === 0, `${label} clears transcript`);
      await feedbackSeen;
      return {
        sendButton: document.querySelector('.sendButton'),
        textarea: document.querySelector('textarea[aria-label="消息"]'),
      };
    };
    const runSlashNavigation = async (command, titleText, contentText, label) => {
      setNativeValue(textarea, command);
      await sleep(120);
      sendButton.click();
      await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes(titleText), `${label} title`);
      if (contentText) {
        await waitFor(() => document.body.innerText.includes(contentText), `${label} content`);
      }
      ({ textarea, sendButton } = await startNewTaskFromPage(label));
    };

    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'composer');
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-density') === 'comfortable', 'default density after preference reset');
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-theme') === 'light', 'default theme after preference reset');
    await waitFor(() => document.querySelectorAll('.emptyHints button').length === 3, 'empty prompt action buttons');
    if (!Array.from(document.querySelectorAll('.emptyHints button')).every((button) => button.disabled)) {
      throw new Error('Empty prompt action buttons should be disabled while gateway is skipped.');
    }

    await waitFor(() => window.__beautyHermesInjectGatewayEvent, 'gateway event smoke injector');
    window.__beautyHermesInjectGatewayEvent({
      payload: { session_id: 'smoke-order' },
      type: 'message.start',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: {
        command: 'pwd 2>&1',
        session_id: 'smoke-order',
        tool_id: 'smoke-tool-order',
      },
      type: 'tool.start',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: { reasoning: '阶段思考输出：先确认目标，再执行命令。', session_id: 'smoke-order' },
      type: 'reasoning.delta',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: { text: '正在梳理命令输出和下一步。', session_id: 'smoke-order' },
      type: 'status.update',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: {
        command: 'pwd 2>&1',
        duration_s: 0.2,
        output: '/tmp/beauty-hermes',
        session_id: 'smoke-order',
        tool_id: 'smoke-tool-order',
      },
      type: 'tool.complete',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: { text: 'pondering', session_id: 'smoke-order' },
      type: 'thinking.delta',
    });
    await waitFor(() => document.querySelector('[data-testid="message-list"]')?.innerText.includes('阶段思考输出'), 'reasoning delta visible body');
    await waitFor(() => document.querySelector('[data-testid="message-list"]')?.innerText.includes('正在梳理命令输出和下一步'), 'status update promoted into reasoning body');
    const transcriptNodes = Array.from(document.querySelectorAll('[data-testid="message-list"] .message'));
    const reasoningIndex = transcriptNodes.findIndex((item) => item.textContent?.includes('阶段思考输出'));
    const toolIndex = transcriptNodes.findIndex((item) => item.textContent?.includes('已运行命令'));
    const thinkingIndex = transcriptNodes.findIndex((item) => item.textContent?.includes('正在思考'));
    if (!(reasoningIndex >= 0 && toolIndex >= 0 && thinkingIndex >= 0 && reasoningIndex < toolIndex && toolIndex < thinkingIndex)) {
      throw new Error(`Transcript event order should be reasoning -> tool -> thinking, got ${JSON.stringify({ reasoningIndex, toolIndex, thinkingIndex })}`);
    }
    await startNewTaskFromPage('transcript ordering');

    let textarea = document.querySelector('textarea[aria-label="消息"]');
    setNativeValue(textarea, '/');
    await waitFor(() => document.querySelector('.slashMenu')?.textContent?.includes('/help'), 'slash menu');
    setNativeValue(textarea, '/mess');
    await waitFor(() => document.querySelector('.slashMenu')?.textContent?.includes('/messaging'), 'slash messaging suggestion');
    await waitFor(() => document.querySelector('.slashItem.selected')?.getAttribute('aria-selected') === 'true', 'slash aria selected');
    textarea.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }));
    await waitFor(() => !document.querySelector('.slashMenu'), 'slash escape close');

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
    await waitFor(() => document.querySelector('.agentControlStrip'), 'agents gateway controls');
    for (const label of ['启动', '重启', '停止']) {
      if (!findButton(label, document.querySelector('.agentControlStrip'))) {
        throw new Error(`Agents page should expose Gateway ${label} action.`);
      }
    }
    if (!Array.from(document.querySelectorAll('.agentCardActions button')).some((button) => button.textContent?.includes('启动') || button.textContent?.includes('复制摘要'))) {
      throw new Error('Agents page should expose inline card actions, not read-only cards.');
    }
    ({ textarea, sendButton } = await startNewTaskFromPage('slash agents'));

    await runSlashNavigation('/projects', '项目', '项目工作区', 'slash projects');
    await runSlashNavigation('/settings 外观', '设置', '界面密度', 'slash settings');
    await runSlashNavigation('/models', '设置', '默认模型', 'slash models');
    await runSlashNavigation('/approval', '设置', '命令审批', 'slash approval');
    setNativeValue(textarea, '/skills');
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('技能库'), 'slash skills title');
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'slash skills content');
    const firstSkillName = await waitFor(
      () => document.querySelector('.skillCard .skillTitle strong')?.textContent?.trim(),
      'first skill name',
    );
    ({ textarea, sendButton } = await startNewTaskFromPage('slash skills'));

    const skillSearchText = firstSkillName.split(/[-_:]/)[0] || firstSkillName;
    setNativeValue(textarea, `/skills ${skillSearchText}`);
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('技能库'), 'slash skills search title');
    await waitFor(
      () => document.querySelector('input[aria-label="搜索 skill"]')?.value === skillSearchText,
      'slash skills query prefill',
    );
    ({ textarea, sendButton } = await startNewTaskFromPage('slash skills query'));

    setNativeValue(textarea, `/skill ${firstSkillName}`);
    await sleep(120);
    sendButton.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('技能库'), 'slash skill detail title');
    await waitFor(
      () => Array.from(document.querySelectorAll('.skillCard.expanded'))
        .some((card) => card.getAttribute('data-skill-name') === firstSkillName && card.querySelector('.skillDetail')),
      'slash skill expands target',
    );
    ({ textarea, sendButton } = await startNewTaskFromPage('slash skill detail'));
    await runSlashNavigation('/cron', '自动化', '后台调度', 'slash cron');
    await runSlashNavigation('/messaging', '消息网关', '管理 Hermes Gateway', 'slash messaging');
    await runSlashNavigation('/diagnostics', '诊断与更新', 'Desktop shell', 'slash diagnostics');
    await runSlashNavigation('/diagnose', '诊断与更新', 'Desktop shell', 'slash diagnose');
    await runSlashNavigation('/gateway', '诊断与更新', 'Desktop shell', 'slash gateway');
    await runSlashNavigation('/profiles', 'Profiles', '工作身份', 'slash profiles');
    await runSlashNavigation('/onboarding', '首次启动', '选择 Hermes', 'slash onboarding');
    await runSlashNavigation('/files', 'Hermes Agent', '变更文件', 'slash files');
    await runSlashNavigation('/preview', 'Hermes Agent', '暂无预览产物', 'slash preview');

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

    const sidebarSection = (title) => Array.from(document.querySelectorAll('.navSection'))
      .find((section) => section.querySelector('h2')?.textContent?.includes(title));
    const firstRecentRow = sidebarSection('最近')?.querySelector('.sessionRow');
    const firstPinButton = firstRecentRow?.querySelector('.rowActions button[aria-label="置顶"]');
    if (firstRecentRow && firstPinButton) {
      const pinnedTitle = firstRecentRow.querySelector('.sessionText strong')?.textContent?.trim();
      const pinnedId = firstRecentRow.querySelector('.sessionMain[data-session-id]')?.getAttribute('data-session-id');
      if (!pinnedTitle || !pinnedId) {
        throw new Error('Recent session row should expose title and session id before pinning.');
      }
      firstPinButton.click();
      await waitFor(
        () => sidebarSection('置顶')?.textContent?.includes(pinnedTitle),
        'sidebar pinned section receives session',
      );
      await waitFor(
        () => JSON.parse(localStorage.getItem('beauty-hermes-pinned-sessions') || '[]').includes(pinnedId),
        'sidebar pinned sessions persisted',
      );
      if (sidebarSection('最近')?.textContent?.includes(pinnedTitle)) {
        throw new Error('Pinned session should move out of recent list.');
      }
      const unpinButton = sidebarSection('置顶')?.querySelector('.rowActions button[aria-label="取消置顶"]');
      if (!unpinButton) {
        throw new Error('Pinned session should expose unpin action.');
      }
      unpinButton.click();
      await waitFor(
        () => !(sidebarSection('置顶')?.textContent || '').includes(pinnedTitle),
        'sidebar unpin removes pinned session',
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
    findButton('关闭命令中心', document.querySelector('[data-testid="command-center"]'))?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'command center close button');

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

    window.__beautyHermesInjectGatewayEvent({
      payload: {
        command: 'echo activity-workbench 2>&1',
        duration_s: 0.4,
        output: 'activity-workbench',
        session_id: 'smoke-activity',
        tool_id: 'smoke-activity-tool',
      },
      type: 'tool.complete',
    });
    window.__beautyHermesInjectGatewayEvent({
      payload: {
        files: [{ change: 'mod', meta: 'smoke preview fixture', path: previewFixturePath }],
        session_id: 'smoke-preview',
      },
      type: 'file.changed',
    });

    await waitFor(() => document.querySelector('[data-testid="right-workbench"]'), 'right workbench');
    const workbenchChecks = [
      ['文件', '变更文件'],
      ['终端', 'Hermes Gateway'],
      ['预览', 'package.json'],
      ['活动', '当前任务'],
    ];
    for (const [tab, expected] of workbenchChecks) {
      findButton(tab, document.querySelector('[data-testid="right-workbench"]'))?.click();
      await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes(expected), `${tab} tab`);
      if (tab === '文件') {
        for (const label of ['预览', '打开', '复制路径', '复制摘要']) {
          if (!findButton(label, document.querySelector('[data-testid="right-workbench"]'))) {
            throw new Error(`Files workbench should expose ${label} action.`);
          }
        }
        findButton('复制摘要', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => {
          const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
          return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
        }, 'files copy feedback');
      }
      if (tab === '终端') {
        for (const label of ['启动', '重启', '停止', '刷新', '复制日志', '清空']) {
          if (!findButton(label, document.querySelector('[data-testid="right-workbench"]'))) {
            throw new Error(`Terminal workbench should expose ${label} action.`);
          }
        }
        findButton('停止', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('停止'), 'terminal stop feedback');
        findButton('刷新', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('刷新'), 'terminal refresh feedback');
        const copyLogsButton = findButton('复制日志', document.querySelector('[data-testid="right-workbench"]'));
        if (copyLogsButton && !copyLogsButton.disabled) {
          copyLogsButton.click();
          await waitFor(() => {
            const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
            return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
          }, 'terminal copy logs feedback');
        }
      }
      if (tab === '预览') {
        await waitFor(
          () => document.querySelector('[data-testid="right-workbench"] .previewTextFrame')?.textContent?.includes('beauty-hermes-gui'),
          'preview real file content',
        );
        for (const label of ['打开文件', '复制路径', '复制摘要', '复制内容']) {
          if (!findButton(label, document.querySelector('[data-testid="right-workbench"]'))) {
            throw new Error(`Preview workbench should expose ${label} action.`);
          }
        }
        findButton('刷新', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(
          () => {
            const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
            return text.includes('刷新完成') || text.includes('预览已加载');
          },
          'preview refresh feedback',
        );
        const copyPreviewSummaryButton = await waitFor(() => {
          const button = findButton('复制摘要', document.querySelector('[data-testid="right-workbench"]'));
          return button && !button.disabled ? button : null;
        }, 'preview copy summary button enabled');
        copyPreviewSummaryButton.click();
        await waitFor(() => {
          const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
          return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
        }, 'preview copy summary feedback');
        const copyPreviewContentButton = await waitFor(() => {
          const button = findButton('复制内容', document.querySelector('[data-testid="right-workbench"]'));
          return button && !button.disabled ? button : null;
        }, 'preview copy content button enabled');
        copyPreviewContentButton.click();
        await waitFor(() => {
          const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
          return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
        }, 'preview copy content feedback');
        const openGatewayButton = findButton('打开 Gateway', document.querySelector('[data-testid="right-workbench"]'));
        if (openGatewayButton && !openGatewayButton.disabled) {
          openGatewayButton.click();
          await waitFor(() => document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent?.includes('Gateway'), 'preview open gateway feedback');
        }
      }
      if (tab === '活动') {
        await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('工具详情'), 'activity tool detail panel');
        if (!findButton('复制详情', document.querySelector('[data-testid="right-workbench"]')) || !findButton('打开终端', document.querySelector('[data-testid="right-workbench"]'))) {
          throw new Error('Activity workbench should expose copy details and open terminal actions.');
        }
        findButton('复制详情', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => {
          const text = document.querySelector('[data-testid="right-workbench"] .railStatus')?.textContent || '';
          return text.includes('已复制') || text.includes('无法访问剪贴板') || text.includes('复制失败');
        }, 'activity copy tool feedback');
        findButton('打开终端', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('Hermes Gateway'), 'activity opens terminal');
        findButton('活动', document.querySelector('[data-testid="right-workbench"]'))?.click();
        await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('查看审批超时态'), 'activity restored after terminal action');
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
      ['Agents', 'Gateway 控制'],
      ['技能库', '读取本机 Hermes skills'],
      ['自动化', '后台调度'],
      ['消息网关', '管理 Hermes Gateway'],
      ['设置', '通用'],
      ['诊断', '诊断与更新'],
    ];

    const failures = [];
    for (const [label, expected] of pages) {
      const button = findNavButton(label);
      if (!button) {
        failures.push(`${label}: missing button`);
        continue;
      }
      button.click();
      try {
        await waitFor(() => document.body.innerText.includes(expected), `${label} content`, 2500);
        const loadFailures = ['读取 profiles 失败', '读取 skills 失败', '读取 cron 失败', '读取平台失败'];
        const currentFailure = loadFailures.find((pattern) => document.body.innerText.includes(pattern));
        if (currentFailure) {
          throw new Error(currentFailure);
        }
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

    findNavButton('Profiles')?.click();
    await waitFor(() => document.body.innerText.includes('工作身份'), 'profiles feedback page');
    const profileCreateButton = await waitFor(
      () => {
        const button = document.querySelector('.inlineCreateForm button[type="submit"]');
        return button && !button.disabled && button.textContent?.includes('创建') ? button : null;
      },
      'available profile create action',
      12000,
    );
    profileCreateButton.click();
    await waitFor(() => document.querySelector('.panelStatus')?.textContent?.includes('请输入 profile 名称'), 'profile create validation feedback');
    const profileRow = await waitFor(
      () => Array.from(document.querySelectorAll('.profileRow')).find((item) => !item.disabled),
      'selectable profile row',
    );
    profileRow.click();
    await waitFor(() => document.querySelector('.panelStatus')?.textContent?.includes('已选择'), 'profile selection feedback');
    const profileEditor = await waitFor(() => document.querySelector('.profileEditGrid'), 'profile edit controls');
    const profileNameInput = profileEditor.querySelector('input[aria-label="Profile 名称"]');
    const profileDescriptionInput = profileEditor.querySelector('textarea[aria-label="Profile 描述"]');
    const profileProviderInput = profileEditor.querySelector('input[aria-label="Profile provider"]');
    const profileModelInput = profileEditor.querySelector('input[aria-label="Profile model"]');
    const profileSoulInput = profileEditor.querySelector('textarea[aria-label="Profile SOUL"]');
    if (!profileNameInput || !profileDescriptionInput || !profileProviderInput || !profileModelInput || !profileSoulInput) {
      throw new Error('Profiles editor should expose name, description, model, provider, and SOUL controls.');
    }
    if (profileDescriptionInput.disabled || profileProviderInput.disabled || profileModelInput.disabled) {
      throw new Error('Profiles editor description/model controls should be editable.');
    }
    if (!findButton('保存描述', profileEditor) || !findButton('保存模型', profileEditor) || !findButton('读取 SOUL', profileEditor) || !findButton('保存 SOUL', profileEditor)) {
      throw new Error('Profiles editor should expose save/read actions.');
    }
    if (!findButton('打开终端', profileEditor) || !findButton('删除', profileEditor)) {
      throw new Error('Profiles editor should expose terminal and delete actions.');
    }
    if (profileNameInput.value === 'default' && !findButton('删除', profileEditor)?.disabled) {
      throw new Error('Default profile delete action should be disabled.');
    }
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

    findNavButton('自动化')?.click();
    await waitFor(() => document.body.innerText.includes('后台调度'), 'automation feedback page');
    const cronDeliverySelect = await waitFor(
      () => {
        const select = document.querySelector('.cronCreateForm select[aria-label="投递目标"]');
        return select && !select.disabled ? select : null;
      },
      'cron delivery target select',
      12000,
    );
    const cronDetailButton = Array.from(document.querySelectorAll('.automationRow button[aria-label="查看自动化任务详情"]'))
      .find((item) => !item.disabled);
    if (cronDetailButton) {
      cronDetailButton.click();
      await waitFor(() => document.querySelector('.cronEditor'), 'cron editor expansion');
      for (const label of ['编辑任务名称', '编辑计划表达式', '编辑投递目标', '编辑自动化 prompt']) {
        if (!document.querySelector(`[aria-label="${label}"]`)) {
          throw new Error(`Missing cron editor control ${label}`);
        }
      }
      if (!Array.from(document.querySelectorAll('.cronEditor button')).some((item) => item.textContent?.includes('保存更改'))) {
        throw new Error('Cron editor should expose save action.');
      }
    }
    const cronCreateButton = await waitFor(
      () => {
        const button = document.querySelector('.cronCreateForm button[type="submit"]');
        return button && !button.disabled && button.textContent?.includes('新建') ? button : null;
      },
      'available cron create action',
      12000,
    );
    cronCreateButton.click();
    await waitFor(() => document.querySelector('.surfaceStatus')?.textContent?.includes('请输入自动化 prompt'), 'cron create validation feedback');
    const automationRefreshButton = await waitFor(
      () => Array.from(document.querySelectorAll('.automationRow button.rowTextAction'))
        .find((item) => item.textContent?.includes('刷新') && !item.disabled),
      'automation row refresh action',
    );
    automationRefreshButton.click();
    await waitFor(() => document.querySelector('.surfaceStatus')?.textContent?.includes('刷新'), 'automation row refresh feedback');

    findNavButton('诊断')?.click();
    await waitFor(() => document.body.innerText.includes('诊断与更新'), 'diagnostics feedback page');
    findButton('重新诊断')?.click();
    await waitFor(() => document.querySelector('.diagnostics .surfaceStatus')?.textContent?.includes('重新诊断'), 'diagnostics refresh feedback');
    for (const label of ['检查更新', '执行更新', '更新状态', '启动 Gateway', '重启 Gateway', '停止 Gateway', '复制诊断摘要']) {
      const action = findButton(label, document.querySelector('.diagnostics'));
      if (!action) {
        throw new Error(`Missing diagnostics action ${label}`);
      }
      if (label !== '执行更新' && action.disabled) {
        throw new Error(`Diagnostics action should be available: ${label}`);
      }
    }
    findButton('更新状态', document.querySelector('.diagnostics')).click();
    await waitFor(
      () => /hermes-update|后台动作|暂无运行记录/.test(document.querySelector('.diagnostics .surfaceStatus')?.textContent || ''),
      'diagnostics update status feedback',
      20000,
    );
    findButton('检查更新', document.querySelector('.diagnostics')).click();
    await waitFor(
      () => document.querySelector('.diagnostics .surfaceStatus')?.textContent?.includes('更新检查完成')
        || document.querySelector('.diagnostics .surfaceStatus')?.textContent?.includes('检查更新失败'),
      'diagnostics update check feedback',
      70000,
    );

    findNavButton('首次启动')?.click();
    await waitFor(() => document.body.innerText.includes('连接 Hermes 工作方式'), 'onboarding page');
    const onboarding = await waitFor(() => document.querySelector('.onboardingPanel'), 'onboarding panel');
    for (const label of ['Hermes Home', 'Provider', 'Model', '远程 Gateway URL', 'Gateway Token']) {
      if (!Array.from(onboarding.querySelectorAll('label span')).some((item) => item.textContent?.includes(label))) {
        throw new Error(`Missing onboarding config field ${label}`);
      }
    }
    for (const label of ['读取配置', '检查连接', '启动 Gateway', 'Setup', '保存配置']) {
      if (!findButton(label, onboarding)) {
        throw new Error(`Missing onboarding action ${label}`);
      }
    }
    const remoteChoice = findButton('连接远程 Gateway', onboarding);
    if (!remoteChoice) {
      throw new Error('Missing onboarding remote mode selector.');
    }
    remoteChoice.click();
    await waitFor(() => !onboarding.querySelector('input[placeholder="https://gateway.example.com"]')?.disabled, 'onboarding remote url enabled');
    findButton('检查连接', onboarding)?.click();
    await waitFor(
      () => document.querySelector('.onboardingStatus')?.textContent?.includes('请输入远程 Gateway URL'),
      'onboarding remote validation feedback',
    );

    findNavButton('技能库')?.click();
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'skills copy page');
    const skillToggleButton = await waitFor(
      () => Array.from(document.querySelectorAll('.skillCard button'))
        .find((item) => !item.disabled && (item.textContent?.includes('停用') || item.textContent?.includes('启用'))),
      'skill toggle action',
      20000,
    );
    if (!skillToggleButton || skillToggleButton.disabled) {
      throw new Error('Skill toggle action should be available.');
    }
    for (const label of ['详情', '复制路径', '复制摘要', '打开位置']) {
      if (!Array.from(document.querySelectorAll('.skillCard button')).some((item) => item.textContent?.includes(label))) {
        throw new Error(`Skill card should expose ${label} action.`);
      }
    }
    findButton('详情', document.querySelector('.skillCard'))?.click();
    await waitFor(() => document.querySelector('.skillDetail'), 'skill detail expansion');
    const skillCopyButton = await waitFor(
      () => Array.from(document.querySelectorAll('.skillCard button')).find((item) => item.textContent?.includes('复制路径') && !item.disabled),
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
    await openCommandCenter(firstSkillName);
    await waitFor(() => findCommandRow(firstSkillName), 'skill command row');
    findCommandRow(firstSkillName)?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'skill command center auto close');
    await waitFor(
      () => Array.from(document.querySelectorAll('.skillCard.expanded'))
        .some((card) => card.getAttribute('data-skill-name') === firstSkillName && card.querySelector('.skillDetail')),
      'command center skill expands target',
    );
    const skillSearchInput = document.querySelector('input[aria-label="搜索 skill"]');
    if (skillSearchInput) {
      setNativeValue(skillSearchInput, '');
      await waitFor(() => document.querySelector('input[aria-label="搜索 skill"]')?.value === '', 'skill search cleared');
    }
    const localSkillName = `beauty-smoke-${Date.now().toString(36)}`;
    const localSkillDescription = 'UI lifecycle smoke skill';
    const skillNameInput = await waitFor(
      () => document.querySelector('input[aria-label="新建 skill 名称"]'),
      'local skill name input',
    );
    const skillDescriptionInput = await waitFor(
      () => document.querySelector('input[aria-label="新建 skill 描述"]'),
      'local skill description input',
    );
    setNativeValue(skillNameInput, localSkillName);
    setNativeValue(skillDescriptionInput, localSkillDescription);
    await waitFor(
      () => document.querySelector('input[aria-label="新建 skill 名称"]')?.value === localSkillName
        && document.querySelector('input[aria-label="新建 skill 描述"]')?.value === localSkillDescription,
      'local skill create inputs filled',
    );
    await sleep(150);
    const createSkillButton = await waitFor(
      () => {
        const button = document.querySelector('.skillCreateForm button');
        return button && !button.disabled ? button : null;
      },
      'local skill create button enabled',
      20000,
    );
    if (!createSkillButton.textContent?.includes('新建本地 skill')) {
      throw new Error('Local skill create button has unexpected label.');
    }
    const createdSkill = await window.hermesDesktop.api({
      body: { description: localSkillDescription, name: localSkillName },
      method: 'POST',
      path: '/api/skills',
      timeoutMs: 20000,
    });
    if (!createdSkill?.skill?.name) {
      throw new Error(`Local skill direct create returned unexpected payload: ${JSON.stringify(createdSkill)}`);
    }
    const editedSkillContent = [
      '---',
      `name: "${localSkillName}"`,
      'description: "Edited from UI smoke"',
      '---',
      '',
      `# ${localSkillName}`,
      '',
      'Edited from UI lifecycle smoke.',
    ].join('\n');
    const loadedSkill = await window.hermesDesktop.api({
      path: `/api/skills/${encodeURIComponent(localSkillName)}`,
      timeoutMs: 12000,
    });
    if (!loadedSkill?.skill?.content?.includes(localSkillName)) {
      throw new Error('Local skill bridge did not read created SKILL.md.');
    }
    const savedSkill = await window.hermesDesktop.api({
      body: { content: editedSkillContent },
      method: 'PUT',
      path: `/api/skills/${encodeURIComponent(localSkillName)}`,
      timeoutMs: 12000,
    });
    if (!savedSkill?.skill?.content?.includes('Edited from UI lifecycle smoke.')) {
      throw new Error('Local skill bridge did not persist edited SKILL.md.');
    }
    await window.hermesDesktop.api({
      method: 'DELETE',
      path: `/api/skills/${encodeURIComponent(localSkillName)}`,
      timeoutMs: 12000,
    });
    let deletedSkillStillReadable = false;
    try {
      await window.hermesDesktop.api({
        path: `/api/skills/${encodeURIComponent(localSkillName)}`,
        timeoutMs: 12000,
      });
      deletedSkillStillReadable = true;
    } catch {
      deletedSkillStillReadable = false;
    }
    if (deletedSkillStillReadable) {
      throw new Error('Local skill bridge delete did not remove SKILL.md.');
    }

    await openCommandCenter('项目');
    await waitFor(() => findCommandRow('项目'), 'projects command row');
    findCommandRow('项目')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'project command center auto close');
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page');
    findSidebarProject('会话')?.click();
    await waitFor(
      () => findProjectCard('会话')?.classList.contains('selected'),
      'project sidebar selection targets session card',
    );
    findSidebarProject('本地 Hermes')?.click();
    await waitFor(
      () => findProjectCard('本地 Hermes 工作区')?.classList.contains('selected'),
      'project sidebar selection targets local card',
    );
    findSidebarProject('项目档案')?.click();
    await waitFor(
      () => document.querySelector('.projectConfigPanel')?.classList.contains('selected'),
      'project sidebar selection targets config panel',
    );
    const newProjectButton = findButton('新建项目', document.querySelector('.projectConfigPanel'));
    if (!newProjectButton) {
      throw new Error('Missing project config new action.');
    }
    newProjectButton.click();
    await waitFor(() => document.querySelector('input[aria-label="项目名称"]'), 'project config form');
    setNativeValue(document.querySelector('input[aria-label="项目名称"]'), 'Smoke 项目');
    setNativeValue(document.querySelector('input[aria-label="工作目录"]'), '/tmp/Beauty-Hermes-GUI-commit');
    setNativeValue(document.querySelector('input[aria-label="默认模型"]'), 'smoke-model-alpha');
    setNativeValue(document.querySelector('input[aria-label="Hermes profile"]'), 'default');
    setNativeValue(document.querySelector('textarea[aria-label="项目备注"]'), 'smoke project config');
    findButton('保存项目', document.querySelector('.projectConfigPanel'))?.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('已保存'),
      'project config save feedback',
    );
    await waitFor(
      () => Array.from(document.querySelectorAll('.projectConfigRow')).some((row) => row.textContent?.includes('Smoke 项目')),
      'project config saved row',
    );
    const applyProjectButton = findButton('应用项目', document.querySelector('.projectConfigPanel'));
    if (!applyProjectButton) {
      throw new Error('Missing project config apply action.');
    }
    applyProjectButton.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('已应用'),
      'project config apply feedback',
    );
    await waitFor(
      () => document.querySelector('.profileBlock')?.textContent?.includes('smoke-model-alpha'),
      'project config apply updates current model',
    );
    const copyProjectPrompt = findButton('复制启动提示', document.querySelector('.projectConfigPanel'));
    if (!copyProjectPrompt) {
      throw new Error('Missing project config copy prompt action.');
    }
    copyProjectPrompt.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('已复制')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('无法访问剪贴板')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('复制失败'),
      'project config copy prompt feedback',
    );
    const deleteProjectButton = findButton('删除项目', document.querySelector('.projectConfigPanel'));
    if (!deleteProjectButton) {
      throw new Error('Missing project config delete action.');
    }
    deleteProjectButton.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('再次点击删除'),
      'project config delete confirmation',
    );
    findButton('确认删除', document.querySelector('.projectConfigPanel'))?.click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('已删除'),
      'project config delete feedback',
    );
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
    const workspaceAction = findProjectAction('本地 Hermes 工作区', '查看文件');
    if (!workspaceAction) {
      throw new Error('Missing project workspace file action.');
    }
    for (const label of ['复制路径', '打开目录', '项目设置']) {
      if (!findProjectAction('本地 Hermes 工作区', label)) {
        throw new Error(`Missing project workspace action ${label}.`);
      }
    }
    for (const label of ['重启', '停止', '打开日志']) {
      if (!findProjectAction('Hermes Gateway', label)) {
        throw new Error(`Missing project gateway action ${label}.`);
      }
    }
    for (const label of ['刷新会话', '新建任务']) {
      if (!findProjectAction('会话', label)) {
        throw new Error(`Missing project sessions action ${label}.`);
      }
    }
    workspaceAction.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), 'workspace action opens chat');
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('变更文件'), 'workspace action opens files workbench');
    findNavButton('项目')?.click();
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page after workspace action');
    await waitFor(() => document.querySelector('.projectSessionManager'), 'project session manager');
    if (!findButton('搜索/刷新', document.querySelector('.projectSessionManager')) && !findButton('同步中', document.querySelector('.projectSessionManager'))) {
      throw new Error('Missing project session manager action 搜索/刷新');
    }
    for (const label of ['显示归档', '全选']) {
      if (!findButton(label, document.querySelector('.projectSessionManager'))) {
        throw new Error(`Missing project session manager action ${label}`);
      }
    }
    const projectSearch = document.querySelector('.projectSessionManager input[aria-label="搜索会话"]');
    if (!projectSearch) {
      throw new Error('Missing project session search input.');
    }
    const sessionRows = document.querySelectorAll('.projectSessionRow');
    if (sessionRows.length > 0) {
      for (const label of ['重命名', '归档', '导出', '删除']) {
        const hasAction = Array.from(document.querySelectorAll('.projectSessionRow button'))
          .some((button) => button.textContent?.includes(label));
        if (!hasAction) {
          throw new Error(`Missing project session row action ${label}`);
        }
      }
    }
    const sessionAction = findProjectAction('会话', '新建任务') || findProjectAction('会话', '打开最近');
    if (!sessionAction) {
      throw new Error('Missing project session action.');
    }
    if (sessionAction.disabled) {
      throw new Error(`Project session action is disabled: ${document.querySelector('.surfaceStatus')?.textContent || 'no status'}`);
    }
    sessionAction.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), 'project new task opens chat')
      .catch((error) => {
        throw new Error(`${error.message}; title=${document.querySelector('[data-testid="surface-title"]')?.textContent || 'none'}; status=${document.querySelector('.surfaceStatus')?.textContent || 'none'}; actionDisabled=${sessionAction.disabled}`);
      });
    findNavButton('项目')?.click();
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page after session action');
    findButton('项目设置')?.click();
    await waitFor(() => document.querySelector('.settingsSurface'), 'project settings navigation');

    await openCommandCenter('Agents');
    await waitFor(() => findCommandRow('Agents'), 'agents command row');
    findCommandRow('Agents')?.click();
    await waitFor(() => !document.querySelector('[data-testid="command-center"]'), 'agents command center auto close');
    await waitFor(() => document.body.innerText.includes('运行中工具'), 'agents page');
    await waitFor(() => document.body.innerText.includes('后台动作'), 'agents background actions column');
    findButton('刷新状态')?.click();
    await waitFor(() => document.querySelector('.surfaceStatus')?.textContent?.includes('Agents 状态'), 'agents refresh feedback');
    const staticAgentCard = await waitFor(() => document.querySelector('.agentCard.static'), 'static agent cards');
    if (staticAgentCard.tagName.toLowerCase() === 'button') {
      throw new Error('Static agent card should not be rendered as a button.');
    }
    findButton('新建任务')?.click();
    await waitFor(() => document.querySelector('[data-testid="composer"]'), 'agents new task target');

    findNavButton('设置')?.click();
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
    const findRuntimePolicySurface = () => {
      const explicitSurface = document.querySelector(
        '[data-testid="runtime-policy-settings"], [data-testid="runtime-policy-controls"], .runtimePolicySettings, .runtimePolicyControls',
      );
      if (explicitSurface) {
        return explicitSurface;
      }
      const policyPattern = /runtime policy|tool use|environment probe|image input|运行时策略|运行策略|高级运行参数|工具使用策略|环境探测|图片输入/i;
      return Array.from(document.querySelectorAll('.settingRow')).find((row) => policyPattern.test(row.textContent || ''));
    };
    const assertRuntimePolicyControls = async () => {
      const runtimePolicySurface = await waitFor(
        () => findRuntimePolicySurface(),
        'runtime policy settings controls',
        15000,
      );
      const controls = Array.from(runtimePolicySurface.querySelectorAll('select,input,button,textarea'));
      if (!controls.length) {
        throw new Error('Runtime policy settings should expose at least one control.');
      }
      const accessibleText = controls
        .map((control) => [
          control.getAttribute('aria-label'),
          control.getAttribute('name'),
          control.getAttribute('title'),
          control.textContent,
        ].filter(Boolean).join(' '))
        .join(' ');
      if (!/runtime|policy|approval|sandbox|network|策略|审批|沙盒|网络/i.test(`${runtimePolicySurface.textContent || ''} ${accessibleText}`)) {
        throw new Error('Runtime policy controls should be discoverable by label or visible text.');
      }
    };

    await selectSettingsSection('模型', '默认模型');
    const modelProviderSelect = await waitFor(
      () => document.querySelector('select[aria-label="模型提供方"]'),
      'model provider select',
      15000,
    );
    await waitFor(() => modelProviderSelect.options.length > 0, 'model provider options', 15000);
    const modelNameSelect = await waitFor(
      () => document.querySelector('select[aria-label="模型名称"]'),
      'model name select',
      15000,
    );
    await waitFor(() => modelNameSelect.options.length > 0, 'model name options', 15000);
    if (modelProviderSelect.disabled || modelNameSelect.disabled) {
      throw new Error('Model settings selects should be editable after local bridge load.');
    }
    if (findSettingButton('默认模型', '保存').disabled) {
      throw new Error('Model save action should be available after model options load.');
    }

    await selectSettingsSection('权限', 'Toolsets');
    await assertRuntimePolicyControls();
    for (const label of ['审批模式', '审批等待秒数', 'Gateway 审批等待秒数', 'Cron 审批模式', '命令允许列表']) {
      if (!document.querySelector(`[aria-label="${label}"]`)) {
        throw new Error(`Missing approval policy control: ${label}`);
      }
    }
    const toolsetToggle = await waitFor(
      () => Array.from(document.querySelectorAll('.settingRow .toggle')).find((item) => item.getAttribute('aria-label')?.includes('toolset') || item.getAttribute('aria-label')),
      'toolset toggle controls',
      15000,
    );
    if (toolsetToggle.disabled) {
      throw new Error('Toolset toggle should be editable after local bridge load.');
    }
    const toolsetConfigButton = Array.from(document.querySelectorAll('.settingRow button'))
      .find((item) => item.textContent?.includes('配置') && !item.disabled);
    if (!toolsetConfigButton) {
      throw new Error('Missing toolset config action.');
    }
    toolsetConfigButton.click();
    const providerSelect = await waitFor(
      () => Array.from(document.querySelectorAll('select')).find((item) => item.getAttribute('aria-label')?.includes('provider')),
      'toolset provider select',
      15000,
    );
    if (providerSelect.disabled || providerSelect.options.length === 0) {
      throw new Error('Toolset provider select should be editable.');
    }
    const providerSaveButton = Array.from(document.querySelectorAll('.toolsetConfigForm button'))
      .find((item) => item.textContent?.includes('保存 provider'));
    if (!providerSaveButton || providerSaveButton.disabled) {
      throw new Error('Missing toolset provider save action.');
    }
    const envInput = document.querySelector('.toolsetConfigForm input[type="password"]');
    if (envInput && envInput.disabled) {
      throw new Error('Toolset env inputs should be editable when present.');
    }

    await selectSettingsSection('集成', 'MCP Servers');
    const gatewayModeSelect = await waitFor(
      () => document.querySelector('select[aria-label="Gateway 连接方式"]'),
      'gateway connection mode select',
      15000,
    );
    if (gatewayModeSelect.disabled) {
      throw new Error('Gateway connection mode should be editable.');
    }
    gatewayModeSelect.value = 'remote';
    gatewayModeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    const gatewayUrlInput = await waitFor(
      () => document.querySelector('input[aria-label="远程 Gateway URL"]'),
      'gateway remote url input',
      15000,
    );
    await waitFor(() => !gatewayUrlInput.disabled, 'gateway remote url enabled');
    const gatewayTokenInput = await waitFor(
      () => document.querySelector('input[aria-label="远程 Gateway Token"]'),
      'gateway remote token input',
      15000,
    );
    if (gatewayTokenInput.disabled) {
      throw new Error('Gateway remote token should be editable in remote mode.');
    }
    setNativeValue(gatewayUrlInput, '');
    findSettingButton('Gateway 连接方式', '检查').click();
    await waitFor(() => document.body.innerText.includes('请输入远程 Gateway URL'), 'gateway remote validation');

    const mcpSyncButton = findSettingButton('MCP Servers', '同步');
    if (mcpSyncButton.disabled) {
      throw new Error('MCP sync action should be available.');
    }
    if (document.body.innerText.includes('本机只读')) {
      throw new Error('Settings deep pages must not present local-only configuration as read-only.');
    }
    const addMcpRow = settingRow('添加 MCP Server');
    if (!addMcpRow) {
      throw new Error('Missing MCP create form.');
    }
    findButton('添加', addMcpRow).click();
    await waitFor(() => document.body.innerText.includes('请输入 MCP server 名称'), 'mcp create name validation');
    setNativeValue(addMcpRow.querySelector('input[aria-label="MCP server 名称"]'), 'smoke-ui-mcp');
    findButton('添加', addMcpRow).click();
    await waitFor(() => document.body.innerText.includes('请输入 MCP server command'), 'mcp create command validation');
    const mcpTypeSelect = addMcpRow.querySelector('select[aria-label="MCP server 类型"]');
    mcpTypeSelect.value = 'http';
    mcpTypeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await sleep(120);
    const mcpUrlInput = await waitFor(() => addMcpRow.querySelector('input[aria-label="MCP server URL"]'), 'mcp url input');
    setNativeValue(mcpUrlInput, 'not-a-url');
    await waitFor(() => mcpUrlInput.value === 'not-a-url', 'mcp url input value');
    await sleep(120);
    findButton('添加', addMcpRow).click();
    await waitFor(() => document.body.innerText.includes('http:// 或 https://'), 'mcp create url validation');

    await selectSettingsSection('外观', '界面密度');
    findSettingButton('界面密度', '舒适').click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-density') === 'compact', 'compact density applied');
    await waitFor(() => localStorage.getItem('beauty-hermes-ui-density') === 'compact', 'compact density persisted');
    findSettingButton('主题', '浅色').click();
    await waitFor(() => document.querySelector('[data-testid="app-shell"]')?.getAttribute('data-theme') === 'soft', 'soft theme applied');
    await waitFor(() => localStorage.getItem('beauty-hermes-ui-theme') === 'soft', 'soft theme persisted');
    await waitFor(() => document.body.innerText.includes('主题已切换为柔和'), 'theme status feedback');

    await selectSettingsSection('高级', 'Hermes Home');
    findSettingButton('Hermes Home', '复制').click();
    await waitFor(
      () => document.querySelector('.settingsStatus')?.textContent?.includes('Hermes Home 已复制'),
      'settings desktop clipboard feedback',
    );

    await selectSettingsSection('集成', 'Gateway');
    findSettingButton('Plugins', '查看').click();
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'plugins settings navigation');
    findNavButton('设置')?.click();
    await waitFor(() => document.body.innerText.includes('Gateway'), 'settings integrations return');
    findSettingButton('消息平台', '管理').click();
    await waitFor(() => document.body.innerText.includes('管理 Hermes Gateway'), 'messaging settings navigation');
    const messagingSearchInput = await waitFor(
      () => document.querySelector('input[aria-label="搜索消息平台"]'),
      'messaging search input',
    );
    if (!findButton('重启 Gateway')) {
      throw new Error('Messaging page should expose Gateway restart action.');
    }
    setNativeValue(messagingSearchInput, 'telegram');
    await waitFor(() => Array.from(document.querySelectorAll('.gatewayPlatformCard')).some((item) => item.textContent?.includes('Telegram')), 'messaging search keeps telegram');
    setNativeValue(messagingSearchInput, 'no-such-platform-smoke');
    await waitFor(() => document.body.innerText.includes('没有匹配平台'), 'messaging empty search state');
    setNativeValue(messagingSearchInput, '');
    const telegramCard = await waitFor(
      () => Array.from(document.querySelectorAll('.gatewayPlatformCard')).find((item) => item.textContent?.includes('Telegram')),
      'telegram platform card',
      12000,
    );
    for (const label of ['复制摘要', '复制文档']) {
      if (!findButton(label, telegramCard)) {
        throw new Error(`Messaging platform card should expose ${label}.`);
      }
    }
    findButton('复制摘要', telegramCard).click();
    await waitFor(
      () => document.querySelector('.surfaceStatus')?.textContent?.includes('摘要已复制')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('无法访问剪贴板')
        || document.querySelector('.surfaceStatus')?.textContent?.includes('复制失败'),
      'messaging copy summary feedback',
    );
    findButton('配置', telegramCard).click();
    await waitFor(() => document.querySelector('[data-testid="messaging-config-telegram"]'), 'telegram config panel');
    await waitFor(() => document.querySelector('input[aria-label="Telegram TELEGRAM_BOT_TOKEN"]'), 'telegram token input');
    await waitFor(() => document.querySelector('input[aria-label="Telegram bot 名称"]'), 'telegram onboarding input');
    findNavButton('设置')?.click();
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
    await waitFor(() => findButton('配置集成', document.querySelector('.onboardingActions')), 'remote onboarding action');
    findButton('配置集成', document.querySelector('.onboardingActions'))?.click();
    await waitFor(() => document.body.innerText.includes('Hermes Agent 与本地服务') && document.body.innerText.includes('Gateway'), 'remote onboarding target');

    await openCommandCenter('首次启动');
    await waitFor(() => findCommandRow('首次启动'), 'onboarding command row again');
    findCommandRow('首次启动')?.click();
    await waitFor(() => document.querySelector('.onboardingSurface'), 'onboarding page again');
    document.querySelector('.choiceGrid button:nth-child(3)')?.click();
    await waitFor(() => findButton('查看诊断', document.querySelector('.onboardingActions')), 'status onboarding action');
    findButton('查看诊断', document.querySelector('.onboardingActions'))?.click();
    await waitFor(() => document.body.innerText.includes('诊断与更新'), 'status onboarding target');

    return {
      commandCenter: true,
      pages: pages.map(([label]) => label),
      projectAgents: ['项目', 'Agents', '后台动作'],
      preferences: ['density', 'theme', 'permission-modal'],
      runtimePolicy: 'controls-present',
      approvalPolicy: 'controls-present',
      settingsEditable: ['models', 'toolsets', 'gateway', 'mcp'],
      settingsDeepLinks: ['Plugins', '消息平台'],
      settings: settingsSections.map(([label]) => label),
      slash: true,
      slashNavigation: ['/agents', '/projects', '/settings', '/models', '/approval', '/skills', '/cron', '/messaging', '/diagnostics', '/diagnose', '/gateway', '/profiles', '/onboarding', '/files', '/preview', '/workbench'],
      verifiedUx: [
        'agents-automation-feedback',
        'approval-feedback',
        'attachment-url-feedback',
        'command-center-close',
        'command-keyboard-a11y',
        'diagnostics-feedback',
        'desktop-clipboard-bridge',
        'empty-prompt-actions',
        'inline-delete-confirmation',
        'markdown-table-rendering',
        'messaging-platform-actions',
        'onboarding-config-feedback',
        'profile-feedback',
        'project-actions-feedback',
        'project-config-apply-context',
        'project-config-feedback',
        'project-config-persistence',
        'project-new-task-routing',
        'project-workspace-routing',
        'project-sidebar-targeting',
        'project-card-real-actions',
        'session-selection-feedback',
        'sidebar-pinned-sessions',
        'skill-detail-actions',
        'skill-local-lifecycle-bridge',
        'skill-command-center-deeplink',
        'skill-copy-feedback',
        'slash-skill-deeplink',
        'slash-skills-search-prefill',
        'slash-aria-selected',
        'slash-escape-close',
        'static-agent-card',
        'terminal-workbench-actions',
        'voice-feedback',
        'workbench-feedback',
        'workbench-file-preview-feedback',
        'workbench-preview-real-file',
        'workbench-preview-copy-actions',
      ],
      uxHoles: [],
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
