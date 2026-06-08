const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hermesDesktop', {
  getDesktopInfo: () => ipcRenderer.invoke('hermes:desktop-info'),
});

