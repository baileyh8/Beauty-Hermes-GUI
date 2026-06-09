const { app, BrowserWindow, clipboard, dialog, ipcMain, Menu } = require('electron');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createGatewayManager } = require('./gateway-manager.cjs');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const gatewayManager = createGatewayManager();
let mainWindow = null;

app.setName('Beauty Hermes GUI');

function createApplicationMenu() {
  const template = [
    {
      label: 'Beauty Hermes GUI',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '进入全屏' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭窗口' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1060,
    minHeight: 720,
    title: 'Beauty Hermes GUI',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f6f7fb',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;

  let smokeCaptureWritten = false;
  let windowReadyLogged = false;
  const showWindow = () => {
    if (win.isDestroyed()) {
      return;
    }

    win.show();
    win.focus();
    if (!windowReadyLogged) {
      windowReadyLogged = true;
      process.stdout.write('[beauty-hermes] window-ready\n');
    }

    if (process.env.BEAUTY_HERMES_CAPTURE_PATH && !smokeCaptureWritten) {
      smokeCaptureWritten = true;
      const captureDelayMs = Number(process.env.BEAUTY_HERMES_CAPTURE_DELAY_MS || 300);
      setTimeout(() => {
        win.webContents.capturePage()
          .then((image) => {
            fs.writeFileSync(process.env.BEAUTY_HERMES_CAPTURE_PATH, image.toPNG());
            process.stdout.write('[beauty-hermes] capture-ready\n');
          })
          .catch((error) => {
            console.error(`[beauty-hermes] capture-failed ${error instanceof Error ? error.message : String(error)}`);
          });
      }, Number.isFinite(captureDelayMs) ? Math.max(0, captureDelayMs) : 300);
    }
  };

  win.once('ready-to-show', showWindow);
  win.webContents.once('did-finish-load', showWindow);
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedUrl) => {
    console.error(`[beauty-hermes] window-load-failed ${errorCode} ${errorDescription} ${validatedUrl}`);
  });
  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

async function pickAttachment(event, kind) {
  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow;

  if (kind === 'clipboard-image') {
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return [];
    }

    return [{
      kind,
      label: '剪贴板图片',
      text: '[clipboard image]',
    }];
  }

  const optionByKind = {
    file: {
      properties: ['openFile'],
      title: '选择文件',
    },
    folder: {
      properties: ['openDirectory'],
      title: '选择文件夹',
    },
    image: {
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'svg'] }],
      properties: ['openFile'],
      title: '选择图片',
    },
  };
  const options = optionByKind[kind];

  if (!options) {
    return [];
  }

  const result = await dialog.showOpenDialog(owner, {
    ...options,
    message: options.title,
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths.map((filePath) => ({
    kind,
    label: path.basename(filePath),
    path: filePath,
  }));
}

function safeReadText(filePath, maxBytes = 120000) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return '';
    }

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(maxBytes, stat.size));
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    return buffer.toString('utf8');
  } catch {
    return '';
  }
}

function safeReadJson(filePath) {
  const text = safeReadText(filePath);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function walkFiles(root, matcher, limit = 120) {
  const files = [];

  function walk(dir) {
    if (files.length >= limit) {
      return;
    }

    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= limit) {
        return;
      }
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && matcher(entryPath, entry.name)) {
        files.push(entryPath);
      }
    }
  }

  walk(root);
  return files;
}

