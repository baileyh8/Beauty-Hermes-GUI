const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hermesDesktop', {
  api: (request) => ipcRenderer.invoke('hermes:api', request),
  getDesktopInfo: () => ipcRenderer.invoke('hermes:desktop-info'),
  getConnection: () => ipcRenderer.invoke('hermes:get-connection'),
  getGatewayWsUrl: () => ipcRenderer.invoke('hermes:get-gateway-ws-url'),
  getSnapshot: () => ipcRenderer.invoke('hermes:snapshot'),
  startHermes: (options) => ipcRenderer.invoke('hermes:start', options),
});
