/// <reference types="vite/client" />

interface HermesDesktopBridge {
  getDesktopInfo: () => Promise<{
    appName: string;
    bridge: string;
  }>;
  getSnapshot: () => Promise<{
    sessions: number;
    projects: number;
    pendingApprovals: number;
    gateway: string;
  }>;
}

interface Window {
  hermesDesktop?: HermesDesktopBridge;
}

declare module 'lucide-react/dist/esm/icons/*.js' {
  import type { LucideIcon } from 'lucide-react';

  const Icon: LucideIcon;
  export default Icon;
}
