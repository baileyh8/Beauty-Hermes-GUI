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
  await evaluate(client, `(() => {
    localStorage.removeItem('beauty-hermes-ui-density');
    localStorage.removeItem('beauty-hermes-ui-theme');
    window.setTimeout(() => window.location.reload(), 0);
    return true;
  })()`);
  await wait(1000);

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
    const findNavButton = (label) => Array.from(document.querySelectorAll('.sidebar button, .sidebarFooter button'))
      .find((item) => item.textContent?.includes(label) || item.getAttribute('aria-label')?.includes(label));
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
      await waitFor(() => document.querySelector('[data-testid="composer"]'), `${label} return to chat`);
      await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), `${label} chat title`);
      await waitFor(() => document.querySelector('[data-testid="message-list"]')?.querySelectorAll('.message').length === 0, `${label} clears transcript`);
      await waitFor(() => document.querySelector('.toastNotice')?.textContent?.includes('已开始新任务'), `${label} new task feedback`);
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
    ({ textarea, sendButton } = await startNewTaskFromPage('slash agents'));

    await runSlashNavigation('/projects', '项目', '项目工作区', 'slash projects');
    await runSlashNavigation('/settings 外观', '设置', '界面密度', 'slash settings');
    await runSlashNavigation('/models', '设置', '默认模型', 'slash models');
    await runSlashNavigation('/approval', '设置', '命令审批', 'slash approval');
    await runSlashNavigation('/skills', '技能库', '读取本机 Hermes skills', 'slash skills');
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
    const workspaceAction = findProjectAction('本地 Hermes 工作区', '查看文件');
    if (!workspaceAction) {
      throw new Error('Missing project workspace file action.');
    }
    workspaceAction.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), 'workspace action opens chat');
    await waitFor(() => document.querySelector('[data-testid="right-workbench"]')?.innerText.includes('变更文件'), 'workspace action opens files workbench');
    findNavButton('项目')?.click();
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page after workspace action');
    const sessionAction = findProjectAction('会话', '新建任务');
    if (!sessionAction) {
      throw new Error('Missing project new task action.');
    }
    sessionAction.click();
    await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('Hermes Agent'), 'project new task opens chat');
    await waitFor(() => document.querySelector('[data-testid="message-list"]')?.querySelectorAll('.message').length === 0, 'project new task clears transcript');
    findNavButton('项目')?.click();
    await waitFor(() => document.body.innerText.includes('项目工作区'), 'projects page after session action');
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

    await selectSettingsSection('集成', 'Gateway');
    findSettingButton('Plugins', '查看').click();
    await waitFor(() => document.body.innerText.includes('读取本机 Hermes skills'), 'plugins settings navigation');
    findNavButton('设置')?.click();
    await waitFor(() => document.body.innerText.includes('Gateway'), 'settings integrations return');
    findSettingButton('消息平台', '管理').click();
    await waitFor(() => document.body.innerText.includes('管理 Hermes Gateway'), 'messaging settings navigation');
    const telegramCard = await waitFor(
      () => Array.from(document.querySelectorAll('.gatewayPlatformCard')).find((item) => item.textContent?.includes('Telegram')),
      'telegram platform card',
      12000,
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
      settingsEditable: ['models', 'toolsets', 'mcp'],
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
        'empty-prompt-actions',
        'inline-delete-confirmation',
        'markdown-table-rendering',
        'profile-feedback',
        'project-actions-feedback',
        'project-new-task-routing',
        'project-workspace-routing',
        'session-selection-feedback',
        'skill-copy-feedback',
        'slash-aria-selected',
        'slash-escape-close',
        'static-agent-card',
        'voice-feedback',
        'workbench-feedback',
        'workbench-file-preview-feedback',
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
