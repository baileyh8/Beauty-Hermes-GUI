/// <reference types="vite/client" />

interface HermesDesktopBridge {
  getDesktopInfo: () => Promise<{
    appName: string;
    bridge: string;
  }>;
}

interface Window {
  hermesDesktop?: HermesDesktopBridge;
}