function yamlValue(text, key) {
  const match = text.match(new RegExp(`(?:^|\\n)\\s*${key}:\\s*([^\\n]+)`));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function yamlNestedValue(text, section, key) {
  const sectionMatch = text.match(new RegExp(`(?:^|\\n)${section}:\\n([\\s\\S]*?)(?=\\n\\S|$)`));
  return sectionMatch ? yamlValue(sectionMatch[1], key) : '';
}

function yamlList(text, key) {
  const match = text.match(new RegExp(`(?:^|\\n)${key}:\\n((?:\\s*-.*\\n?)+)`));
  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
}

function parseSkillFile(filePath, root) {
  const text = safeReadText(filePath, 6000);
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  const meta = frontmatter?.[1] || '';
  const relative = path.relative(root, path.dirname(filePath));
  const name = yamlValue(meta, 'name') || relative.split(path.sep).filter(Boolean).pop() || 'skill';
  const description = yamlValue(meta, 'description') || text.split('\n').find((line) => line.trim() && !line.startsWith('#')) || '';

  return {
    description: String(description).slice(0, 160),
    name,
    path: relative,
    source: path.basename(root),
  };
}

function pairingCount(hermesHome, platform, state) {
  const data = safeReadJson(path.join(hermesHome, 'pairing', `${platform}-${state}.json`));
  return data && typeof data === 'object' ? Object.keys(data).length : 0;
}

function readHermesInventory() {
  const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
  const agentRepo = path.join(hermesHome, 'hermes-agent');
  const configText = safeReadText(path.join(hermesHome, 'config.yaml'));
  const models = safeReadJson(path.join(hermesHome, 'models.json'));
  const gatewayState = safeReadJson(path.join(hermesHome, 'gateway_state.json'));
  const channelDirectory = safeReadJson(path.join(hermesHome, 'channel_directory.json'));
  const desktopSessions = safeReadJson(path.join(hermesHome, 'desktop', 'sessions.json'));
  const processList = safeReadJson(path.join(hermesHome, 'processes.json'));
  const desktopPackage = safeReadJson(path.join(hermesHome, 'package.json'));
  const agentRegistry = safeReadJson(path.join(agentRepo, 'acp_registry', 'agent.json'));

  const skillRoots = [
    path.join(hermesHome, 'skills'),
    path.join(hermesHome, 'hermes-agent', 'plugins'),
  ];
  const skills = skillRoots.flatMap((root) => (
    walkFiles(root, (_filePath, name) => name === 'SKILL.md', 90).map((filePath) => parseSkillFile(filePath, root))
  ));

  const pluginFiles = [
    ...walkFiles(path.join(hermesHome, 'plugins'), (_filePath, name) => name === 'plugin.yaml' || name.endsWith('.plugin.json'), 40),
    ...walkFiles(path.join(agentRepo, 'plugins'), (_filePath, name) => name === 'plugin.yaml' || name.endsWith('.plugin.json'), 40),
  ];
  const plugins = pluginFiles.map((filePath) => {
    const text = safeReadText(filePath, 4000);
    const json = filePath.endsWith('.json') ? safeReadJson(filePath) : null;
    return {
      name: (json && typeof json === 'object' && typeof json.name === 'string' ? json.name : yamlValue(text, 'name')) || path.basename(path.dirname(filePath)),
      path: filePath.replace(os.homedir(), '~'),
      status: 'installed',
    };
  });

  const modelList = Array.isArray(models)
    ? models.map((item) => ({
      baseUrl: typeof item.baseUrl === 'string' ? item.baseUrl : '',
      model: typeof item.model === 'string' ? item.model : '',
      name: typeof item.name === 'string' ? item.name : '',
      provider: typeof item.provider === 'string' ? item.provider : '',
    })).filter((item) => item.name || item.model)
    : [];

  const sessions = Array.isArray(desktopSessions?.sessions) ? desktopSessions.sessions : [];
  const platforms = gatewayState && typeof gatewayState === 'object' && gatewayState.platforms && typeof gatewayState.platforms === 'object'
    ? Object.entries(gatewayState.platforms).map(([name, value]) => ({
      name,
      state: value && typeof value === 'object' && typeof value.state === 'string' ? value.state : 'unknown',
      updatedAt: value && typeof value === 'object' && typeof value.updated_at === 'string' ? value.updated_at : '',
    }))
    : [];
  const channelCounts = channelDirectory && typeof channelDirectory === 'object' && channelDirectory.platforms && typeof channelDirectory.platforms === 'object'
    ? Object.fromEntries(Object.entries(channelDirectory.platforms).map(([name, rows]) => [name, Array.isArray(rows) ? rows.length : 0]))
    : {};

  return {
    config: {
      defaultModel: yamlNestedValue(configText, 'model', 'default'),
      gatewayTimeout: Number(yamlNestedValue(configText, 'agent', 'gateway_timeout')) || null,
      maxTurns: Number(yamlNestedValue(configText, 'agent', 'max_turns')) || null,
      provider: yamlNestedValue(configText, 'model', 'provider'),
      toolsets: yamlList(configText, 'toolsets'),
    },
    diagnostics: {
      agentRepoExists: fs.existsSync(agentRepo),
      configExists: Boolean(configText),
      desktopVersion: typeof desktopPackage?.version === 'string' ? desktopPackage.version : '',
      gatewayPid: typeof gatewayState?.pid === 'number' ? gatewayState.pid : null,
      gatewayState: typeof gatewayState?.gateway_state === 'string' ? gatewayState.gateway_state : '',
      hermesHome,
      hermesVersion: typeof agentRegistry?.version === 'string' ? agentRegistry.version : '',
      processCount: Array.isArray(processList) ? processList.length : 0,
    },
    messaging: {
      channelCounts,
      pairings: {
        feishuApproved: pairingCount(hermesHome, 'feishu', 'approved'),
        feishuPending: pairingCount(hermesHome, 'feishu', 'pending'),
        weixinApproved: pairingCount(hermesHome, 'weixin', 'approved'),
        weixinPending: pairingCount(hermesHome, 'weixin', 'pending'),
      },
      platforms,
      updatedAt: typeof gatewayState?.updated_at === 'string' ? gatewayState.updated_at : '',
    },
    models: modelList,
    plugins,
    sessions: {
      count: sessions.length,
      recent: sessions.slice(0, 8).map((session) => ({
        id: String(session.id || ''),
        messageCount: Number(session.messageCount || 0),
        model: String(session.model || ''),
        source: String(session.source || ''),
        title: String(session.title || '新对话'),
      })),
      sources: sessions.reduce((acc, session) => {
        const source = String(session.source || 'unknown');
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {}),
    },
    skills: skills.slice(0, 80),
  };
}

function localApiFallback(request, error) {
  const rawPath = String(request?.path || '');
  const method = String(request?.method || 'GET').toUpperCase();

  if (!rawPath.startsWith('/')) {
    return { handled: false };
  }

  const url = new URL(rawPath, 'http://beauty-hermes.local');
  const inventory = readHermesInventory();
  const defaultProfile = {
    description: '来自本机 Hermes 配置的默认工作身份',
    gateway_running: Boolean(inventory.diagnostics.gatewayPid) || inventory.diagnostics.gatewayState === 'connected',
    has_env: fs.existsSync(path.join(inventory.diagnostics.hermesHome, '.env')),
    is_default: true,
    model: inventory.config.defaultModel,
    name: 'default',
    path: inventory.diagnostics.hermesHome,
    provider: inventory.config.provider,
    skill_count: inventory.skills.length,
  };

  if (method === 'GET' && url.pathname === '/api/profiles') {
    return {
      handled: true,
      value: {
        profiles: [defaultProfile],
        source: 'desktop-local-fallback',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/profiles/active') {
    return {
      handled: true,
      value: {
        active: 'default',
        source: 'desktop-local-fallback',
      },
    };
  }

  const setupMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/setup-command$/);
  if (method === 'GET' && setupMatch) {
    const name = decodeURIComponent(setupMatch[1]);
    return {
      handled: true,
      value: {
        command: name === 'default' ? 'hermes' : '',
        source: 'desktop-local-fallback',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/skills') {
    return {
      handled: true,
      value: inventory.skills.map((skill) => ({
        ...skill,
        enabled: true,
      })),
    };
  }

  if (method === 'GET' && url.pathname === '/api/cron/jobs') {
    return {
      handled: true,
      value: [],
    };
  }

  if (method === 'GET' && url.pathname === '/api/messaging/platforms') {
    return {
      handled: true,
      value: {
        platforms: inventory.messaging.platforms.map((platform) => ({
          description: `${inventory.messaging.channelCounts[platform.name] ?? 0} 个频道 · ${platform.updatedAt || '未记录更新时间'}`,
          enabled: platform.state !== 'disabled',
          id: platform.name,
          name: platform.name,
          state: platform.state,
          updated_at: platform.updatedAt,
        })),
        source: 'desktop-local-fallback',
      },
    };
  }

  const messagingTestMatch = url.pathname.match(/^\/api\/messaging\/platforms\/([^/]+)\/test$/);
  if (method === 'POST' && messagingTestMatch) {
    const id = decodeURIComponent(messagingTestMatch[1]);
    const platform = inventory.messaging.platforms.find((item) => item.name === id);
    return {
      handled: true,
      value: {
        message: platform
          ? `本机状态：${platform.state || 'unknown'}；当前 Gateway 未暴露平台测试接口。`
          : '当前 Gateway 未暴露平台测试接口。',
        ok: Boolean(platform && platform.state === 'connected'),
        source: 'desktop-local-fallback',
        state: platform?.state || 'unavailable',
      },
    };
  }

  if (method !== 'GET' && (
    url.pathname.startsWith('/api/profiles')
    || url.pathname.startsWith('/api/skills')
    || url.pathname.startsWith('/api/cron/jobs')
    || url.pathname.startsWith('/api/messaging/platforms')
  )) {
    return {
      handled: false,
      error: new Error(`当前 Hermes Gateway 不支持这个桌面增强操作：${method} ${url.pathname}${error ? `；原始错误：${error instanceof Error ? error.message : String(error)}` : ''}`),
    };
  }

  return { handled: false };
}

async function desktopApi(request) {
  try {
    return await gatewayManager.api(request);
  } catch (error) {
    const fallback = localApiFallback(request, error);
    if (fallback.handled) {
      return fallback.value;
    }
    throw fallback.error || error;
  }
}

app.whenReady().then(() => {
  createApplicationMenu();

  ipcMain.handle('hermes:desktop-info', () => ({
    appName: 'Beauty Hermes GUI',
    bridge: 'electron-ipc',
  }));

  ipcMain.handle('hermes:snapshot', () => ({
    sessions: 7,
    projects: 3,
    pendingApprovals: 0,
    gateway: gatewayManager.getConnection()?.status ?? 'idle',
  }));

  ipcMain.handle('hermes:get-connection', () => gatewayManager.getConnection());
  ipcMain.handle('hermes:start', (_event, options) => gatewayManager.start(options));
  ipcMain.handle('hermes:stop', () => gatewayManager.stop());
  ipcMain.handle('hermes:get-gateway-ws-url', () => gatewayManager.getGatewayWsUrl());
  ipcMain.handle('hermes:api', (_event, request) => desktopApi(request));
  ipcMain.handle('hermes:get-local-inventory', () => readHermesInventory());
  ipcMain.handle('hermes:pick-attachment', (event, kind) => pickAttachment(event, kind));

  createWindow();

  app.on('activate', () => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  gatewayManager.dispose();
});
