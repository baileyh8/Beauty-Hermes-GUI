const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const fs = require('node:fs');
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
      setTimeout(() => {
        win.webContents.capturePage()
          .then((image) => {
            fs.writeFileSync(process.env.BEAUTY_HERMES_CAPTURE_PATH, image.toPNG());
            process.stdout.write('[beauty-hermes] capture-ready\n');
          })
          .catch((error) => {
            console.error(`[beauty-hermes] capture-failed ${error instanceof Error ? error.message : String(error)}`);
          });
      }, 300);
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
  ipcMain.handle('hermes:get-gateway-ws-url', () => gatewayManager.getGatewayWsUrl());
  ipcMain.handle('hermes:api', (_event, request) => gatewayManager.api(request));

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
