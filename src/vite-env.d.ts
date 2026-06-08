/// <reference types="vite/client" />

interface HermesApiRequest {
  body?: unknown;
  method?: string;
  path: string;
  profile?: null | string;
  timeoutMs?: number;
}

interface HermesGatewayConnection {
  authMode: 'token';
  baseUrl: string;
  logs?: string[];
  mode: 'local';
  pid?: null | number;
  source: 'existing' | 'spawned' | 'skipped' | string;
  status: 'connected' | 'exited' | 'skipped' | string;
  tokenPreview?: null | string;
  wsUrl: string;
}

interface HermesDesktopBridge {
  api: <T = unknown>(request: HermesApiRequest) => Promise<T>;
  getDesktopInfo: () => Promise<{
    appName: string;
    bridge: string;
  }>;
  getConnection: () => Promise<(HermesGatewayConnection & { logs?: string[] }) | null>;
  getGatewayWsUrl: () => Promise<string>;
  getSnapshot: () => Promise<{
    sessions: number;
    projects: number;
    pendingApprovals: number;
    gateway: string;
  }>;
  startHermes: (options?: { force?: boolean }) => Promise<HermesGatewayConnection & { logs?: string[] }>;
}

interface Window {
  hermesDesktop?: HermesDesktopBridge;
}

declare module 'lucide-react/dist/esm/icons/*.js' {
  import type { LucideIcon } from 'lucide-react';

  const Icon: LucideIcon;
  export default Icon;
}
