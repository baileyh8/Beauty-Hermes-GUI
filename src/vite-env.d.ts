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
  mode: 'local' | 'remote' | string;
  pid?: null | number;
  source: 'existing' | 'remote' | 'spawned' | 'skipped' | string;
  status: 'connected' | 'exited' | 'skipped' | string;
  tokenPreview?: null | string;
  wsUrl: string;
}

interface HermesLocalInventory {
  config: {
    defaultModel: string;
    gatewayTimeout: null | number;
    maxTurns: null | number;
    provider: string;
    toolsets: string[];
  };
  diagnostics: {
    agentRepoExists: boolean;
    configExists: boolean;
    desktopVersion: string;
    gatewayPid: null | number;
    gatewayState: string;
    hermesHome: string;
    hermesVersion: string;
    processCount: number;
  };
  messaging: {
    channelCounts: Record<string, number>;
    pairings: {
      feishuApproved: number;
      feishuPending: number;
      weixinApproved: number;
      weixinPending: number;
    };
    platforms: Array<{ name: string; state: string; updatedAt: string }>;
    updatedAt: string;
  };
  models: Array<{ baseUrl: string; model: string; name: string; provider: string }>;
  plugins: Array<{ name: string; path: string; status: string }>;
  sessions: {
    count: number;
    recent: Array<{ id: string; messageCount: number; model: string; source: string; title: string }>;
    sources: Record<string, number>;
  };
  skills: Array<{ description: string; name: string; path: string; source: string }>;
}

type HermesAttachmentKind = 'clipboard-image' | 'file' | 'folder' | 'image';

interface HermesAttachmentPick {
  kind: HermesAttachmentKind;
  label: string;
  path?: string;
  text?: string;
}

interface HermesDesktopBridge {
  api: <T = unknown>(request: HermesApiRequest) => Promise<T>;
  getDesktopInfo: () => Promise<{
    appName: string;
    bridge: string;
  }>;
  getConnection: () => Promise<(HermesGatewayConnection & { logs?: string[] }) | null>;
  getGatewayWsUrl: () => Promise<string>;
  getLocalInventory: () => Promise<HermesLocalInventory>;
  getSnapshot: () => Promise<{
    sessions: number;
    projects: number;
    pendingApprovals: number;
    gateway: string;
  }>;
  pickAttachment: (kind: HermesAttachmentKind) => Promise<HermesAttachmentPick[]>;
  startHermes: (options?: { force?: boolean }) => Promise<HermesGatewayConnection & { logs?: string[] }>;
  stopHermes: () => Promise<(HermesGatewayConnection & { logs?: string[] }) | null>;
}

interface Window {
  __beautyHermesInjectGatewayEvent?: (event: import('./gateway').GatewayEvent) => void;
  hermesDesktop?: HermesDesktopBridge;
}

declare module 'lucide-react/dist/esm/icons/*.js' {
  import type { LucideIcon } from 'lucide-react';

  const Icon: LucideIcon;
  export default Icon;
}
