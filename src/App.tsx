import Archive from 'lucide-react/dist/esm/icons/archive.js';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle.js';
import Bell from 'lucide-react/dist/esm/icons/bell.js';
import Bot from 'lucide-react/dist/esm/icons/bot.js';
import CalendarClock from 'lucide-react/dist/esm/icons/calendar-clock.js';
import Check from 'lucide-react/dist/esm/icons/check.js';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2.js';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down.js';
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left.js';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right.js';
import CircleDot from 'lucide-react/dist/esm/icons/circle-dot.js';
import Clipboard from 'lucide-react/dist/esm/icons/clipboard.js';
import Clock from 'lucide-react/dist/esm/icons/clock.js';
import Command from 'lucide-react/dist/esm/icons/command.js';
import Copy from 'lucide-react/dist/esm/icons/copy.js';
import Database from 'lucide-react/dist/esm/icons/database.js';
import Download from 'lucide-react/dist/esm/icons/download.js';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link.js';
import Eye from 'lucide-react/dist/esm/icons/eye.js';
import File from 'lucide-react/dist/esm/icons/file.js';
import FileCode2 from 'lucide-react/dist/esm/icons/file-code-2.js';
import FileText from 'lucide-react/dist/esm/icons/file-text.js';
import Folder from 'lucide-react/dist/esm/icons/folder.js';
import FolderOpen from 'lucide-react/dist/esm/icons/folder-open.js';
import GitBranch from 'lucide-react/dist/esm/icons/git-branch.js';
import HardDrive from 'lucide-react/dist/esm/icons/hard-drive.js';
import Image from 'lucide-react/dist/esm/icons/image.js';
import Inbox from 'lucide-react/dist/esm/icons/inbox.js';
import KeyRound from 'lucide-react/dist/esm/icons/key-round.js';
import Layers from 'lucide-react/dist/esm/icons/layers.js';
import Link from 'lucide-react/dist/esm/icons/link.js';
import ListChecks from 'lucide-react/dist/esm/icons/list-checks.js';
import Lock from 'lucide-react/dist/esm/icons/lock.js';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square.js';
import Mic from 'lucide-react/dist/esm/icons/mic.js';
import Monitor from 'lucide-react/dist/esm/icons/monitor.js';
import MoreHorizontal from 'lucide-react/dist/esm/icons/more-horizontal.js';
import Network from 'lucide-react/dist/esm/icons/network.js';
import PanelRightClose from 'lucide-react/dist/esm/icons/panel-right-close.js';
import PanelRightOpen from 'lucide-react/dist/esm/icons/panel-right-open.js';
import PauseCircle from 'lucide-react/dist/esm/icons/pause-circle.js';
import Play from 'lucide-react/dist/esm/icons/play.js';
import Plus from 'lucide-react/dist/esm/icons/plus.js';
import Puzzle from 'lucide-react/dist/esm/icons/puzzle.js';
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw.js';
import Rocket from 'lucide-react/dist/esm/icons/rocket.js';
import Search from 'lucide-react/dist/esm/icons/search.js';
import SendHorizontal from 'lucide-react/dist/esm/icons/send-horizontal.js';
import Settings from 'lucide-react/dist/esm/icons/settings.js';
import Shield from 'lucide-react/dist/esm/icons/shield.js';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal.js';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles.js';
import TerminalSquare from 'lucide-react/dist/esm/icons/terminal-square.js';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.js';
import UsersRound from 'lucide-react/dist/esm/icons/users-round.js';
import Wrench from 'lucide-react/dist/esm/icons/wrench.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import XCircle from 'lucide-react/dist/esm/icons/x-circle.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import hermesAgentLogo from './assets/hermes-agent-logo.png';
import { JsonRpcGatewayClient, type GatewayConnectionState, type GatewayEvent } from './gateway';

type Surface =
  | 'chat'
  | 'projects'
  | 'agents'
  | 'profiles'
  | 'skills'
  | 'cron'
  | 'messaging'
  | 'settings'
  | 'diagnostics'
  | 'onboarding';
type WorkbenchTab = 'activity' | 'files' | 'terminal' | 'preview';
type ApprovalVariant = 'risk' | 'timeout' | 'permission';
type SettingsSection = 'general' | 'models' | 'permissions' | 'integrations' | 'appearance' | 'advanced';
type UiDensity = 'comfortable' | 'compact';
type UiTheme = 'light' | 'soft';
type GatewayStatus = 'browser' | 'starting' | 'connected' | 'skipped' | 'error' | 'stopped';
type ChatMessageKind =
  | 'assistant'
  | 'user'
  | 'status'
  | 'reasoning'
  | 'tool'
  | 'approval'
  | 'clarify'
  | 'error';

interface SidebarItem {
  active?: boolean;
  color?: string;
  id?: string;
  meta: string;
  title: string;
}

const preferenceStorageKeys = {
  density: 'beauty-hermes-ui-density',
  theme: 'beauty-hermes-ui-theme',
} as const;

interface ChatArtifactModel {
  kind: 'file' | 'terminal' | 'preview';
  meta: string;
  tab: WorkbenchTab;
  title: string;
}

interface ChatCheckItem {
  done?: boolean;
  label: string;
}

interface ChatMessageModel {
  artifacts?: ChatArtifactModel[];
  checks?: ChatCheckItem[];
  choices?: string[];
  command?: string;
  details?: string;
  id: string;
  kind: ChatMessageKind;
  meta?: string;
  sessionId?: null | string;
  status?: 'pending' | 'running' | 'done' | 'denied' | 'error';
  text: string;
  title?: string;
  toolName?: string;
}

interface ToolDisplayInfo {
  details: string;
  label: string;
  summary: string;
}

interface GatewayToolItem {
  detail: string;
  details?: string;
  id: string;
  label: string;
  state: 'done' | 'running' | 'pending';
  value: string;
}

interface GatewayFileItem {
  change: 'add' | 'mod';
  label: string;
  meta: string;
}

interface SlashCommandOption {
  desc: string;
  icon: React.ReactNode;
  insert: string;
  title: string;
}

interface LocalSlashContext {
  connection: HermesGatewayConnection | null;
  contextPercent: number;
  cwd: string;
  files: GatewayFileItem[];
  gatewayStatus: GatewayStatus;
  inventory: HermesLocalInventory | null;
  inventoryError: string;
  messages: ChatMessageModel[];
  model: string;
  pendingApproval: PendingApproval | null;
  recentSessions: SidebarItem[];
  socketState: GatewayConnectionState;
  statusText: string;
  tools: GatewayToolItem[];
}

interface LocalSlashResponse {
  text: string;
  title: string;
}

type AttachmentMenuKind = HermesAttachmentKind | 'snippet' | 'url';

interface SpeechRecognitionEventLike {
  results: ArrayLike<{
    0?: { transcript?: string };
    isFinal?: boolean;
  }>;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: null | (() => void);
  onerror: null | ((event: { error?: string; message?: string }) => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  start: () => void;
  stop: () => void;
}

interface PendingApproval {
  command: string;
  description: string;
  messageId: string;
  requestId?: string;
  sessionId: null | string;
}

interface PendingClarify {
  choices: string[];
  messageId: string;
  question: string;
  requestId: string;
  sessionId: null | string;
}

interface HermesRuntime {
  activeSessionId: null | string;
  apiRequest: <T = unknown>(request: HermesApiRequest) => Promise<T>;
  archiveSession: (item: SidebarItem) => Promise<void>;
  connection: HermesGatewayConnection | null;
  connectionLabel: string;
  contextPercent: number;
  cwd: string;
  deleteSession: (item: SidebarItem) => Promise<void>;
  files: GatewayFileItem[];
  gatewayStatus: GatewayStatus;
  inventory: HermesLocalInventory | null;
  inventoryError: string;
  logs: string[];
  messages: ChatMessageModel[];
  model: string;
  pendingApproval: null | PendingApproval;
  pendingClarify: null | PendingClarify;
  recentSessions: SidebarItem[];
  refreshInventory: () => Promise<void>;
  restartGateway: () => Promise<void>;
  selectedStoredSessionId: null | string;
  socketState: GatewayConnectionState;
  statusText: string;
  selectSession: (sessionId: string) => Promise<void>;
  startGateway: () => Promise<void>;
  startNewTask: () => Promise<void>;
  stopGateway: () => Promise<void>;
  submitPrompt: (text: string) => Promise<void>;
  respondApproval: (choice: 'once' | 'session' | 'always' | 'deny') => Promise<void>;
  respondClarify: (answer: string) => Promise<void>;
  tools: GatewayToolItem[];
}

interface SessionCreateResponse {
  info?: SessionRuntimeInfo;
  messages?: SessionMessageResponse[];
  session_id: string;
  stored_session_id?: string;
}

interface SessionInfoResponse {
  archived?: boolean;
  ended_at?: null | number;
  cwd?: null | string;
  id: string;
  is_active?: boolean;
  last_active?: number;
  message_count?: number;
  model?: null | string;
  preview?: null | string;
  source?: null | string;
  started_at?: number;
  title?: null | string;
}

interface SessionListResponse {
  data?: SessionInfoResponse[];
  limit?: number;
  offset?: number;
  sessions?: SessionInfoResponse[];
  total?: number;
}

interface SessionMessageResponse {
  content?: unknown;
  finish_reason?: null | string;
  id?: string;
  reasoning?: null | string;
  reasoning_content?: null | string;
  session_id?: string;
  timestamp?: number;
  tool_name?: string;
  tool_call_id?: null | string;
  tool_calls?: unknown;
  role?: 'assistant' | 'system' | 'tool' | 'user';
  text?: unknown;
}

interface SessionMessagesResponse {
  data?: SessionMessageResponse[];
  messages?: SessionMessageResponse[];
  session_id: string;
}

interface HermesActionStatusResponse {
  exit_code?: null | number;
  lines?: string[];
  name?: string;
  pid?: null | number;
  running?: boolean;
}

interface HermesActionStartResponse {
  error?: string;
  message?: string;
  name?: string;
  ok?: boolean;
  pid?: null | number;
  source?: string;
  status?: string;
  update_command?: string;
}

interface HermesUpdateCommit {
  at?: number;
  author?: string;
  sha?: string;
  summary?: string;
}

interface HermesUpdateCheckResponse {
  behind?: null | number;
  can_apply?: boolean;
  commits?: HermesUpdateCommit[];
  current_version?: string;
  install_method?: string;
  message?: null | string;
  source?: string;
  update_available?: boolean;
  update_command?: string;
}

interface SessionStatsResponse {
  active_store?: number;
  archived?: number;
  by_source?: Record<string, number>;
  messages?: number;
  total?: number;
}

interface SessionSearchResponse {
  results?: Array<{
    model?: string;
    session_id?: string;
    session_started?: number;
    snippet?: string;
    source?: string;
  }>;
}

interface SessionRuntimeInfo {
  context_percent?: number;
  cwd?: string;
  model?: string;
  provider?: string;
  running?: boolean;
  usage?: { context_percent?: number };
}

interface HermesProfileInfo {
  description?: string;
  gateway_running?: boolean;
  has_alias?: boolean;
  has_env?: boolean;
  is_default?: boolean;
  model?: null | string;
  name: string;
  path?: string;
  provider?: null | string;
  skill_count?: number;
  source?: string;
}

interface HermesSkillInfo {
  description?: string;
  enabled?: boolean;
  name: string;
  path?: string;
  source?: string;
}

interface HermesCronJobInfo {
  deliver?: string;
  id?: string;
  last_delivery_error?: string | null;
  last_run_at?: string | null;
  name?: string;
  next_run_at?: string | null;
  paused?: boolean;
  prompt?: string;
  profile?: string;
  schedule?: string;
  schedule_display?: string;
  state?: string;
  enabled?: boolean;
  next_run?: string;
  workdir?: string | null;
}

interface HermesCronDeliveryTargetInfo {
  home_env_var?: null | string;
  home_target_set?: boolean;
  id: string;
  name: string;
}

interface HermesCronRunInfo {
  ended_at?: number | string | null;
  id?: string;
  is_active?: boolean;
  last_active?: number | string;
  started_at?: number | string;
  title?: string;
}

interface HermesMessagingPlatformInfo {
  configured?: boolean;
  description?: string;
  docs_url?: string;
  enabled?: boolean;
  error_message?: string;
  env_vars?: Array<{
    description?: string;
    is_password?: boolean;
    is_set?: boolean;
    key: string;
    password?: boolean;
    prompt?: string;
    redacted_value?: null | string;
    required?: boolean;
    url?: string;
  }>;
  gateway_running?: boolean;
  home_channel?: null | Record<string, unknown>;
  id: string;
  name: string;
  state?: string;
  updated_at?: string;
}

interface TelegramOnboardingState {
  botUsername?: null | string;
  deepLink?: string;
  expiresAt?: string;
  ownerUserId?: null | string;
  pairingId?: string;
  qrPayload?: string;
  status?: 'idle' | 'waiting' | 'ready' | 'applied' | 'error';
  suggestedUsername?: string;
}

const messagingPlatformDescriptions: Record<string, string> = {
  api_server: '提供 OpenAI-compatible HTTP API，供 Open WebUI 等客户端调用。',
  bluebubbles: '通过 BlueBubbles server 接入 iMessage。',
  dingtalk: '连接钉钉群机器人或企业内部应用。',
  discord: '连接 Discord 私聊、频道和 threads。',
  email: '通过 IMAP/SMTP 邮箱收发消息。',
  feishu: '连接飞书 / Lark 应用与群聊。',
  homeassistant: '通过 Home Assistant 控制智能家居。',
  mattermost: '连接 Mattermost 频道和私聊。',
  matrix: '连接 Matrix 房间与私信。',
  qqbot: '连接 QQ 开放平台 Bot。',
  signal: '通过 signal-cli REST bridge 接入 Signal。',
  slack: '通过 Slack Socket Mode 接入工作区。',
  sms: '通过 Twilio 收发 SMS。',
  telegram: '连接 Telegram 私聊、群组和话题。',
  webhook: '接收 GitHub、GitLab 等 webhook 事件。',
  wecom: '连接企业微信群机器人。',
  wecom_callback: '连接企业微信应用回调。',
  weixin: '连接微信公众号。',
  whatsapp: '通过 WhatsApp bridge 和 QR 认证接入。',
  yuanbao: '连接腾讯元宝平台。',
};

interface HermesModelProviderInfo {
  authenticated?: boolean;
  is_current?: boolean;
  models?: string[];
  name?: string;
  slug: string;
  warning?: string;
}

interface HermesModelOptionsInfo {
  model?: string;
  provider?: string;
  providers?: HermesModelProviderInfo[];
  source?: string;
}

interface HermesToolsetInfo {
  available?: boolean;
  configured?: boolean;
  description?: string;
  enabled?: boolean;
  label?: string;
  name: string;
  tools?: string[];
}

interface HermesToolsetEnvInfo {
  default?: string;
  is_set?: boolean;
  key: string;
  prompt?: string;
  url?: string;
}

interface HermesToolsetProviderInfo {
  badge?: string;
  env_vars?: HermesToolsetEnvInfo[];
  is_active?: boolean;
  name: string;
  post_setup?: string;
  requires_nous_auth?: boolean;
  tag?: string;
}

interface HermesToolsetConfigInfo {
  active_provider?: null | string;
  has_category?: boolean;
  name: string;
  providers?: HermesToolsetProviderInfo[];
  source?: string;
}

interface HermesMcpServerInfo {
  args?: string[];
  command?: string;
  enabled?: boolean;
  name: string;
  tools?: Array<string | { name?: string }>;
  transport?: string;
  url?: string;
}

interface HermesFilePreviewInfo {
  data_url?: string;
  ext?: string;
  kind: 'html' | 'image' | 'text' | 'unsupported';
  mime?: string;
  name?: string;
  ok?: boolean;
  path?: string;
  requested_path?: string;
  size?: number;
  source?: string;
  text?: string;
  truncated?: boolean;
}

type OnboardingMode = 'local' | 'remote' | 'status';

interface HermesOnboardingConfig {
  agent_repo_exists?: boolean;
  auto_start_gateway?: boolean;
  config_exists?: boolean;
  desktop_config_path?: string;
  gateway_pid?: null | number;
  gateway_state?: string;
  hermes_home?: string;
  message?: string;
  mode?: 'local' | 'remote';
  model?: string;
  ok?: boolean;
  provider?: string;
  remote_token_preview?: null | string;
  remote_token_set?: boolean;
  remote_url?: string;
  source?: string;
  toolsets?: string[];
}

const pinnedSessions: SidebarItem[] = [];

const recentSessions: SidebarItem[] = [];

const settingsSections: Array<{ id: SettingsSection; label: string; desc: string }> = [
  { id: 'general', label: '通用', desc: '语言、启动和窗口行为' },
  { id: 'models', label: '模型', desc: '默认模型和推理强度' },
  { id: 'permissions', label: '权限', desc: '审批、文件和命令策略' },
  { id: 'integrations', label: '集成', desc: 'Hermes Agent 与本地服务' },
  { id: 'appearance', label: '外观', desc: '主题、密度和字体' },
  { id: 'advanced', label: '高级', desc: '日志、诊断和实验项' },
];

const surfaceMeta: Record<Surface, { title: string; subtitle: string }> = {
  chat: {
    title: 'Hermes Agent',
    subtitle: '连接本地 Hermes Gateway 后开始真实会话。',
  },
  projects: { title: '项目', subtitle: '把会话、路径、模型配置和运行状态合并管理。' },
  agents: { title: 'Agents 并行任务', subtitle: '管理多个 Agent 工作树、审批队列和完成结果。' },
  profiles: { title: 'Profiles', subtitle: '切换模型、技能、记忆、语言和权限边界。' },
  skills: { title: '技能库', subtitle: '发现、启用、更新和创建可复用 Hermes skills。' },
  cron: { title: '自动化', subtitle: '管理提醒、巡检、汇报和定时任务。' },
  messaging: { title: '消息网关', subtitle: '连接外部消息平台并配置路由策略。' },
  settings: { title: '设置', subtitle: '调整全局偏好、模型、审批、快捷键和外观。' },
  diagnostics: { title: '诊断与更新', subtitle: '集中恢复环境、网关、权限、版本和日志问题。' },
  onboarding: { title: '首次启动', subtitle: '选择 Hermes 的本地或远程工作方式。' },
};

const initialMessages: ChatMessageModel[] = [];

const fallbackTools: GatewayToolItem[] = [];

const fallbackFiles: GatewayFileItem[] = [];

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function textFromUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(textFromUnknown).filter(Boolean).join('\n');
  }

  if (value && typeof value === 'object') {
    const row = value as Record<string, unknown>;
    if (typeof row.text === 'string') {
      return row.text;
    }
    if (typeof row.content === 'string') {
      return row.content;
    }

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '';
    }
  }

  return value == null ? '' : String(value);
}

function payloadRecord(event: GatewayEvent): Record<string, unknown> {
  return event.payload && typeof event.payload === 'object'
    ? (event.payload as Record<string, unknown>)
    : {};
}

function coerceGatewayText(payload: Record<string, unknown>, options: { trim?: boolean } = {}) {
  const text = textFromUnknown(
    payload.text
      ?? payload.delta
      ?? payload.rendered
      ?? payload.result_text
      ?? payload.summary
      ?? payload.message
      ?? payload.content
      ?? payload.reasoning_content
      ?? payload.reasoning,
  );
  return options.trim === false ? text : text.trim();
}

function cleanDisplayText(text: string) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{4,}/g, '\n\n\n');
}

function compactLine(text: string, maxLength = 96) {
  const line = cleanDisplayText(text).split('\n').map((item) => item.trim()).find(Boolean) || '';
  return line.length > maxLength ? `${line.slice(0, maxLength - 1)}…` : line;
}

function truncateText(text: string, maxLength = 1800) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function shortenPath(pathValue: string) {
  const value = pathValue.trim();
  if (!value) {
    return '未设置';
  }

  const homePrefix = '/Users/huangyemin';
  const normalized = value.startsWith(homePrefix) ? `~${value.slice(homePrefix.length)}` : value;
  const parts = normalized.split('/').filter(Boolean);
  if (normalized.startsWith('~/') && parts.length > 2) {
    return `~/${parts.slice(-2).join('/')}`;
  }
  if (parts.length > 3) {
    return `…/${parts.slice(-2).join('/')}`;
  }
  return normalized;
}

function summarizeCommand(command: string) {
  const value = cleanDisplayText(command).replace(/\s+/g, ' ').trim();
  if (!value) {
    return '';
  }

  const lower = value.toLowerCase();
  if (/\bgit pull\b/.test(lower)) {
    return '同步仓库';
  }
  if (/\bgit fetch\b/.test(lower)) {
    return '拉取远端信息';
  }
  if (/\bgit rev-parse\b/.test(lower)) {
    return '检查 Git 版本';
  }
  if (/\bgit tag\b/.test(lower)) {
    return '读取版本标签';
  }
  if (/\bhermes\s+--version\b|\bcat\s+.*version\b|\b_version\.py\b/.test(lower)) {
    return '检查 Hermes 版本';
  }
  if (/\bpip install\b/.test(lower)) {
    return '安装 Python 依赖';
  }
  if (/\bnpm (run )?build\b/.test(lower)) {
    return '运行构建';
  }
  if (/\bnpm (run )?typecheck\b|\btsc\b/.test(lower)) {
    return '运行类型检查';
  }
  if (/\bpwd\b/.test(lower)) {
    return '读取工作目录';
  }
  if (/\bls\b/.test(lower)) {
    return '列出文件';
  }

  return compactLine(value.replace(/^cd\s+[^&|;]+(&&|;)\s*/, ''), 64);
}

function normalizeStatusText(text: string) {
  const value = cleanDisplayText(text).trim();

  if (/(analy[sz]ing|cogitating|synthesizing|pondering|musing)/i.test(value)) {
    return '正在思考';
  }

  return value;
}

function compactDuplicateReasoning(previous: string, incoming: string, replace = false) {
  const next = cleanDisplayText(incoming);

  if (replace || !previous) {
    return next.trim();
  }

  if (!next) {
    return previous;
  }

  if (previous.includes(next)) {
    return previous;
  }

  if (next.includes(previous)) {
    return next.trim();
  }

  return `${previous}${next}`;
}

function slashOutputText(result: unknown) {
  if (result && typeof result === 'object') {
    const row = result as Record<string, unknown>;
    return cleanDisplayText(
      [textFromUnknown(row.output), textFromUnknown(row.warning)]
        .filter((item) => item.trim())
        .join('\n\n'),
    ).trim();
  }

  return cleanDisplayText(textFromUnknown(result)).trim();
}

const localSlashCommandNames = new Set([
  '/activity',
  '/agents',
  '/approval',
  '/automation',
  '/chat',
  '/cron',
  '/diagnose',
  '/diagnostics',
  '/files',
  '/gateway',
  '/help',
  '/messaging',
  '/models',
  '/onboarding',
  '/profiles',
  '/projects',
  '/sessions',
  '/settings',
  '/skill',
  '/skills',
  '/summary',
  '/terminal',
  '/preview',
  '/workbench',
]);

function slashCommandName(text: string) {
  return text.trim().split(/\s+/)[0].toLowerCase();
}

function isKnownLocalSlashInput(text: string) {
  return localSlashCommandNames.has(slashCommandName(text));
}

interface LocalSlashUiTarget {
  settingsSection?: SettingsSection;
  surface?: Surface;
  workbenchTab?: WorkbenchTab;
}

function settingsSectionFromSlashQuery(query: string): SettingsSection {
  const normalized = query.trim().toLowerCase();
  const match = settingsSections.find((section) => (
    section.id.toLowerCase() === normalized
    || section.label.toLowerCase() === normalized
    || section.desc.toLowerCase().includes(normalized)
  ));
  return match?.id ?? 'general';
}

function localSlashUiTarget(command: string): LocalSlashUiTarget | null {
  const name = slashCommandName(command);
  const query = command.trim().slice(name.length).trim();
  const surfaceTargets: Partial<Record<string, Surface>> = {
    '/agents': 'agents',
    '/automation': 'cron',
    '/chat': 'chat',
    '/cron': 'cron',
    '/diagnose': 'diagnostics',
    '/diagnostics': 'diagnostics',
    '/gateway': 'diagnostics',
    '/messaging': 'messaging',
    '/onboarding': 'onboarding',
    '/profiles': 'profiles',
    '/projects': 'projects',
    '/skills': 'skills',
  };
  const workbenchTargets: Partial<Record<string, WorkbenchTab>> = {
    '/activity': 'activity',
    '/files': 'files',
    '/preview': 'preview',
    '/terminal': 'terminal',
  };

  if (name === '/settings') {
    return { settingsSection: settingsSectionFromSlashQuery(query), surface: 'settings' };
  }

  if (name === '/models') {
    return { settingsSection: 'models', surface: 'settings' };
  }

  if (name === '/approval') {
    return { settingsSection: 'permissions', surface: 'settings' };
  }

  if (name === '/workbench') {
    const tab = workbenchTargets[`/${query.toLowerCase()}`] ?? 'activity';
    return { surface: 'chat', workbenchTab: tab };
  }

  const surface = surfaceTargets[name];
  if (surface) {
    return { surface };
  }

  const workbenchTab = workbenchTargets[name];
  if (workbenchTab) {
    return { surface: 'chat', workbenchTab };
  }

  return null;
}

function slashUiTargetLabel(target: LocalSlashUiTarget | null) {
  if (!target) {
    return '';
  }

  if (target.settingsSection) {
    return settingsSections.find((section) => section.id === target.settingsSection)?.label || '设置';
  }

  if (target.surface) {
    return surfaceMeta[target.surface]?.title || target.surface;
  }

  return '';
}

function slashWorkbenchLabel(tab?: WorkbenchTab) {
  const labels: Record<WorkbenchTab, string> = {
    activity: '活动',
    files: '文件',
    preview: '预览',
    terminal: '终端',
  };
  return tab ? labels[tab] : '';
}

function bulletRows(rows: string[], fallback: string) {
  return rows.length > 0 ? rows.map((row) => `- ${row}`).join('\n') : `- ${fallback}`;
}

function formatUpdateCheckSummary(result: HermesUpdateCheckResponse | null) {
  if (!result) {
    return '还没有检查更新。';
  }

  const version = result.current_version ? `v${result.current_version}` : 'unknown';
  const method = result.install_method || 'unknown';
  if (result.behind === 0) {
    return `${version} · ${method} · 已是最新版本`;
  }

  if (typeof result.behind === 'number' && result.behind > 0) {
    return `${version} · ${method} · 落后 ${result.behind} 个提交`;
  }

  return `${version} · ${method} · ${result.message || '更新源暂不可用'}`;
}

function updateActionStatusText(result: HermesActionStatusResponse | null) {
  if (!result) {
    return '后台状态暂不可用。';
  }

  if (result.running) {
    return `${result.name || '后台动作'} 运行中${result.pid ? ` · pid ${result.pid}` : ''}`;
  }

  if (typeof result.exit_code === 'number') {
    return `${result.name || '后台动作'} 已结束 · exit ${result.exit_code}`;
  }

  return `${result.name || '后台动作'} 暂无运行记录。`;
}

function buildLocalSlashResponse(command: string, context: LocalSlashContext): LocalSlashResponse | null {
  const name = slashCommandName(command);
  const query = command.trim().slice(name.length).trim().toLowerCase();
  const inventory = context.inventory;

  if (name === '/help') {
    return {
      title: '内置指令',
      text: [
        '这些指令由 Beauty Hermes GUI 本地处理，未知 `/` 指令会继续透传给 Hermes Gateway。',
        '',
        '- `/help` 查看可用指令',
        '- `/skills [关键词]` 搜索本机 skills',
        '- `/skill <名称>` 查看单个 skill',
        '- `/diagnose` 检查 Gateway、配置和进程状态',
        '- `/approval` 查看当前待审批命令',
        '- `/summary` 总结当前会话状态',
        '- `/sessions` 查看最近真实会话',
        '- `/models` 查看本机模型配置',
        '- `/profiles` 查看当前 profile 线索',
        '- `/gateway` 查看连接信息',
        '',
        '页面与工作区：',
        '- `/projects` 打开项目页',
        '- `/agents` 打开 Agents 队列',
        '- `/settings [模型|权限|集成|外观|高级]` 打开设置页',
        '- `/cron` 或 `/automation` 打开自动化页',
        '- `/messaging` 打开消息网关页',
        '- `/diagnostics` 打开诊断页',
        '- `/profiles` 打开 Profiles 页并显示配置线索',
        '- `/skills` 打开技能库并搜索本机 skills',
        '- `/models` 打开模型设置并列出模型配置',
        '- `/approval` 打开权限设置并查看审批队列',
        '- `/workbench [activity|files|terminal|preview]` 打开右侧工作区',
      ].join('\n'),
    };
  }

  if (['/projects', '/agents', '/settings', '/cron', '/automation', '/messaging', '/diagnostics', '/onboarding', '/chat', '/workbench', '/terminal', '/files', '/preview', '/activity'].includes(name)) {
    const target = localSlashUiTarget(command);
    const surfaceLabel = slashUiTargetLabel(target);
    const workbenchLabel = target?.workbenchTab ? `，并展开${slashWorkbenchLabel(target.workbenchTab)}工作区` : '';

    return {
      title: '界面指令',
      text: `已处理 \`${name}\`。${surfaceLabel ? `正在打开 ${surfaceLabel}` : '正在更新界面'}${workbenchLabel}。`,
    };
  }

  if (name === '/skills') {
    const skills = inventory?.skills ?? [];
    const matched = skills
      .filter((skill) => {
        const haystack = `${skill.name} ${skill.description} ${skill.path} ${skill.source}`.toLowerCase();
        return !query || haystack.includes(query);
      })
      .slice(0, 18)
      .map((skill) => `\`${skill.name}\` · ${skill.source || 'local'} · ${compactLine(skill.description || skill.path, 92)}`);

    return {
      title: 'Skills',
      text: [
        `共读取到 **${skills.length}** 个 skills${query ? `，匹配 **${matched.length}** 个。` : '。'}`,
        '',
        bulletRows(matched, inventory ? '没有匹配的 skill。' : context.inventoryError || '本机 inventory 暂不可用。'),
      ].join('\n'),
    };
  }

  if (name === '/skill') {
    const skills = inventory?.skills ?? [];
    const skill = query
      ? skills.find((item) => item.name.toLowerCase() === query)
        ?? skills.find((item) => item.name.toLowerCase().includes(query))
      : undefined;

    return {
      title: 'Skill 详情',
      text: skill ? [
        `**${skill.name}**`,
        '',
        `- 来源：${skill.source || 'local'}`,
        `- 路径：\`${skill.path}\``,
        `- 描述：${skill.description || '暂无描述'}`,
        '',
        `可在输入框继续发送 \`/skill ${skill.name}\` 或直接描述要调用它完成的任务。`,
      ].join('\n') : [
        query ? `没有找到匹配 \`${query}\` 的 skill。` : '请输入 skill 名称，例如 `/skill lark-approval`。',
        '',
        '可先运行 `/skills` 查看可用列表。',
      ].join('\n'),
    };
  }

  if (name === '/diagnose' || name === '/gateway') {
    const diagnostics = inventory?.diagnostics;
    const lines = [
      `Gateway：${context.connection?.baseUrl || context.statusText || context.gatewayStatus}`,
      `WebSocket：${context.socketState}`,
      `模型：${context.model}`,
      `工作目录：${context.cwd || '未设置'}`,
      `Hermes Home：${diagnostics?.hermesHome || '未读取'}`,
      `Hermes 版本：${diagnostics?.hermesVersion || '未读取'}`,
      `配置文件：${diagnostics?.configExists ? '存在' : '未确认'}`,
      `进程数：${diagnostics?.processCount ?? 0}`,
      `最近错误：${context.inventoryError || '无'}`,
    ];

    return {
      title: name === '/gateway' ? 'Gateway 状态' : '诊断结果',
      text: bulletRows(lines, '暂无诊断信息。'),
    };
  }

  if (name === '/approval') {
    return {
      title: '审批队列',
      text: context.pendingApproval ? [
        '当前有 1 条命令等待确认：',
        '',
        `- 描述：${context.pendingApproval.description}`,
        `- 命令：\`${compactLine(context.pendingApproval.command, 140)}\``,
        '',
        '可以在右侧工作区或弹出的审批面板中选择允许/拒绝。',
      ].join('\n') : '当前没有待审批命令。高风险操作出现时会固定到审批区域。',
    };
  }

  if (name === '/summary') {
    const userCount = context.messages.filter((message) => message.kind === 'user').length;
    const assistantCount = context.messages.filter((message) => message.kind === 'assistant').length;
    const runningTools = context.tools.filter((tool) => tool.state === 'running').length;
    const changedFiles = context.files.length;
    const tableValue = (value: string | number) => String(value).replace(/\|/g, '/');

    return {
      title: '会话摘要',
      text: [
        '| 项目 | 当前值 |',
        '| --- | --- |',
        `| 当前模型 | **${tableValue(context.model)}** |`,
        `| 工作目录 | ${tableValue(context.cwd || '未设置')} |`,
        `| 上下文 | ${context.contextPercent}% · 1M |`,
        `| 消息 | ${userCount} 条用户消息，${assistantCount} 条最终结果 |`,
        `| 工具 | ${runningTools} 个运行中，${context.tools.length} 个已记录 |`,
        `| 文件 | ${changedFiles} 个变更条目 |`,
        `| 会话 | ${context.recentSessions.length} 个最近真实会话 |`,
      ].join('\n'),
    };
  }

  if (name === '/sessions') {
    return {
      title: '最近会话',
      text: bulletRows(
        context.recentSessions.slice(0, 12).map((session) => `${session.title} · ${session.meta}`),
        inventory ? '暂无真实会话。' : context.inventoryError || '还没有读取到会话列表。',
      ),
    };
  }

  if (name === '/models') {
    return {
      title: '模型配置',
      text: bulletRows(
        (inventory?.models ?? []).slice(0, 16).map((model) => `${model.name || model.model} · ${model.provider || 'provider 未设置'} · \`${model.model}\``),
        inventory ? `当前模型：${context.model}` : context.inventoryError || `当前模型：${context.model}`,
      ),
    };
  }

  if (name === '/profiles') {
    const config = inventory?.config;
    return {
      title: 'Profile 线索',
      text: [
        `默认模型：${config?.defaultModel || context.model}`,
        `Provider：${config?.provider || '未设置'}`,
        `Toolsets：${config?.toolsets?.join(', ') || '未设置'}`,
        `Hermes Home：${inventory?.diagnostics.hermesHome || '未读取'}`,
        '',
        '完整 profile 创建、切换和 setup 命令请打开左侧工作台里的 Profiles 页面。',
      ].join('\n'),
    };
  }

  return null;
}

function maybeJsonRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return null;
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function commandFromUnknown(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  const record = maybeJsonRecord(value);
  if (!record) {
    return '';
  }

  return textFromUnknown(record.command ?? record.cmd ?? record.shell ?? record.args);
}

function toolDisplayFromContent(value: unknown, fallbackName = '工具调用'): ToolDisplayInfo {
  const record = maybeJsonRecord(value);
  const rawText = cleanDisplayText(textFromUnknown(value)).trim();

  if (!record) {
    const summary = compactLine(rawText || fallbackName);
    return {
      details: rawText,
      label: fallbackName,
      summary,
    };
  }

  const command = commandFromUnknown(record.command ?? record.args ?? record.input);
  const output = cleanDisplayText(textFromUnknown(record.output ?? record.stdout ?? record.stderr ?? record.result ?? record.message)).trim();
  const error = cleanDisplayText(textFromUnknown(record.error)).trim();
  const exitCode = record.exit_code ?? record.exitCode;
  const detailParts = [
    command ? `$ ${command}` : '',
    output,
    error && error !== 'null' ? error : '',
    exitCode !== undefined && exitCode !== null ? `exit: ${String(exitCode)}` : '',
  ].filter(Boolean);
  const details = detailParts.join('\n\n') || rawText;
  const summary = compactLine(summarizeCommand(command) || output || error || rawText || fallbackName, 72);

  return {
    details: truncateText(details, 4000),
    label: command ? '运行命令' : fallbackName,
    summary,
  };
}

function toolDisplayFromPayload(payload: Record<string, unknown>, fallbackName = '工具调用'): ToolDisplayInfo {
  const args = payload.args && typeof payload.args === 'object' ? (payload.args as Record<string, unknown>) : null;
  const command = commandFromUnknown(payload.command ?? payload.args_text ?? args?.command ?? args?.cmd ?? args);
  const output = cleanDisplayText(
    textFromUnknown(payload.output ?? payload.stdout ?? payload.stderr ?? payload.result ?? payload.preview ?? payload.context),
  ).trim();
  const details = [command ? `$ ${command}` : '', output].filter(Boolean).join('\n\n');
  const summary = compactLine(summarizeCommand(command) || output || coerceGatewayText(payload) || fallbackName, 72);

  return {
    details: truncateText(details || textFromUnknown(payload), 4000),
    label: command || fallbackName === 'terminal' ? '运行命令' : fallbackName,
    summary,
  };
}

function toolEventKey(payload: Record<string, unknown>, name: string, display: ToolDisplayInfo) {
  const explicitId = payload.tool_id ?? payload.id ?? payload.call_id ?? payload.run_id;
  if (explicitId) {
    return String(explicitId);
  }

  const firstDetail = compactLine(display.details, 80);
  return `${name}:${display.label}:${firstDetail || display.summary}`;
}

function firstExistingMessageIndex(messages: ChatMessageModel[], ids: Array<null | string | undefined>) {
  for (const id of ids) {
    if (!id) {
      continue;
    }

    const index = messages.findIndex((message) => message.id === id);
    if (index >= 0) {
      return index;
    }
  }

  return -1;
}

function toolGroupMessage(
  group: Array<{ id: string; info: ToolDisplayInfo; name?: string }>,
  sessionId?: null | string,
): ChatMessageModel | null {
  if (group.length === 0) {
    return null;
  }

  const visible = group.slice(0, 4).map((item) => `• ${item.info.summary}`);
  const hiddenCount = Math.max(0, group.length - visible.length);

  return {
    details: truncateText(
      group.map((item, index) => `${index + 1}. ${item.name || item.info.label}\n${item.info.details || item.info.summary}`).join('\n\n---\n\n'),
      10000,
    ),
    id: `stored-tool-group-${group[0].id}`,
    kind: 'tool',
    meta: hiddenCount > 0 ? `另有 ${hiddenCount} 次已折叠` : '已折叠',
    sessionId,
    status: 'done',
    text: hiddenCount > 0 ? `${visible.join('\n')}\n• 另有 ${hiddenCount} 次工具调用` : visible.join('\n'),
    title: group.length > 1 ? `${group.length} 次工具调用` : group[0].info.label,
    toolName: group[0].name,
  };
}

function eventSessionId(event: GatewayEvent, fallback: null | string) {
  return typeof event.session_id === 'string' && event.session_id ? event.session_id : fallback;
}

function normalizeModel(info?: SessionRuntimeInfo) {
  if (!info) {
    return null;
  }

  if (info.provider && info.model) {
    return `${info.provider}/${info.model}`;
  }

  return info.model || null;
}

function contextPercentFromInfo(info?: SessionRuntimeInfo) {
  const value = info?.usage?.context_percent ?? info?.context_percent;
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : null;
}

function compactCwd(cwd?: null | string) {
  if (!cwd) {
    return 'Hermes Desktop优化';
  }

  const parts = cwd.split('/').filter(Boolean);
  return parts.slice(-2).join('/') || cwd;
}

function formatSessionTime(value?: number) {
  if (!value) {
    return '最近';
  }

  const ms = value > 10_000_000_000 ? Date.now() - value : Date.now() - value * 1000;
  const minutes = Math.max(1, Math.round(ms / 60000));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours}h`;
  }

  return `${Math.round(hours / 24)} 天`;
}

function sessionsFromResponse(response: SessionListResponse) {
  return response.sessions ?? response.data ?? [];
}

function sessionDisplayTitle(session: SessionInfoResponse) {
  return session.title || session.preview || session.id || '未命名会话';
}

function sessionDisplayMeta(session: SessionInfoResponse) {
  const parts = [
    `${session.message_count ?? 0} 条消息`,
    session.model || undefined,
    session.source || undefined,
    formatSessionTime(session.last_active || session.started_at),
  ].filter(Boolean);
  return parts.join(' · ');
}

function sessionSourceLabel(source?: null | string) {
  if (!source) {
    return 'chat';
  }
  const labels: Record<string, string> = {
    cli: 'CLI',
    cron: '自动化',
    dashboard: 'Dashboard',
    desktop: 'Desktop',
    gateway: 'Gateway',
    telegram: 'Telegram',
  };
  return labels[source] || source;
}

function sessionMessagesFromResponse(response: SessionMessagesResponse) {
  return response.messages ?? response.data ?? [];
}

function sessionsToSidebarItems(response: SessionListResponse): SidebarItem[] {
  const sessions = [...sessionsFromResponse(response)].sort((left, right) => {
    const leftActive = typeof left.last_active === 'number' ? left.last_active : 0;
    const rightActive = typeof right.last_active === 'number' ? right.last_active : 0;
    return rightActive - leftActive;
  });

  return sessions.slice(0, 12).map((session, index) => ({
    color: index === 0 ? 'blue' : 'gray',
    id: session.id,
    meta: `${session.message_count ?? 0} 条消息 · ${formatSessionTime(session.last_active)}`,
    title: sessionDisplayTitle(session),
  }));
}

function promoteSidebarItem(items: SidebarItem[], sessionId: null | string, title?: string): SidebarItem[] {
  if (!sessionId) {
    return items;
  }

  const existing = items.find((item) => item.id === sessionId);
  const nextTitle = existing?.title || compactLine(title || '新的 Hermes 会话', 18);
  const nextMeta = existing?.meta?.replace(/·\s*[^·]+$/, '· 刚刚') || '进行中 · 刚刚';
  const promoted: SidebarItem = {
    color: 'blue',
    id: sessionId,
    meta: nextMeta,
    title: nextTitle,
  };

  return [
    promoted,
    ...items
      .filter((item) => item.id !== sessionId)
      .map((item) => ({ ...item, color: item.color === 'blue' ? 'gray' : item.color })),
  ].slice(0, 5);
}

function messagesFromStoredTranscript(messages: SessionMessageResponse[], sessionId?: null | string): ChatMessageModel[] {
  const rendered: ChatMessageModel[] = [];
  let toolGroup: Array<{ id: string; info: ToolDisplayInfo; name?: string }> = [];

  const flushTools = () => {
    const message = toolGroupMessage(toolGroup, sessionId);
    if (message) {
      rendered.push(message);
    }
    toolGroup = [];
  };

  messages.forEach((message, index) => {
    const text = cleanDisplayText(textFromUnknown(message.text ?? message.content)).trim();
    const id = message.id || `${message.role || 'message'}-${index}`;

    if (message.role === 'tool') {
      toolGroup.push({
        id,
        info: toolDisplayFromContent(message.text ?? message.content, message.tool_name || '历史工具输出'),
        name: message.tool_name,
      });
      return;
    }

    if (!text) {
      return;
    }

    flushTools();

    if (message.role === 'user') {
      rendered.push({ id: `stored-user-${id}`, kind: 'user', sessionId, text });
      return;
    }

    rendered.push({
      id: `stored-assistant-${id}`,
      kind: message.role === 'system' ? 'status' : 'assistant',
      sessionId,
      status: 'done',
      text,
      title: message.role === 'assistant' ? '最终结果' : undefined,
    });
  });

  flushTools();
  return rendered;
}

function useHermesRuntime(): HermesRuntime {
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>('browser');
  const [connection, setConnection] = useState<HermesGatewayConnection | null>(null);
  const [socketState, setSocketState] = useState<GatewayConnectionState>('idle');
  const [messages, setMessages] = useState<ChatMessageModel[]>(initialMessages);
  const [activeSessionId, setActiveSessionId] = useState<null | string>(null);
  const [selectedStoredSessionId, setSelectedStoredSessionId] = useState<null | string>(null);
  const [model, setModel] = useState('deepseek-v4-flash');
  const [cwd, setCwd] = useState('');
  const [contextPercent, setContextPercent] = useState(0);
  const [statusText, setStatusText] = useState('正在连接 Hermes Gateway');
  const [inventory, setInventory] = useState<HermesLocalInventory | null>(null);
  const [inventoryError, setInventoryError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [recentSessionItems, setRecentSessionItems] = useState<SidebarItem[]>(recentSessions);
  const [tools, setTools] = useState<GatewayToolItem[]>(fallbackTools);
  const [files, setFiles] = useState<GatewayFileItem[]>(fallbackFiles);
  const [pendingApproval, setPendingApproval] = useState<PendingApproval | null>(null);
  const [pendingClarify, setPendingClarify] = useState<PendingClarify | null>(null);

  const clientRef = useRef<JsonRpcGatewayClient | null>(null);
  const activeSessionIdRef = useRef<null | string>(null);
  const selectedStoredSessionIdRef = useRef<null | string>(null);
  const assistantMessageIdRef = useRef<null | string>(null);
  const reasoningMessageIdRef = useRef<null | string>(null);
  const statusMessageIdRef = useRef<null | string>(null);
  const toolDigestMessageIdRef = useRef<null | string>(null);
  const ignoredSessionIdsRef = useRef<Set<string>>(new Set());
  const pendingApprovalRef = useRef<PendingApproval | null>(null);
  const pendingClarifyRef = useRef<PendingClarify | null>(null);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    selectedStoredSessionIdRef.current = selectedStoredSessionId;
  }, [selectedStoredSessionId]);

  useEffect(() => {
    pendingApprovalRef.current = pendingApproval;
  }, [pendingApproval]);

  useEffect(() => {
    pendingClarifyRef.current = pendingClarify;
  }, [pendingClarify]);

  const patchRuntimeInfo = useCallback((info?: SessionRuntimeInfo) => {
    const nextModel = normalizeModel(info);
    const nextPercent = contextPercentFromInfo(info);

    if (nextModel) {
      setModel(nextModel);
    }

    if (info?.cwd) {
      setCwd(info.cwd);
    }

    if (nextPercent !== null) {
      setContextPercent(nextPercent);
    }
  }, []);

  const refreshInventory = useCallback(async () => {
    if (!window.hermesDesktop?.getLocalInventory) {
      return;
    }

    try {
      const nextInventory = await window.hermesDesktop.getLocalInventory();
      setInventory(nextInventory);
      setInventoryError('');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setInventoryError(message);
    }
  }, []);

  const apiRequest = useCallback(async <T = unknown,>(request: HermesApiRequest) => {
    if (!window.hermesDesktop?.api) {
      throw new Error('Desktop IPC bridge is unavailable.');
    }

    return window.hermesDesktop.api<T>(request);
  }, []);

  const refreshSessionList = useCallback(async () => {
    const response = await apiRequest<SessionListResponse>({
      path: '/api/sessions?limit=40&offset=0&min_messages=1&archived=exclude&order=recent',
      timeoutMs: 12000,
    });
    const nextItems = sessionsToSidebarItems(response);
    if (nextItems.length > 0) {
      setRecentSessionItems(nextItems);
    }
  }, [apiRequest]);

  const upsertMessage = useCallback((message: ChatMessageModel, options: { beforeId?: null | string; moveToEnd?: boolean } = {}) => {
    setMessages((current) => {
      const index = current.findIndex((item) => item.id === message.id);
      const merged = index === -1 ? message : { ...current[index], ...message };

      if (index >= 0 && !options.beforeId && !options.moveToEnd) {
        const next = [...current];
        next[index] = merged;
        return next;
      }

      const next = index === -1 ? [...current] : current.filter((_, itemIndex) => itemIndex !== index);
      let insertAt = next.length;

      if (options.beforeId && options.beforeId !== message.id) {
        const beforeIndex = next.findIndex((item) => item.id === options.beforeId);
        if (beforeIndex >= 0) {
          insertAt = beforeIndex;
        }
      }

      next.splice(insertAt, 0, merged);
      return next;
    });
  }, []);

  const appendToMessage = useCallback((id: string, delta: string, fallback: ChatMessageModel, options: { beforeId?: null | string; moveToEnd?: boolean } = {}) => {
    setMessages((current) => {
      const index = current.findIndex((item) => item.id === id);

      if (index === -1) {
        const next = [...current];
        let insertAt = next.length;
        if (options.beforeId && options.beforeId !== id) {
          const beforeIndex = next.findIndex((item) => item.id === options.beforeId);
          if (beforeIndex >= 0) {
            insertAt = beforeIndex;
          }
        }
        next.splice(insertAt, 0, { ...fallback, text: delta });
        return next;
      }

      const merged = {
        ...current[index],
        text: `${current[index].text}${delta}`,
      };

      if (!options.beforeId && !options.moveToEnd) {
        const next = [...current];
        next[index] = merged;
        return next;
      }

      const next = current.filter((_, itemIndex) => itemIndex !== index);
      let insertAt = next.length;
      if (options.beforeId && options.beforeId !== id) {
        const beforeIndex = next.findIndex((item) => item.id === options.beforeId);
        if (beforeIndex >= 0) {
          insertAt = beforeIndex;
        }
      }
      next.splice(insertAt, 0, merged);
      return next;
    });
  }, []);

  const updateStatusMessage = useCallback(
    (text: string, status: ChatMessageModel['status'] = 'running') => {
      const displayText = normalizeStatusText(text);
      if (!displayText) {
        return;
      }

      const id = statusMessageIdRef.current || makeId('status');
      statusMessageIdRef.current = id;
      setStatusText(displayText);
      upsertMessage({
        id,
        kind: 'status',
        status,
        text: displayText,
        title: '状态更新',
      }, { beforeId: assistantMessageIdRef.current });
    },
    [upsertMessage],
  );

  const appendToolDigest = useCallback(
    (info: ToolDisplayInfo, sessionId?: null | string, toolName?: string) => {
      if (!info.summary) {
        return;
      }

      const id = toolDigestMessageIdRef.current || makeId('tool-digest');
      toolDigestMessageIdRef.current = id;

      setMessages((current) => {
        const index = current.findIndex((item) => item.id === id);
        const existing = index >= 0 ? current[index] : null;
        const currentLines = existing?.text ? existing.text.split('\n').filter(Boolean) : [];
        const nextLine = `• ${info.summary}`;
        const text = currentLines.includes(nextLine) ? currentLines.join('\n') : [...currentLines, nextLine].slice(-6).join('\n');
        const details = [existing?.details, info.details || info.summary].filter(Boolean).join('\n\n---\n\n');
        const message: ChatMessageModel = {
          ...(existing ?? {}),
          details,
          id,
          kind: 'tool',
          meta: '已折叠',
          sessionId,
          status: 'done',
          text,
          title: '工具调用',
          toolName,
        };
        const next = index >= 0 ? current.filter((_, itemIndex) => itemIndex !== index) : [...current];
        const beforeIndex = firstExistingMessageIndex(next, [statusMessageIdRef.current, assistantMessageIdRef.current]);
        next.splice(beforeIndex >= 0 ? beforeIndex : next.length, 0, message);
        return next;
      });
    },
    [],
  );

  const clearConversationRuntime = useCallback((options: {
    clearMessages?: boolean;
    clearSelection?: boolean;
    statusText?: string;
  } = {}) => {
    const {
      clearMessages = true,
      clearSelection = false,
      statusText: nextStatusText,
    } = options;

    if (clearSelection) {
      setSelectedStoredSessionId(null);
      selectedStoredSessionIdRef.current = null;
    }

    setActiveSessionId(null);
    activeSessionIdRef.current = null;
    assistantMessageIdRef.current = null;
    reasoningMessageIdRef.current = null;
    statusMessageIdRef.current = null;
    toolDigestMessageIdRef.current = null;
    setPendingApproval(null);
    setPendingClarify(null);
    setTools([]);
    setFiles([]);
    setContextPercent(0);

    if (clearMessages) {
      setMessages([]);
    }

    if (nextStatusText) {
      setStatusText(nextStatusText);
    }
  }, []);

  const resumeRuntimeSession = useCallback(
    async (
      client: JsonRpcGatewayClient,
      storedSessionId: string,
      options: { replaceTranscript?: boolean } = {},
    ) => {
      const resumed = await client.request<SessionCreateResponse>(
        'session.resume',
        { cols: 96, session_id: storedSessionId },
        60000,
      );
      const runtimeSessionId = resumed.session_id || storedSessionId;
      ignoredSessionIdsRef.current.delete(runtimeSessionId);
      ignoredSessionIdsRef.current.delete(storedSessionId);
      setActiveSessionId(runtimeSessionId);
      activeSessionIdRef.current = runtimeSessionId;
      patchRuntimeInfo(resumed.info);

      const resumedTranscript = messagesFromStoredTranscript(resumed.messages ?? [], runtimeSessionId);
      if (options.replaceTranscript && resumedTranscript.length > 0) {
        setMessages(resumedTranscript);
      }

      setStatusText('就绪');
      return runtimeSessionId;
    },
    [patchRuntimeInfo],
  );

  const handleGatewayEvent = useCallback(
    (event: GatewayEvent) => {
      const payload = payloadRecord(event);
      const sessionId = eventSessionId(event, activeSessionIdRef.current);

      if (event.session_id && ignoredSessionIdsRef.current.has(event.session_id)) {
        return;
      }

      if (event.session_id && activeSessionIdRef.current && event.session_id !== activeSessionIdRef.current) {
        return;
      }

      if (sessionId && !activeSessionIdRef.current) {
        setActiveSessionId(sessionId);
      }

      switch (event.type) {
        case 'gateway.ready':
          setStatusText('Hermes Gateway 已就绪');
          break;
        case 'session.info': {
          const info = (payload.info && typeof payload.info === 'object' ? payload.info : payload) as SessionRuntimeInfo;
          patchRuntimeInfo(info);

          if (payload.running === false || info.running === false) {
            setStatusText('就绪');
            setTools((current) =>
              current.map((item) => (item.state === 'running' ? { ...item, state: 'done', value: '完成' } : item)),
            );
          }
          break;
        }
        case 'message.start': {
          const id = makeId('assistant');
          assistantMessageIdRef.current = id;
          reasoningMessageIdRef.current = null;
          statusMessageIdRef.current = null;
          toolDigestMessageIdRef.current = null;
          setStatusText('Agent 正在生成回复');
          upsertMessage({
            id,
            kind: 'assistant',
            sessionId,
            status: 'running',
            text: '',
            title: '最终结果',
          }, { moveToEnd: true });
          break;
        }
        case 'message.delta': {
          const delta = coerceGatewayText(payload, { trim: false });
          if (delta.length === 0) {
            break;
          }

          const id = assistantMessageIdRef.current || makeId('assistant');
          assistantMessageIdRef.current = id;
          appendToMessage(id, delta, {
            id,
            kind: 'assistant',
            sessionId,
            status: 'running',
            text: '',
            title: '最终结果',
          }, { moveToEnd: true });
          break;
        }
        case 'message.complete': {
          const finalText = coerceGatewayText(payload);
          const id = assistantMessageIdRef.current || makeId('assistant');
          const statusId = statusMessageIdRef.current;

          setMessages((current) => {
            const withoutActiveStatus = statusId
              ? current.filter((item) => item.id !== statusId)
              : current;
            const index = withoutActiveStatus.findIndex((item) => item.id === id);
            if (index === -1) {
              return finalText
                ? [
                    ...withoutActiveStatus,
                    {
                      id,
                      kind: 'assistant',
                      sessionId,
                      status: payload.status === 'error' ? 'error' : 'done',
                      text: finalText,
                      title: '最终结果',
                    },
                  ]
                : withoutActiveStatus;
            }

            const next = [...withoutActiveStatus];
            next[index] = {
              ...next[index],
              status: payload.status === 'error' ? 'error' : 'done',
              text: finalText || next[index].text,
              title: '最终结果',
            };
            const [finalMessage] = next.splice(index, 1);
            next.push(finalMessage);
            return next;
          });

          assistantMessageIdRef.current = null;
          statusMessageIdRef.current = null;
          setStatusText(payload.status === 'error' ? '回复中断' : '就绪');
          break;
        }
        case 'thinking.delta':
        case 'status.update': {
          const text = normalizeStatusText(coerceGatewayText(payload) || textFromUnknown(payload.kind));
          if (text) {
            if (text === '正在思考') {
              updateStatusMessage(text, 'running');
            } else {
              setStatusText(text);
            }
          }
          break;
        }
        case 'reasoning.delta':
        case 'reasoning.available': {
          const delta = coerceGatewayText(payload, { trim: event.type === 'reasoning.available' });
          if (delta.length === 0) {
            break;
          }

          const id = reasoningMessageIdRef.current || makeId('reasoning');
          reasoningMessageIdRef.current = id;

          updateStatusMessage('正在思考', 'running');

          if (event.type === 'reasoning.available') {
            setMessages((current) => {
              const index = current.findIndex((item) => item.id === id);
              const existing = index >= 0 ? current[index] : null;
              const message: ChatMessageModel = {
                ...(existing ?? {}),
                id,
                kind: 'reasoning',
                sessionId,
                status: 'done',
                text: compactDuplicateReasoning(existing?.text ?? '', delta, true),
                title: '推理过程',
              };
              const next = index >= 0 ? current.filter((_, itemIndex) => itemIndex !== index) : [...current];
              const beforeIndex = firstExistingMessageIndex(next, [
                toolDigestMessageIdRef.current,
                statusMessageIdRef.current,
                assistantMessageIdRef.current,
              ]);
              next.splice(beforeIndex >= 0 ? beforeIndex : next.length, 0, message);
              return next;
            });
            break;
          }

          setMessages((current) => {
            const index = current.findIndex((item) => item.id === id);
            const existing = index >= 0 ? current[index] : null;
            const message: ChatMessageModel = {
              ...(existing ?? {}),
              id,
              kind: 'reasoning',
              sessionId,
              status: 'done',
              text: compactDuplicateReasoning(existing?.text ?? '', delta),
              title: '推理过程',
            };
            const next = index >= 0 ? current.filter((_, itemIndex) => itemIndex !== index) : [...current];
            const beforeIndex = firstExistingMessageIndex(next, [
              toolDigestMessageIdRef.current,
              statusMessageIdRef.current,
              assistantMessageIdRef.current,
            ]);
            next.splice(beforeIndex >= 0 ? beforeIndex : next.length, 0, message);
            return next;
          });
          break;
        }
        case 'tool.generating':
        case 'tool.start':
        case 'tool.progress':
        case 'tool.complete': {
          const name = String(payload.name || payload.tool_name || '工具调用');
          const isComplete = event.type === 'tool.complete';
          const display = toolDisplayFromPayload(payload, name);
          const text = display.summary || (isComplete ? '工具调用已完成' : '工具正在执行');
          const toolId = toolEventKey(payload, name, display);

          setTools((current) => {
            const index = current.findIndex((item) => item.id === toolId || item.detail === text);
            const item: GatewayToolItem = {
              detail: text,
              details: display.details,
              id: toolId,
              label: display.label,
              state: isComplete ? 'done' : 'running',
              value: isComplete
                ? typeof payload.duration_s === 'number'
                  ? `${payload.duration_s.toFixed(1)}s`
                  : '完成'
                : '运行中',
            };

            if (index === -1) {
              return [item, ...current.filter((row) => !row.id.startsWith('demo-tool'))].slice(0, 8);
            }

            const next = [...current];
            next[index] = item;
            return next;
          });

          if (isComplete) {
            appendToolDigest(display, sessionId, name);
          }

          if (typeof payload.inline_diff === 'string' && payload.inline_diff.trim()) {
            setFiles((current) => [
              { change: 'mod', label: `${name} diff`, meta: 'inline' },
              ...current.filter((item) => item.label !== `${name} diff`),
            ]);
          }
          break;
        }
        case 'approval.request': {
          const command = textFromUnknown(payload.command).trim();
          const description = textFromUnknown(payload.description).trim() || 'Hermes 需要确认这个操作后才能继续。';
          const requestId = textFromUnknown(payload.request_id).trim();
          const id = makeId('approval');
          const request = { command, description, messageId: id, requestId, sessionId };

          setPendingApproval(request);
          setStatusText('等待审批');
          upsertMessage({
            command,
            id,
            kind: 'approval',
            sessionId,
            status: 'pending',
            text: description,
            title: '需要手动确认',
          }, { beforeId: assistantMessageIdRef.current });
          break;
        }
        case 'clarify.request': {
          const question = textFromUnknown(payload.question).trim();
          const requestId = textFromUnknown(payload.request_id).trim();
          const choices = Array.isArray(payload.choices)
            ? payload.choices.filter((choice): choice is string => typeof choice === 'string')
            : [];
          const id = makeId('clarify');
          const request = { choices, messageId: id, question, requestId, sessionId };

          setPendingClarify(request);
          setStatusText('等待补充信息');
          upsertMessage({
            choices,
            id,
            kind: 'clarify',
            sessionId,
            status: 'pending',
            text: question || 'Hermes 需要你补充信息。',
            title: '需要澄清',
          }, { beforeId: assistantMessageIdRef.current });
          break;
        }
        case 'error': {
          const text = coerceGatewayText(payload) || textFromUnknown(payload.message ?? payload.error) || 'Gateway 事件出错';
          upsertMessage({
            id: makeId('error'),
            kind: 'error',
            sessionId,
            status: 'error',
            text,
            title: 'Hermes 错误',
          }, { beforeId: assistantMessageIdRef.current });
          setStatusText('出现错误');
          break;
        }
        case 'background.complete':
          updateStatusMessage(coerceGatewayText(payload) || '后台任务已完成', 'done');
          break;
        default:
          break;
      }
    },
    [appendToMessage, appendToolDigest, patchRuntimeInfo, updateStatusMessage, upsertMessage],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('smoke') && gatewayStatus !== 'skipped' && gatewayStatus !== 'browser') {
      return undefined;
    }

    window.__beautyHermesInjectGatewayEvent = handleGatewayEvent;
    return () => {
      delete window.__beautyHermesInjectGatewayEvent;
    };
  }, [gatewayStatus, handleGatewayEvent]);

  const connectGateway = useCallback(async () => {
    if (!window.hermesDesktop) {
      setGatewayStatus('browser');
      setSocketState('closed');
      setStatusText('浏览器预览模式');
      setLogs(['Desktop IPC bridge is unavailable in a regular browser preview.']);
      return;
    }

    void refreshInventory();
    setGatewayStatus('starting');
    setStatusText('正在启动 Hermes Gateway');
    const desktop = window.hermesDesktop;

    try {
      const nextConnection = await desktop.startHermes();
      setConnection(nextConnection);
      setLogs(nextConnection.logs ?? []);

      if (nextConnection.status === 'skipped') {
        setGatewayStatus('skipped');
        setStatusText('Gateway smoke 模式');
        return;
      }

      setStatusText('正在连接 Hermes Gateway');
      const wsUrl = await desktop.getGatewayWsUrl();
      const client = new JsonRpcGatewayClient();
      clientRef.current?.close();
      clientRef.current = client;
      client.onAny(handleGatewayEvent);
      client.onState(setSocketState);
      await client.connect(wsUrl);
      setGatewayStatus('connected');
      setStatusText('就绪');

      const selectedSessionId = selectedStoredSessionIdRef.current;
      if (selectedSessionId && !activeSessionIdRef.current) {
        void resumeRuntimeSession(client, selectedSessionId).catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          setStatusText('历史会话恢复失败');
          setLogs((current) => [`Session resume error: ${message}`, ...current].slice(0, 120));
        });
      }

      void (async () => {
        const [sessionsResponse, statusResponse] = await Promise.allSettled([
          refreshSessionList(),
          desktop.api<Record<string, unknown>>({ path: '/api/status', timeoutMs: 12000 }),
        ]);

        if (sessionsResponse.status === 'rejected') {
          setLogs((current) => [`Session list error: ${sessionsResponse.reason}`, ...current].slice(0, 120));
        }

        if (statusResponse.status === 'fulfilled') {
          const version = typeof statusResponse.value.version === 'string' ? statusResponse.value.version : '';
          setLogs((current) => [`Hermes status OK${version ? ` · ${version}` : ''}`, ...current].slice(0, 120));
        } else {
          setLogs((current) => [`Hermes status error: ${statusResponse.reason}`, ...current].slice(0, 120));
        }

        void refreshInventory();
      })();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setGatewayStatus('error');
      setSocketState('error');
      setStatusText('Gateway 连接失败');
      setLogs((current) => [`Gateway error: ${message}`, ...current].slice(0, 120));
      upsertMessage({
        id: makeId('gateway-error'),
        kind: 'error',
        status: 'error',
        text: message,
        title: '无法连接 Hermes Gateway',
      });
    }
  }, [handleGatewayEvent, refreshInventory, refreshSessionList, resumeRuntimeSession, upsertMessage]);

  useEffect(() => {
    void connectGateway();

    return () => {
      clientRef.current?.close();
      clientRef.current = null;
    };
  }, [connectGateway]);

  const selectSession = useCallback(
    async (sessionId: string) => {
      const storedSessionId = sessionId.trim();
      if (!storedSessionId) {
        return;
      }

      const previousSessionId = activeSessionIdRef.current;
      const previousStoredSessionId = selectedStoredSessionIdRef.current;
      if (previousSessionId) {
        ignoredSessionIdsRef.current.add(previousSessionId);
      }

      setRecentSessionItems((current) => promoteSidebarItem(current, storedSessionId));
      clearConversationRuntime({ statusText: '正在加载会话' });
      setSelectedStoredSessionId(storedSessionId);
      selectedStoredSessionIdRef.current = storedSessionId;
      setMessages([
        {
          id: makeId('session-loading'),
          kind: 'status',
          sessionId: storedSessionId,
          status: 'running',
          text: '正在打开历史会话。',
          title: '打开会话',
        },
      ]);

      const previousClient = clientRef.current;
      if (previousSessionId && previousStoredSessionId !== storedSessionId && previousClient?.connectionState === 'open') {
        await previousClient.request('session.close', { session_id: previousSessionId }, 15000).catch(() => undefined);
      }

      if (!window.hermesDesktop) {
        setMessages([
          {
            id: makeId('browser-session'),
            kind: 'status',
            status: 'done',
            text: '浏览器预览模式无法读取真实 Hermes 会话。',
            title: '会话预览不可用',
          },
        ]);
        return;
      }

      let paintedTranscript = false;

      try {
        const response = await window.hermesDesktop.api<SessionMessagesResponse>({
          path: `/api/sessions/${encodeURIComponent(storedSessionId)}/messages`,
          timeoutMs: 60000,
        });
        const transcript = messagesFromStoredTranscript(sessionMessagesFromResponse(response), storedSessionId);

        if (transcript.length > 0) {
          setMessages(transcript);
          paintedTranscript = true;
        } else {
          setMessages([
            {
              id: makeId('empty-session'),
              kind: 'status',
              sessionId: storedSessionId,
              status: 'done',
              text: '这个会话暂时没有可显示的消息。',
              title: '空会话',
            },
          ]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setMessages([
          {
            id: makeId('session-load-error'),
            kind: 'error',
            sessionId: storedSessionId,
            status: 'error',
            text: message,
            title: '会话读取失败',
          },
        ]);
      }

      const client = clientRef.current;
      if (!client || client.connectionState !== 'open') {
        setStatusText('已打开历史会话，等待 Gateway 连接');
        return;
      }

      try {
        await resumeRuntimeSession(client, storedSessionId, { replaceTranscript: !paintedTranscript });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatusText('历史会话已打开，运行时恢复失败');
        upsertMessage({
          id: makeId('session-resume-error'),
          kind: 'error',
          sessionId: storedSessionId,
          status: 'error',
          text: message,
          title: '会话恢复失败',
        });
      }
    },
    [clearConversationRuntime, resumeRuntimeSession, upsertMessage],
  );

  const ensureRuntimeSession = useCallback(
    async (client: JsonRpcGatewayClient, title?: string) => {
      const currentSessionId = activeSessionIdRef.current;
      if (currentSessionId) {
        return currentSessionId;
      }

      const created = await client.request<SessionCreateResponse>('session.create', { cols: 96, title: title || '' }, 60000);
      const sessionId = created.session_id;
      const storedId = created.stored_session_id || created.session_id;
      setActiveSessionId(sessionId);
      activeSessionIdRef.current = sessionId;
      setSelectedStoredSessionId(storedId);
      selectedStoredSessionIdRef.current = storedId;
      setRecentSessionItems((current) => promoteSidebarItem(current, storedId, title));
      patchRuntimeInfo(created.info);

      if (created.messages?.length) {
        const transcript = messagesFromStoredTranscript(created.messages, sessionId);
        if (transcript.length) {
          setMessages(transcript);
        }
      }

      return sessionId;
    },
    [patchRuntimeInfo],
  );

  const archiveSession = useCallback(
    async (item: SidebarItem) => {
      if (!item.id) {
        throw new Error('只有真实 Hermes 会话可以归档。');
      }
      if (!window.hermesDesktop?.api) {
        throw new Error('桌面 IPC 不可用，无法归档真实会话。');
      }

      const activeRuntimeId = activeSessionIdRef.current;
      const client = clientRef.current;
      const wasSelected = selectedStoredSessionIdRef.current === item.id;
      if (wasSelected && activeRuntimeId) {
        ignoredSessionIdsRef.current.add(activeRuntimeId);
      }
      if (wasSelected && activeRuntimeId && client?.connectionState === 'open') {
        await client.request('session.close', { session_id: activeRuntimeId }, 15000).catch(() => undefined);
      }

      await window.hermesDesktop.api({
        body: { archived: true },
        method: 'PATCH',
        path: `/api/sessions/${encodeURIComponent(item.id)}`,
        timeoutMs: 30000,
      });
      setRecentSessionItems((current) => current.filter((row) => row.id !== item.id));
      if (wasSelected) {
        clearConversationRuntime({ clearSelection: true, statusText: '会话已归档' });
      } else {
        setStatusText('会话已归档');
      }
      void refreshSessionList().catch((error) => {
        setLogs((current) => [`Session refresh error: ${error instanceof Error ? error.message : String(error)}`, ...current].slice(0, 120));
      });
      void refreshInventory();
    },
    [clearConversationRuntime, refreshInventory, refreshSessionList],
  );

  const deleteSession = useCallback(
    async (item: SidebarItem) => {
      if (!item.id) {
        throw new Error('只有真实 Hermes 会话可以删除。');
      }
      if (!window.hermesDesktop?.api) {
        throw new Error('桌面 IPC 不可用，无法删除真实会话。');
      }

      const activeRuntimeId = activeSessionIdRef.current;
      const client = clientRef.current;
      const wasSelected = selectedStoredSessionIdRef.current === item.id;
      if (wasSelected && activeRuntimeId) {
        ignoredSessionIdsRef.current.add(activeRuntimeId);
      }
      if (wasSelected && activeRuntimeId && client?.connectionState === 'open') {
        await client.request('session.close', { session_id: activeRuntimeId }, 15000).catch(() => undefined);
      }

      await window.hermesDesktop.api({
        method: 'DELETE',
        path: `/api/sessions/${encodeURIComponent(item.id)}`,
        timeoutMs: 30000,
      });
      setRecentSessionItems((current) => current.filter((row) => row.id !== item.id));
      if (wasSelected) {
        clearConversationRuntime({ clearSelection: true, statusText: '会话已删除' });
      } else {
        setStatusText('会话已删除');
      }
      void refreshSessionList().catch((error) => {
        setLogs((current) => [`Session refresh error: ${error instanceof Error ? error.message : String(error)}`, ...current].slice(0, 120));
      });
      void refreshInventory();
    },
    [clearConversationRuntime, refreshInventory, refreshSessionList],
  );

  const submitPrompt = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      upsertMessage({
        id: makeId('user'),
        kind: 'user',
        text: trimmed,
      });

      if (trimmed.startsWith('/')) {
        const localResponse = buildLocalSlashResponse(trimmed, {
          connection,
          contextPercent,
          cwd,
          files,
          gatewayStatus,
          inventory,
          inventoryError,
          messages,
          model,
          pendingApproval,
          recentSessions: recentSessionItems,
          socketState,
          statusText,
          tools,
        });

        if (localResponse) {
          upsertMessage({
            id: makeId('slash-local'),
            kind: 'assistant',
            status: 'done',
            text: localResponse.text,
            title: localResponse.title,
          });
          setStatusText('就绪');
          return;
        }
      }

      const client = clientRef.current;
      if (!client || client.connectionState !== 'open') {
        upsertMessage({
          id: makeId('not-connected'),
          kind: 'error',
          status: 'error',
          text: 'Hermes Gateway 还没有连接完成，请稍后再试。',
          title: '暂时无法发送',
        });
        return;
      }

      let sessionId = activeSessionIdRef.current;
      setStatusText('正在提交消息');

      try {
        sessionId = await ensureRuntimeSession(client, trimmed);

        if (trimmed.startsWith('/')) {
          const result = await client.request('slash.exec', { command: trimmed, session_id: sessionId }, 90000);
          const output = slashOutputText(result) || '指令已完成。';
          upsertMessage({
            id: makeId('slash-output'),
            kind: 'assistant',
            sessionId,
            status: 'done',
            text: output,
            title: `已运行 ${trimmed.split(/\s+/)[0]}`,
          });
          setStatusText('就绪');
          return;
        }

        setRecentSessionItems((current) => promoteSidebarItem(current, selectedStoredSessionIdRef.current || sessionId, trimmed));
        await client.request('prompt.submit', { session_id: sessionId, text: trimmed }, 30000);
        setStatusText('等待 Hermes 回复');
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setStatusText('发送失败');
        upsertMessage({
          id: makeId('submit-error'),
          kind: 'error',
          sessionId,
          status: 'error',
          text: message,
          title: '发送失败',
        });
      }
    },
    [connection, contextPercent, cwd, ensureRuntimeSession, files, gatewayStatus, inventory, inventoryError, messages, model, pendingApproval, recentSessionItems, socketState, statusText, tools, upsertMessage],
  );

  const respondApproval = useCallback(
    async (choice: 'once' | 'session' | 'always' | 'deny') => {
      const request = pendingApprovalRef.current;
      const sessionId = request?.sessionId || activeSessionIdRef.current;
      const client = clientRef.current;

      if (!request || !sessionId || !client) {
        return;
      }

      await client.request('approval.respond', { choice, session_id: sessionId }, 30000);
      setPendingApproval(null);
      upsertMessage({
        id: request.messageId,
        kind: 'approval',
        sessionId,
        status: choice === 'deny' ? 'denied' : 'done',
        text: choice === 'deny' ? '已拒绝，Hermes 会停止或改用其他路径。' : '已确认，Hermes 会继续执行。',
        title: choice === 'deny' ? '审批已拒绝' : '审批已通过',
      });
      setStatusText(choice === 'deny' ? '审批已拒绝' : '继续执行');
    },
    [upsertMessage],
  );

  const respondClarify = useCallback(
    async (answer: string) => {
      const request = pendingClarifyRef.current;
      const client = clientRef.current;

      if (!request || !request.requestId || !client) {
        return;
      }

      await client.request('clarify.respond', { answer, request_id: request.requestId }, 30000);
      setPendingClarify(null);
      upsertMessage({
        choices: request.choices,
        id: request.messageId,
        kind: 'clarify',
        sessionId: request.sessionId,
        status: 'done',
        text: `已回复：${answer}`,
        title: '澄清已提交',
      });
      setStatusText('继续执行');
    },
    [upsertMessage],
  );

  const startNewTask = useCallback(async () => {
    const previousSessionId = activeSessionIdRef.current;
    const client = clientRef.current;

    if (previousSessionId) {
      ignoredSessionIdsRef.current.add(previousSessionId);
    }

    clearConversationRuntime({
      clearSelection: true,
      statusText: client?.connectionState === 'open' ? '就绪' : gatewayStatus === 'connected' ? '正在连接 Hermes Gateway' : statusText,
    });

    if (previousSessionId && client?.connectionState === 'open') {
      try {
        await client.request('session.close', { session_id: previousSessionId }, 15000);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setLogs((current) => [`Session close during new task: ${message}`, ...current].slice(0, 120));
      }
    }
  }, [clearConversationRuntime, gatewayStatus, statusText]);

  const startGateway = useCallback(async () => {
    setGatewayStatus('starting');
    setStatusText('正在启动 Hermes Gateway');

    if (!window.hermesDesktop?.startHermes) {
      setGatewayStatus('browser');
      setStatusText('浏览器预览模式');
      return;
    }

    const nextConnection = await window.hermesDesktop.startHermes({ force: true });
    setConnection(nextConnection);
    setLogs(nextConnection?.logs ?? []);
    await connectGateway();
    void refreshInventory();
  }, [connectGateway, refreshInventory]);

  const stopGateway = useCallback(async () => {
    clientRef.current?.close();
    clientRef.current = null;
    setSocketState('closed');

    if (!window.hermesDesktop?.stopHermes) {
      setStatusText('浏览器预览模式');
      return;
    }

    const nextConnection = await window.hermesDesktop.stopHermes();
    setConnection(nextConnection);
    setLogs(nextConnection?.logs ?? []);
    setGatewayStatus(nextConnection?.status === 'exited' ? 'stopped' : 'skipped');
    setStatusText(nextConnection?.status === 'exited' ? 'Gateway 已停止' : '没有可停止的本机进程');
    void refreshInventory();
  }, [refreshInventory]);

  const restartGateway = useCallback(async () => {
    clientRef.current?.close();
    clientRef.current = null;
    setSocketState('closed');
    if (window.hermesDesktop?.stopHermes) {
      await window.hermesDesktop.stopHermes().catch(() => null);
    }
    setGatewayStatus('starting');
    setStatusText('正在重启 Hermes Gateway');
    await connectGateway();
  }, [connectGateway]);

  const connectionLabel = useMemo(() => {
    if (gatewayStatus === 'browser') {
      return '浏览器预览';
    }

    if (gatewayStatus === 'starting') {
      return '启动中';
    }

    if (gatewayStatus === 'error') {
      return '连接失败';
    }

    if (gatewayStatus === 'stopped') {
      return '已停止';
    }

    if (gatewayStatus === 'skipped') {
      return 'Smoke 模式';
    }

    if (connection?.source === 'existing') {
      return '已连接 · 复用 gateway';
    }

    return '已连接 · 本机 gateway';
  }, [connection?.source, gatewayStatus]);

  return {
    activeSessionId,
    apiRequest,
    archiveSession,
    connection,
    connectionLabel,
    contextPercent,
    cwd,
    deleteSession,
    files,
    gatewayStatus,
    inventory,
    inventoryError,
    logs,
    messages,
    model,
    pendingApproval,
    pendingClarify,
    recentSessions: recentSessionItems,
    refreshInventory,
    restartGateway,
    selectedStoredSessionId,
    selectSession,
    startGateway,
    startNewTask,
    stopGateway,
    respondApproval,
    respondClarify,
    socketState,
    statusText,
    submitPrompt,
    tools,
  };
}

function projectSidebarItems(runtime: HermesRuntime): SidebarItem[] {
  const cwdLabel = runtime.cwd ? shortenPath(runtime.cwd) : '未选择目录';
  const sessionCount = runtime.recentSessions.length;

  return [
    {
      active: true,
      color: runtime.gatewayStatus === 'connected' ? 'indigo' : runtime.gatewayStatus === 'error' ? 'red' : 'gray',
      meta: `${runtime.connectionLabel} · ${cwdLabel}`,
      title: '本地 Hermes',
    },
    {
      color: sessionCount > 0 ? 'blue' : 'gray',
      meta: sessionCount > 0 ? `${sessionCount} 个最近会话` : '等待真实会话',
      title: '会话',
    },
  ];
}

function sidebarItemKey(item: SidebarItem) {
  return item.id || item.title;
}

function readStoredDensity(): UiDensity {
  if (typeof window === 'undefined') {
    return 'comfortable';
  }

  try {
    const value = window.localStorage.getItem(preferenceStorageKeys.density);
    return value === 'compact' || value === 'comfortable' ? value : 'comfortable';
  } catch {
    return 'comfortable';
  }
}

function readStoredTheme(): UiTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  try {
    const value = window.localStorage.getItem(preferenceStorageKeys.theme);
    return value === 'soft' || value === 'light' ? value : 'light';
  } catch {
    return 'light';
  }
}

function writeStoredPreference(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Preference persistence should never block the main desktop workflow.
  }
}

function App() {
  const runtime = useHermesRuntime();
  const [surface, setSurface] = useState<Surface>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('activity');
  const [uiDensity, setUiDensity] = useState<UiDensity>(readStoredDensity);
  const [uiTheme, setUiTheme] = useState<UiTheme>(readStoredTheme);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [approvalVariant, setApprovalVariant] = useState<ApprovalVariant | null>(null);
  const [selectedWorkbenchFileLabel, setSelectedWorkbenchFileLabel] = useState('');
  const [deniedRecovery, setDeniedRecovery] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');
  const [hiddenSidebarKeys, setHiddenSidebarKeys] = useState<string[]>([]);
  const [pendingSidebarDeleteKey, setPendingSidebarDeleteKey] = useState('');
  const [selectingSessionId, setSelectingSessionId] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    writeStoredPreference(preferenceStorageKeys.density, uiDensity);
  }, [uiDensity]);

  useEffect(() => {
    writeStoredPreference(preferenceStorageKeys.theme, uiTheme);
  }, [uiTheme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandOpen(true);
      }
      if (event.key === 'Escape') {
        setCommandOpen(false);
        setApprovalVariant(null);
        setAttachmentOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setNotice(''), 2200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!pendingSidebarDeleteKey) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingSidebarDeleteKey(''), 5000);
    return () => window.clearTimeout(timer);
  }, [pendingSidebarDeleteKey]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
  }, []);

  const chatTitle = useMemo(() => {
    if (!runtime.selectedStoredSessionId) {
      return surfaceMeta.chat.title;
    }

    return runtime.recentSessions.find((item) => item.id === runtime.selectedStoredSessionId)?.title || surfaceMeta.chat.title;
  }, [runtime.recentSessions, runtime.selectedStoredSessionId]);
  const currentMeta = surface === 'chat' ? { ...surfaceMeta.chat, title: chatTitle } : surfaceMeta[surface];
  const projectItems = useMemo(() => projectSidebarItems(runtime), [runtime.connectionLabel, runtime.cwd, runtime.gatewayStatus, runtime.recentSessions]);
  const visibleRecentItems = useMemo(
    () => runtime.recentSessions.filter((item) => !hiddenSidebarKeys.includes(sidebarItemKey(item))),
    [hiddenSidebarKeys, runtime.recentSessions],
  );
  const visibleProjectItems = useMemo(
    () => projectItems.filter((item) => !hiddenSidebarKeys.includes(sidebarItemKey(item))),
    [hiddenSidebarKeys, projectItems],
  );
  const showWorkbench = surface === 'chat';
  const hideSidebarItem = useCallback((item: SidebarItem) => {
    const key = sidebarItemKey(item);
    setHiddenSidebarKeys((current) => current.includes(key) ? current : [...current, key]);
    showNotice(`${item.title} 已隐藏`);
  }, [showNotice]);
  const handleArchiveItem = useCallback((item: SidebarItem) => {
    if (!item.id) {
      hideSidebarItem(item);
      return;
    }

    void runtime.archiveSession(item)
      .then(() => showNotice(`${item.title} 已归档`))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(`归档失败：${message}`);
      });
  }, [hideSidebarItem, runtime, showNotice]);
  const handleDeleteItem = useCallback((item: SidebarItem) => {
    const key = sidebarItemKey(item);
    if (pendingSidebarDeleteKey !== key) {
      setPendingSidebarDeleteKey(key);
      showNotice(item.id ? `再次点击删除“${item.title}”` : `再次点击隐藏“${item.title}”`);
      return;
    }

    setPendingSidebarDeleteKey('');
    if (!item.id) {
      hideSidebarItem(item);
      return;
    }

    void runtime.deleteSession(item)
      .then(() => showNotice(`${item.title} 已删除`))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(`删除失败：${message}`);
      });
  }, [hideSidebarItem, pendingSidebarDeleteKey, runtime, showNotice]);
  const handleSelectSession = useCallback((sessionId: string) => {
    const item = runtime.recentSessions.find((row) => row.id === sessionId);
    setSurface('chat');
    setSelectingSessionId(sessionId);
    showNotice(`正在打开 ${item?.title || '会话'}`);

    void runtime.selectSession(sessionId)
      .then(() => showNotice(`${item?.title || '会话'} 已打开`))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(`打开会话失败：${message}`);
      })
      .finally(() => setSelectingSessionId(''));
  }, [runtime, showNotice]);
  const handleStartNewTask = useCallback(() => {
    setSurface('chat');
    setRightOpen(true);
    setPendingSidebarDeleteKey('');
    setSelectingSessionId('');

    void runtime.startNewTask()
      .then(() => showNotice('已开始新任务'))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(`新建任务失败：${message}`);
      });
  }, [runtime, showNotice]);

  return (
    <div
      className={rightOpen && showWorkbench ? 'appShell workbenchOpen' : 'appShell'}
      data-density={uiDensity}
      data-testid="app-shell"
      data-theme={uiTheme}
    >
      <Sidebar
        activeSessionId={runtime.activeSessionId}
        activeSurface={surface}
        gatewayStatus={runtime.gatewayStatus}
        model={runtime.model}
        onNewTask={handleStartNewTask}
        onSurfaceChange={setSurface}
        onOpenCommand={() => setCommandOpen(true)}
        onSelectSession={handleSelectSession}
        onArchiveItem={handleArchiveItem}
        onDeleteItem={handleDeleteItem}
        onMoreItem={(item) => {
          setCommandQuery(item.title);
          setCommandOpen(true);
        }}
        recentItems={visibleRecentItems}
        projectItems={visibleProjectItems}
        pendingDeleteKey={pendingSidebarDeleteKey}
        selectedStoredSessionId={runtime.selectedStoredSessionId}
        selectingSessionId={selectingSessionId}
        statusText={runtime.connectionLabel}
      />

      <main className={rightOpen && showWorkbench ? 'content withWorkbench' : 'content'}>
        <header className={surface === 'chat' ? 'topBar chatTopBar' : 'topBar'}>
          <div className="topBarTitle">
            <h1 data-testid="surface-title">{currentMeta.title}</h1>
            {surface === 'chat' && (
              <button
                className="titleMoreButton"
                type="button"
                aria-label="会话更多操作"
                onClick={() => {
                  setCommandQuery(chatTitle);
                  setCommandOpen(true);
                }}
              >
                <MoreHorizontal size={17} />
              </button>
            )}
            {surface !== 'chat' && <p>{currentMeta.subtitle}</p>}
          </div>
          {surface !== 'chat' && (
            <div className="topActions">
              <button className="iconButton" type="button" aria-label="搜索" onClick={() => setCommandOpen(true)}>
                <Search size={17} />
              </button>
              {showWorkbench && (
                <button
                  className="iconButton"
                  type="button"
                  aria-label={rightOpen ? '收起工作区' : '展开工作区'}
                  onClick={() => setRightOpen((value) => !value)}
                >
                  {rightOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
                </button>
              )}
            </div>
          )}
        </header>

        {surface === 'chat' && (
          <ChatSurface
            attachmentOpen={attachmentOpen}
            deniedRecovery={deniedRecovery}
            runtime={runtime}
            setAttachmentOpen={setAttachmentOpen}
            onOpenApproval={() => setApprovalVariant('risk')}
            onNavigate={(nextSurface) => setSurface(nextSurface)}
            onOpenProjects={() => setSurface('projects')}
            onOpenSettingsSection={(section) => {
              setSettingsSection(section);
              setSurface('settings');
            }}
            onOpenWorkbenchTab={(tab) => {
              setRightOpen(true);
              setWorkbenchTab(tab);
            }}
          />
        )}
        {surface === 'projects' && (
          <ProjectsSurface
            runtime={runtime}
            onOpenDiagnostics={() => setSurface('diagnostics')}
            onOpenSession={handleSelectSession}
            onOpenNewTask={handleStartNewTask}
            onOpenProjectMenu={(projectTitle) => {
              setCommandQuery(projectTitle);
              setCommandOpen(true);
            }}
            onOpenSettings={() => setSurface('settings')}
            onOpenWorkbenchTab={(tab) => {
              setSurface('chat');
              setRightOpen(true);
              setWorkbenchTab(tab);
            }}
          />
        )}
        {surface === 'agents' && <AgentsSurface runtime={runtime} onOpenApproval={() => setApprovalVariant('risk')} onOpenChat={handleStartNewTask} />}
        {surface === 'profiles' && <ProfilesSurface runtime={runtime} />}
        {surface === 'skills' && <SkillsSurface runtime={runtime} />}
        {surface === 'cron' && <CronSurface runtime={runtime} />}
        {surface === 'messaging' && <MessagingSurface runtime={runtime} />}
        {surface === 'settings' && (
          <SettingsSurface
            density={uiDensity}
            runtime={runtime}
            selected={settingsSection}
            theme={uiTheme}
            onDensityChange={setUiDensity}
            onOpenPermission={() => setApprovalVariant('permission')}
            onOpenSurface={setSurface}
            onSelect={setSettingsSection}
            onThemeChange={setUiTheme}
          />
        )}
        {surface === 'diagnostics' && <DiagnosticsSurface runtime={runtime} onOpenPermission={() => setApprovalVariant('permission')} />}
        {surface === 'onboarding' && (
          <OnboardingSurface
            runtime={runtime}
            onFinish={(target) => {
              if (target === 'integrations') {
                setSettingsSection('integrations');
                setSurface('settings');
                return;
              }
              if (target === 'diagnostics') {
                setSurface('diagnostics');
                return;
              }
              setSurface('chat');
            }}
          />
        )}
      </main>

      {showWorkbench && (
        rightOpen ? (
          <Workbench
            activeTab={workbenchTab}
            onTabChange={setWorkbenchTab}
            onCollapse={() => setRightOpen(false)}
            onOpenFilePreview={(fileLabel) => {
              setSelectedWorkbenchFileLabel(fileLabel);
              setWorkbenchTab('preview');
            }}
            onOpenApproval={setApprovalVariant}
            runtime={runtime}
            selectedFileLabel={selectedWorkbenchFileLabel}
          />
        ) : (
          <button
            className="floatingWorkbenchButton"
            type="button"
            aria-label="展开工作区"
            onClick={() => setRightOpen(true)}
          >
            <PanelRightOpen size={19} />
          </button>
        )
      )}

      {commandOpen && (
        <CommandCenter
          query={commandQuery}
          onQueryChange={setCommandQuery}
          onClose={() => setCommandOpen(false)}
          onNewTask={handleStartNewTask}
          onNavigate={(nextSurface) => {
            setSurface(nextSurface);
            setCommandOpen(false);
          }}
          onOpenWorkbenchTab={(tab) => {
            setRightOpen(true);
            setWorkbenchTab(tab);
            setCommandOpen(false);
          }}
          onOpenWorkbenchFile={(fileLabel) => {
            setSurface('chat');
            setRightOpen(true);
            setWorkbenchTab('files');
            setSelectedWorkbenchFileLabel(fileLabel);
            setCommandOpen(false);
          }}
          onOpenApproval={() => {
            setCommandOpen(false);
            setApprovalVariant('risk');
          }}
          onOpenSettingsSection={(section) => {
            setSettingsSection(section);
            setSurface('settings');
            setCommandOpen(false);
          }}
          runtime={runtime}
        />
      )}

      {approvalVariant && (
        <ApprovalModal
          pendingApproval={runtime.pendingApproval}
          variant={approvalVariant}
          onClose={() => setApprovalVariant(null)}
          onDeny={() => {
            setApprovalVariant(null);
            setDeniedRecovery(true);
            setSurface('chat');
            setRightOpen(true);
            setWorkbenchTab('activity');
          }}
          onRespondApproval={runtime.respondApproval}
        />
      )}
      {notice && <div className="toastNotice" role="status">{notice}</div>}
    </div>
  );
}

function Sidebar({
  activeSessionId,
  activeSurface,
  gatewayStatus,
  model,
  onNewTask,
  onSurfaceChange,
  onOpenCommand,
  onArchiveItem,
  onDeleteItem,
  onMoreItem,
  onSelectSession,
  pendingDeleteKey,
  projectItems,
  recentItems,
  selectedStoredSessionId,
  selectingSessionId,
  statusText,
}: {
  activeSessionId: null | string;
  activeSurface: Surface;
  gatewayStatus: GatewayStatus;
  model: string;
  onNewTask: () => void;
  onSurfaceChange: (surface: Surface) => void;
  onOpenCommand: () => void;
  onArchiveItem: (item: SidebarItem) => void;
  onDeleteItem: (item: SidebarItem) => void;
  onMoreItem: (item: SidebarItem) => void;
  onSelectSession: (sessionId: string) => void;
  pendingDeleteKey: string;
  projectItems: SidebarItem[];
  recentItems: SidebarItem[];
  selectedStoredSessionId: null | string;
  selectingSessionId: string;
  statusText: string;
}) {
  const utilityItems: Array<{ id: Surface; label: string; meta: string; icon: React.ReactNode }> = [
    { id: 'agents', label: 'Agents', meta: '任务队列', icon: <Bot size={15} /> },
    { id: 'profiles', label: 'Profiles', meta: '身份与策略', icon: <UsersRound size={15} /> },
    { id: 'skills', label: '技能库', meta: '本机 skills', icon: <Puzzle size={15} /> },
    { id: 'cron', label: '自动化', meta: '定时任务', icon: <CalendarClock size={15} /> },
    { id: 'messaging', label: '消息网关', meta: '外部消息', icon: <Network size={15} /> },
    { id: 'diagnostics', label: '诊断', meta: '环境检查', icon: <Wrench size={15} /> },
    { id: 'onboarding', label: '首次启动', meta: '连接方式', icon: <Rocket size={15} /> },
  ];

  return (
    <aside className="sidebar">
      <button className="profileBlock" type="button" onClick={() => onSurfaceChange('profiles')}>
        <span className="brandLogo" aria-hidden="true">
          <img src={hermesAgentLogo} alt="" />
        </span>
        <div>
          <strong>Hermes</strong>
          <span>本地运行 · {model}</span>
        </div>
      </button>

      <button className="primaryButton" type="button" onClick={onNewTask}>
        <Plus size={17} />
        新建任务
      </button>

      <button className="searchBox asButton" type="button" onClick={onOpenCommand}>
        <Search size={15} />
        <span>搜索会话、文件、技能</span>
        <kbd>⌘K</kbd>
      </button>

      <nav className="sidebarScroll" aria-label="会话导航">
        <SidebarSection
          title="置顶"
          items={pinnedSessions}
          onOpenChat={() => onSurfaceChange('chat')}
          onSelectSession={onSelectSession}
          onArchiveItem={onArchiveItem}
          onDeleteItem={onDeleteItem}
          onMoreItem={onMoreItem}
          pendingDeleteKey={pendingDeleteKey}
          selectedSessionId={selectedStoredSessionId || activeSessionId}
          selectingSessionId={selectingSessionId}
        />
        <ProjectSection
          items={projectItems}
          onOpenProjects={() => onSurfaceChange('projects')}
          onArchiveItem={onArchiveItem}
          onDeleteItem={onDeleteItem}
          onMoreItem={onMoreItem}
          pendingDeleteKey={pendingDeleteKey}
        />
        <SidebarSection
          title="最近"
          emptyText="暂无真实会话"
          items={recentItems}
          muted
          onOpenChat={() => onSurfaceChange('chat')}
          onSelectSession={onSelectSession}
          onArchiveItem={onArchiveItem}
          onDeleteItem={onDeleteItem}
          onMoreItem={onMoreItem}
          pendingDeleteKey={pendingDeleteKey}
          selectedSessionId={selectedStoredSessionId || activeSessionId}
          selectingSessionId={selectingSessionId}
        />

        <section className="navSection">
          <h2>工作台</h2>
          {utilityItems.map((item) => (
            <button
              key={item.id}
              className={activeSurface === item.id ? 'utilityRow active' : 'utilityRow'}
              type="button"
              onClick={() => onSurfaceChange(item.id)}
            >
              {item.icon}
              <span>
                <strong>{item.label}</strong>
                <small>{item.meta}</small>
              </span>
              <ChevronRight size={13} />
            </button>
          ))}
        </section>
      </nav>

      <div className="gatewayStrip">
        <span className={`statusDot ${gatewayStatus === 'error' ? 'red' : gatewayStatus === 'starting' || gatewayStatus === 'stopped' ? 'amber' : 'green'}`} />
        <div>
          <strong>Gateway</strong>
          <small>{statusText}</small>
        </div>
      </div>

      <div className="sidebarFooter">
        <button
          className={activeSurface === 'projects' ? 'footerButton active' : 'footerButton'}
          type="button"
          onClick={() => onSurfaceChange('projects')}
        >
          <Layers size={16} />
          项目
        </button>
        <button
          className={activeSurface === 'settings' ? 'footerButton active' : 'footerButton'}
          type="button"
          onClick={() => onSurfaceChange('settings')}
        >
          <Settings size={16} />
          设置
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  title,
  items,
  muted,
  emptyText,
  onArchiveItem,
  onDeleteItem,
  onOpenChat,
  onMoreItem,
  onSelectSession,
  pendingDeleteKey,
  selectedSessionId,
  selectingSessionId,
}: {
  title: string;
  muted?: boolean;
  emptyText?: string;
  items: SidebarItem[];
  onArchiveItem: (item: SidebarItem) => void;
  onDeleteItem: (item: SidebarItem) => void;
  onOpenChat: () => void;
  onMoreItem: (item: SidebarItem) => void;
  onSelectSession: (sessionId: string) => void;
  pendingDeleteKey: string;
  selectedSessionId: null | string;
  selectingSessionId: string;
}) {
  const orderedItems = useMemo(() => {
    if (!selectedSessionId) {
      return items;
    }
    const selectedIndex = items.findIndex((item) => item.id === selectedSessionId);
    if (selectedIndex <= 0) {
      return items;
    }
    const next = [...items];
    const [selected] = next.splice(selectedIndex, 1);
    return [selected, ...next];
  }, [items, selectedSessionId]);

  return (
    <section className="navSection">
      <h2>{title}</h2>
      {orderedItems.length === 0 && <div className="sectionEmpty">{emptyText || '暂无内容'}</div>}
      {orderedItems.map((item, index) => (
        <SessionRow
          key={item.id || item.title}
          item={item}
          muted={muted}
          active={item.id ? item.id === selectedSessionId : !selectedSessionId && !muted && index === 0}
          busy={Boolean(item.id && item.id === selectingSessionId)}
          confirmingDelete={pendingDeleteKey === sidebarItemKey(item)}
          onSelect={() => {
            onOpenChat();
            if (item.id) {
              onSelectSession(item.id);
            }
          }}
          onArchive={() => onArchiveItem(item)}
          onDelete={() => onDeleteItem(item)}
          onMore={() => onMoreItem(item)}
        />
      ))}
    </section>
  );
}

function ProjectSection({
  items,
  onArchiveItem,
  onDeleteItem,
  onMoreItem,
  onOpenProjects,
  pendingDeleteKey,
}: {
  items: SidebarItem[];
  onArchiveItem: (item: SidebarItem) => void;
  onDeleteItem: (item: SidebarItem) => void;
  onMoreItem: (item: SidebarItem) => void;
  onOpenProjects: () => void;
  pendingDeleteKey: string;
}) {
  return (
    <section className="navSection">
      <div className="sectionTitleRow">
        <h2>项目</h2>
        <button className="sectionAction" type="button" aria-label="查看全部项目" onClick={onOpenProjects}>
          <ChevronRight size={14} />
        </button>
      </div>
      {items.map((item) => (
        <SessionRow
          key={item.title}
          item={{ ...item, color: item.active ? 'indigo' : 'gray' }}
          active={item.active}
          confirmingDelete={pendingDeleteKey === sidebarItemKey(item)}
          onSelect={onOpenProjects}
          onArchive={() => onArchiveItem(item)}
          onDelete={() => onDeleteItem(item)}
          onMore={() => onMoreItem(item)}
        />
      ))}
    </section>
  );
}

function SessionRow({
  item,
  active,
  busy,
  confirmingDelete,
  muted,
  onArchive,
  onDelete,
  onMore,
  onSelect,
}: {
  item: SidebarItem;
  active?: boolean;
  busy?: boolean;
  confirmingDelete?: boolean;
  muted?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  onSelect: () => void;
}) {
  const secondaryText = confirmingDelete
    ? item.id ? '再次点击删除，操作不可恢复' : '再次点击隐藏'
    : busy ? '打开中...' : item.meta;

  return (
    <div className={`${active ? 'sessionRow active' : 'sessionRow'}${busy ? ' loading' : ''}${confirmingDelete ? ' confirmDelete' : ''}`}>
      <button className="sessionMain" data-session-id={item.id} type="button" disabled={busy} onClick={onSelect}>
        <span className={`statusDot ${item.color ?? (muted ? 'gray' : 'blue')}`} />
        <span className="sessionText">
          <strong>{item.title}</strong>
          <span>{secondaryText}</span>
        </span>
      </button>
      <div className="rowActions" aria-label="会话操作">
        <button
          type="button"
          aria-label="归档"
          title="归档"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onArchive?.();
          }}
        >
          <Archive size={14} />
        </button>
        <button
          className={confirmingDelete ? 'danger confirm' : undefined}
          type="button"
          aria-label={confirmingDelete ? '确认删除' : '删除'}
          title={confirmingDelete ? '确认删除' : '删除'}
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2 size={14} />
        </button>
        <button
          type="button"
          aria-label="更多"
          title="更多"
          disabled={busy}
          onClick={(event) => {
            event.stopPropagation();
            onMore?.();
          }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

function ChatSurface({
  attachmentOpen,
  deniedRecovery,
  runtime,
  setAttachmentOpen,
  onOpenApproval,
  onNavigate,
  onOpenProjects,
  onOpenSettingsSection,
  onOpenWorkbenchTab,
}: {
  attachmentOpen: boolean;
  deniedRecovery: boolean;
  runtime: HermesRuntime;
  setAttachmentOpen: (open: boolean) => void;
  onOpenApproval: () => void;
  onNavigate: (surface: Surface) => void;
  onOpenProjects: () => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
}) {
  const messageStackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stack = messageStackRef.current;
    if (!stack) {
      return;
    }

    const scrollToBottom = () => {
      stack.scrollTop = stack.scrollHeight;
    };

    scrollToBottom();
    const frame = window.requestAnimationFrame(scrollToBottom);
    const timer = window.setTimeout(scrollToBottom, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [runtime.messages, runtime.statusText]);

  return (
    <section className="chatSurface" aria-label="会话">
      <div className="messageStack" data-testid="message-list" ref={messageStackRef}>
        {runtime.messages.length === 0 && (
          <EmptyConversation
            gatewayStatus={runtime.gatewayStatus}
            model={runtime.model}
            onSubmitPrompt={runtime.submitPrompt}
            statusText={runtime.statusText}
          />
        )}

        {runtime.messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onOpenApproval={onOpenApproval}
            onOpenWorkbenchTab={onOpenWorkbenchTab}
            onRespondApproval={runtime.respondApproval}
            onRespondClarify={runtime.respondClarify}
          />
        ))}

        {deniedRecovery && (
          <ChatMessage
            message={{
              id: 'denied-recovery',
              kind: 'status',
              status: 'denied',
              text: '我会改用只读检查：读取当前 UI 文件、运行类型检查，并把需要人工确认的命令保留在审批记录里。',
              title: '已拒绝高风险命令',
            }}
            onOpenApproval={onOpenApproval}
            onOpenWorkbenchTab={onOpenWorkbenchTab}
            onRespondApproval={runtime.respondApproval}
            onRespondClarify={runtime.respondClarify}
          />
        )}
      </div>

      <Composer
        attachmentOpen={attachmentOpen}
        setAttachmentOpen={setAttachmentOpen}
        runtime={runtime}
        onNavigate={onNavigate}
        onOpenProjects={onOpenProjects}
        onOpenSettingsSection={onOpenSettingsSection}
        onOpenWorkbenchTab={onOpenWorkbenchTab}
      />
    </section>
  );
}

function EmptyConversation({
  gatewayStatus,
  model,
  onSubmitPrompt,
  statusText,
}: {
  gatewayStatus: GatewayStatus;
  model: string;
  onSubmitPrompt: (text: string) => Promise<void>;
  statusText: string;
}) {
  const ready = gatewayStatus === 'connected';
  const emptyPromptActions = [
    {
      label: '检查当前项目',
      prompt: '请检查当前项目结构，找出最影响可用性的 3 个问题，并按优先级给出修复建议。',
    },
    {
      label: '读取文件并总结',
      prompt: '请读取当前目录里最能说明项目用途的文件，并用中文总结项目如何运行、如何验证。',
    },
    {
      label: '安全运行命令',
      prompt: '请先说明你准备运行哪些命令来检查当前项目；遇到高风险命令时先请求审批。',
    },
  ];

  return (
    <div className="emptyConversation">
      <div className="emptyMark">
        <img src={hermesAgentLogo} alt="" />
      </div>
      <h2>{ready ? 'Hermes 已就绪' : '正在准备 Hermes'}</h2>
      <p>{ready ? `当前模型 ${model}，可以直接发送任务。` : statusText}</p>
      <div className="emptyHints" aria-label="可开始的任务">
        {emptyPromptActions.map((action) => (
          <button
            key={action.label}
            type="button"
            disabled={!ready}
            onClick={() => void onSubmitPrompt(action.prompt)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  onOpenApproval,
  onOpenWorkbenchTab,
  onRespondApproval,
  onRespondClarify,
}: {
  message: ChatMessageModel;
  onOpenApproval: () => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
  onRespondApproval: HermesRuntime['respondApproval'];
  onRespondClarify: HermesRuntime['respondClarify'];
}) {
  if (message.kind === 'user') {
    return (
      <article className="message human">
        <MarkdownText className="humanText" text={message.text} />
      </article>
    );
  }

  const icon = {
    approval: <Shield size={16} />,
    assistant: null,
    clarify: <MessageSquare size={16} />,
    error: <AlertTriangle size={16} />,
    reasoning: <Sparkles size={16} />,
    status: <CircleDot size={16} />,
    tool: <TerminalSquare size={16} />,
    user: null,
  }[message.kind];

  return (
    <article className={`message agent typed ${message.kind} ${message.status ?? ''}`}>
      <div className="agentContent">
        {message.kind === 'assistant' ? (
          <FinalAnswerMessage
            message={message}
            onOpenWorkbenchTab={onOpenWorkbenchTab}
          />
        ) : (
          <MessageEventCard
            icon={icon}
            message={message}
            onOpenApproval={onOpenApproval}
            onRespondApproval={onRespondApproval}
            onRespondClarify={onRespondClarify}
          />
        )}
      </div>
    </article>
  );
}

function safeMarkdownHref(href: string) {
  try {
    const url = new URL(href);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? href : '';
  } catch {
    return '';
  }
}

function renderInlineMarkdown(text: string) {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;
    if (token.startsWith('`')) {
      nodes.push(<code className="inlineCode" key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = link ? safeMarkdownHref(link[2].trim()) : '';
      nodes.push(href
        ? <a href={href} key={key} rel="noreferrer" target="_blank">{link?.[1]}</a>
        : token);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function isMarkdownTableDivider(line: string) {
  const cells = line.trim().split('|').map((cell) => cell.trim()).filter(Boolean);
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseMarkdownTableLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) {
    return null;
  }

  return trimmed
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function MarkdownText({ className, text }: { className?: string; text: string }) {
  const value = cleanDisplayText(text).trim();
  if (!value) {
    return null;
  }

  const blocks: Array<{ kind: 'code' | 'heading' | 'list' | 'orderedList' | 'paragraph' | 'quote' | 'table'; level?: number; lines: string[] }> = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let listKind: 'list' | 'orderedList' | null = null;
  let code: string[] | null = null;
  let table: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', lines: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ kind: listKind ?? 'list', lines: list });
      list = [];
      listKind = null;
    }
  };
  const flushTable = () => {
    if (table.length > 0) {
      blocks.push({ kind: 'table', lines: table });
      table = [];
    }
  };
  const pushListItem = (kind: 'list' | 'orderedList', item: string) => {
    flushParagraph();
    flushTable();
    if (listKind && listKind !== kind) {
      flushList();
    }
    listKind = kind;
    list.push(item);
  };

  value.split('\n').forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (code) {
        blocks.push({ kind: 'code', lines: code });
        code = null;
      } else {
        flushParagraph();
        flushList();
        flushTable();
        code = [];
      }
      return;
    }

    if (code) {
      code.push(line);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      flushTable();
      return;
    }

    const nextTableLine = parseMarkdownTableLine(line);
    const previousTableLine = table.length > 0 ? parseMarkdownTableLine(table[table.length - 1]) : null;
    if (
      nextTableLine
      && (
        table.length > 0
        || (paragraph.length === 1 && isMarkdownTableDivider(line) && parseMarkdownTableLine(paragraph[0])?.length === nextTableLine.length)
      )
    ) {
      if (paragraph.length === 1 && isMarkdownTableDivider(line)) {
        table = [paragraph[0], line];
        paragraph = [];
        return;
      }
      if (!isMarkdownTableDivider(line) && (!previousTableLine || previousTableLine.length === nextTableLine.length)) {
        table.push(line);
        return;
      }
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push({ kind: 'heading', level: heading[1].length, lines: [heading[2]] });
      return;
    }

    const quote = line.match(/^\s*>\s?(.+)$/);
    if (quote) {
      flushParagraph();
      flushList();
      flushTable();
      blocks.push({ kind: 'quote', lines: [quote[1]] });
      return;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      pushListItem('list', bullet[1]);
      return;
    }

    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (ordered) {
      pushListItem('orderedList', ordered[1]);
      return;
    }

    flushList();
    flushTable();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  flushTable();
  if (code) {
    blocks.push({ kind: 'code', lines: code });
  }

  return (
    <div className={className ? `markdownText ${className}` : 'markdownText'}>
      {blocks.map((block, index) => {
        if (block.kind === 'code') {
          return <pre key={index}><code>{block.lines.join('\n')}</code></pre>;
        }
        if (block.kind === 'heading') {
          const HeadingTag = block.level && block.level <= 2 ? 'h3' : 'h4';
          return <HeadingTag className="markdownHeading" key={index}>{renderInlineMarkdown(block.lines.join(' '))}</HeadingTag>;
        }
        if (block.kind === 'quote') {
          return <blockquote key={index}>{renderInlineMarkdown(block.lines.join('\n'))}</blockquote>;
        }
        if (block.kind === 'table') {
          const header = parseMarkdownTableLine(block.lines[0]) ?? [];
          const rows = block.lines.slice(2).map((line) => parseMarkdownTableLine(line) ?? []);
          return (
            <div className="markdownTableWrap" key={index}>
              <table>
                <thead>
                  <tr>
                    {header.map((cell, cellIndex) => (
                      <th key={`${index}-head-${cellIndex}`}>{renderInlineMarkdown(cell)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`${index}-row-${rowIndex}`}>
                      {header.map((_, cellIndex) => (
                        <td key={`${index}-cell-${rowIndex}-${cellIndex}`}>{renderInlineMarkdown(row[cellIndex] ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.kind === 'list') {
          return (
            <ul key={index}>
              {block.lines.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          );
        }
        if (block.kind === 'orderedList') {
          return (
            <ol key={index}>
              {block.lines.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          );
        }
        return <p key={index}>{renderInlineMarkdown(block.lines.join('\n'))}</p>;
      })}
    </div>
  );
}

function FinalAnswerMessage({
  message,
  onOpenWorkbenchTab,
}: {
  message: ChatMessageModel;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
}) {
  return (
    <div className={`finalAnswerCard ${message.status === 'running' ? 'streaming' : ''}`}>
      {message.text ? (
        <MarkdownText className="finalAnswerBody" text={message.text} />
      ) : (
        <p className="answerPlaceholder">正在生成...</p>
      )}
      {message.checks && <CheckListCard items={message.checks} />}
      {message.artifacts && (
        <div className="artifactTranscript">
          {message.artifacts.map((artifact) => (
            <Artifact
              icon={artifact.kind === 'file' ? <File size={15} /> : artifact.kind === 'terminal' ? <TerminalSquare size={15} /> : <Eye size={15} />}
              key={`${artifact.title}-${artifact.meta}`}
              meta={artifact.meta}
              onClick={() => onOpenWorkbenchTab(artifact.tab)}
              title={artifact.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CheckListCard({ items }: { items: ChatCheckItem[] }) {
  return (
    <div className="checkTranscript">
      {items.map((item) => (
        <div className={item.done ? 'done' : 'current'} key={item.label}>
          {item.done ? <CheckCircle2 size={15} /> : <CircleDot size={15} />}
          {item.label}
        </div>
      ))}
    </div>
  );
}

function MessageEventCard({
  icon,
  message,
  onOpenApproval,
  onRespondApproval,
  onRespondClarify,
}: {
  icon: React.ReactNode;
  message: ChatMessageModel;
  onOpenApproval: () => void;
  onRespondApproval: HermesRuntime['respondApproval'];
  onRespondClarify: HermesRuntime['respondClarify'];
}) {
  const [clarifyDraft, setClarifyDraft] = useState('');
  const [actionBusy, setActionBusy] = useState('');
  const [actionStatus, setActionStatus] = useState('');
  const isApproval = message.kind === 'approval';
  const isClarify = message.kind === 'clarify';
  const isTool = message.kind === 'tool';
  const isReasoning = message.kind === 'reasoning';
  const isStatus = message.kind === 'status';
  const eventLabel = eventLineLabel(message);
  const showStatusBody = isStatus && shouldShowEventBody(message);
  const showActionBody = !isTool && !isReasoning && !isStatus && Boolean(message.text.trim());
  const reasoningText = isReasoning ? cleanDisplayText(message.text).trim() : '';
  const phaseText = isReasoning ? reasoningText || reasoningPhaseText(message) : '';
  const detailsText = isTool
    ? (message.details || message.command)
    : isReasoning
      ? (message.details && message.details !== reasoningText ? message.details : '')
      : (message.details || message.command || message.text);
  const submitApproval = async (choice: 'once' | 'session' | 'always' | 'deny') => {
    try {
      setActionBusy(choice);
      setActionStatus('');
      await onRespondApproval(choice);
      setActionStatus(choice === 'deny' ? '审批已拒绝。' : '审批已提交。');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      setActionStatus(`审批提交失败：${messageText}`);
    } finally {
      setActionBusy('');
    }
  };
  const submitClarify = async (answer: string) => {
    const text = answer.trim();
    if (!text) {
      return;
    }

    try {
      setActionBusy('clarify');
      setActionStatus('');
      await onRespondClarify(text);
      setClarifyDraft('');
      setActionStatus('澄清回复已提交。');
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      setActionStatus(`澄清提交失败：${messageText}`);
    } finally {
      setActionBusy('');
    }
  };

  return (
    <div className={`eventBlock ${message.kind} ${message.status ?? ''}`}>
      {isTool || isReasoning ? (
        <details className={`eventDetails ${isTool ? 'toolDetails' : 'reasoningDetails'}`}>
          <summary>
            <span className="eventIcon">{icon}</span>
            <span>{eventLabel}</span>
          </summary>
          {isTool && message.text && <MarkdownText className="eventSummaryBody" text={message.text} />}
          {detailsText && (
            <pre><code>{detailsText}</code></pre>
          )}
        </details>
      ) : (
        <div className="eventLine">
          <span className="eventIcon">{icon}</span>
          <span>{eventLabel}</span>
          {message.meta && <small>{message.meta}</small>}
        </div>
      )}
      {phaseText && <MarkdownText className="phaseThought" text={phaseText} />}
      {showStatusBody && <MarkdownText className="eventBody" text={message.text} />}
      {showActionBody && <MarkdownText className="eventBody" text={message.text} />}
      {!isTool && !isReasoning && message.command && (
        <details className="eventDetails commandDetails">
          <summary>
            <span className="eventIcon"><TerminalSquare size={14} /></span>
            <span>查看命令</span>
          </summary>
          <pre><code>{message.command}</code></pre>
        </details>
      )}
      {isApproval && message.status === 'pending' && (
        <div className="approvalInlineActions">
          <button type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('once')}>{actionBusy === 'once' ? '提交中' : '本次允许'}</button>
          <button type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('session')}>{actionBusy === 'session' ? '提交中' : '当前会话'}</button>
          <button type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('always')}>{actionBusy === 'always' ? '提交中' : '始终允许'}</button>
          <button className="danger" type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('deny')}>{actionBusy === 'deny' ? '提交中' : '拒绝'}</button>
          <button className="ghost" type="button" disabled={Boolean(actionBusy)} onClick={onOpenApproval}>详情</button>
          {actionStatus && <p className="inlineActionStatus" role="status">{actionStatus}</p>}
        </div>
      )}
      {isClarify && message.status === 'pending' && (
        <div className="clarifyInlineActions">
          {message.choices?.map((choice) => (
            <button key={choice} type="button" disabled={Boolean(actionBusy)} onClick={() => void submitClarify(choice)}>
              {actionBusy === 'clarify' ? '提交中' : choice}
            </button>
          ))}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submitClarify(clarifyDraft);
            }}
          >
            <input
              aria-label="澄清回复"
              disabled={Boolean(actionBusy)}
              onChange={(event) => setClarifyDraft(event.target.value)}
              placeholder="输入补充信息"
              value={clarifyDraft}
            />
            <button type="submit" disabled={Boolean(actionBusy)}>{actionBusy === 'clarify' ? '发送中' : '发送'}</button>
          </form>
          {actionStatus && <p className="inlineActionStatus" role="status">{actionStatus}</p>}
        </div>
      )}
    </div>
  );
}

function shouldShowEventBody(message: ChatMessageModel) {
  const text = cleanDisplayText(message.text).trim();
  if (!text) {
    return false;
  }

  if (message.status === 'running' && /^(正在思考|正在生成|正在运行|正在提交|等待)/.test(text)) {
    return false;
  }

  if (/(analy[sz]ing|cogitating|synthesizing|pondering|musing)/i.test(text)) {
    return false;
  }

  return text !== (message.title || '').trim();
}

function eventLineLabel(message: ChatMessageModel) {
  if (message.kind === 'tool') {
    const count = message.text.split('\n').filter((line) => line.trim().startsWith('•')).length;
    if (message.status === 'running') {
      return count > 0 ? `正在运行 ${count} 条命令` : '正在运行命令';
    }
    return count > 1 ? `已运行 ${count} 条命令` : '已运行命令';
  }

  if (message.kind === 'reasoning') {
    return message.status === 'running' ? '正在思考' : '思考过程';
  }

  if (message.kind === 'approval') {
    return message.status === 'pending' ? '等待审批' : '审批记录';
  }

  if (message.kind === 'clarify') {
    return '需要补充信息';
  }

  if (message.kind === 'error') {
    return message.title || '出现错误';
  }

  if (message.kind === 'status') {
    const text = normalizeStatusText(message.text);
    if (/(正在思考|正在生成|正在运行|等待|就绪)/.test(text)) {
      return text;
    }
    return message.title || compactLine(text, 42) || '状态更新';
  }

  return message.title || cardTitle(message);
}

function reasoningPhaseText(message: ChatMessageModel) {
  if (message.status === 'running') {
    return '正在梳理命令输出和下一步。';
  }

  return '';
}

function cardTitle(message: ChatMessageModel) {
  if (message.kind === 'tool') {
    return message.toolName || '工具调用';
  }

  if (message.kind === 'reasoning') {
    return '推理过程';
  }

  if (message.kind === 'clarify') {
    return '需要补充信息';
  }

  if (message.kind === 'error') {
    return 'Hermes 错误';
  }

  return '状态更新';
}

function Artifact({
  icon,
  title,
  meta,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  onClick?: () => void;
}) {
  return (
    <button className="artifact" type="button" onClick={onClick}>
      {icon}
      <strong>{title}</strong>
      <span>{meta}</span>
    </button>
  );
}

function Composer({
  attachmentOpen,
  onNavigate,
  onOpenProjects,
  onOpenSettingsSection,
  onOpenWorkbenchTab,
  setAttachmentOpen,
  runtime,
}: {
  attachmentOpen: boolean;
  onNavigate: (surface: Surface) => void;
  onOpenProjects: () => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
  setAttachmentOpen: (open: boolean) => void;
  runtime: HermesRuntime;
}) {
  const [draft, setDraft] = useState('');
  const [composerNotice, setComposerNotice] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [slashDismissedDraft, setSlashDismissedDraft] = useState('');
  const recognitionRef = useRef<null | SpeechRecognitionLike>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = runtime.gatewayStatus === 'connected' && runtime.socketState === 'open';
  const trimmedDraft = draft.trim();
  const canRunLocalSlash = trimmedDraft.startsWith('/') && isKnownLocalSlashInput(trimmedDraft);
  const canSubmit = Boolean(trimmedDraft) && (canSend || canRunLocalSlash);
  const slashQuery = draft.trimStart().startsWith('/') ? draft.trimStart().slice(1).toLowerCase() : '';
  const slashOptions = useMemo<SlashCommandOption[]>(() => {
    const base: SlashCommandOption[] = [
      { desc: '查看可用指令和技能', icon: <Command size={16} />, insert: '/help', title: '/help' },
      { desc: '运行本机状态诊断', icon: <Wrench size={16} />, insert: '/diagnose', title: '/diagnose' },
      { desc: '列出可用 skills', icon: <Puzzle size={16} />, insert: '/skills', title: '/skills' },
      { desc: '检查当前审批队列', icon: <Shield size={16} />, insert: '/approval', title: '/approval' },
      { desc: '总结当前会话上下文', icon: <MessageSquare size={16} />, insert: '/summary', title: '/summary' },
      { desc: '查看最近真实会话', icon: <MessageSquare size={16} />, insert: '/sessions', title: '/sessions' },
      { desc: '查看本机模型配置', icon: <Zap size={16} />, insert: '/models', title: '/models' },
      { desc: '查看 Gateway 连接信息', icon: <Network size={16} />, insert: '/gateway', title: '/gateway' },
      { desc: '查看 profile 配置线索', icon: <UsersRound size={16} />, insert: '/profiles', title: '/profiles' },
      { desc: '打开项目页', icon: <Folder size={16} />, insert: '/projects', title: '/projects' },
      { desc: '打开 Agents 队列', icon: <Bot size={16} />, insert: '/agents', title: '/agents' },
      { desc: '打开自动化任务页', icon: <CalendarClock size={16} />, insert: '/cron', title: '/cron' },
      { desc: '打开消息网关页', icon: <Network size={16} />, insert: '/messaging', title: '/messaging' },
      { desc: '打开诊断与更新页', icon: <Wrench size={16} />, insert: '/diagnostics', title: '/diagnostics' },
      { desc: '打开首次启动向导', icon: <Rocket size={16} />, insert: '/onboarding', title: '/onboarding' },
      { desc: '打开设置页', icon: <Settings size={16} />, insert: '/settings', title: '/settings' },
      { desc: '打开文件工作区', icon: <File size={16} />, insert: '/files', title: '/files' },
      { desc: '打开终端工作区', icon: <TerminalSquare size={16} />, insert: '/terminal', title: '/terminal' },
      { desc: '打开预览工作区', icon: <Eye size={16} />, insert: '/preview', title: '/preview' },
      { desc: '打开右侧工作区', icon: <PanelRightOpen size={16} />, insert: '/workbench terminal', title: '/workbench' },
    ];
    const skills = runtime.inventory?.skills.slice(0, 12).map((skill) => ({
      desc: skill.description || skill.path,
      icon: <Puzzle size={16} />,
      insert: `/skill ${skill.name}`,
      title: `/skill ${skill.name}`,
    })) ?? [];

    return [...base, ...skills];
  }, [runtime.inventory?.skills]);
  const visibleSlashOptions = useMemo(() => {
    if (!draft.trimStart().startsWith('/')) {
      return [];
    }

    return slashOptions
      .filter((option) => {
        const haystack = `${option.title} ${option.desc}`.toLowerCase();
        return !slashQuery || haystack.includes(slashQuery);
      })
      .slice(0, 8);
  }, [draft, slashOptions, slashQuery]);
  const slashOpen = visibleSlashOptions.length > 0 && slashDismissedDraft !== draft;

  useEffect(() => {
    setSlashIndex(0);
  }, [slashQuery]);

  useEffect(() => {
    if (!composerNotice) {
      return undefined;
    }

    const timer = window.setTimeout(() => setComposerNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [composerNotice]);

  const insertDraftText = useCallback((text: string) => {
    setDraft((current) => {
      const separator = current && !/\s$/.test(current) ? ' ' : '';
      return `${current}${separator}${text}`;
    });
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const selectSlashOption = useCallback((option?: SlashCommandOption) => {
    if (!option) {
      return;
    }

    setDraft(`${option.insert} `);
    setSlashDismissedDraft(`${option.insert} `);
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  const submit = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    if (!canSend && !canRunLocalSlash) {
      setComposerNotice('Hermes Gateway 还没有连接完成。');
      return;
    }

    setDraft('');
    const uiTarget = localSlashUiTarget(text);
    void runtime.submitPrompt(text);
    if (uiTarget) {
      window.requestAnimationFrame(() => {
        if (uiTarget.settingsSection) {
          onOpenSettingsSection(uiTarget.settingsSection);
          return;
        }
        if (uiTarget.surface) {
          onNavigate(uiTarget.surface);
        }
        if (uiTarget.workbenchTab) {
          onOpenWorkbenchTab(uiTarget.workbenchTab);
        }
      });
    }
  };

  const handleAttachmentPick = async (kind: AttachmentMenuKind) => {
    setAttachmentOpen(false);

    if (kind === 'url') {
      return;
    }

    if (kind === 'snippet') {
      insertDraftText('/prompt ');
      setComposerNotice('已插入提示片段指令。');
      return;
    }

    if (!window.hermesDesktop?.pickAttachment) {
      setComposerNotice('附件选择需要在桌面端使用。');
      return;
    }

    try {
      const picks = await window.hermesDesktop.pickAttachment(kind);
      if (picks.length === 0) {
        setComposerNotice('未选择附件。');
        return;
      }

      const inserted = picks
        .map((pick) => pick.path ? `@${pick.path}` : pick.text || pick.label)
        .filter(Boolean)
        .join(' ');
      if (!inserted) {
        setComposerNotice('没有可插入的附件内容。');
        return;
      }
      insertDraftText(inserted);
      setComposerNotice(`已添加 ${picks.length} 个附件。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setComposerNotice(`附件选择失败：${message}`);
    }
  };

  const handleVoiceInput = async () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setComposerNotice('语音输入已停止。');
      return;
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognitionLike;
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const SpeechRecognitionCtor = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (SpeechRecognitionCtor) {
      try {
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = navigator.language || 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.onresult = (event) => {
          const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index]?.[0]?.transcript || '')
            .join('')
            .trim();
          if (transcript) {
            setDraft(transcript);
          }
        };
        recognition.onerror = (event) => {
          setIsListening(false);
          setComposerNotice(`语音输入失败：${event.error || event.message || '运行时不可用'}`);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognitionRef.current = recognition;
        setIsListening(true);
        setComposerNotice('正在听写，识别文本会填入输入框。');
        recognition.start();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        setIsListening(false);
        setComposerNotice(`语音输入启动失败：${message}`);
        return;
      }
    }

    try {
      const permissions = navigator.permissions;
      const status = permissions?.query
        ? await permissions.query({ name: 'microphone' as PermissionName })
        : null;
      const suffix = status?.state ? `麦克风权限状态：${status.state}。` : '';
      setComposerNotice(`当前运行时没有可用语音转写接口。${suffix}`);
    } catch {
      setComposerNotice('当前运行时没有可用语音转写接口。');
    }
  };

  return (
    <div className="composerWrap" data-testid="composer">
      <div className="composerMeta" aria-label="任务状态">
        <button className="permission" type="button" title="权限设置" onClick={() => onOpenSettingsSection('permissions')}>
          <Shield size={17} />
          完全访问
          <ChevronDown size={15} />
        </button>
        <button className="modelName" type="button" title={runtime.model} onClick={() => onOpenSettingsSection('models')}>
          <Zap size={16} />
          {runtime.model}
        </button>
        <button className="workdir" type="button" title={runtime.cwd} onClick={onOpenProjects}>
          <span className="workdirLabel">工作目录</span>
          <span className="workdirPath">{shortenPath(runtime.cwd)}</span>
        </button>
        <button className="contextMeter" type="button" title={`${runtime.contextPercent}% · 1M`} onClick={() => onOpenWorkbenchTab('activity')}>
          <span className="contextTrack"><span style={{ width: `${Math.max(5, runtime.contextPercent)}%` }} /></span>
          {runtime.contextPercent}% · 1M
        </button>
      </div>

      <div className="composerInputRow">
        <button
          className="plusButton"
          type="button"
          aria-expanded={attachmentOpen}
          aria-haspopup="menu"
          aria-label="添加"
          onClick={() => setAttachmentOpen(!attachmentOpen)}
        >
          <Plus size={22} />
        </button>
        <textarea
          ref={textareaRef}
          aria-activedescendant={slashOpen ? `slash-option-${slashIndex}` : undefined}
          aria-controls={slashOpen ? 'slash-options' : undefined}
          aria-expanded={slashOpen}
          aria-label="消息"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (slashOpen && event.key === 'ArrowDown') {
              event.preventDefault();
              setSlashIndex((index) => Math.min(index + 1, visibleSlashOptions.length - 1));
              return;
            }
            if (slashOpen && event.key === 'ArrowUp') {
              event.preventDefault();
              setSlashIndex((index) => Math.max(0, index - 1));
              return;
            }
            if (slashOpen && (event.key === 'Tab' || event.key === 'Enter')) {
              event.preventDefault();
              selectSlashOption(visibleSlashOptions[slashIndex]);
              return;
            }
            if (event.key === 'Escape' && (slashOpen || attachmentOpen)) {
              event.preventDefault();
              if (slashOpen) {
                setSlashDismissedDraft(draft);
              }
              setAttachmentOpen(false);
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="继续描述你的目标，或输入 / 选择技能..."
          rows={1}
          value={draft}
        />
        <button
          className={isListening ? 'ghostIcon active' : 'ghostIcon'}
          type="button"
          aria-label={isListening ? '停止语音输入' : '语音输入'}
          title={isListening ? '停止语音输入' : '语音输入'}
          onClick={() => void handleVoiceInput()}
        >
          <Mic size={19} />
        </button>
        <button className="sendButton" type="button" aria-label="发送" disabled={!canSubmit} onClick={submit}>
          <SendHorizontal size={20} />
        </button>

        {attachmentOpen && (
          <AttachmentMenu
            onInsertUrl={(value) => {
              setAttachmentOpen(false);
              insertDraftText(value);
              setComposerNotice('URL 已添加。');
            }}
            onPick={(kind) => void handleAttachmentPick(kind)}
          />
        )}
        {slashOpen && (
          <SlashMenu
            options={visibleSlashOptions}
            selectedIndex={slashIndex}
            onPick={selectSlashOption}
          />
        )}
      </div>
      {composerNotice && <div className="composerNotice" role="status">{composerNotice}</div>}
    </div>
  );
}

function AttachmentMenu({
  onInsertUrl,
  onPick,
}: {
  onInsertUrl: (value: string) => void;
  onPick: (kind: AttachmentMenuKind) => void;
}) {
  const [urlDraft, setUrlDraft] = useState('');
  const [urlOpen, setUrlOpen] = useState(false);
  const [menuStatus, setMenuStatus] = useState('');
  const items: Array<{ icon: React.ReactNode; kind: AttachmentMenuKind; label: string }> = [
    { icon: <File size={18} />, kind: 'file', label: '文件...' },
    { icon: <Folder size={18} />, kind: 'folder', label: '文件夹...' },
    { icon: <Image size={18} />, kind: 'image', label: '图片...' },
    { icon: <Clipboard size={18} />, kind: 'clipboard-image', label: '粘贴图片' },
    { icon: <Link size={18} />, kind: 'url', label: 'URL...' },
    { icon: <MessageSquare size={18} />, kind: 'snippet', label: '提示片段...' },
  ];

  return (
    <div className="attachmentMenu" role="menu">
      <span className="menuTitle">添加</span>
      {items.map((item, index) => (
        <button
          className={index === 5 ? 'menuItem divided' : 'menuItem'}
          type="button"
          role="menuitem"
          key={item.label}
          onClick={() => {
            if (item.kind === 'url') {
              setMenuStatus('');
              setUrlOpen((open) => !open);
              return;
            }
            onPick(item.kind);
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      {urlOpen && (
        <form
          className="menuUrlForm"
          onSubmit={(event) => {
            event.preventDefault();
            const value = urlDraft.trim();
            if (!value) {
              setMenuStatus('请输入 URL。');
              return;
            }
            if (!/^https?:\/\/\S+\.\S+/.test(value)) {
              setMenuStatus('请输入 http(s) URL。');
              return;
            }
            onInsertUrl(value);
          }}
        >
          <input
            autoFocus
            aria-label="URL"
            onChange={(event) => setUrlDraft(event.target.value)}
            placeholder="https://..."
            value={urlDraft}
          />
          <button type="submit">添加</button>
        </form>
      )}
      {menuStatus && <div className="menuStatus" role="status">{menuStatus}</div>}
      <div className="menuHint">提示：输入 @ 可在正文中引用文件。</div>
    </div>
  );
}

function SlashMenu({
  options,
  selectedIndex,
  onPick,
}: {
  options: SlashCommandOption[];
  selectedIndex: number;
  onPick: (option: SlashCommandOption) => void;
}) {
  return (
    <div className="slashMenu" id="slash-options" role="listbox" aria-label="斜杠指令">
      {options.map((option, index) => (
        <button
          aria-selected={index === selectedIndex}
          className={index === selectedIndex ? 'slashItem selected' : 'slashItem'}
          id={`slash-option-${index}`}
          key={option.title}
          role="option"
          type="button"
          onClick={() => onPick(option)}
        >
          <span>{option.icon}</span>
          <div>
            <strong>{option.title}</strong>
            <small>{option.desc}</small>
          </div>
        </button>
      ))}
    </div>
  );
}

function Workbench({
  activeTab,
  onTabChange,
  onCollapse,
  onOpenFilePreview,
  onOpenApproval,
  runtime,
  selectedFileLabel,
}: {
  activeTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
  onCollapse: () => void;
  onOpenFilePreview: (fileLabel: string) => void;
  onOpenApproval: (variant: ApprovalVariant) => void;
  runtime: HermesRuntime;
  selectedFileLabel?: string;
}) {
  const tabs: Array<{ id: WorkbenchTab; label: string }> = [
    { id: 'activity', label: '活动' },
    { id: 'files', label: '文件' },
    { id: 'terminal', label: '终端' },
    { id: 'preview', label: '预览' },
  ];

  return (
    <aside className="workbench" data-testid="right-workbench">
      <div className="workbenchHeader">
        <div className="tabs four">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'selected' : undefined}
              type="button"
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="iconButton compact" type="button" aria-label="收起工作区" onClick={onCollapse}>
          <PanelRightClose size={17} />
        </button>
      </div>

      {activeTab === 'activity' && (
        <WorkbenchActivity
          onOpenApproval={onOpenApproval}
          onOpenTerminal={() => onTabChange('terminal')}
          runtime={runtime}
        />
      )}
      {activeTab === 'files' && (
        <WorkbenchFiles
          files={runtime.files}
          onOpenPreview={onOpenFilePreview}
          runtime={runtime}
          selectedFileLabel={selectedFileLabel}
        />
      )}
      {activeTab === 'terminal' && <WorkbenchTerminal logs={runtime.logs} onStop={runtime.stopGateway} />}
      {activeTab === 'preview' && <WorkbenchPreview runtime={runtime} selectedFileLabel={selectedFileLabel} />}
    </aside>
  );
}

function WorkbenchActivity({
  onOpenApproval,
  onOpenTerminal,
  runtime,
}: {
  onOpenApproval: (variant: ApprovalVariant) => void;
  onOpenTerminal: () => void;
  runtime: HermesRuntime;
}) {
  const [selectedToolId, setSelectedToolId] = useState('');
  const [toolStatus, setToolStatus] = useState('');
  const selectedTool = runtime.tools.find((tool) => tool.id === selectedToolId) || runtime.tools[0] || null;
  const selectedToolDetails = selectedTool ? selectedTool.details || selectedTool.detail || selectedTool.label : '';

  useEffect(() => {
    if (!runtime.tools.some((tool) => tool.id === selectedToolId)) {
      setSelectedToolId(runtime.tools[0]?.id || '');
    }
  }, [runtime.tools, selectedToolId]);

  const copySelectedTool = async () => {
    if (!selectedTool) {
      setToolStatus('当前没有可复制的工具调用。');
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setToolStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      await navigator.clipboard.writeText([
        selectedTool.label,
        selectedTool.detail,
        selectedTool.value,
        '',
        selectedToolDetails,
      ].filter(Boolean).join('\n'));
      setToolStatus('工具详情已复制。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setToolStatus(`复制失败：${message}`);
    }
  };

  return (
    <>
      <section className="taskCard">
        <span>当前任务</span>
        <strong>{runtime.activeSessionId ? 'Hermes Agent 会话' : '等待新任务'}</strong>
        <p>{runtime.statusText}</p>
        <div className="progressBar">
          <span style={{ width: `${Math.max(8, runtime.contextPercent)}%` }} />
        </div>
      </section>
      <section className="workbenchList">
        <h3>工具调用</h3>
        {runtime.tools.length > 0 ? (
          runtime.tools.map((item) => (
            <WorkbenchItem
              key={item.id}
              active={selectedTool?.id === item.id}
              detail={item.detail}
              onSelect={() => {
                setSelectedToolId(item.id);
                setToolStatus('');
              }}
              state={item.state}
              label={item.label}
              value={item.value}
            />
          ))
        ) : (
          <div className="railEmpty">工具调用会在运行任务时出现。</div>
        )}
      </section>
      {selectedTool && (
        <section className="railSection toolDetailPanel">
          <h3>工具详情</h3>
          <dl className="fileDetailList">
            <div>
              <dt>名称</dt>
              <dd title={selectedTool.label}>{selectedTool.label}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>{selectedTool.state === 'running' ? '运行中' : selectedTool.value}</dd>
            </div>
          </dl>
          <pre className="miniCode toolDetailCode"><code>{selectedToolDetails}</code></pre>
          <div className="workbenchActions fileActionGrid">
            <button type="button" onClick={() => void copySelectedTool()}>
              复制详情
            </button>
            <button type="button" onClick={onOpenTerminal}>
              打开终端
            </button>
          </div>
          {toolStatus && <p className="railStatus" role="status">{toolStatus}</p>}
        </section>
      )}
      {runtime.pendingApproval ? (
        <section className="approvalCard">
          <Shield size={17} />
          <div>
            <strong>需要手动确认</strong>
            <span>{runtime.pendingApproval.description}</span>
          </div>
          <button type="button" onClick={() => onOpenApproval('risk')}>查看</button>
        </section>
      ) : (
        <section className="approvalCard idle">
          <Shield size={17} />
          <div>
            <strong>暂无待审批命令</strong>
            <span>出现高风险操作时会固定在这里。</span>
          </div>
        </section>
      )}
      <button className="subtleAction" type="button" onClick={() => onOpenApproval('timeout')}>
        <Clock size={15} />
        查看审批超时态
      </button>
    </>
  );
}

function WorkbenchFiles({
  files,
  onOpenPreview,
  runtime,
  selectedFileLabel,
}: {
  files: GatewayFileItem[];
  onOpenPreview: (fileLabel: string) => void;
  runtime: HermesRuntime;
  selectedFileLabel?: string;
}) {
  const [copyBusy, setCopyBusy] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [openBusy, setOpenBusy] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const selectedFile = files[selectedFileIndex] || files[0] || null;
  const selectedPath = selectedFile?.label || '';
  const diffSummary = selectedFile
    ? `${selectedFile.change === 'add' ? '+' : '~'} ${selectedFile.label} · ${selectedFile.meta}`
    : '等待 Hermes 返回文件变更。';

  useEffect(() => {
    if (selectedFileIndex >= files.length) {
      setSelectedFileIndex(0);
    }
  }, [files.length, selectedFileIndex]);

  useEffect(() => {
    if (!selectedFileLabel) {
      return;
    }

    const nextIndex = files.findIndex((file) => (
      file.label === selectedFileLabel || `${file.label} ${file.meta}`.includes(selectedFileLabel)
    ));
    if (nextIndex >= 0) {
      setSelectedFileIndex(nextIndex);
    }
  }, [files, selectedFileLabel]);

  const copyFileInfo = async (kind: 'path' | 'summary') => {
    const label = kind === 'path' ? '路径' : '摘要';
    const value = kind === 'path' ? selectedPath : diffSummary;
    if (!value) {
      setCopyStatus('当前没有可复制的文件。');
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      setCopyBusy(kind);
      setCopyStatus('');
      await navigator.clipboard.writeText(value);
      setCopyStatus(`Diff ${label}已复制。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCopyStatus(`复制失败：${message}`);
    } finally {
      setCopyBusy('');
    }
  };

  const openFile = async () => {
    if (!selectedFile) {
      setCopyStatus('当前没有可打开文件。');
      return;
    }

    try {
      setOpenBusy(true);
      setCopyStatus('');
      await runtime.apiRequest({
        body: {
          cwd: runtime.cwd,
          path: selectedFile.label,
        },
        method: 'POST',
        path: '/api/files/open',
        timeoutMs: 15000,
      });
      setCopyStatus('文件已交给系统打开。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCopyStatus(`打开失败：${message}`);
    } finally {
      setOpenBusy(false);
    }
  };

  return (
    <>
      <section className="railSection">
        <h3>变更文件</h3>
        {files.length > 0 ? (
          files.map((file, index) => (
            <button
              className={index === selectedFileIndex ? 'fileChangeRow selected' : 'fileChangeRow'}
              key={`${file.label}-${file.meta}`}
              type="button"
              onClick={() => setSelectedFileIndex(index)}
            >
              <span className={file.change === 'add' ? 'changeTag add' : 'changeTag mod'}>{file.change === 'add' ? '新' : '改'}</span>
              <span>{file.label}</span>
              <small>{file.meta}</small>
            </button>
          ))
        ) : (
          <div className="railEmpty">当前会话还没有文件变更。</div>
        )}
      </section>
      <section className="railSection">
        <h3>文件动作</h3>
        <dl className="fileDetailList">
          <div>
            <dt>路径</dt>
            <dd title={selectedPath}>{selectedPath || '等待文件变更'}</dd>
          </div>
          <div>
            <dt>类型</dt>
            <dd>{selectedFile?.change === 'add' ? '新增' : selectedFile ? '修改' : '未选择'}</dd>
          </div>
        </dl>
        <pre className="miniCode"><code>{diffSummary}</code></pre>
        <div className="workbenchActions fileActionGrid">
          <button type="button" onClick={() => selectedFile && onOpenPreview(selectedFile.label)} disabled={!selectedFile}>
            预览
          </button>
          <button type="button" onClick={() => void openFile()} disabled={openBusy || !selectedFile}>
            {openBusy ? '打开中' : '打开'}
          </button>
          <button type="button" onClick={() => void copyFileInfo('path')} disabled={Boolean(copyBusy) || !selectedFile}>
            {copyBusy === 'path' ? '复制中' : '复制路径'}
          </button>
          <button type="button" onClick={() => void copyFileInfo('summary')} disabled={Boolean(copyBusy)}>
            {copyBusy === 'summary' ? '复制中' : '复制摘要'}
          </button>
        </div>
        {copyStatus && <p className="railStatus" role="status">{copyStatus}</p>}
      </section>
    </>
  );
}

function WorkbenchTerminal({ logs, onStop }: { logs: string[]; onStop: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const renderedLogs = logs.length > 0 ? logs.slice(-12).join('\n') : 'Gateway 日志会在这里显示。';
  const stopGateway = async () => {
    try {
      setBusy(true);
      setStatus('');
      await onStop();
      setStatus('Gateway 停止请求已发送。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`停止失败：${message}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className="railSection terminalSection">
        <div className="terminalHeader">
          <strong>Hermes Gateway</strong>
          <button type="button" onClick={() => void stopGateway()} disabled={busy}>
            {busy ? <RefreshCw className="spinIcon" size={15} /> : <PauseCircle size={15} />}
            {busy ? '停止中' : '停止'}
          </button>
        </div>
        <pre className="terminalBlock"><code>{renderedLogs}</code></pre>
        {status && <p className="railStatus" role="status">{status}</p>}
      </section>
      <section className="railSection">
        <h3>退出状态</h3>
        <div className="statusLine good">
          <CheckCircle2 size={15} />
          日志流已连接
        </div>
      </section>
    </>
  );
}

function WorkbenchPreview({ runtime, selectedFileLabel }: { runtime: HermesRuntime; selectedFileLabel?: string }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedPath, setSelectedPath] = useState('');
  const [preview, setPreview] = useState<HermesFilePreviewInfo | null>(null);
  const selectedFile = runtime.files.find((file) => file.label === selectedPath) || runtime.files[0] || null;
  const previewText = selectedFile
    ? `${selectedFile.label} · ${selectedFile.meta}`
    : runtime.connection?.baseUrl
      ? `Gateway: ${runtime.connection.baseUrl}`
      : '连接 Hermes Gateway 后，预览和外部产物会显示在这里。';
  const loadFilePreview = useCallback(async (file: GatewayFileItem | null = selectedFile) => {
    if (!file) {
      setPreview(null);
      setStatus('当前会话还没有可预览文件。');
      return;
    }

    try {
      setBusy(true);
      setStatus('');
      const result = await runtime.apiRequest<HermesFilePreviewInfo>({
        path: `/api/files/preview?path=${encodeURIComponent(file.label)}&cwd=${encodeURIComponent(runtime.cwd || '')}`,
        timeoutMs: 15000,
      });
      setPreview(result);
      setSelectedPath(file.label);
      setStatus(`${result.name || file.label} 预览已加载。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPreview(null);
      setStatus(`预览失败：${message}`);
    } finally {
      setBusy(false);
    }
  }, [runtime, selectedFile]);
  const refreshPreview = async () => {
    try {
      setBusy(true);
      setStatus('');
      await runtime.refreshInventory();
      if (selectedFile) {
        await loadFilePreview(selectedFile);
      } else {
        setStatus(runtime.connection?.baseUrl ? '预览状态已刷新。' : '已刷新，本机 Gateway 暂无可打开地址。');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`刷新失败：${message}`);
    } finally {
      setBusy(false);
    }
  };
  const openGateway = () => {
    if (!runtime.connection?.baseUrl) {
      setStatus('本机 Gateway 暂无可打开地址。');
      return;
    }

    const previewWindow = window.open(runtime.connection.baseUrl, '_blank', 'noopener,noreferrer');
    setStatus(previewWindow ? 'Gateway 已在新窗口打开。' : 'Gateway 窗口可能被拦截。');
  };
  const openPreviewFile = async () => {
    if (!selectedFile) {
      setStatus('当前没有可打开文件。');
      return;
    }

    try {
      setBusy(true);
      await runtime.apiRequest({
        body: {
          cwd: runtime.cwd,
          path: selectedFile.label,
        },
        method: 'POST',
        path: '/api/files/open',
        timeoutMs: 15000,
      });
      setStatus('文件已交给系统打开。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`打开失败：${message}`);
    } finally {
      setBusy(false);
    }
  };
  const copyPreviewPath = async () => {
    const value = preview?.path || selectedFile?.label || '';
    if (!value) {
      setStatus('当前没有可复制路径。');
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      setStatus('文件路径已复制。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(`复制失败：${message}`);
    }
  };

  useEffect(() => {
    if (!selectedPath && runtime.files.length > 0) {
      void loadFilePreview(runtime.files[0]);
    }
  }, [loadFilePreview, runtime.files, selectedPath]);

  useEffect(() => {
    if (!selectedFileLabel) {
      return;
    }

    const nextFile = runtime.files.find((file) => (
      file.label === selectedFileLabel || `${file.label} ${file.meta}`.includes(selectedFileLabel)
    ));
    if (nextFile && nextFile.label !== selectedPath) {
      void loadFilePreview(nextFile);
    }
  }, [loadFilePreview, runtime.files, selectedFileLabel, selectedPath]);

  return (
    <>
      <section className="previewPanel">
        {preview?.kind === 'image' && preview.data_url ? (
          <div className="previewMediaFrame">
            <img src={preview.data_url} alt={preview.name || selectedFile?.label || '预览图片'} />
          </div>
        ) : preview?.kind === 'html' ? (
          <iframe className="previewHtmlFrame" sandbox="" srcDoc={preview.text || ''} title={preview.name || 'HTML 预览'} />
        ) : preview?.kind === 'text' ? (
          <pre className="previewTextFrame"><code>{preview.text || ''}</code></pre>
        ) : (
          <div className="previewEmpty">
            <Eye size={22} />
            <strong>{selectedFile ? '选择文件预览' : '暂无预览产物'}</strong>
            <span>{previewText}</span>
          </div>
        )}
      </section>
      <section className="railSection">
        <h3>预览产物</h3>
        <p>{previewText}</p>
        {runtime.files.length > 0 && (
          <div className="previewFilePicker">
            {runtime.files.slice(0, 8).map((file) => (
              <button
                className={selectedFile?.label === file.label ? 'selected' : undefined}
                key={`${file.label}-${file.meta}`}
                type="button"
                onClick={() => void loadFilePreview(file)}
              >
                <File size={14} />
                <span>{file.label}</span>
              </button>
            ))}
          </div>
        )}
        {preview && (
          <div className="previewMeta">
            <span>{preview.kind}</span>
            <span>{preview.mime || 'unknown'}</span>
            <span>{typeof preview.size === 'number' ? `${Math.ceil(preview.size / 1024)} KB` : 'size unknown'}</span>
            {preview.truncated && <span>已截断</span>}
          </div>
        )}
        <div className="workbenchActions previewActions">
          <button type="button" onClick={() => void refreshPreview()} disabled={busy}>
            {busy ? '刷新中' : '刷新'}
          </button>
          <button type="button" onClick={() => void openPreviewFile()} disabled={busy || !selectedFile}>
            打开文件
          </button>
          <button type="button" onClick={() => void copyPreviewPath()} disabled={busy || !selectedFile}>
            复制路径
          </button>
          <button
            type="button"
            disabled={!runtime.connection?.baseUrl}
            onClick={openGateway}
          >
            打开 Gateway
          </button>
        </div>
        {status && <p className="railStatus" role="status">{status}</p>}
      </section>
    </>
  );
}

function WorkbenchItem({
  active,
  detail,
  onSelect,
  state,
  label,
  value,
}: {
  active?: boolean;
  detail?: string;
  onSelect?: () => void;
  state: 'done' | 'running' | 'pending';
  label: string;
  value: string;
}) {
  const content = (
    <>
      <span className={`${state}Mark`} />
      <div className="workbenchItemText">
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </div>
      <em>{value}</em>
    </>
  );

  if (onSelect) {
    return (
      <button className={active ? 'workbenchItem selected' : 'workbenchItem'} type="button" onClick={onSelect}>
        {content}
      </button>
    );
  }

  return (
    <div className="workbenchItem">
      {content}
    </div>
  );
}

interface CommandCenterAction {
  action: string;
  danger?: boolean;
  desc: string;
  group: string;
  icon: React.ReactNode;
  keywords: string;
  run: () => void;
  title: string;
}

function CommandCenter({
  query,
  onQueryChange,
  onClose,
  onNewTask,
  onNavigate,
  onOpenWorkbenchTab,
  onOpenWorkbenchFile,
  onOpenApproval,
  onOpenSettingsSection,
  runtime,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onNewTask: () => void;
  onNavigate: (surface: Surface) => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
  onOpenWorkbenchFile: (fileLabel: string) => void;
  onOpenApproval: () => void;
  onOpenSettingsSection: (section: SettingsSection) => void;
  runtime: HermesRuntime;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const normalized = query.trim().toLowerCase();
  const actions = useMemo<CommandCenterAction[]>(() => {
    const list: CommandCenterAction[] = [
      {
        action: '执行',
        desc: '回到聊天区，继续和 Hermes 对话',
        group: '常用动作',
        icon: <Plus />,
        keywords: 'new chat task 新建 任务 对话',
        run: onNewTask,
        title: '新建任务',
      },
      {
        action: '打开',
        desc: '在右侧工作区查看 Gateway 日志',
        group: '常用动作',
        icon: <TerminalSquare />,
        keywords: 'terminal log gateway 终端 日志',
        run: () => onOpenWorkbenchTab('terminal'),
        title: '打开终端',
      },
      {
        action: '打开',
        desc: '查看当前会话文件变更',
        group: '常用动作',
        icon: <FileCode2 />,
        keywords: 'file diff changed 文件 变更',
        run: () => onOpenWorkbenchTab('files'),
        title: '查看文件变更',
      },
      {
        action: runtime.pendingApproval ? '跳转' : '设置',
        danger: Boolean(runtime.pendingApproval),
        desc: runtime.pendingApproval?.description || '配置命令确认、权限范围和记住方式',
        group: '常用动作',
        icon: <Shield />,
        keywords: 'approval permission 权限 审批 命令',
        run: runtime.pendingApproval ? onOpenApproval : () => onOpenSettingsSection('permissions'),
        title: runtime.pendingApproval ? '查看待审批命令' : '审批设置',
      },
      {
        action: '刷新',
        desc: runtime.inventoryError || '重新读取配置、skills、sessions 和 Gateway 状态',
        group: '常用动作',
        icon: <RefreshCw />,
        keywords: 'refresh reload inventory diagnostic 刷新 诊断 状态',
        run: () => {
          void runtime.refreshInventory();
          onNavigate('diagnostics');
        },
        title: '刷新本机状态',
      },
      ...([
        ['agents', 'Agents', '任务队列、审批和并行运行状态', <Bot />],
        ['projects', '项目', '会话、路径、模型配置和运行状态', <Folder />],
        ['profiles', 'Profiles', '模型、技能、记忆和权限边界', <UsersRound />],
        ['skills', '技能库', '本机 skills 与插件', <Puzzle />],
        ['cron', '自动化', '调度、超时策略和后台进程', <CalendarClock />],
        ['messaging', '消息网关', '平台状态、频道目录和用户配对', <Network />],
        ['diagnostics', '诊断与更新', 'Gateway、权限、版本和日志', <Wrench />],
        ['onboarding', '首次启动', '连接 Hermes 工作方式', <Rocket />],
        ['settings', '设置', '全局偏好、模型、审批和外观', <Settings />],
      ] as Array<[Surface, string, string, React.ReactNode]>).map(([surface, title, desc, icon]) => ({
        action: '跳转',
        desc,
        group: '跳转',
        icon,
        keywords: `${surface} ${title} ${desc}`,
        run: () => onNavigate(surface),
        title,
      })),
      ...settingsSections.map((section) => ({
        action: '设置',
        desc: section.desc,
        group: '设置',
        icon: <Settings />,
        keywords: `${section.id} ${section.label} ${section.desc}`,
        run: () => onOpenSettingsSection(section.id),
        title: section.label,
      })),
      ...runtime.recentSessions.slice(0, 8).map((session) => ({
        action: '打开',
        desc: session.meta,
        group: '会话',
        icon: <MessageSquare />,
        keywords: `${session.title} ${session.meta}`,
        run: () => {
          onNavigate('chat');
          if (session.id) {
            void runtime.selectSession(session.id);
          }
        },
        title: session.title,
      })),
      ...runtime.files.slice(0, 12).map((file) => ({
        action: '打开',
        desc: file.meta || '当前会话文件变更',
        group: '文件',
        icon: <FileCode2 />,
        keywords: `${file.label} ${file.meta} ${file.change} 文件 变更 diff`,
        run: () => onOpenWorkbenchFile(file.label),
        title: file.label,
      })),
      ...(runtime.inventory?.skills.slice(0, 12).map((skill) => ({
        action: '查看',
        desc: skill.description || skill.path,
        group: 'Skills',
        icon: <Puzzle />,
        keywords: `${skill.name} ${skill.description} ${skill.path} ${skill.source}`,
        run: () => onNavigate('skills'),
        title: skill.name,
      })) ?? []),
    ];

    const queryText = query.trim();
    if (queryText) {
      const promptAction: CommandCenterAction = {
        action: '发送',
        desc: `把“${compactLine(queryText, 48)}”作为新任务发送给 Hermes`,
        group: '常用动作',
        icon: <SendHorizontal />,
        keywords: `${queryText} prompt send 发送`,
        run: () => {
          onClose();
          onNavigate('chat');
          void (async () => {
            await runtime.startNewTask();
            await runtime.submitPrompt(queryText);
          })();
        },
        title: '用当前输入新建任务',
      };
      const exactMatch = list.some((action) => action.title.toLowerCase() === queryText.toLowerCase());
      if (exactMatch) {
        list.push(promptAction);
      } else {
        list.unshift(promptAction);
      }
    }

    return list;
  }, [onClose, onNavigate, onNewTask, onOpenApproval, onOpenSettingsSection, onOpenWorkbenchFile, onOpenWorkbenchTab, query, runtime]);
  const filteredActions = useMemo(() => {
    if (!normalized) {
      return actions;
    }

    return actions.filter((action) => {
      const haystack = `${action.title} ${action.desc} ${action.keywords}`.toLowerCase();
      return normalized.split(/\s+/).every((part) => haystack.includes(part));
    });
  }, [actions, normalized]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [normalized]);

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(0, filteredActions.length - 1)));
  }, [filteredActions.length]);

  const runAction = useCallback((action?: CommandCenterAction) => {
    if (!action) {
      return;
    }

    action.run();
    onClose();
  }, [onClose]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setSelectedIndex(0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setSelectedIndex(Math.max(0, filteredActions.length - 1));
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((index) => Math.min(index + 1, Math.max(0, filteredActions.length - 1)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((index) => Math.max(0, index - 1));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      runAction(filteredActions[selectedIndex]);
    }
  };
  const selectedActionId = filteredActions.length > 0 ? `command-option-${selectedIndex}` : undefined;
  const groupedActions = filteredActions.reduce<Record<string, CommandCenterAction[]>>((acc, action) => {
    acc[action.group] = acc[action.group] || [];
    acc[action.group].push(action);
    return acc;
  }, {});

  return (
    <div className="overlayLayer" role="dialog" aria-modal="true" aria-label="命令中心" data-testid="command-center">
      <button className="overlayBackdrop" type="button" aria-label="关闭命令中心" onClick={onClose} />
      <div className="commandPanel">
        <div className="commandInput">
          <Search size={18} />
          <input
            autoFocus
            aria-activedescendant={selectedActionId}
            aria-controls="command-options"
            aria-expanded="true"
            aria-label="搜索命令"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            onKeyDown={handleKeyDown}
            role="combobox"
            placeholder="搜索命令、会话、文件、设置或 skill"
          />
          <kbd>⌘K</kbd>
          <button className="commandCloseButton" type="button" aria-label="关闭命令中心" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {filteredActions.length > 0 ? (
          <div className="commandBody" id="command-options" role="listbox" aria-label="命令结果">
            {Object.entries(groupedActions).map(([group, groupActions]) => (
              <CommandGroup title={group} key={group}>
                {groupActions.map((action) => {
                  const flatIndex = filteredActions.indexOf(action);
                  return (
                    <CommandRow
                      action={action.action}
                      danger={action.danger}
                      desc={action.desc}
                      id={`command-option-${flatIndex}`}
                      icon={action.icon}
                      key={`${group}-${action.title}-${action.desc}`}
                      selected={flatIndex === selectedIndex}
                      title={action.title}
                      onClick={() => runAction(action)}
                    />
                  );
                })}
              </CommandGroup>
            ))}
          </div>
        ) : (
          <div className="commandEmpty">
            <Search size={26} />
            <strong>没有找到匹配结果</strong>
            <p>可以用“{query}”新建任务，或去技能库查找相关能力。</p>
            <div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  void runtime.submitPrompt(query.trim());
                }}
              >
                用查询新建任务
              </button>
              <button
                type="button"
                onClick={() => {
                  onNavigate('skills');
                  onClose();
                }}
              >
                打开技能库
              </button>
            </div>
          </div>
        )}

        <div className="commandFooter">
          <span>↑↓ 选择</span>
          <span>Enter 执行</span>
          <span>Esc 关闭</span>
        </div>
      </div>
    </div>
  );
}

function CommandGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="commandGroup">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

function CommandRow({
  id,
  icon,
  title,
  desc,
  action,
  danger,
  selected,
  onClick,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  danger?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      aria-selected={selected}
      className={`${danger ? 'commandRow danger' : 'commandRow'}${selected ? ' selected' : ''}`}
      id={id}
      role="option"
      type="button"
      onClick={onClick}
    >
      <span>{icon}</span>
      <div>
        <strong>{title}</strong>
        <small>{desc}</small>
      </div>
      <em>{action}</em>
    </button>
  );
}

function ApprovalModal({
  pendingApproval,
  variant,
  onClose,
  onDeny,
  onRespondApproval,
}: {
  pendingApproval: PendingApproval | null;
  variant: ApprovalVariant;
  onClose: () => void;
  onDeny: () => void;
  onRespondApproval: HermesRuntime['respondApproval'];
}) {
  const [modalStatus, setModalStatus] = useState('');
  const [actionBusy, setActionBusy] = useState('');
  const hasPendingApproval = variant === 'risk' && Boolean(pendingApproval);
  const content = {
    risk: {
      icon: <Shield size={24} />,
      title: hasPendingApproval ? '确认高风险命令' : '暂无待审批命令',
      desc: pendingApproval?.description || '当前没有真实待审批命令。高风险操作出现时会固定在这里。',
      code: pendingApproval?.command || '等待 Hermes Gateway 发送 approval.request',
      details: pendingApproval ? [
        `session: ${pendingApproval.sessionId || '当前会话'}`,
        `request: ${pendingApproval.requestId || '未提供'}`,
        '来源: Hermes Agent',
        '操作: 等待用户确认',
      ] : ['状态: 空闲', '来源: Hermes Agent', '恢复: 回到会话继续描述任务'],
    },
    timeout: {
      icon: <Clock size={24} />,
      title: '审批已超时',
      desc: '原命令的运行环境已经变化，需要重新计算风险和工作目录后再请求确认。',
      code: 'npm run test:desktop -- --approval-ui --update-snapshots',
      details: ['过期: 6 分钟前', '状态: 未执行', '建议: 重新请求审批', '恢复: 返回线程'],
    },
    permission: {
      icon: <AlertTriangle size={24} />,
      title: '缺少 macOS 系统权限',
      desc: 'Hermes 不能代替用户授予系统目录权限。可以打开系统设置，或改用当前项目内的日志路径。',
      code: 'open ~/Library/Logs/Hermes',
      details: ['目标: ~/Library/Logs/Hermes', '权限: Files and Folders', '来源: 诊断与更新', '替代: 导出项目日志'],
    },
  }[variant];
  const submitApproval = async (choice: 'once' | 'session' | 'always' | 'deny') => {
    if (!hasPendingApproval) {
      if (choice === 'deny') {
        onDeny();
        return;
      }
      setModalStatus(choice === 'once' ? '当前没有待审批命令。' : '当前没有可记住的审批规则。');
      return;
    }

    try {
      setActionBusy(choice);
      setModalStatus('');
      await onRespondApproval(choice);
      setModalStatus(choice === 'deny' ? '已拒绝当前命令。' : '审批已提交，Hermes 会继续执行。');
      window.setTimeout(onClose, 450);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setModalStatus(`审批提交失败：${message}`);
    } finally {
      setActionBusy('');
    }
  };

  return (
    <div className="overlayLayer" role="dialog" aria-modal="true" aria-label="工具审批" data-testid="approval-modal">
      <button className="overlayBackdrop" type="button" aria-label="关闭审批" onClick={onClose} />
      <div className={variant === 'timeout' ? 'approvalModal timeout' : 'approvalModal'}>
        <div className="approvalSource">来自 Hermes · 当前会话 · 本地 Hermes</div>
        <div className="approvalHead">
          <div className="approvalIcon">{content.icon}</div>
          <div>
            <h2>{content.title}</h2>
            <p>{content.desc}</p>
          </div>
        </div>
        <pre className="codeBlock"><code>{content.code}</code></pre>
        <div className="approvalDetails">
          {content.details.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <div className="approvalActions">
          <button className="secondaryButton" type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('deny')}>
            {actionBusy === 'deny' ? '提交中' : '拒绝'}
          </button>
          {variant === 'timeout' ? (
            <button className="primaryButtonInline" type="button" onClick={() => setModalStatus('审批已重新标记，请回到会话重新发送。')}>
              重新请求审批
            </button>
          ) : variant === 'permission' ? (
            <button
              className="primaryButtonInline"
              type="button"
              onClick={() => {
                const settingsWindow = window.open('x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles', '_blank', 'noopener,noreferrer');
                setModalStatus(settingsWindow ? '系统设置已打开。' : '系统设置可能被系统拦截，请手动打开隐私与安全性。');
              }}
            >
              打开系统设置
            </button>
          ) : (
            <>
              <button className="secondaryButton" type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('once')}>
                {actionBusy === 'once' ? '提交中' : '本次允许'}
              </button>
              <button className="primaryButtonInline" type="button" disabled={Boolean(actionBusy)} onClick={() => void submitApproval('session')}>
                {actionBusy === 'session' ? '提交中' : '允许并记住当前会话'}
              </button>
            </>
          )}
        </div>
        {modalStatus && <p className="modalStatus" role="status">{modalStatus}</p>}
      </div>
    </div>
  );
}

function ProjectsSurface({
  runtime,
  onOpenDiagnostics,
  onOpenNewTask,
  onOpenProjectMenu,
  onOpenSettings,
  onOpenSession,
  onOpenWorkbenchTab,
}: {
  runtime: HermesRuntime;
  onOpenDiagnostics: () => void;
  onOpenNewTask: () => void;
  onOpenProjectMenu: (projectTitle: string) => void;
  onOpenSettings: () => void;
  onOpenSession: (sessionId: string) => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
}) {
  const [projectBusy, setProjectBusy] = useState<null | string>(null);
  const [projectStatus, setProjectStatus] = useState('');
  const [projectSessions, setProjectSessions] = useState<SessionInfoResponse[]>([]);
  const [projectStats, setProjectStats] = useState<SessionStatsResponse | null>(null);
  const [emptySessionCount, setEmptySessionCount] = useState(0);
  const [sessionQuery, setSessionQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState('');
  const [renamingSessionId, setRenamingSessionId] = useState('');
  const [renameDraft, setRenameDraft] = useState('');
  const gatewayReady = runtime.gatewayStatus === 'connected';
  const firstRecentSession = runtime.recentSessions.find((session) => Boolean(session.id));
  const apiRequest = runtime.apiRequest;
  const runProjectAction = async (
    key: string,
    label: string,
    action: () => Promise<string | void> | string | void,
    doneMessage?: string,
  ) => {
    setProjectBusy(key);
    setProjectStatus(`${label}处理中...`);
    try {
      const result = await action();
      setProjectStatus(typeof result === 'string' ? result : doneMessage || `${label}已完成。`);
    } catch (error) {
      setProjectStatus(`${label}失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setProjectBusy(null);
    }
  };
  const loadProjectSessions = useCallback(async (query = sessionQuery) => {
    const archivedMode = includeArchived ? 'include' : 'exclude';
    const queryText = query.trim();
    setProjectBusy('sessions:load');
    setProjectStatus(queryText ? `正在搜索“${queryText}”...` : '正在同步会话...');
    try {
      const [listResult, statsResult, emptyResult, searchResult] = await Promise.allSettled([
        apiRequest<SessionListResponse>({
          path: `/api/sessions?limit=80&offset=0&min_messages=0&archived=${archivedMode}&order=recent`,
          timeoutMs: 30000,
        }),
        apiRequest<SessionStatsResponse>({ path: '/api/sessions/stats', timeoutMs: 30000 }),
        apiRequest<{ count?: number }>({ path: '/api/sessions/empty/count', timeoutMs: 30000 }),
        queryText
          ? apiRequest<SessionSearchResponse>({
            path: `/api/sessions/search?q=${encodeURIComponent(queryText)}&limit=40`,
            timeoutMs: 30000,
          })
          : Promise.resolve<SessionSearchResponse>({ results: [] }),
      ]);

      if (listResult.status === 'rejected') {
        throw listResult.reason;
      }

      const baseSessions = sessionsFromResponse(listResult.value);
      let nextSessions = baseSessions;
      if (queryText) {
        const lowerQuery = queryText.toLowerCase();
        const searchRows = searchResult.status === 'fulfilled'
          ? (searchResult.value.results || []).map((result): SessionInfoResponse => {
            const existing = baseSessions.find((item) => item.id === result.session_id);
            return existing || {
              id: result.session_id || '',
              last_active: result.session_started,
              message_count: 0,
              model: result.model,
              preview: result.snippet,
              source: result.source,
              title: result.snippet,
            };
          }).filter((item) => Boolean(item.id))
          : [];
        const visibleMatches = baseSessions.filter((session) => (
          [session.id, session.title, session.preview, session.model, session.source]
            .some((value) => String(value || '').toLowerCase().includes(lowerQuery))
        ));
        const seen = new Set<string>();
        nextSessions = [...searchRows, ...visibleMatches].filter((session) => {
          if (!session.id || seen.has(session.id)) {
            return false;
          }
          seen.add(session.id);
          return true;
        });
      }

      setProjectSessions(nextSessions);
      setSelectedSessionIds((current) => current.filter((id) => nextSessions.some((session) => session.id === id)));
      if (statsResult.status === 'fulfilled') {
        setProjectStats(statsResult.value);
      }
      if (emptyResult.status === 'fulfilled') {
        setEmptySessionCount(Number(emptyResult.value.count || 0));
      }
      setProjectStatus(queryText ? `找到 ${nextSessions.length} 个匹配会话。` : `已同步 ${nextSessions.length} 个会话。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProjectSessions([]);
      setSelectedSessionIds([]);
      setProjectStatus(`会话同步失败：${message}`);
    } finally {
      setProjectBusy(null);
    }
  }, [apiRequest, includeArchived, sessionQuery]);

  useEffect(() => {
    void loadProjectSessions('');
  }, [includeArchived]);

  const visibleSessionIds = projectSessions.map((session) => session.id).filter(Boolean);
  const allVisibleSelected = visibleSessionIds.length > 0 && visibleSessionIds.every((id) => selectedSessionIds.includes(id));
  const toggleSessionSelection = (sessionId: string) => {
    setPendingDeleteId('');
    setSelectedSessionIds((current) => (
      current.includes(sessionId) ? current.filter((id) => id !== sessionId) : [...current, sessionId]
    ));
  };
  const toggleAllVisibleSessions = () => {
    setPendingDeleteId('');
    setSelectedSessionIds(allVisibleSelected ? [] : visibleSessionIds);
  };
  const beginRenameSession = (session: SessionInfoResponse) => {
    setPendingDeleteId('');
    setRenamingSessionId(session.id);
    setRenameDraft(session.title || session.preview || '');
  };
  const renameSession = (session: SessionInfoResponse) => runProjectAction(
    `rename:${session.id}`,
    '重命名会话',
    async () => {
      const title = renameDraft.trim();
      if (!title) {
        throw new Error('请输入会话名称');
      }
      await apiRequest({
        body: { title },
        method: 'PATCH',
        path: `/api/sessions/${encodeURIComponent(session.id)}`,
        timeoutMs: 30000,
      });
      setRenamingSessionId('');
      await loadProjectSessions();
      await runtime.refreshInventory();
      return `“${title}” 已保存。`;
    },
  );
  const archiveProjectSession = (session: SessionInfoResponse, archived: boolean) => runProjectAction(
    `archive:${session.id}`,
    archived ? '归档会话' : '恢复会话',
    async () => {
      await apiRequest({
        body: { archived },
        method: 'PATCH',
        path: `/api/sessions/${encodeURIComponent(session.id)}`,
        timeoutMs: 30000,
      });
      await loadProjectSessions();
      await runtime.refreshInventory();
      return archived ? '会话已归档。' : '会话已恢复。';
    },
  );
  const deleteProjectSession = (session: SessionInfoResponse) => {
    if (pendingDeleteId !== session.id) {
      setPendingDeleteId(session.id);
      setProjectStatus(`再次点击删除“${sessionDisplayTitle(session)}”。`);
      return;
    }
    void runProjectAction(
      `delete:${session.id}`,
      '删除会话',
      async () => {
        await runtime.deleteSession({
          id: session.id,
          meta: sessionDisplayMeta(session),
          title: sessionDisplayTitle(session),
        });
        setPendingDeleteId('');
        setSelectedSessionIds((current) => current.filter((id) => id !== session.id));
        await loadProjectSessions();
        return '会话已删除。';
      },
    );
  };
  const bulkDeleteSessions = () => {
    if (selectedSessionIds.length === 0) {
      setProjectStatus('请先选择要删除的会话。');
      return;
    }
    if (pendingDeleteId !== 'bulk') {
      setPendingDeleteId('bulk');
      setProjectStatus(`再次点击批量删除 ${selectedSessionIds.length} 个会话。`);
      return;
    }
    void runProjectAction(
      'bulk-delete',
      '批量删除',
      async () => {
        const result = await apiRequest<{ deleted?: number }>({
          body: { ids: selectedSessionIds },
          method: 'POST',
          path: '/api/sessions/bulk-delete',
          timeoutMs: 30000,
        });
        setSelectedSessionIds([]);
        setPendingDeleteId('');
        await loadProjectSessions();
        await runtime.refreshInventory();
        return `已删除 ${result.deleted ?? selectedSessionIds.length} 个会话。`;
      },
    );
  };
  const cleanEmptySessions = () => {
    if (emptySessionCount <= 0) {
      setProjectStatus('当前没有可清理的空会话。');
      return;
    }
    if (pendingDeleteId !== 'empty') {
      setPendingDeleteId('empty');
      setProjectStatus(`再次点击清理 ${emptySessionCount} 个空会话。`);
      return;
    }
    void runProjectAction(
      'empty-delete',
      '清理空会话',
      async () => {
        const result = await apiRequest<{ deleted?: number }>({
          method: 'DELETE',
          path: '/api/sessions/empty',
          timeoutMs: 30000,
        });
        setPendingDeleteId('');
        await loadProjectSessions();
        await runtime.refreshInventory();
        return `已清理 ${result.deleted ?? 0} 个空会话。`;
      },
    );
  };
  const exportSession = (session: SessionInfoResponse) => runProjectAction(
    `export:${session.id}`,
    '导出会话',
    async () => {
      const result = await apiRequest<{ session?: unknown }>({
        path: `/api/sessions/${encodeURIComponent(session.id)}/export`,
        timeoutMs: 30000,
      });
      if (!navigator.clipboard?.writeText) {
        throw new Error('当前环境无法访问剪贴板');
      }
      await navigator.clipboard.writeText(JSON.stringify(result.session || result, null, 2));
      return '会话 JSON 已复制。';
    },
  );

  const projectCards = [
    {
      action: '查看文件',
      icon: <Folder size={20} />,
      key: 'workspace',
      meta: runtime.cwd ? shortenPath(runtime.cwd) : '尚未从会话读取工作目录',
      onClick: () => runProjectAction(
        'workspace',
        '文件工作区',
        () => onOpenWorkbenchTab('files'),
        '文件工作区已打开。',
      ),
      stats: [runtime.model, `${runtime.contextPercent}% · 1M`],
      title: '本地 Hermes 工作区',
    },
    {
      action: gatewayReady ? '查看诊断' : '修复连接',
      icon: <Network size={20} />,
      key: 'gateway',
      meta: runtime.connection?.baseUrl || runtime.connectionLabel,
      onClick: () => runProjectAction(
        'gateway',
        gatewayReady ? 'Gateway 诊断' : 'Gateway 修复',
        gatewayReady ? onOpenDiagnostics : runtime.restartGateway,
        gatewayReady ? 'Gateway 诊断已打开。' : 'Gateway 修复命令已发送。',
      ),
      stats: [runtime.connectionLabel, runtime.socketState],
      title: 'Hermes Gateway',
    },
    {
      action: firstRecentSession?.id ? '打开最近' : '新建任务',
      icon: <MessageSquare size={20} />,
      key: 'sessions',
      meta: `${projectStats?.total ?? runtime.recentSessions.length} 个会话 · ${projectStats?.messages ?? 0} 条消息`,
      onClick: () => runProjectAction(
        'sessions',
        firstRecentSession?.id ? '最近会话' : '新建任务',
        () => {
          if (firstRecentSession?.id) {
            onOpenSession(firstRecentSession.id);
            return;
          }
          onOpenNewTask();
        },
        firstRecentSession?.id ? '最近会话正在打开。' : '新任务已创建。',
      ),
      stats: [
        `${projectStats?.active_store ?? projectSessions.length} 可见`,
        `${projectStats?.archived ?? 0} 归档`,
      ],
      title: '会话',
    },
  ];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>项目工作区</h2>
          <p>把会话、路径、模型配置和运行状态合并管理。</p>
        </div>
        <button className="lightButton" type="button" onClick={onOpenSettings}>
          <Settings size={16} />
          项目设置
        </button>
      </div>
      {projectStatus && <p className="surfaceStatus" role="status">{projectStatus}</p>}

      <div className="projectGrid">
        {projectCards.map((project) => (
          <article className="projectCard" key={project.title}>
            <div className="cardTop">
              <div className="projectIcon">
                {project.icon}
              </div>
              <button
                className="iconButton compact"
                type="button"
                aria-label={`${project.title} 更多操作`}
                onClick={() => {
                  setProjectStatus(`${project.title} 操作已打开。`);
                  onOpenProjectMenu(project.title);
                }}
              >
                <MoreHorizontal size={17} />
              </button>
            </div>
            <h3>{project.title}</h3>
            <p>{project.meta}</p>
            <div className="projectStats">
              {project.stats.length > 0 ? project.stats.map((stat) => <span key={stat}>{stat}</span>) : <span>等待数据</span>}
            </div>
            <div className="projectActions">
              <button type="button" disabled={projectBusy !== null} onClick={project.onClick}>
                <ChevronRight size={15} />
                {projectBusy === project.key ? '处理中' : project.action}
              </button>
            </div>
          </article>
        ))}
      </div>

      <section className="projectSessionManager">
        <div className="sessionManagerHeader">
          <div>
            <h3>会话管理</h3>
            <p>{projectStats?.total ?? projectSessions.length} 个会话 · {projectStats?.messages ?? 0} 条消息 · {emptySessionCount} 个空会话</p>
          </div>
          <div className="sessionManagerControls">
            <label className="inlineSearch sessionSearch">
              <Search size={15} />
              <input
                aria-label="搜索会话"
                onChange={(event) => setSessionQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void loadProjectSessions();
                  }
                }}
                placeholder="搜索标题、ID 或消息"
                value={sessionQuery}
              />
            </label>
            <button type="button" onClick={() => void loadProjectSessions()} disabled={Boolean(projectBusy)}>
              {projectBusy === 'sessions:load' ? '同步中' : '搜索/刷新'}
            </button>
            <button type="button" onClick={() => setIncludeArchived((value) => !value)} disabled={Boolean(projectBusy)}>
              {includeArchived ? '隐藏归档' : '显示归档'}
            </button>
          </div>
        </div>

        <div className="sessionBulkBar">
          <button type="button" onClick={toggleAllVisibleSessions} disabled={projectSessions.length === 0 || Boolean(projectBusy)}>
            {allVisibleSelected ? '取消全选' : '全选'}
          </button>
          <button type="button" onClick={bulkDeleteSessions} disabled={selectedSessionIds.length === 0 || Boolean(projectBusy)}>
            {pendingDeleteId === 'bulk' ? '确认删除' : `批量删除 ${selectedSessionIds.length || ''}`.trim()}
          </button>
          <button type="button" onClick={cleanEmptySessions} disabled={emptySessionCount === 0 || Boolean(projectBusy)}>
            {pendingDeleteId === 'empty' ? '确认清理' : `清理空会话 ${emptySessionCount || ''}`.trim()}
          </button>
          <span>{selectedSessionIds.length > 0 ? `已选择 ${selectedSessionIds.length} 个` : '选择会话后可批量操作'}</span>
        </div>

        <div className="projectSessionList" aria-label="项目会话列表">
          {projectSessions.length > 0 ? projectSessions.map((session) => {
            const title = sessionDisplayTitle(session);
            const selected = selectedSessionIds.includes(session.id);
            const renaming = renamingSessionId === session.id;
            return (
              <article className={selected ? 'projectSessionRow selected' : 'projectSessionRow'} key={session.id}>
                <label className="sessionSelect">
                  <input
                    aria-label={`选择 ${title}`}
                    checked={selected}
                    onChange={() => toggleSessionSelection(session.id)}
                    type="checkbox"
                  />
                </label>
                <button className="sessionOpenTarget" type="button" onClick={() => onOpenSession(session.id)}>
                  <span className={session.is_active ? 'statusDot green' : session.archived ? 'statusDot gray' : 'statusDot blue'} />
                  <span>
                    <strong>{title}</strong>
                    <small>{sessionDisplayMeta(session)}</small>
                  </span>
                </button>
                <div className="sessionTags">
                  <span>{sessionSourceLabel(session.source)}</span>
                  {session.archived && <span>已归档</span>}
                  {session.is_active && <span className="live">活跃</span>}
                </div>
                {renaming ? (
                  <form
                    className="sessionRenameForm"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void renameSession(session);
                    }}
                  >
                    <input aria-label="会话名称" value={renameDraft} onChange={(event) => setRenameDraft(event.target.value)} />
                    <button type="submit" disabled={Boolean(projectBusy)}>保存</button>
                    <button type="button" onClick={() => setRenamingSessionId('')} disabled={Boolean(projectBusy)}>取消</button>
                  </form>
                ) : (
                  <div className="sessionRowActions">
                    <button type="button" onClick={() => beginRenameSession(session)} disabled={Boolean(projectBusy)}>重命名</button>
                    <button type="button" onClick={() => void archiveProjectSession(session, !session.archived)} disabled={Boolean(projectBusy)}>
                      {session.archived ? '恢复' : '归档'}
                    </button>
                    <button type="button" onClick={() => void exportSession(session)} disabled={Boolean(projectBusy)}>导出</button>
                    <button className="danger" type="button" onClick={() => deleteProjectSession(session)} disabled={Boolean(projectBusy)}>
                      {pendingDeleteId === session.id ? '确认删除' : '删除'}
                    </button>
                  </div>
                )}
              </article>
            );
          }) : (
            <div className="projectSessionEmpty">
              <strong>{sessionQuery.trim() ? '没有匹配会话' : '暂无真实会话'}</strong>
              <p>{sessionQuery.trim() ? '换个关键词，或清空搜索后刷新。' : '开始新任务后，真实 Hermes 会话会出现在这里。'}</p>
              <button type="button" onClick={onOpenNewTask}>新建任务</button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

function AgentsSurface({
  runtime,
  onOpenChat,
  onOpenApproval,
}: {
  runtime: HermesRuntime;
  onOpenChat: () => void;
  onOpenApproval: () => void;
}) {
  const [agentBusy, setAgentBusy] = useState('');
  const [agentStatus, setAgentStatus] = useState('');
  const runningTools = runtime.tools.filter((tool) => tool.state === 'running');
  const completedTools = runtime.tools.filter((tool) => tool.state === 'done');
  const gatewayControlsLocked = Boolean(agentBusy);
  const refreshAgents = async () => {
    try {
      setAgentBusy('refresh');
      setAgentStatus('正在刷新 Agents 状态...');
      await runtime.refreshInventory();
      setAgentStatus('Agents 状态已刷新。');
    } catch (error) {
      setAgentStatus(`Agents 状态刷新失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setAgentBusy('');
    }
  };
  const runAgentAction = async (key: string, label: string, action: () => Promise<void>) => {
    try {
      setAgentBusy(key);
      setAgentStatus(`${label}处理中...`);
      await action();
      setAgentStatus(`${label}已完成。`);
    } catch (error) {
      setAgentStatus(`${label}失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setAgentBusy('');
    }
  };
  const copyAgentSummary = async (tool: GatewayToolItem) => {
    if (!navigator.clipboard?.writeText) {
      setAgentStatus('当前环境无法访问剪贴板。');
      return;
    }

    await runAgentAction(`copy:${tool.id}`, `${tool.label} 摘要复制`, async () => {
      await navigator.clipboard.writeText([
        tool.label,
        tool.detail,
        tool.value,
      ].filter(Boolean).join('\n'));
    });
  };
  const respondAgentApproval = (choice: 'once' | 'session' | 'always' | 'deny') => {
    const label = choice === 'deny' ? '拒绝审批' : choice === 'always' ? '永久允许' : choice === 'session' ? '本会话允许' : '允许一次';
    void runAgentAction(`approval:${choice}`, label, async () => {
      await runtime.respondApproval(choice);
    });
  };
  const runningCards = runningTools.length > 0
    ? runningTools.map((tool) => (
      <AgentCard
        key={tool.id}
        title={tool.label}
        status="运行中"
        desc="工具正在执行，输出会同步到聊天和右侧活动。"
        meta={tool.detail || tool.value}
        actions={(
          <button type="button" onClick={() => void copyAgentSummary(tool)} disabled={gatewayControlsLocked}>
            {agentBusy === `copy:${tool.id}` ? '复制中' : '复制摘要'}
          </button>
        )}
      />
    ))
    : [(
      <AgentCard
        key="gateway"
        title="Hermes Gateway"
        status={runtime.socketState === 'open' ? '已连接' : runtime.connectionLabel}
        desc="连接状态来自本机 Gateway。"
        meta={runtime.statusText}
        muted={runtime.socketState !== 'open'}
        actions={(
          <>
            <button type="button" onClick={() => void runAgentAction('gateway:start', '启动 Gateway', runtime.startGateway)} disabled={gatewayControlsLocked || runtime.gatewayStatus === 'connected'}>
              启动
            </button>
            <button type="button" onClick={() => void runAgentAction('gateway:restart', '重启 Gateway', runtime.restartGateway)} disabled={gatewayControlsLocked}>
              重启
            </button>
            <button type="button" onClick={() => void runAgentAction('gateway:stop', '停止 Gateway', runtime.stopGateway)} disabled={gatewayControlsLocked || runtime.gatewayStatus === 'stopped'}>
              停止
            </button>
          </>
        )}
      />
    )];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>Agents</h2>
          <p>运行中工具、待确认命令和 Gateway 控制集中在这里。</p>
        </div>
        <div className="topActions">
          <button className="lightButton" type="button" onClick={() => void refreshAgents()} disabled={Boolean(agentBusy)}>
            <RefreshCw className={agentBusy === 'refresh' ? 'spinIcon' : undefined} size={16} />
            {agentBusy === 'refresh' ? '刷新中' : '刷新状态'}
          </button>
          <button className="lightButton" type="button" onClick={onOpenChat} disabled={Boolean(agentBusy)}>
            <Plus size={16} />
            新建任务
          </button>
        </div>
      </div>
      {agentStatus && <p className="surfaceStatus" role="status">{agentStatus}</p>}
      <div className="agentControlStrip" aria-label="Gateway 快捷控制">
        <div>
          <Network size={15} />
          <strong>{runtime.connectionLabel}</strong>
          <span>{runtime.connection?.baseUrl || runtime.statusText}</span>
        </div>
        <div>
          <button type="button" onClick={() => void runAgentAction('gateway:start', '启动 Gateway', runtime.startGateway)} disabled={gatewayControlsLocked || runtime.gatewayStatus === 'connected'}>
            <Play size={14} />
            启动
          </button>
          <button type="button" onClick={() => void runAgentAction('gateway:restart', '重启 Gateway', runtime.restartGateway)} disabled={gatewayControlsLocked}>
            <RefreshCw className={agentBusy === 'gateway:restart' ? 'spinIcon' : undefined} size={14} />
            重启
          </button>
          <button type="button" onClick={() => void runAgentAction('gateway:stop', '停止 Gateway', runtime.stopGateway)} disabled={gatewayControlsLocked || runtime.gatewayStatus === 'stopped'}>
            <PauseCircle size={14} />
            停止
          </button>
        </div>
      </div>
      <div className="kanbanGrid">
        <KanbanColumn title="运行中" count={String(runningTools.length || (runtime.socketState === 'open' ? 1 : 0))}>
          {runningCards}
        </KanbanColumn>
        <KanbanColumn title="待确认" count={runtime.pendingApproval ? '1' : '0'}>
          {runtime.pendingApproval ? (
            <AgentCard
              title="高风险命令确认"
              status="approval"
              desc="需要手动确认后，Hermes 才会继续执行。"
              meta={runtime.pendingApproval.description}
              danger
              onClick={onOpenApproval}
              actions={(
                <>
                  <button type="button" onClick={() => respondAgentApproval('once')} disabled={gatewayControlsLocked}>
                    允许一次
                  </button>
                  <button type="button" onClick={() => respondAgentApproval('session')} disabled={gatewayControlsLocked}>
                    本会话
                  </button>
                  <button className="danger" type="button" onClick={() => respondAgentApproval('deny')} disabled={gatewayControlsLocked}>
                    拒绝
                  </button>
                </>
              )}
            />
          ) : (
            <AgentCard title="暂无待审批命令" status="空闲" desc="出现高风险操作时会固定在这里。" meta="审批队列为空" muted />
          )}
        </KanbanColumn>
        <KanbanColumn title="已完成" count={String(completedTools.length)}>
          {completedTools.length > 0 ? (
            completedTools.slice(0, 4).map((tool) => (
              <AgentCard key={tool.id} title={tool.label} status="完成" desc="最近动作已同步到当前线程。" meta={tool.detail || tool.value} muted />
            ))
          ) : (
            <AgentCard title="等待任务完成" status="空" desc="完成后的工具调用会显示在这里。" meta="暂无完成事件" muted />
          )}
        </KanbanColumn>
      </div>
    </section>
  );
}

function KanbanColumn({ title, count, children }: { title: string; count: string; children: React.ReactNode }) {
  return (
    <section className="kanbanColumn">
      <div className="columnHead">
        <h3>{title}</h3>
        <span>{count}</span>
      </div>
      {children}
    </section>
  );
}

function AgentCard({
  desc,
  title,
  status,
  meta,
  danger,
  muted,
  onClick,
  actions,
}: {
  actions?: React.ReactNode;
  desc: string;
  title: string;
  status: string;
  meta: string;
  danger?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  const className = `${muted ? 'agentCard muted' : 'agentCard'}${onClick && !actions ? '' : ' static'}`;
  const content = (
    <>
      <div className="cardHead">
        <strong>{title}</strong>
        <span className={danger ? 'pill red' : 'pill'}>{status}</span>
      </div>
      <p>{desc}</p>
      <div className="cardFoot">
        <span>{meta}</span>
        {onClick && !actions && <ChevronRight size={14} />}
      </div>
      {actions && (
        <div className="agentCardActions">
          {onClick && (
            <button type="button" onClick={onClick}>
              查看详情
            </button>
          )}
          {actions}
        </div>
      )}
    </>
  );

  if (!onClick || actions) {
    return (
      <article className={className}>
        {content}
      </article>
    );
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {content}
    </button>
  );
}

function ProfilesSurface({ runtime }: { runtime: HermesRuntime }) {
  const config = runtime.inventory?.config;
  const fallbackProfiles: HermesProfileInfo[] = [
    {
      description: runtime.connectionLabel,
      gateway_running: runtime.gatewayStatus === 'connected',
      is_default: true,
      model: config?.defaultModel || runtime.model,
      name: 'default',
      provider: config?.provider || '',
      source: 'desktop-local-bridge',
      skill_count: runtime.inventory?.skills.length ?? 0,
    },
  ];
  const [profiles, setProfiles] = useState<HermesProfileInfo[]>([]);
  const [activeName, setActiveName] = useState('default');
  const [selectedProfile, setSelectedProfile] = useState('default');
  const [newProfileName, setNewProfileName] = useState('');
  const [profileDraftName, setProfileDraftName] = useState('');
  const [profileDescriptionDraft, setProfileDescriptionDraft] = useState('');
  const [profileModelDraft, setProfileModelDraft] = useState('');
  const [profileProviderDraft, setProfileProviderDraft] = useState('');
  const [profileSoulDraft, setProfileSoulDraft] = useState('');
  const [profileSoulLoadedName, setProfileSoulLoadedName] = useState('');
  const [pendingProfileDeleteName, setPendingProfileDeleteName] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileBusy, setProfileBusy] = useState('');
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const visibleProfiles = profiles.length > 0 ? profiles : fallbackProfiles;
  const activeProfile = visibleProfiles.find((profile) => profile.name === selectedProfile) || visibleProfiles[0];
  useEffect(() => {
    setProfileDraftName(activeProfile?.name || '');
    setProfileDescriptionDraft(activeProfile?.description || '');
    setProfileModelDraft(activeProfile?.model || config?.defaultModel || runtime.model || '');
    setProfileProviderDraft(activeProfile?.provider || config?.provider || '');
    setProfileSoulDraft('');
    setProfileSoulLoadedName('');
    setPendingProfileDeleteName('');
  }, [activeProfile?.description, activeProfile?.model, activeProfile?.name, activeProfile?.provider, config?.defaultModel, config?.provider, runtime.model]);
  const loadProfiles = useCallback(async () => {
    try {
      setProfileBusy('load');
      const [list, active] = await Promise.all([
        apiRequest<{ profiles?: HermesProfileInfo[]; source?: string }>({ path: '/api/profiles', timeoutMs: 12000 }),
        apiRequest<{ active?: string; current?: string }>({ path: '/api/profiles/active', timeoutMs: 12000 }),
      ]);
      const rows = Array.isArray(list.profiles) ? list.profiles : [];
      setProfiles(rows);
      setActiveName(active.active || active.current || 'default');
      setSelectedProfile((current) => rows.some((profile) => profile.name === current) ? current : active.active || rows[0]?.name || 'default');
      setProfileStatus(rows.length > 0 ? 'Profiles 已同步' : '暂无自定义 profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`读取 profiles 失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [apiRequest]);
  const createProfile = useCallback(async () => {
    const name = newProfileName.trim();
    if (!name) {
      setProfileStatus('请输入 profile 名称。');
      return;
    }

    try {
      setProfileBusy('create');
      await apiRequest({
        body: { clone_from_default: true, name },
        method: 'POST',
        path: '/api/profiles',
        timeoutMs: 60000,
      });
      setNewProfileName('');
      setProfileStatus(`${name} 已创建`);
      await loadProfiles();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`创建失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [apiRequest, loadProfiles, newProfileName, refreshInventory]);
  const activateProfile = useCallback(async (name: string) => {
    try {
      setProfileBusy(`activate:${name}`);
      await apiRequest({
        body: { name },
        method: 'POST',
        path: '/api/profiles/active',
        timeoutMs: 20000,
      });
      setActiveName(name);
      setProfileStatus(`${name} 已设为默认 profile`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`切换失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [apiRequest]);
  const copySetupCommand = useCallback(async (name: string) => {
    try {
      setProfileBusy(`copy:${name}`);
      const result = await apiRequest<{ command?: string }>({
        path: `/api/profiles/${encodeURIComponent(name)}/setup-command`,
        timeoutMs: 12000,
      });
      const command = result.command?.trim();
      if (!command) {
        setProfileStatus(`${name} 没有可复制的 setup 命令。`);
        return;
      }
      if (!navigator.clipboard?.writeText) {
        setProfileStatus('当前环境无法访问剪贴板。');
        return;
      }
      await navigator.clipboard.writeText(command);
      setProfileStatus(`${name} setup 命令已复制。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`复制失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [apiRequest]);
  const renameProfile = useCallback(async () => {
    const currentName = activeProfile.name;
    const nextName = profileDraftName.trim();
    if (!nextName || nextName === currentName) {
      setProfileStatus('请输入新的 profile 名称。');
      return;
    }
    if (activeProfile.is_default || currentName === 'default') {
      setProfileStatus('default profile 不能重命名。');
      return;
    }

    try {
      setProfileBusy(`rename:${currentName}`);
      await apiRequest({
        body: { new_name: nextName },
        method: 'PATCH',
        path: `/api/profiles/${encodeURIComponent(currentName)}`,
        timeoutMs: 30000,
      });
      setSelectedProfile(nextName);
      setProfileStatus(`${currentName} 已重命名为 ${nextName}`);
      await loadProfiles();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`重命名失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.is_default, activeProfile.name, apiRequest, loadProfiles, profileDraftName, refreshInventory]);
  const saveProfileDescription = useCallback(async () => {
    try {
      setProfileBusy(`description:${activeProfile.name}`);
      await apiRequest({
        body: { description: profileDescriptionDraft },
        method: 'PUT',
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}/description`,
        timeoutMs: 20000,
      });
      setProfileStatus(`${activeProfile.name} 描述已保存`);
      await loadProfiles();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`描述保存失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.name, apiRequest, loadProfiles, profileDescriptionDraft, refreshInventory]);
  const saveProfileModel = useCallback(async () => {
    const provider = profileProviderDraft.trim();
    const model = profileModelDraft.trim();
    if (!provider || !model) {
      setProfileStatus('请输入 provider 和 model。');
      return;
    }

    try {
      setProfileBusy(`model:${activeProfile.name}`);
      await apiRequest({
        body: { model, provider },
        method: 'PUT',
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}/model`,
        timeoutMs: 30000,
      });
      setProfileStatus(`${activeProfile.name} 模型已保存`);
      await loadProfiles();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`模型保存失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.name, apiRequest, loadProfiles, profileModelDraft, profileProviderDraft, refreshInventory]);
  const loadProfileSoul = useCallback(async () => {
    try {
      setProfileBusy(`soul:load:${activeProfile.name}`);
      const result = await apiRequest<{ content?: string; exists?: boolean }>({
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}/soul`,
        timeoutMs: 20000,
      });
      setProfileSoulDraft(result.content || '');
      setProfileSoulLoadedName(activeProfile.name);
      setProfileStatus(result.exists ? `${activeProfile.name} SOUL 已读取` : `${activeProfile.name} 暂无 SOUL.md，可直接创建。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`SOUL 读取失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.name, apiRequest]);
  const saveProfileSoul = useCallback(async () => {
    try {
      setProfileBusy(`soul:save:${activeProfile.name}`);
      await apiRequest({
        body: { content: profileSoulDraft },
        method: 'PUT',
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}/soul`,
        timeoutMs: 20000,
      });
      setProfileSoulLoadedName(activeProfile.name);
      setProfileStatus(`${activeProfile.name} SOUL 已保存`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`SOUL 保存失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.name, apiRequest, profileSoulDraft]);
  const openProfileTerminal = useCallback(async () => {
    try {
      setProfileBusy(`terminal:${activeProfile.name}`);
      const result = await apiRequest<{ command?: string }>({
        method: 'POST',
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}/open-terminal`,
        timeoutMs: 20000,
      });
      setProfileStatus(`${activeProfile.name} 终端已打开：${result.command || 'setup'}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`打开终端失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.name, apiRequest]);
  const deleteProfile = useCallback(async () => {
    if (activeProfile.is_default || activeProfile.name === 'default') {
      setProfileStatus('default profile 不能删除。');
      return;
    }
    if (pendingProfileDeleteName !== activeProfile.name) {
      setPendingProfileDeleteName(activeProfile.name);
      setProfileStatus(`再次点击删除 ${activeProfile.name}，操作不可恢复。`);
      return;
    }

    try {
      setProfileBusy(`delete:${activeProfile.name}`);
      await apiRequest({
        method: 'DELETE',
        path: `/api/profiles/${encodeURIComponent(activeProfile.name)}`,
        timeoutMs: 30000,
      });
      setSelectedProfile('default');
      setPendingProfileDeleteName('');
      setProfileStatus(`${activeProfile.name} 已删除`);
      await loadProfiles();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setProfileStatus(`删除失败：${message}`);
    } finally {
      setProfileBusy('');
    }
  }, [activeProfile.is_default, activeProfile.name, apiRequest, loadProfiles, pendingProfileDeleteName, refreshInventory]);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  return (
    <section className="pageSurface twoColumnPage">
      <div className="listPanel">
        <div className="panelTitle">
          <h2>工作身份</h2>
          <button type="button" onClick={() => void loadProfiles()} aria-label="刷新 profiles" disabled={Boolean(profileBusy)}>
            <RefreshCw className={profileBusy === 'load' ? 'spinIcon' : undefined} size={15} />
          </button>
        </div>
        <form
          className="inlineCreateForm"
          onSubmit={(event) => {
            event.preventDefault();
            void createProfile();
          }}
        >
          <input
            aria-label="新 profile 名称"
            disabled={Boolean(profileBusy)}
            onChange={(event) => setNewProfileName(event.target.value)}
            placeholder="新 profile"
            value={newProfileName}
          />
          <button type="submit" disabled={Boolean(profileBusy)}>
            {profileBusy === 'create' ? '创建中' : '创建'}
          </button>
        </form>
        {visibleProfiles.map((profile) => (
          <button
            className={profile.name === activeProfile.name ? 'profileRow active' : 'profileRow'}
            type="button"
            key={profile.name}
            onClick={() => {
              setSelectedProfile(profile.name);
              setProfileStatus(`已选择 ${profile.name}`);
            }}
            disabled={Boolean(profileBusy)}
          >
            <div className="profileAvatar">{profile.name[0]}</div>
            <div>
              <strong>{profile.name}</strong>
              <span>{profile.description || `${profile.provider || 'provider 未设置'} · ${profile.model || 'model 未设置'}`}</span>
            </div>
            <em>{profile.name === activeName ? '默认' : profile.gateway_running ? '运行中' : '可用'}</em>
          </button>
        ))}
        {profileStatus && <p className="panelStatus">{profileStatus}</p>}
      </div>
      <div className="detailPanel">
        <div className="detailHero">
          <UsersRound size={26} />
          <div>
            <h2>{activeProfile.name}</h2>
            <p>{activeProfile.path || activeProfile.description || '本机 Hermes profile'}</p>
          </div>
        </div>
        <div className="policyGrid">
          <PolicyCard icon={<Zap />} title="模型" desc={`${activeProfile.provider || config?.provider || 'provider 未设置'} · ${activeProfile.model || config?.defaultModel || runtime.model}`} />
          <PolicyCard icon={<Puzzle />} title="技能" desc={`${activeProfile.skill_count ?? runtime.inventory?.skills.length ?? 0} skills · ${runtime.inventory?.plugins.length ?? 0} plugins`} />
          <PolicyCard icon={<Shield />} title="环境" desc={activeProfile.has_env ? '已配置 .env' : '未检测到 .env'} />
          <PolicyCard icon={<Database />} title="运行策略" desc={`max turns ${config?.maxTurns ?? '未设置'} · timeout ${config?.gatewayTimeout ?? '未设置'}s`} />
        </div>
        <div className="detailActions">
          <button type="button" onClick={() => void activateProfile(activeProfile.name)} disabled={Boolean(profileBusy) || activeProfile.name === activeName}>
            {profileBusy === `activate:${activeProfile.name}` ? '切换中' : activeProfile.name === activeName ? '当前默认' : '设为默认'}
          </button>
          <button type="button" onClick={() => void copySetupCommand(activeProfile.name)} disabled={Boolean(profileBusy)}>
            {profileBusy === `copy:${activeProfile.name}` ? '复制中' : '复制 setup 命令'}
          </button>
          <button type="button" onClick={() => void loadProfiles()} disabled={Boolean(profileBusy)}>
            {profileBusy === 'load' ? '刷新中' : '刷新'}
          </button>
        </div>
        <div className="profileEditGrid">
          <section className="profileEditBlock">
            <div className="blockTitle">
              <strong>基础信息</strong>
              <span>名称与描述会写回 profile meta。</span>
            </div>
            <div className="profileInlineForm">
              <input
                aria-label="Profile 名称"
                className="settingInput"
                disabled={Boolean(profileBusy) || activeProfile.name === 'default' || activeProfile.is_default}
                value={profileDraftName}
                onChange={(event) => setProfileDraftName(event.target.value)}
              />
              <button type="button" onClick={() => void renameProfile()} disabled={Boolean(profileBusy) || activeProfile.name === 'default' || activeProfile.is_default}>
                {profileBusy === `rename:${activeProfile.name}` ? '保存中' : '重命名'}
              </button>
            </div>
            <textarea
              aria-label="Profile 描述"
              disabled={Boolean(profileBusy)}
              value={profileDescriptionDraft}
              onChange={(event) => setProfileDescriptionDraft(event.target.value)}
              placeholder="这个 profile 的职责、路由偏好或使用场景"
            />
            <button type="button" onClick={() => void saveProfileDescription()} disabled={Boolean(profileBusy)}>
              {profileBusy === `description:${activeProfile.name}` ? '保存中' : '保存描述'}
            </button>
          </section>
          <section className="profileEditBlock">
            <div className="blockTitle">
              <strong>模型</strong>
              <span>只影响当前 profile 的 model.default/provider。</span>
            </div>
            <div className="profileInlineForm">
              <input
                aria-label="Profile provider"
                className="settingInput"
                disabled={Boolean(profileBusy)}
                placeholder="provider"
                value={profileProviderDraft}
                onChange={(event) => setProfileProviderDraft(event.target.value)}
              />
              <input
                aria-label="Profile model"
                className="settingInput"
                disabled={Boolean(profileBusy)}
                placeholder="model"
                value={profileModelDraft}
                onChange={(event) => setProfileModelDraft(event.target.value)}
              />
              <button type="button" onClick={() => void saveProfileModel()} disabled={Boolean(profileBusy)}>
                {profileBusy === `model:${activeProfile.name}` ? '保存中' : '保存模型'}
              </button>
            </div>
          </section>
          <section className="profileEditBlock full">
            <div className="blockTitle">
              <strong>SOUL.md</strong>
              <span>{profileSoulLoadedName === activeProfile.name ? '已读取，可编辑后保存。' : '读取后编辑 profile 的长期身份规则。'}</span>
            </div>
            <div className="profileInlineForm">
              <button type="button" onClick={() => void loadProfileSoul()} disabled={Boolean(profileBusy)}>
                {profileBusy === `soul:load:${activeProfile.name}` ? '读取中' : '读取 SOUL'}
              </button>
              <button type="button" onClick={() => void saveProfileSoul()} disabled={Boolean(profileBusy) || profileSoulLoadedName !== activeProfile.name}>
                {profileBusy === `soul:save:${activeProfile.name}` ? '保存中' : '保存 SOUL'}
              </button>
            </div>
            <textarea
              aria-label="Profile SOUL"
              className="soulEditor"
              disabled={Boolean(profileBusy) || profileSoulLoadedName !== activeProfile.name}
              value={profileSoulDraft}
              onChange={(event) => setProfileSoulDraft(event.target.value)}
              placeholder="读取 SOUL 后在这里编辑..."
            />
          </section>
          <section className="profileEditBlock dangerZone">
            <div className="blockTitle">
              <strong>操作</strong>
              <span>打开 setup 终端，或删除非 default profile。</span>
            </div>
            <div className="profileInlineForm">
              <button type="button" onClick={() => void openProfileTerminal()} disabled={Boolean(profileBusy)}>
                {profileBusy === `terminal:${activeProfile.name}` ? '打开中' : '打开终端'}
              </button>
              <button
                className={pendingProfileDeleteName === activeProfile.name ? 'danger confirm' : 'danger'}
                type="button"
                onClick={() => void deleteProfile()}
                disabled={Boolean(profileBusy) || activeProfile.name === 'default' || activeProfile.is_default}
              >
                {pendingProfileDeleteName === activeProfile.name ? '确认删除' : '删除'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function PolicyCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <article className="policyCard">
      {icon}
      <strong>{title}</strong>
      <span>{desc}</span>
    </article>
  );
}

function SkillsSurface({ runtime }: { runtime: HermesRuntime }) {
  const [query, setQuery] = useState('');
  const [skillRows, setSkillRows] = useState<HermesSkillInfo[]>([]);
  const [skillStatus, setSkillStatus] = useState('');
  const [skillBusy, setSkillBusy] = useState('');
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const loadSkills = useCallback(async () => {
    try {
      setSkillBusy('load');
      const response = await apiRequest<HermesSkillInfo[] | { skills?: HermesSkillInfo[]; source?: string }>({ path: '/api/skills', timeoutMs: 12000 });
      const rows = Array.isArray(response) ? response : Array.isArray(response.skills) ? response.skills : [];
      setSkillRows(Array.isArray(rows) ? rows : []);
      setSkillStatus(Array.isArray(rows) ? `已同步 ${rows.length} 个 skills` : 'skills 返回为空');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSkillStatus(`读取 skills 失败：${message}`);
    } finally {
      setSkillBusy('');
    }
  }, [apiRequest]);
  const toggleSkill = useCallback(async (skill: HermesSkillInfo) => {
    const nextEnabled = !(skill.enabled ?? true);
    try {
      setSkillBusy(`toggle:${skill.name}`);
      await apiRequest({
        body: { enabled: nextEnabled, name: skill.name },
        method: 'PUT',
        path: '/api/skills/toggle',
        timeoutMs: 20000,
      });
      setSkillRows((current) => current.map((row) => row.name === skill.name ? { ...row, enabled: nextEnabled } : row));
      setSkillStatus(`${skill.name} 已${nextEnabled ? '启用' : '停用'}`);
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSkillStatus(`更新失败：${message}`);
    } finally {
      setSkillBusy('');
    }
  }, [apiRequest, refreshInventory]);
  const copySkillInfo = useCallback(async (skill: HermesSkillInfo) => {
    const value = skill.path || skill.description || skill.name;
    if (!navigator.clipboard?.writeText) {
      setSkillStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      setSkillBusy(`copy:${skill.name}`);
      await navigator.clipboard.writeText(value);
      setSkillStatus(`${skill.name} 已复制`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSkillStatus(`复制失败：${message}`);
    } finally {
      setSkillBusy('');
    }
  }, []);
  useEffect(() => {
    void loadSkills();
  }, [loadSkills]);
  const fallbackRows: HermesSkillInfo[] = [
    ...(runtime.inventory?.skills.map((skill) => ({
      description: skill.description || skill.path,
      enabled: true,
      name: skill.name,
      path: skill.path,
      source: skill.source,
    })) ?? []),
    ...(runtime.inventory?.plugins.map((plugin) => ({
      description: plugin.path,
      enabled: true,
      name: plugin.name,
      path: plugin.path,
      source: 'plugin',
    })) ?? []),
  ];
  const rows = skillRows.length > 0 ? skillRows : fallbackRows;
  const filteredSkills = rows
    .filter((skill) => {
      const haystack = `${skill.name} ${skill.description || ''} ${skill.path || ''} ${skill.source || ''}`.toLowerCase();
      return !query.trim() || haystack.includes(query.trim().toLowerCase());
    })
    .slice(0, 36);

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>技能库</h2>
          <p>读取本机 Hermes skills 和插件，按真实安装状态管理。</p>
        </div>
        <label className="inlineSearch">
          <Search size={15} />
          <input aria-label="搜索 skill" placeholder="搜索 skill" value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <button className="lightButton" type="button" onClick={() => void loadSkills()} disabled={Boolean(skillBusy)}>
          <RefreshCw className={skillBusy === 'load' ? 'spinIcon' : undefined} size={16} />
          {skillBusy === 'load' ? '刷新中' : '刷新'}
        </button>
      </div>
      {skillStatus && <p className="surfaceStatus">{skillStatus}</p>}
      <div className="skillGrid">
        {filteredSkills.length > 0 ? filteredSkills.map((skill) => (
          <article className="skillCard" key={skill.name}>
            <div className="skillIcon">
              <Puzzle size={20} />
            </div>
            <strong>{skill.name}</strong>
            <p>{skill.description || skill.path || '暂无描述'}</p>
            <div>
              <span className={(skill.enabled ?? true) ? 'pill green' : 'pill amber'}>
                {skill.source || ((skill.enabled ?? true) ? 'enabled' : 'disabled')}
              </span>
              <button type="button" onClick={() => void toggleSkill(skill)} disabled={Boolean(skillBusy)}>
                {skillBusy === `toggle:${skill.name}` ? '更新中' : (skill.enabled ?? true) ? '停用' : '启用'}
              </button>
              <button type="button" onClick={() => void copySkillInfo(skill)} disabled={Boolean(skillBusy)}>
                {skillBusy === `copy:${skill.name}` ? '复制中' : '复制'}
              </button>
            </div>
          </article>
        )) : (
          <article className="skillCard muted">
            <div className="skillIcon">
              <Puzzle size={20} />
            </div>
            <strong>没有匹配的 skill</strong>
            <p>{runtime.inventoryError || '本机 inventory 还没有返回 skill 数据。'}</p>
          </article>
        )}
      </div>
    </section>
  );
}

function CronSurface({ runtime }: { runtime: HermesRuntime }) {
  const config = runtime.inventory?.config;
  const sourceRows = Object.entries(runtime.inventory?.sessions.sources ?? {});
  const [cronJobs, setCronJobs] = useState<HermesCronJobInfo[]>([]);
  const [cronStatus, setCronStatus] = useState('');
  const [newJobName, setNewJobName] = useState('');
  const [newJobSchedule, setNewJobSchedule] = useState('0 9 * * *');
  const [newJobPrompt, setNewJobPrompt] = useState('');
  const [newJobDeliver, setNewJobDeliver] = useState('local');
  const [deliveryTargets, setDeliveryTargets] = useState<HermesCronDeliveryTargetInfo[]>([]);
  const [selectedCronJobId, setSelectedCronJobId] = useState('');
  const [cronDraftName, setCronDraftName] = useState('');
  const [cronDraftSchedule, setCronDraftSchedule] = useState('');
  const [cronDraftPrompt, setCronDraftPrompt] = useState('');
  const [cronDraftDeliver, setCronDraftDeliver] = useState('local');
  const [cronRunsJobId, setCronRunsJobId] = useState('');
  const [cronRuns, setCronRuns] = useState<HermesCronRunInfo[]>([]);
  const [cronBusy, setCronBusy] = useState('');
  const [pendingCronDeleteId, setPendingCronDeleteId] = useState('');
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const loadCronJobs = useCallback(async () => {
    try {
      setCronBusy('load');
      const response = await apiRequest<HermesCronJobInfo[] | { jobs?: HermesCronJobInfo[]; source?: string }>({ path: '/api/cron/jobs', timeoutMs: 20000 });
      const rows = (Array.isArray(response) ? response : Array.isArray(response.jobs) ? response.jobs : [])
        .map((job) => ({
          ...job,
          schedule: typeof job.schedule === 'string' ? job.schedule : String(job.schedule_display || '未设置 schedule'),
        }));
      setCronJobs(rows);
      setCronStatus(`已同步 ${rows.length} 个自动化任务`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`读取 cron 失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest]);
  const loadDeliveryTargets = useCallback(async () => {
    try {
      const response = await apiRequest<{ targets?: HermesCronDeliveryTargetInfo[]; source?: string }>({ path: '/api/cron/delivery-targets', timeoutMs: 20000 });
      const rows = Array.isArray(response.targets) && response.targets.length > 0
        ? response.targets
        : [{ id: 'local', name: 'Local (save only)', home_target_set: true, home_env_var: null }];
      setDeliveryTargets(rows);
      if (!rows.some((item) => item.id === newJobDeliver)) {
        setNewJobDeliver('local');
      }
    } catch {
      setDeliveryTargets([{ id: 'local', name: 'Local (save only)', home_target_set: true, home_env_var: null }]);
    }
  }, [apiRequest, newJobDeliver]);
  const cronJobPath = (job: HermesCronJobInfo, action?: string) => {
    const id = job.id || job.name || '';
    const suffix = action ? `/${action}` : '';
    const profile = job.profile ? `?profile=${encodeURIComponent(job.profile)}` : '';
    return `/api/cron/jobs/${encodeURIComponent(id)}${suffix}${profile}`;
  };
  useEffect(() => {
    if (!pendingCronDeleteId) {
      return undefined;
    }

    const timer = window.setTimeout(() => setPendingCronDeleteId(''), 5000);
    return () => window.clearTimeout(timer);
  }, [pendingCronDeleteId]);
  const loadCronRuns = useCallback(async (job: HermesCronJobInfo) => {
    const id = job.id || job.name;
    if (!id) {
      setCronRuns([]);
      setCronRunsJobId('');
      return;
    }

    try {
      setCronBusy(`runs:${id}`);
      const path = cronJobPath(job, 'runs');
      const response = await apiRequest<{ runs?: HermesCronRunInfo[]; limit?: number }>({
        path: `${path}${path.includes('?') ? '&' : '?'}limit=5`,
        timeoutMs: 20000,
      });
      setCronRuns(Array.isArray(response.runs) ? response.runs : []);
      setCronRunsJobId(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronRuns([]);
      setCronRunsJobId(id);
      setCronStatus(`运行记录读取失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest]);
  const openCronJob = useCallback((job: HermesCronJobInfo) => {
    const id = job.id || job.name || '';
    if (!id) {
      setCronStatus('这个任务缺少 id，无法查看详情。');
      return;
    }
    if (selectedCronJobId === id) {
      setSelectedCronJobId('');
      setCronRuns([]);
      setCronRunsJobId('');
      return;
    }
    setSelectedCronJobId(id);
    setCronDraftName(job.name || '');
    setCronDraftSchedule(job.schedule_display || job.schedule || '0 9 * * *');
    setCronDraftPrompt(job.prompt || '');
    setCronDraftDeliver(job.deliver || 'local');
    void loadCronRuns(job);
  }, [loadCronRuns, selectedCronJobId]);
  const saveCronJob = useCallback(async (job: HermesCronJobInfo) => {
    const id = job.id || job.name;
    const schedule = cronDraftSchedule.trim();
    if (!id) {
      setCronStatus('这个任务缺少 id，无法保存。');
      return;
    }
    if (!schedule) {
      setCronStatus('请输入计划表达式。');
      return;
    }
    if (!cronDraftPrompt.trim()) {
      setCronStatus('请输入自动化 prompt。');
      return;
    }

    try {
      setCronBusy(`save:${id}`);
      await apiRequest({
        body: {
          updates: {
            deliver: cronDraftDeliver || 'local',
            name: cronDraftName.trim(),
            prompt: cronDraftPrompt.trim(),
            schedule,
          },
        },
        method: 'PUT',
        path: cronJobPath(job),
        timeoutMs: 30000,
      });
      setCronStatus(`${cronDraftName.trim() || id} 已保存`);
      await loadCronJobs();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`保存失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest, cronDraftDeliver, cronDraftName, cronDraftPrompt, cronDraftSchedule, loadCronJobs, refreshInventory]);
  const runCronAction = useCallback(async (job: HermesCronJobInfo, action: 'delete' | 'pause' | 'resume' | 'trigger') => {
    const id = job.id || job.name;
    if (!id) {
      setCronStatus('这个任务缺少 id，无法操作。');
      return;
    }
    if (action === 'delete' && pendingCronDeleteId !== id) {
      setPendingCronDeleteId(id);
      setCronStatus(`再次点击删除 ${job.name || id}。`);
      return;
    }

    try {
      if (action === 'delete') {
        setPendingCronDeleteId('');
      }
      setCronBusy(`${action}:${id}`);
      await apiRequest({
        method: action === 'delete' ? 'DELETE' : 'POST',
        path: cronJobPath(job, action === 'delete' ? undefined : action),
        timeoutMs: action === 'trigger' ? 120000 : 30000,
      });
      if (action === 'delete' && selectedCronJobId === id) {
        setSelectedCronJobId('');
        setCronRuns([]);
        setCronRunsJobId('');
      }
      setCronStatus(`${job.name || id} 已${action === 'pause' ? '暂停' : action === 'resume' ? '恢复' : action === 'trigger' ? '触发' : '删除'}`);
      await loadCronJobs();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`操作失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest, loadCronJobs, pendingCronDeleteId, refreshInventory, selectedCronJobId]);
  const runCronRefresh = useCallback(async (key: string, label: string) => {
    try {
      setCronBusy(key);
      setCronStatus(`${label}刷新中...`);
      await refreshInventory();
      setCronStatus(`${label}已刷新`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`${label}刷新失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [refreshInventory]);
  const createCronJob = useCallback(async () => {
    const prompt = newJobPrompt.trim();
    if (!prompt) {
      setCronStatus('请输入自动化 prompt。');
      return;
    }

    try {
      setCronBusy('create');
      await apiRequest({
        body: {
          deliver: newJobDeliver || 'local',
          name: newJobName.trim(),
          prompt,
          schedule: newJobSchedule.trim() || '0 9 * * *',
        },
        method: 'POST',
        path: '/api/cron/jobs?profile=default',
        timeoutMs: 30000,
      });
      setNewJobName('');
      setNewJobPrompt('');
      setCronStatus('自动化任务已创建');
      await loadCronJobs();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`创建失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest, loadCronJobs, newJobDeliver, newJobName, newJobPrompt, newJobSchedule, refreshInventory]);
  useEffect(() => {
    void loadCronJobs();
    void loadDeliveryTargets();
  }, [loadCronJobs, loadDeliveryTargets]);
  const cronDeliveryOptions = deliveryTargets.length > 0
    ? deliveryTargets
    : [{ id: 'local', name: 'Local (save only)', home_target_set: true, home_env_var: null }];
  const cronRunTime = (value?: number | string | null) => {
    if (typeof value === 'number') {
      return formatSessionTime(value);
    }
    return value ? String(value).replace('T', ' ').slice(0, 16) : '最近';
  };
  const jobs = [
    ['Gateway 超时保护', `${config?.gatewayTimeout ?? '未设置'}s · agent.gateway_timeout`, config?.gatewayTimeout ? '启用' : '未设置'],
    ['最大回合数', `${config?.maxTurns ?? '未设置'} · agent.max_turns`, config?.maxTurns ? '启用' : '未设置'],
    ['后台进程', `${runtime.inventory?.diagnostics.processCount ?? 0} 个 Hermes process`, runtime.inventory?.diagnostics.processCount ? '运行中' : '空闲'],
  ];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>自动化</h2>
          <p>展示 Hermes 本机后台调度、超时策略和会话来源。</p>
        </div>
        <button className="lightButton" type="button" onClick={() => void loadCronJobs()} disabled={Boolean(cronBusy)}>
          <RefreshCw className={cronBusy === 'load' ? 'spinIcon' : undefined} size={16} />
          {cronBusy === 'load' ? '刷新中' : '刷新状态'}
        </button>
      </div>
      <form
        className="cronCreateForm"
        onSubmit={(event) => {
          event.preventDefault();
          void createCronJob();
        }}
      >
        <input aria-label="任务名称" disabled={Boolean(cronBusy)} placeholder="任务名称" value={newJobName} onChange={(event) => setNewJobName(event.target.value)} />
        <input aria-label="计划表达式" disabled={Boolean(cronBusy)} placeholder="0 9 * * *" value={newJobSchedule} onChange={(event) => setNewJobSchedule(event.target.value)} />
        <select aria-label="投递目标" disabled={Boolean(cronBusy)} value={newJobDeliver} onChange={(event) => setNewJobDeliver(event.target.value)}>
          {cronDeliveryOptions.map((target) => (
            <option key={target.id} value={target.id}>
              {target.name || target.id}{target.home_target_set === false ? ' · 需配置 home' : ''}
            </option>
          ))}
        </select>
        <input aria-label="自动化 prompt" disabled={Boolean(cronBusy)} placeholder="让 Hermes 做什么..." value={newJobPrompt} onChange={(event) => setNewJobPrompt(event.target.value)} />
        <button type="submit" disabled={Boolean(cronBusy)}>{cronBusy === 'create' ? '创建中' : '新建'}</button>
      </form>
      {cronStatus && <p className="surfaceStatus">{cronStatus}</p>}
      <div className="automationList">
        {cronJobs.map((job) => {
          const id = job.id || job.name || 'cron-job';
          const paused = Boolean(job.paused) || job.enabled === false;
          const confirmingDelete = pendingCronDeleteId === id;
          const expanded = selectedCronJobId === id;
          const deliverLabel = cronDeliveryOptions.find((target) => target.id === (job.deliver || 'local'))?.name || job.deliver || 'local';
          return (
            <article className={[confirmingDelete ? 'automationRow confirmDelete' : 'automationRow', expanded ? 'expanded' : ''].filter(Boolean).join(' ')} key={id}>
              <CalendarClock size={18} />
              <div>
                <strong>{job.name || id}</strong>
                <span>{confirmingDelete ? '再次点击删除，操作不可恢复' : `${job.schedule || '未设置 schedule'} · ${deliverLabel} · ${compactLine(job.prompt || '', 64) || '无 prompt 预览'}`}</span>
              </div>
              <span className={paused ? 'pill amber' : 'pill green'}>{paused ? '已暂停' : '启用'}</span>
              <button
                type="button"
                aria-label="查看自动化任务详情"
                onClick={() => openCronJob(job)}
                disabled={Boolean(cronBusy)}
              >
                <ChevronDown className={expanded ? 'rotatedIcon' : undefined} size={16} />
              </button>
              <button
                type="button"
                aria-label={paused ? '恢复自动化任务' : '暂停自动化任务'}
                onClick={() => void runCronAction(job, paused ? 'resume' : 'pause')}
                disabled={Boolean(cronBusy)}
              >
                {paused ? <Play size={16} /> : <PauseCircle size={16} />}
              </button>
              <button
                type="button"
                aria-label="立即触发自动化任务"
                onClick={() => void runCronAction(job, 'trigger')}
                disabled={Boolean(cronBusy)}
              >
                <Zap size={16} />
              </button>
              <button
                className={confirmingDelete ? 'danger confirm' : undefined}
                type="button"
                aria-label={confirmingDelete ? '确认删除自动化任务' : '删除自动化任务'}
                onClick={() => void runCronAction(job, 'delete')}
                disabled={Boolean(cronBusy)}
              >
                <Trash2 size={16} />
              </button>
              {expanded && (
                <div className="cronEditor">
                  <div className="cronEditorGrid">
                    <label>
                      <span>名称</span>
                      <input aria-label="编辑任务名称" disabled={Boolean(cronBusy)} value={cronDraftName} onChange={(event) => setCronDraftName(event.target.value)} />
                    </label>
                    <label>
                      <span>计划</span>
                      <input aria-label="编辑计划表达式" disabled={Boolean(cronBusy)} value={cronDraftSchedule} onChange={(event) => setCronDraftSchedule(event.target.value)} />
                    </label>
                    <label>
                      <span>投递</span>
                      <select aria-label="编辑投递目标" disabled={Boolean(cronBusy)} value={cronDraftDeliver} onChange={(event) => setCronDraftDeliver(event.target.value)}>
                        {cronDeliveryOptions.map((target) => (
                          <option key={target.id} value={target.id}>
                            {target.name || target.id}{target.home_target_set === false ? ' · 需配置 home' : ''}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="cronPromptEditor">
                    <span>Prompt</span>
                    <textarea aria-label="编辑自动化 prompt" disabled={Boolean(cronBusy)} value={cronDraftPrompt} onChange={(event) => setCronDraftPrompt(event.target.value)} />
                  </label>
                  <div className="cronEditorActions">
                    <button className="rowTextAction" type="button" onClick={() => void saveCronJob(job)} disabled={Boolean(cronBusy)}>
                      {cronBusy === `save:${id}` ? '保存中' : '保存更改'}
                    </button>
                    <button className="rowTextAction" type="button" onClick={() => void loadCronRuns(job)} disabled={Boolean(cronBusy)}>
                      {cronBusy === `runs:${id}` ? '读取中' : '刷新运行记录'}
                    </button>
                    <span>{job.next_run_at || job.next_run ? `下次 ${cronRunTime(job.next_run_at || job.next_run)}` : '暂无下次运行时间'}</span>
                    {job.last_delivery_error && <span className="dangerText">投递失败：{compactLine(job.last_delivery_error, 80)}</span>}
                  </div>
                  <div className="cronRuns">
                    {cronRunsJobId === id && cronRuns.length > 0 ? cronRuns.map((run) => (
                      <button className="cronRunRow" type="button" key={run.id || run.title || cronRunTime(run.started_at)} onClick={() => setCronStatus(`运行记录：${run.title || run.id || '未命名会话'}`)}>
                        <CircleDot size={13} />
                        <strong>{run.title || run.id || 'Cron run'}</strong>
                        <span>{run.is_active ? '运行中' : '已结束'} · {cronRunTime(run.last_active || run.started_at)}</span>
                      </button>
                    )) : (
                      <p className="cronEmptyRuns">{cronRunsJobId === id ? '暂无运行记录。' : '展开后会读取最近运行记录。'}</p>
                    )}
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {jobs.map(([title, meta, status]) => (
          <article className="automationRow" key={title}>
            <CalendarClock size={18} />
            <div>
              <strong>{title}</strong>
              <span>{meta}</span>
            </div>
            <span className={status === '启用' || status === '运行中' ? 'pill green' : status === '空闲' ? 'pill' : 'pill amber'}>{status}</span>
            <button
              className="rowTextAction"
              type="button"
              aria-label={`刷新${title}`}
              disabled={Boolean(cronBusy)}
              onClick={() => void runCronRefresh(`refresh:${title}`, `${title}`)}
            >
              <RefreshCw className={cronBusy === `refresh:${title}` ? 'spinIcon' : undefined} size={14} />
              {cronBusy === `refresh:${title}` ? '刷新中' : '刷新'}
            </button>
          </article>
        ))}
        {sourceRows.map(([source, count]) => (
          <article className="automationRow" key={source}>
            <MessageSquare size={18} />
            <div>
              <strong>{source}</strong>
              <span>{count} 个历史会话</span>
            </div>
            <span className="pill">{count}</span>
            <button
              className="rowTextAction"
              type="button"
              aria-label={`刷新${source}会话来源`}
              disabled={Boolean(cronBusy)}
              onClick={() => void runCronRefresh(`refresh:source:${source}`, `${source} 会话来源`)}
            >
              <RefreshCw className={cronBusy === `refresh:source:${source}` ? 'spinIcon' : undefined} size={14} />
              {cronBusy === `refresh:source:${source}` ? '刷新中' : '刷新'}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MessagingSurface({ runtime }: { runtime: HermesRuntime }) {
  const messaging = runtime.inventory?.messaging;
  const [platformsState, setPlatformsState] = useState<HermesMessagingPlatformInfo[]>([]);
  const [messagingStatus, setMessagingStatus] = useState('');
  const [messagingBusy, setMessagingBusy] = useState('');
  const [selectedMessagingPlatformId, setSelectedMessagingPlatformId] = useState('');
  const [messagingEnvDrafts, setMessagingEnvDrafts] = useState<Record<string, string>>({});
  const [telegramBotName, setTelegramBotName] = useState('Hermes Agent');
  const [telegramAllowedUsers, setTelegramAllowedUsers] = useState('');
  const [telegramOnboarding, setTelegramOnboarding] = useState<TelegramOnboardingState>({ status: 'idle' });
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const loadPlatforms = useCallback(async () => {
    try {
      setMessagingBusy('load');
      const response = await apiRequest<{ platforms?: HermesMessagingPlatformInfo[]; source?: string }>({ path: '/api/messaging/platforms', timeoutMs: 12000 });
      const rows = Array.isArray(response.platforms) ? response.platforms : [];
      setPlatformsState(rows);
      setMessagingStatus(rows.length > 0 ? `已同步 ${rows.length} 个平台` : '暂无平台配置');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`读取平台失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest]);
  const togglePlatform = useCallback(async (platform: HermesMessagingPlatformInfo) => {
    try {
      const nextEnabled = !platform.enabled;
      setMessagingBusy(`toggle:${platform.id}`);
      await apiRequest({
        body: { enabled: nextEnabled },
        method: 'PUT',
        path: `/api/messaging/platforms/${encodeURIComponent(platform.id)}`,
        timeoutMs: 20000,
      });
      setMessagingStatus(`${platform.name} 已${nextEnabled ? '启用' : '停用'}，重启 Gateway 后生效`);
      await loadPlatforms();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`更新失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, loadPlatforms, refreshInventory]);
  const testPlatform = useCallback(async (platform: HermesMessagingPlatformInfo) => {
    try {
      setMessagingBusy(`test:${platform.id}`);
      const result = await apiRequest<{ message?: string; ok?: boolean; state?: string }>({
        method: 'POST',
        path: `/api/messaging/platforms/${encodeURIComponent(platform.id)}/test`,
        timeoutMs: 20000,
      });
      setMessagingStatus(`${platform.name}: ${result.message || result.state || (result.ok ? '连接正常' : '需要检查')}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`测试失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest]);
  const openPlatformDocs = useCallback((platform: HermesMessagingPlatformInfo) => {
    if (!platform.docs_url) {
      setMessagingStatus(`${platform.name} 没有配置文档链接。`);
      return;
    }

    const docsWindow = window.open(platform.docs_url, '_blank', 'noopener,noreferrer');
    setMessagingStatus(docsWindow ? `${platform.name} 文档已打开。` : `${platform.name} 文档可能被浏览器拦截。`);
  }, []);
  const togglePlatformConfig = useCallback((platform: HermesMessagingPlatformInfo) => {
    if (selectedMessagingPlatformId === platform.id) {
      setSelectedMessagingPlatformId('');
      return;
    }
    setSelectedMessagingPlatformId(platform.id);
    setMessagingEnvDrafts({});
    setMessagingStatus(`${platform.name} 配置已展开`);
  }, [selectedMessagingPlatformId]);
  const savePlatformConfig = useCallback(async (platform: HermesMessagingPlatformInfo) => {
    const env: Record<string, string> = {};
    Object.entries(messagingEnvDrafts).forEach(([key, value]) => {
      const trimmed = value.trim();
      if (trimmed) {
        env[key] = trimmed;
      }
    });
    if (Object.keys(env).length === 0) {
      setMessagingStatus('请输入至少一个要保存的配置值。');
      return;
    }

    try {
      setMessagingBusy(`config:${platform.id}`);
      await apiRequest({
        body: { env },
        method: 'PUT',
        path: `/api/messaging/platforms/${encodeURIComponent(platform.id)}`,
        timeoutMs: 30000,
      });
      setMessagingEnvDrafts({});
      setMessagingStatus(`${platform.name} 配置已保存，重启 Gateway 后生效`);
      await loadPlatforms();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`保存配置失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, loadPlatforms, messagingEnvDrafts, refreshInventory]);
  const clearPlatformEnv = useCallback(async (platform: HermesMessagingPlatformInfo, key: string) => {
    try {
      setMessagingBusy(`clear:${platform.id}:${key}`);
      await apiRequest({
        body: { clear_env: [key] },
        method: 'PUT',
        path: `/api/messaging/platforms/${encodeURIComponent(platform.id)}`,
        timeoutMs: 30000,
      });
      setMessagingEnvDrafts((current) => ({ ...current, [key]: '' }));
      setMessagingStatus(`${key} 已清除`);
      await loadPlatforms();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`清除失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, loadPlatforms, refreshInventory]);
  const startTelegramOnboarding = useCallback(async () => {
    try {
      setMessagingBusy('telegram:onboarding:start');
      const result = await apiRequest<{
        deep_link?: string;
        expires_at?: string;
        pairing_id?: string;
        qr_payload?: string;
        suggested_username?: string;
      }>({
        body: { bot_name: telegramBotName.trim() || 'Hermes Agent' },
        method: 'POST',
        path: '/api/messaging/telegram/onboarding/start',
        timeoutMs: 30000,
      });
      setTelegramOnboarding({
        deepLink: result.deep_link,
        expiresAt: result.expires_at,
        pairingId: result.pairing_id,
        qrPayload: result.qr_payload,
        status: 'waiting',
        suggestedUsername: result.suggested_username,
      });
      setMessagingStatus('Telegram 配对已开始，打开链接后返回检查状态。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setTelegramOnboarding({ status: 'error' });
      setMessagingStatus(`Telegram 配对启动失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, telegramBotName]);
  const pollTelegramOnboarding = useCallback(async () => {
    const pairingId = telegramOnboarding.pairingId;
    if (!pairingId) {
      setMessagingStatus('请先开始 Telegram 配对。');
      return;
    }

    try {
      setMessagingBusy('telegram:onboarding:poll');
      const result = await apiRequest<{
        bot_username?: null | string;
        expires_at?: string;
        owner_user_id?: null | string;
        status?: 'waiting' | 'ready';
      }>({
        path: `/api/messaging/telegram/onboarding/${encodeURIComponent(pairingId)}`,
        timeoutMs: 30000,
      });
      setTelegramOnboarding((current) => ({
        ...current,
        botUsername: result.bot_username,
        expiresAt: result.expires_at || current.expiresAt,
        ownerUserId: result.owner_user_id,
        status: result.status === 'ready' ? 'ready' : 'waiting',
      }));
      if (result.owner_user_id) {
        setTelegramAllowedUsers((current) => current || String(result.owner_user_id));
      }
      setMessagingStatus(result.status === 'ready' ? 'Telegram 已就绪，可以应用配置。' : 'Telegram 仍在等待授权。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`检查 Telegram 配对失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, telegramOnboarding.pairingId]);
  const applyTelegramOnboarding = useCallback(async () => {
    const pairingId = telegramOnboarding.pairingId;
    const allowedUserIds = telegramAllowedUsers.split(/[,\s]+/).map((item) => item.trim()).filter(Boolean);
    if (!pairingId) {
      setMessagingStatus('请先开始 Telegram 配对。');
      return;
    }
    if (allowedUserIds.length === 0) {
      setMessagingStatus('请输入允许使用 Telegram bot 的用户 ID。');
      return;
    }

    try {
      setMessagingBusy('telegram:onboarding:apply');
      await apiRequest({
        body: { allowed_user_ids: allowedUserIds },
        method: 'POST',
        path: `/api/messaging/telegram/onboarding/${encodeURIComponent(pairingId)}/apply`,
        timeoutMs: 30000,
      });
      setTelegramOnboarding((current) => ({ ...current, status: 'applied' }));
      setMessagingStatus('Telegram 配置已应用，重启 Gateway 后生效。');
      await loadPlatforms();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`应用 Telegram 配置失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, loadPlatforms, refreshInventory, telegramAllowedUsers, telegramOnboarding.pairingId]);
  const cancelTelegramOnboarding = useCallback(async () => {
    const pairingId = telegramOnboarding.pairingId;
    if (!pairingId) {
      setTelegramOnboarding({ status: 'idle' });
      return;
    }

    try {
      setMessagingBusy('telegram:onboarding:cancel');
      await apiRequest({
        method: 'DELETE',
        path: `/api/messaging/telegram/onboarding/${encodeURIComponent(pairingId)}`,
        timeoutMs: 20000,
      });
      setTelegramOnboarding({ status: 'idle' });
      setMessagingStatus('Telegram 配对已取消。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setMessagingStatus(`取消 Telegram 配对失败：${message}`);
    } finally {
      setMessagingBusy('');
    }
  }, [apiRequest, telegramOnboarding.pairingId]);
  useEffect(() => {
    void loadPlatforms();
  }, [loadPlatforms]);
  const platforms: HermesMessagingPlatformInfo[] = platformsState.length > 0
    ? platformsState
    : messaging?.platforms.map((platform) => ({
      enabled: platform.state !== 'disabled',
      id: platform.name,
      name: platform.name,
      state: platform.state,
      updated_at: platform.updatedAt,
    })) ?? [];
  const channelRows = Object.entries(messaging?.channelCounts ?? {}).filter(([, count]) => count > 0);
  const pairingRows = [
    ['Feishu', messaging?.pairings.feishuApproved ?? 0, messaging?.pairings.feishuPending ?? 0],
    ['Weixin', messaging?.pairings.weixinApproved ?? 0, messaging?.pairings.weixinPending ?? 0],
  ] as const;

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>消息网关</h2>
          <p>管理 Hermes Gateway 平台状态、凭据配置、连接测试和用户配对。</p>
        </div>
        <button className="lightButton" type="button" onClick={() => void loadPlatforms()} disabled={Boolean(messagingBusy)}>
          <RefreshCw className={messagingBusy === 'load' ? 'spinIcon' : undefined} size={16} />
          {messagingBusy === 'load' ? '刷新中' : '刷新平台'}
        </button>
      </div>
      {messagingStatus && <p className="surfaceStatus">{messagingStatus}</p>}
      <div className="gatewayGrid">
        {platforms.length > 0 ? platforms.map((platform) => {
          const isConfigOpen = selectedMessagingPlatformId === platform.id;
          const envVars = platform.env_vars ?? [];
          const missingRequired = envVars.filter((env) => env.required && !env.is_set).map((env) => env.key);
          const stateLabel = platform.state === 'connected'
            ? '已连接'
            : platform.state === 'not_configured'
              ? '待配置'
              : platform.state === 'disabled'
                ? '已停用'
                : platform.state || (platform.enabled ? '待连接' : '已停用');
          const configLabel = platform.configured
            ? '配置完整'
            : missingRequired.length > 0
              ? `缺少 ${missingRequired.length} 项`
              : '待配置';

          return (
            <article className={isConfigOpen ? 'gatewayCard gatewayPlatformCard configOpen' : 'gatewayCard gatewayPlatformCard'} key={platform.id}>
              <div className="gatewayCardHeader">
                <Network size={18} />
                <span className={platform.state === 'connected' ? 'pill green' : platform.enabled ? 'pill amber' : 'pill'}>{stateLabel}</span>
              </div>
            <strong>{platform.name}</strong>
            <p>{messagingPlatformDescriptions[platform.id] || platform.description || `${messaging?.channelCounts[platform.id] ?? 0} 个频道 · ${platform.updated_at || '未记录更新时间'}`}</p>
            <div className="platformMetaLine">
              <span>{configLabel}</span>
              <span>{envVars.length} 项配置</span>
              {platform.error_message && <span className="dangerText">{platform.error_message}</span>}
            </div>
            <div className="cardActions">
              <button aria-expanded={isConfigOpen} type="button" onClick={() => togglePlatformConfig(platform)} disabled={Boolean(messagingBusy)}>
                {isConfigOpen ? '收起配置' : '配置'}
              </button>
              <button type="button" onClick={() => void togglePlatform(platform)} disabled={Boolean(messagingBusy)}>
                {messagingBusy === `toggle:${platform.id}` ? '更新中' : platform.enabled ? '停用' : '启用'}
              </button>
              <button type="button" onClick={() => void testPlatform(platform)} disabled={Boolean(messagingBusy)}>
                {messagingBusy === `test:${platform.id}` ? '测试中' : '测试'}
              </button>
              {platform.docs_url && <button type="button" onClick={() => openPlatformDocs(platform)} disabled={Boolean(messagingBusy)}>文档</button>}
            </div>
            {isConfigOpen && (
              <div className="platformConfig" data-testid={`messaging-config-${platform.id}`}>
                <div className="platformConfigHeader">
                  <div>
                    <strong>平台配置</strong>
                    <span>{platform.enabled ? '保存后重启 Gateway 生效' : '可先保存配置，再启用平台'}</span>
                  </div>
                  <button className="selectButton" type="button" onClick={() => void savePlatformConfig(platform)} disabled={Boolean(messagingBusy)}>
                    {messagingBusy === `config:${platform.id}` ? '保存中' : '保存配置'}
                  </button>
                </div>
                {envVars.length > 0 ? (
                  <div className="platformEnvGrid">
                    {envVars.map((env) => {
                      const isSecret = Boolean(env.password || env.is_password || /TOKEN|SECRET|PASSWORD|KEY/i.test(env.key));
                      return (
                        <label className="platformEnvField" key={env.key}>
                          <span className="platformEnvLabel">
                            <span>{env.prompt || env.key}</span>
                            {env.required && <em>必填</em>}
                            {env.is_set && <em className="set">已保存</em>}
                          </span>
                          <div className="platformEnvInputRow">
                            <input
                              aria-label={`${platform.name} ${env.key}`}
                              className="settingInput"
                              disabled={Boolean(messagingBusy)}
                              onChange={(event) => setMessagingEnvDrafts((current) => ({ ...current, [env.key]: event.target.value }))}
                              placeholder={env.is_set ? (env.redacted_value || '已保存，输入新值覆盖') : (env.description || env.key)}
                              type={isSecret ? 'password' : 'text'}
                              value={messagingEnvDrafts[env.key] ?? ''}
                            />
                            {env.is_set && (
                              <button className="selectButton danger" type="button" onClick={() => void clearPlatformEnv(platform, env.key)} disabled={Boolean(messagingBusy)}>
                                清除
                              </button>
                            )}
                          </div>
                          <small>{env.description || env.key}</small>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="platformConfigEmpty">这个平台暂无可编辑环境变量，仍可启用、停用或测试连接。</p>
                )}
                {platform.id === 'telegram' && (
                  <div className="telegramOnboarding">
                    <div className="platformConfigHeader">
                      <div>
                        <strong>Telegram 快速配对</strong>
                        <span>按官方 onboarding 流程获取 Bot token 并写入允许用户。</span>
                      </div>
                    </div>
                    <div className="telegramOnboardingGrid">
                      <label className="platformEnvField">
                        <span className="platformEnvLabel"><span>Bot 名称</span></span>
                        <input
                          aria-label="Telegram bot 名称"
                          className="settingInput"
                          disabled={Boolean(messagingBusy)}
                          onChange={(event) => setTelegramBotName(event.target.value)}
                          value={telegramBotName}
                        />
                      </label>
                      <button className="selectButton" type="button" onClick={() => void startTelegramOnboarding()} disabled={Boolean(messagingBusy)}>
                        {messagingBusy === 'telegram:onboarding:start' ? '启动中' : '开始配对'}
                      </button>
                      <button className="selectButton" type="button" onClick={() => void pollTelegramOnboarding()} disabled={Boolean(messagingBusy) || !telegramOnboarding.pairingId}>
                        {messagingBusy === 'telegram:onboarding:poll' ? '检查中' : '检查状态'}
                      </button>
                      <button className="selectButton danger" type="button" onClick={() => void cancelTelegramOnboarding()} disabled={Boolean(messagingBusy) || !telegramOnboarding.pairingId}>
                        取消
                      </button>
                    </div>
                    {telegramOnboarding.pairingId && (
                      <div className="telegramPairingStatus">
                        <span>{telegramOnboarding.status === 'ready' ? '已就绪' : telegramOnboarding.status === 'applied' ? '已应用' : telegramOnboarding.status === 'error' ? '失败' : '等待授权'}</span>
                        <code>{telegramOnboarding.pairingId}</code>
                        {telegramOnboarding.expiresAt && <span>过期 {telegramOnboarding.expiresAt}</span>}
                      </div>
                    )}
                    {telegramOnboarding.deepLink && (
                      <a className="platformDocLink" href={telegramOnboarding.deepLink} target="_blank" rel="noreferrer">
                        打开 Telegram 配对链接
                      </a>
                    )}
                    <div className="telegramAllowedRow">
                      <label className="platformEnvField">
                        <span className="platformEnvLabel"><span>允许用户 ID</span><em>数字</em></span>
                        <input
                          aria-label="Telegram allowed users"
                          className="settingInput"
                          disabled={Boolean(messagingBusy)}
                          onChange={(event) => setTelegramAllowedUsers(event.target.value)}
                          placeholder="例如 123456789，多个用逗号分隔"
                          value={telegramAllowedUsers}
                        />
                      </label>
                      <button className="selectButton" type="button" onClick={() => void applyTelegramOnboarding()} disabled={Boolean(messagingBusy) || !telegramOnboarding.pairingId}>
                        {messagingBusy === 'telegram:onboarding:apply' ? '应用中' : '应用配置'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </article>
          );
        }) : (
          <GatewayCard title="Gateway" status={runtime.connectionLabel} desc={runtime.inventoryError || '等待本机 Gateway 状态。'} />
        )}
      </div>
      <section className="routeTable">
        <h3>配对与频道</h3>
        <div className="tableRow head"><span>来源</span><span>已批准</span><span>待批准</span><span>频道</span></div>
        {pairingRows.map(([platform, approved, pending]) => (
          <div className="tableRow" key={platform}>
            <span>{platform}</span>
            <span>{approved}</span>
            <span>{pending}</span>
            <span>{messaging?.channelCounts[platform.toLowerCase()] ?? 0}</span>
          </div>
        ))}
        {channelRows.filter(([name]) => !['feishu', 'weixin'].includes(name)).map(([name, count]) => (
          <div className="tableRow" key={name}>
            <span>{name}</span>
            <span>-</span>
            <span>-</span>
            <span>{count}</span>
          </div>
        ))}
      </section>
    </section>
  );
}

function GatewayCard({ title, status, desc }: { title: string; status: string; desc: string }) {
  return (
    <article className="gatewayCard">
      <div>
        <Network size={20} />
        <span className={status === '已连接' ? 'pill green' : status === '需要密钥' ? 'pill amber' : 'pill'}>{status}</span>
      </div>
      <strong>{title}</strong>
      <p>{desc}</p>
    </article>
  );
}

function SettingsSurface({
  density,
  runtime,
  selected,
  theme,
  onDensityChange,
  onOpenPermission,
  onOpenSurface,
  onSelect,
  onThemeChange,
}: {
  density: UiDensity;
  runtime: HermesRuntime;
  selected: SettingsSection;
  theme: UiTheme;
  onDensityChange: (density: UiDensity) => void;
  onOpenPermission: () => void;
  onOpenSurface: (surface: Surface) => void;
  onSelect: (section: SettingsSection) => void;
  onThemeChange: (theme: UiTheme) => void;
}) {
  return (
    <section className="settingsSurface">
      <aside className="settingsNav" aria-label="设置分类">
        {settingsSections.map((section) => (
          <button
            key={section.id}
            className={selected === section.id ? 'settingNavItem active' : 'settingNavItem'}
            type="button"
            onClick={() => onSelect(section.id)}
          >
            <strong>{section.label}</strong>
            <span>{section.desc}</span>
          </button>
        ))}
      </aside>
      <SettingsPanel
        density={density}
        runtime={runtime}
        selected={selected}
        theme={theme}
        onDensityChange={onDensityChange}
        onOpenPermission={onOpenPermission}
        onOpenSurface={onOpenSurface}
        onSelect={onSelect}
        onThemeChange={onThemeChange}
      />
    </section>
  );
}

function SettingsPanel({
  density,
  runtime,
  selected,
  theme,
  onDensityChange,
  onOpenPermission,
  onOpenSurface,
  onSelect,
  onThemeChange,
}: {
  density: UiDensity;
  runtime: HermesRuntime;
  selected: SettingsSection;
  theme: UiTheme;
  onDensityChange: (density: UiDensity) => void;
  onOpenPermission: () => void;
  onOpenSurface: (surface: Surface) => void;
  onSelect: (section: SettingsSection) => void;
  onThemeChange: (theme: UiTheme) => void;
}) {
  const title = settingsSections.find((item) => item.id === selected)!;
  const config = runtime.inventory?.config;
  const apiRequest = runtime.apiRequest;
  const [settingsBusy, setSettingsBusy] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [modelOptions, setModelOptions] = useState<HermesModelOptionsInfo | null>(null);
  const [modelOptionsLoaded, setModelOptionsLoaded] = useState(false);
  const [selectedModelProvider, setSelectedModelProvider] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('');
  const [toolsets, setToolsets] = useState<HermesToolsetInfo[]>([]);
  const [toolsetsLoaded, setToolsetsLoaded] = useState(false);
  const [expandedToolsetName, setExpandedToolsetName] = useState('');
  const [toolsetConfigs, setToolsetConfigs] = useState<Record<string, HermesToolsetConfigInfo>>({});
  const [toolsetEnvDrafts, setToolsetEnvDrafts] = useState<Record<string, Record<string, string>>>({});
  const [toolsetProviderDrafts, setToolsetProviderDrafts] = useState<Record<string, string>>({});
  const [mcpServers, setMcpServers] = useState<HermesMcpServerInfo[]>([]);
  const [mcpServersLoaded, setMcpServersLoaded] = useState(false);
  const [mcpDraftName, setMcpDraftName] = useState('');
  const [mcpDraftTransport, setMcpDraftTransport] = useState<'http' | 'stdio'>('stdio');
  const [mcpDraftEndpoint, setMcpDraftEndpoint] = useState('');
  const [mcpDraftArgs, setMcpDraftArgs] = useState('');
  const [pendingMcpDeleteName, setPendingMcpDeleteName] = useState('');
  const [gatewayConfig, setGatewayConfig] = useState<HermesOnboardingConfig | null>(null);
  const [gatewayConfigLoaded, setGatewayConfigLoaded] = useState(false);
  const [gatewayModeDraft, setGatewayModeDraft] = useState<'local' | 'remote'>('local');
  const [gatewayRemoteUrlDraft, setGatewayRemoteUrlDraft] = useState('');
  const [gatewayRemoteTokenDraft, setGatewayRemoteTokenDraft] = useState('');
  const [gatewayAutoStartDraft, setGatewayAutoStartDraft] = useState(true);
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const runSettingAction = async (key: string, label: string, action: () => Promise<void>) => {
    try {
      setSettingsBusy(key);
      setSettingsStatus('');
      await action();
      setSettingsStatus(`${label} 已完成`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSettingsStatus(`${label} 失败：${message}`);
    } finally {
      setSettingsBusy('');
    }
  };
  const copyText = async (value: string, label: string) => {
    if (!value) {
      setSettingsStatus(`${label} 暂无可复制内容。`);
      return;
    }
    if (!navigator.clipboard?.writeText) {
      setSettingsStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      setSettingsBusy(`copy:${label}`);
      await navigator.clipboard.writeText(value);
      setSettingsStatus(`${label} 已复制`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSettingsStatus(`${label} 复制失败：${message}`);
    } finally {
      setSettingsBusy('');
    }
  };
  const refreshSettings = (key: string, label: string) => {
    void runSettingAction(key, label, runtime.refreshInventory);
  };
  const restartGateway = () => {
    void runSettingAction('gateway:restart', 'Gateway 重启', runtime.restartGateway);
  };
  const stopGateway = () => {
    void runSettingAction('gateway:stop', 'Gateway 停止', runtime.stopGateway);
  };
  const applyGatewayConfig = useCallback((result: HermesOnboardingConfig) => {
    setGatewayConfig(result);
    setGatewayConfigLoaded(true);
    setGatewayModeDraft(result.mode === 'remote' ? 'remote' : 'local');
    setGatewayRemoteUrlDraft(result.remote_url || '');
    setGatewayRemoteTokenDraft('');
    setGatewayAutoStartDraft(result.auto_start_gateway !== false);
  }, []);
  const loadGatewayConfig = useCallback(async () => {
    try {
      setSettingsBusy('gateway:config:load');
      const result = await apiRequest<HermesOnboardingConfig>({ path: '/api/onboarding/config', timeoutMs: 12000 });
      applyGatewayConfig(result);
      if (selectedRef.current === 'integrations') {
        setSettingsStatus('Gateway 连接配置已读取');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (selectedRef.current === 'integrations') {
        setSettingsStatus(`Gateway 连接配置读取失败：${message}`);
      }
    } finally {
      setSettingsBusy('');
    }
  }, [apiRequest, applyGatewayConfig]);
  const runGatewayConfigAction = useCallback(async (
    key: string,
    label: string,
    action: () => Promise<HermesOnboardingConfig>,
  ) => {
    try {
      setSettingsBusy(key);
      const result = await action();
      applyGatewayConfig(result);
      setSettingsStatus(result.message || `${label} 已完成`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSettingsStatus(`${label} 失败：${message}`);
    } finally {
      setSettingsBusy('');
    }
  }, [applyGatewayConfig]);
  const checkGatewayConfig = useCallback(() => {
    void runGatewayConfigAction('gateway:config:check', 'Gateway 连接检查', () => apiRequest<HermesOnboardingConfig>({
      body: {
        mode: gatewayModeDraft,
        remote_token: gatewayRemoteTokenDraft.trim(),
        remote_url: gatewayRemoteUrlDraft.trim(),
      },
      method: 'POST',
      path: '/api/onboarding/check',
      timeoutMs: 12000,
    }));
  }, [apiRequest, gatewayModeDraft, gatewayRemoteTokenDraft, gatewayRemoteUrlDraft, runGatewayConfigAction]);
  const saveGatewayConfig = useCallback(() => {
    if (gatewayModeDraft === 'remote' && !gatewayRemoteUrlDraft.trim()) {
      setSettingsStatus('请输入远程 Gateway URL。');
      return;
    }

    void runGatewayConfigAction('gateway:config:save', 'Gateway 连接配置保存', async () => {
      const result = await apiRequest<HermesOnboardingConfig>({
        body: {
          auto_start_gateway: gatewayAutoStartDraft,
          mode: gatewayModeDraft,
          remote_token: gatewayRemoteTokenDraft.trim(),
          remote_url: gatewayRemoteUrlDraft.trim(),
        },
        method: 'PUT',
        path: '/api/onboarding/config',
        timeoutMs: 30000,
      });
      await runtime.refreshInventory();
      return result;
    });
  }, [apiRequest, gatewayAutoStartDraft, gatewayModeDraft, gatewayRemoteTokenDraft, gatewayRemoteUrlDraft, runGatewayConfigAction, runtime]);
  const inventoryModelOptions = useMemo<HermesModelOptionsInfo | null>(() => {
    const defaultModel = config?.defaultModel || runtime.model || '';
    const currentProvider = config?.provider
      || runtime.inventory?.models.find((item) => item.model === defaultModel || item.name === defaultModel)?.provider
      || '';
    if (!currentProvider || !defaultModel) {
      return null;
    }

    const modelsByProvider = new Map<string, Set<string>>();
    const providerNames = new Map<string, string>();
    const addModel = (provider: string, model: string, name?: string) => {
      if (!provider || !model) {
        return;
      }
      if (!modelsByProvider.has(provider)) {
        modelsByProvider.set(provider, new Set());
      }
      modelsByProvider.get(provider)?.add(model);
      providerNames.set(provider, name || providerNames.get(provider) || provider);
    };

    runtime.inventory?.models.forEach((item) => {
      addModel(item.provider || currentProvider, item.model || item.name, item.provider || item.name);
    });
    addModel(currentProvider, defaultModel, currentProvider);

    return {
      model: defaultModel,
      provider: currentProvider,
      providers: Array.from(modelsByProvider.entries()).map(([slug, models]) => ({
        authenticated: true,
        models: Array.from(models),
        name: providerNames.get(slug) || slug,
        slug,
      })),
      source: 'desktop-inventory',
    };
  }, [config?.defaultModel, config?.provider, runtime.inventory?.models, runtime.model]);
  useEffect(() => {
    if (!modelOptions && inventoryModelOptions) {
      setModelOptions(inventoryModelOptions);
      setSelectedModelProvider(inventoryModelOptions.provider || '');
      setSelectedModelName(inventoryModelOptions.model || '');
    }
  }, [inventoryModelOptions, modelOptions]);
  const loadModelSettings = useCallback(async () => {
    try {
      setSettingsBusy('models:load');
      const response = await apiRequest<HermesModelOptionsInfo>({ path: '/api/model/options', timeoutMs: 30000 });
      const providers = Array.isArray(response.providers) ? response.providers : [];
      const provider = response.provider || config?.provider || providers[0]?.slug || '';
      const model = response.model || config?.defaultModel || providers.find((item) => item.slug === provider)?.models?.[0] || '';
      setModelOptions({ ...response, providers });
      setModelOptionsLoaded(true);
      setSelectedModelProvider(provider);
      setSelectedModelName(model);
      if (selectedRef.current === 'models') {
        setSettingsStatus(`已同步 ${providers.length} 个模型提供方`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (selectedRef.current === 'models') {
        setSettingsStatus(`模型配置读取失败：${message}`);
      }
    } finally {
      setSettingsBusy('');
    }
  }, [apiRequest, config?.defaultModel, config?.provider]);
  const providerModels = useMemo(() => {
    const provider = modelOptions?.providers?.find((item) => item.slug === selectedModelProvider);
    return Array.isArray(provider?.models) ? provider.models : [];
  }, [modelOptions, selectedModelProvider]);
  const currentModelProvider = modelOptions?.providers?.find((item) => item.slug === selectedModelProvider);
  const saveMainModel = useCallback(async () => {
    if (!selectedModelProvider || !selectedModelName) {
      setSettingsStatus('请选择 provider 和 model。');
      return;
    }

    await runSettingAction('models:save', '默认模型保存', async () => {
      await apiRequest({
        body: {
          model: selectedModelName,
          provider: selectedModelProvider,
          scope: 'main',
        },
        method: 'POST',
        path: '/api/model/set',
        timeoutMs: 30000,
      });
      await runtime.refreshInventory();
    });
  }, [apiRequest, runtime, selectedModelName, selectedModelProvider]);
  const loadToolsets = useCallback(async () => {
    try {
      setSettingsBusy('toolsets:load');
      const rows = await apiRequest<HermesToolsetInfo[]>({ path: '/api/tools/toolsets', timeoutMs: 30000 });
      setToolsets(Array.isArray(rows) ? rows : []);
      setToolsetsLoaded(true);
      if (selectedRef.current === 'permissions') {
        setSettingsStatus(`已同步 ${Array.isArray(rows) ? rows.length : 0} 个 toolsets`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (selectedRef.current === 'permissions') {
        setSettingsStatus(`Toolsets 读取失败：${message}`);
      }
    } finally {
      setSettingsBusy('');
    }
  }, [apiRequest]);
  const toggleToolset = useCallback(async (toolset: HermesToolsetInfo) => {
    const nextEnabled = !toolset.enabled;
    await runSettingAction(`toolset:${toolset.name}`, `${toolset.label || toolset.name} ${nextEnabled ? '启用' : '停用'}`, async () => {
      await apiRequest({
        body: { enabled: nextEnabled },
        method: 'PUT',
        path: `/api/tools/toolsets/${encodeURIComponent(toolset.name)}`,
        timeoutMs: 30000,
      });
      setToolsets((current) => current.map((item) => item.name === toolset.name ? { ...item, enabled: nextEnabled, available: nextEnabled } : item));
      await runtime.refreshInventory();
    });
  }, [apiRequest, runtime]);
  const loadToolsetConfig = useCallback(async (toolset: HermesToolsetInfo, expand = true) => {
    try {
      setSettingsBusy(`toolset:config:${toolset.name}`);
      const configInfo = await apiRequest<HermesToolsetConfigInfo>({
        path: `/api/tools/toolsets/${encodeURIComponent(toolset.name)}/config`,
        timeoutMs: 30000,
      });
      const providers = Array.isArray(configInfo.providers) ? configInfo.providers : [];
      const activeProvider = configInfo.active_provider || providers.find((provider) => provider.is_active)?.name || providers[0]?.name || '';
      setToolsetConfigs((current) => ({ ...current, [toolset.name]: { ...configInfo, providers } }));
      setToolsetProviderDrafts((current) => ({ ...current, [toolset.name]: activeProvider }));
      if (expand) {
        setExpandedToolsetName(toolset.name);
      }
      setSettingsStatus(providers.length > 0 ? `${toolset.label || toolset.name} 配置已同步` : `${toolset.label || toolset.name} 暂无 provider 配置项`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSettingsStatus(`${toolset.label || toolset.name} 配置读取失败：${message}`);
    } finally {
      setSettingsBusy('');
    }
  }, [apiRequest]);
  const saveToolsetProvider = useCallback(async (toolset: HermesToolsetInfo) => {
    const provider = toolsetProviderDrafts[toolset.name] || '';
    if (!provider) {
      setSettingsStatus('请选择 provider。');
      return;
    }

    await runSettingAction(`toolset:provider:${toolset.name}`, `${toolset.label || toolset.name} provider 保存`, async () => {
      await apiRequest({
        body: { provider },
        method: 'PUT',
        path: `/api/tools/toolsets/${encodeURIComponent(toolset.name)}/provider`,
        timeoutMs: 30000,
      });
      await loadToolsetConfig(toolset, true);
      await runtime.refreshInventory();
    });
  }, [apiRequest, loadToolsetConfig, runtime, toolsetProviderDrafts]);
  const saveToolsetEnv = useCallback(async (toolset: HermesToolsetInfo, provider: HermesToolsetProviderInfo) => {
    const draft = toolsetEnvDrafts[toolset.name] || {};
    const env = Object.fromEntries((provider.env_vars || []).map((item) => [item.key, draft[item.key] || '']));
    const hasValue = Object.values(env).some((value) => value.trim());
    if (!hasValue) {
      setSettingsStatus('请输入至少一个新的 env key；已配置的 key 不会被回显。');
      return;
    }

    await runSettingAction(`toolset:env:${toolset.name}`, `${toolset.label || toolset.name} env 保存`, async () => {
      const result = await apiRequest<{ saved?: string[] }>({
        body: { env },
        method: 'PUT',
        path: `/api/tools/toolsets/${encodeURIComponent(toolset.name)}/env`,
        timeoutMs: 30000,
      });
      setToolsetEnvDrafts((current) => ({ ...current, [toolset.name]: {} }));
      await loadToolsetConfig(toolset, true);
      setSettingsStatus(`已保存 ${result.saved?.length ?? 0} 个 env key`);
    });
  }, [apiRequest, loadToolsetConfig, toolsetEnvDrafts]);
  const runToolsetPostSetup = useCallback(async (toolset: HermesToolsetInfo, provider: HermesToolsetProviderInfo) => {
    if (!provider.post_setup) {
      setSettingsStatus(`${provider.name} 没有 post-setup 步骤。`);
      return;
    }

    await runSettingAction(`toolset:post:${toolset.name}`, `${provider.name} post-setup`, async () => {
      await apiRequest({
        body: { key: provider.post_setup },
        method: 'POST',
        path: `/api/tools/toolsets/${encodeURIComponent(toolset.name)}/post-setup`,
        timeoutMs: 30000,
      });
    });
  }, [apiRequest]);
  const loadMcpServers = useCallback(async () => {
    try {
      setSettingsBusy('mcp:load');
      const response = await apiRequest<{ servers?: HermesMcpServerInfo[] }>({ path: '/api/mcp/servers', timeoutMs: 30000 });
      const rows = Array.isArray(response.servers) ? response.servers : [];
      setMcpServers(rows);
      setMcpServersLoaded(true);
      if (selectedRef.current === 'integrations') {
        setSettingsStatus(`已同步 ${rows.length} 个 MCP servers`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (selectedRef.current === 'integrations') {
        setSettingsStatus(`MCP servers 读取失败：${message}`);
      }
    } finally {
      setSettingsBusy('');
    }
  }, [apiRequest]);
  const addMcpServer = useCallback(async () => {
    const name = mcpDraftName.trim();
    const endpoint = mcpDraftEndpoint.trim();
    if (!name) {
      setSettingsStatus('请输入 MCP server 名称。');
      return;
    }
    if (!endpoint) {
      setSettingsStatus(mcpDraftTransport === 'http' ? '请输入 MCP server URL。' : '请输入 MCP server command。');
      return;
    }
    if (mcpDraftTransport === 'http' && !/^https?:\/\//i.test(endpoint)) {
      setSettingsStatus('MCP URL 需要以 http:// 或 https:// 开头。');
      return;
    }

    let args: string[] = [];
    try {
      const text = mcpDraftArgs.trim();
      if (text.startsWith('[')) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('args JSON 必须是数组。');
        }
        args = parsed.map((item) => String(item));
      } else if (text) {
        args = text.split(/\s+/).filter(Boolean);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSettingsStatus(`MCP args 格式错误：${message}`);
      return;
    }

    await runSettingAction('mcp:add', `MCP server ${name} 添加`, async () => {
      await apiRequest({
        body: mcpDraftTransport === 'http'
          ? { name, url: endpoint }
          : { args, command: endpoint, name },
        method: 'POST',
        path: '/api/mcp/servers',
        timeoutMs: 30000,
      });
      setMcpDraftName('');
      setMcpDraftEndpoint('');
      setMcpDraftArgs('');
      await loadMcpServers();
      await runtime.refreshInventory();
    });
  }, [apiRequest, loadMcpServers, mcpDraftArgs, mcpDraftEndpoint, mcpDraftName, mcpDraftTransport, runtime]);
  const toggleMcpServer = useCallback(async (server: HermesMcpServerInfo) => {
    const nextEnabled = !server.enabled;
    await runSettingAction(`mcp:${server.name}`, `${server.name} ${nextEnabled ? '启用' : '停用'}`, async () => {
      await apiRequest({
        body: { enabled: nextEnabled },
        method: 'PUT',
        path: `/api/mcp/servers/${encodeURIComponent(server.name)}/enabled`,
        timeoutMs: 30000,
      });
      setMcpServers((current) => current.map((item) => item.name === server.name ? { ...item, enabled: nextEnabled } : item));
      await runtime.refreshInventory();
    });
  }, [apiRequest, runtime]);
  const deleteMcpServer = useCallback(async (server: HermesMcpServerInfo) => {
    if (pendingMcpDeleteName !== server.name) {
      setPendingMcpDeleteName(server.name);
      setSettingsStatus(`再次点击删除 ${server.name}，操作不可恢复。`);
      return;
    }

    await runSettingAction(`mcp:delete:${server.name}`, `${server.name} 删除`, async () => {
      await apiRequest({
        method: 'DELETE',
        path: `/api/mcp/servers/${encodeURIComponent(server.name)}`,
        timeoutMs: 30000,
      });
      setPendingMcpDeleteName('');
      setMcpServers((current) => current.filter((item) => item.name !== server.name));
      await runtime.refreshInventory();
    });
  }, [apiRequest, pendingMcpDeleteName, runtime]);
  const testMcpServer = useCallback(async (server: HermesMcpServerInfo) => {
    await runSettingAction(`mcp:test:${server.name}`, `${server.name} 测试`, async () => {
      const result = await apiRequest<{ error?: string; ok?: boolean; tools?: Array<{ name?: string }> }>({
        method: 'POST',
        path: `/api/mcp/servers/${encodeURIComponent(server.name)}/test`,
        timeoutMs: 60000,
      });
      if (!result.ok) {
        throw new Error(result.error || 'MCP 测试未通过');
      }
      setSettingsStatus(`${server.name} 连接正常，发现 ${result.tools?.length ?? 0} 个工具`);
    });
  }, [apiRequest]);
  useEffect(() => {
    if (selected === 'models' && !modelOptionsLoaded && !settingsBusy) {
      void loadModelSettings();
    }
    if (selected === 'permissions' && !toolsetsLoaded && !settingsBusy) {
      void loadToolsets();
    }
    if (selected === 'integrations' && !gatewayConfigLoaded && !settingsBusy) {
      void loadGatewayConfig();
    }
    if (selected === 'integrations' && !mcpServersLoaded && !settingsBusy) {
      void loadMcpServers();
    }
  }, [gatewayConfigLoaded, loadGatewayConfig, loadMcpServers, loadModelSettings, loadToolsets, mcpServersLoaded, modelOptionsLoaded, selected, settingsBusy, toolsetsLoaded]);
  const enabledToolsetCount = toolsets.filter((item) => item.enabled).length;
  const enabledMcpCount = mcpServers.filter((item) => item.enabled !== false).length;
  const settingsControlLocked = Boolean(settingsBusy && !settingsBusy.endsWith(':load'));
  const rowsBySection: Record<SettingsSection, Array<{ desc: string; icon: React.ReactNode; title: string; control: React.ReactNode }>> = {
    advanced: [
      { icon: <HardDrive size={18} />, title: 'Hermes Home', desc: runtime.inventory?.diagnostics.hermesHome || '浏览器预览不可用', control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void copyText(runtime.inventory?.diagnostics.hermesHome || '', 'Hermes Home')}>{settingsBusy === 'copy:Hermes Home' ? '复制中' : '复制'}</button> },
      { icon: <TerminalSquare size={18} />, title: 'Gateway PID', desc: String(runtime.inventory?.diagnostics.gatewayPid ?? '-'), control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => refreshSettings('advanced:pid', 'Gateway 状态')}>{settingsBusy === 'advanced:pid' ? '刷新中' : runtime.gatewayStatus}</button> },
      { icon: <RefreshCw size={18} />, title: '刷新本机状态', desc: runtime.inventoryError || '重新读取配置、skills、sessions 和 pairing。', control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => refreshSettings('advanced:refresh', '本机状态刷新')}>{settingsBusy === 'advanced:refresh' ? '刷新中' : '刷新'}</button> },
    ],
    appearance: [
      {
        icon: <Sparkles size={18} />,
        title: '界面密度',
        desc: density === 'compact' ? '紧凑布局已应用到侧栏、页面和输入区。' : '舒适布局已应用，适合长时间阅读。',
        control: (
          <button
            className="selectButton"
            type="button"
            disabled={settingsControlLocked}
            onClick={() => {
              const nextDensity = density === 'comfortable' ? 'compact' : 'comfortable';
              onDensityChange(nextDensity);
              setSettingsStatus(`界面密度已切换为${nextDensity === 'compact' ? '紧凑' : '舒适'}`);
            }}
          >
            {density === 'compact' ? '紧凑' : '舒适'}
          </button>
        ),
      },
      {
        icon: <Monitor size={18} />,
        title: '主题',
        desc: theme === 'soft' ? '柔和主题已应用，降低背景和边界对比。' : '浅色主题已应用，贴近 Codex Desktop 默认观感。',
        control: (
          <button
            className="selectButton"
            type="button"
            disabled={settingsControlLocked}
            onClick={() => {
              const nextTheme = theme === 'light' ? 'soft' : 'light';
              onThemeChange(nextTheme);
              setSettingsStatus(`主题已切换为${nextTheme === 'soft' ? '柔和' : '浅色'}`);
            }}
          >
            {theme === 'soft' ? '柔和' : '浅色'}
          </button>
        ),
      },
    ],
    general: [
      { icon: <Command size={18} />, title: '启动行为', desc: '打开应用后连接本机 Hermes Gateway，并读取最近会话。', control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => runtime.gatewayStatus === 'connected' ? stopGateway() : restartGateway()}>{settingsBusy === 'gateway:stop' || settingsBusy === 'gateway:restart' ? '处理中' : runtime.gatewayStatus === 'connected' ? '停止' : '启动'}</button> },
      { icon: <Database size={18} />, title: '会话', desc: `${runtime.inventory?.sessions.count ?? runtime.recentSessions.length} 个本机会话`, control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => refreshSettings('general:sessions', '会话列表刷新')}>{settingsBusy === 'general:sessions' ? '刷新中' : '刷新'}</button> },
    ],
    integrations: [
      { icon: <Network size={18} />, title: 'Gateway', desc: runtime.connection?.baseUrl || runtime.connectionLabel, control: <div className="settingInlineActions"><button className="selectButton" type="button" disabled={settingsControlLocked} onClick={restartGateway}>{settingsBusy === 'gateway:restart' ? '重启中' : '重启'}</button><button className="selectButton" type="button" disabled={settingsControlLocked} onClick={stopGateway}>{settingsBusy === 'gateway:stop' ? '停止中' : '停止'}</button></div> },
      {
        icon: <SlidersHorizontal size={18} />,
        title: 'Gateway 连接方式',
        desc: gatewayModeDraft === 'remote'
          ? `远程 · ${gatewayRemoteUrlDraft || gatewayConfig?.remote_url || '未填写 URL'}${gatewayConfig?.remote_token_set ? ' · token 已保存' : ''}`
          : `本机 · ${gatewayAutoStartDraft ? '启动时自动复用或启动 Gateway' : '启动时不自动拉起 Gateway'}`,
        control: (
          <form
            className="settingControlStack wide gatewayConfigForm"
            onSubmit={(event) => {
              event.preventDefault();
              saveGatewayConfig();
            }}
          >
            <select
              aria-label="Gateway 连接方式"
              className="settingSelect short"
              disabled={settingsControlLocked}
              value={gatewayModeDraft}
              onChange={(event) => setGatewayModeDraft(event.target.value === 'remote' ? 'remote' : 'local')}
            >
              <option value="local">本机 Gateway</option>
              <option value="remote">远程 Gateway</option>
            </select>
            <input
              aria-label="远程 Gateway URL"
              className="settingInput"
              disabled={settingsControlLocked || gatewayModeDraft !== 'remote'}
              placeholder="https://gateway.example.com"
              value={gatewayRemoteUrlDraft}
              onChange={(event) => setGatewayRemoteUrlDraft(event.target.value)}
            />
            <input
              aria-label="远程 Gateway Token"
              className="settingInput"
              disabled={settingsControlLocked || gatewayModeDraft !== 'remote'}
              placeholder={gatewayConfig?.remote_token_set ? `已保存 ${gatewayConfig.remote_token_preview || 'token'}，留空保持不变` : 'Gateway token'}
              type="password"
              value={gatewayRemoteTokenDraft}
              onChange={(event) => setGatewayRemoteTokenDraft(event.target.value)}
            />
            <label className="settingCheckbox compact">
              <input
                checked={gatewayAutoStartDraft}
                disabled={settingsControlLocked}
                type="checkbox"
                onChange={(event) => setGatewayAutoStartDraft(event.target.checked)}
              />
              <span>自动启动</span>
            </label>
            <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void loadGatewayConfig()}>
              {settingsBusy === 'gateway:config:load' ? '读取中' : '读取'}
            </button>
            <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={checkGatewayConfig}>
              {settingsBusy === 'gateway:config:check' ? '检查中' : '检查'}
            </button>
            <button className="selectButton" type="submit" disabled={settingsControlLocked}>
              {settingsBusy === 'gateway:config:save' ? '保存中' : '保存'}
            </button>
          </form>
        ),
      },
      { icon: <MessageSquare size={18} />, title: '消息平台', desc: `${runtime.inventory?.messaging.platforms.length ?? 0} 个平台状态`, control: <div className="settingInlineActions"><button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => refreshSettings('integrations:messaging', '消息平台刷新')}>{settingsBusy === 'integrations:messaging' ? '刷新中' : '刷新'}</button><button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => onOpenSurface('messaging')}>管理</button></div> },
      { icon: <Puzzle size={18} />, title: 'Plugins', desc: `${runtime.inventory?.plugins.length ?? 0} 个本机插件`, control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => onOpenSurface('skills')}>查看</button> },
      { icon: <Network size={18} />, title: 'MCP Servers', desc: `${enabledMcpCount}/${mcpServers.length} 已启用，配置写入 Hermes mcp_servers。`, control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void loadMcpServers()}>{settingsBusy === 'mcp:load' ? '同步中' : '同步'}</button> },
      {
        icon: <Plus size={18} />,
        title: '添加 MCP Server',
        desc: mcpDraftTransport === 'http' ? 'HTTP/SSE server：填写 URL。' : 'stdio server：填写 command，args 可用空格或 JSON 数组。',
        control: (
          <form
            className="settingControlStack wide mcpCreateForm"
            onSubmit={(event) => {
              event.preventDefault();
              void addMcpServer();
            }}
          >
            <input
              aria-label="MCP server 名称"
              className="settingInput short"
              disabled={settingsControlLocked}
              placeholder="name"
              value={mcpDraftName}
              onChange={(event) => setMcpDraftName(event.target.value)}
            />
            <select
              aria-label="MCP server 类型"
              className="settingSelect short"
              disabled={settingsControlLocked}
              value={mcpDraftTransport}
              onChange={(event) => setMcpDraftTransport(event.target.value === 'http' ? 'http' : 'stdio')}
            >
              <option value="stdio">stdio</option>
              <option value="http">http</option>
            </select>
            <input
              aria-label={mcpDraftTransport === 'http' ? 'MCP server URL' : 'MCP server command'}
              className="settingInput"
              disabled={settingsControlLocked}
              placeholder={mcpDraftTransport === 'http' ? 'https://...' : 'npx'}
              value={mcpDraftEndpoint}
              onChange={(event) => setMcpDraftEndpoint(event.target.value)}
            />
            {mcpDraftTransport === 'stdio' && (
              <input
                aria-label="MCP server args"
                className="settingInput"
                disabled={settingsControlLocked}
                placeholder="-y @scope/server"
                value={mcpDraftArgs}
                onChange={(event) => setMcpDraftArgs(event.target.value)}
              />
            )}
            <button className="selectButton" type="submit" disabled={settingsControlLocked}>
              {settingsBusy === 'mcp:add' ? '添加中' : '添加'}
            </button>
          </form>
        ),
      },
      ...mcpServers.map((server) => ({
        icon: <Network size={18} />,
        title: server.name,
        desc: `${server.transport || 'unknown'} · ${server.url || server.command || '未配置入口'}`,
        control: (
          <div className="settingInlineActions">
            <button
              className={server.enabled === false ? 'toggle' : 'toggle on'}
              type="button"
              aria-label={`${server.enabled === false ? '启用' : '停用'} ${server.name}`}
              disabled={settingsControlLocked}
              onClick={() => void toggleMcpServer(server)}
            >
              <span />
            </button>
            <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void testMcpServer(server)}>
              {settingsBusy === `mcp:test:${server.name}` ? '测试中' : '测试'}
            </button>
            <button
              className={pendingMcpDeleteName === server.name ? 'selectButton danger' : 'selectButton'}
              type="button"
              disabled={settingsControlLocked}
              onClick={() => void deleteMcpServer(server)}
            >
              {pendingMcpDeleteName === server.name ? '确认删除' : '删除'}
            </button>
          </div>
        ),
      })),
    ],
    models: [
      {
        icon: <Zap size={18} />,
        title: '默认模型',
        desc: `${config?.defaultModel || runtime.model} · ${config?.provider || 'provider 未设置'}，保存后影响新会话。`,
        control: (
          <div className="settingControlStack wide">
            <select
              className="settingSelect"
              aria-label="模型提供方"
              value={selectedModelProvider}
              disabled={settingsControlLocked || !modelOptions?.providers?.length}
              onChange={(event) => {
                const provider = event.target.value;
                const models = modelOptions?.providers?.find((item) => item.slug === provider)?.models || [];
                setSelectedModelProvider(provider);
                setSelectedModelName(models[0] || '');
              }}
            >
              {(modelOptions?.providers || []).map((provider) => (
                <option key={provider.slug} value={provider.slug}>{provider.name || provider.slug}</option>
              ))}
            </select>
            <select
              className="settingSelect model"
              aria-label="模型名称"
              value={selectedModelName}
              disabled={settingsControlLocked || providerModels.length === 0}
              onChange={(event) => setSelectedModelName(event.target.value)}
            >
              {providerModels.map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
            <button className="selectButton" type="button" disabled={settingsControlLocked || !selectedModelProvider || !selectedModelName} onClick={() => void saveMainModel()}>
              {settingsBusy === 'models:save' ? '保存中' : '保存'}
            </button>
          </div>
        ),
      },
      {
        icon: <Database size={18} />,
        title: '模型库',
        desc: `${modelOptions?.providers?.length ?? runtime.inventory?.models.length ?? 0} 个 provider · ${currentModelProvider?.authenticated === false ? '需要配置凭据' : '已可选择'}${currentModelProvider?.warning ? ` · ${currentModelProvider.warning}` : ''}`,
        control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void loadModelSettings()}>{settingsBusy === 'models:load' ? '同步中' : '同步'}</button>,
      },
    ],
    permissions: [
      { icon: <Shield size={18} />, title: '命令审批', desc: '高风险命令进入确认队列。', control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={onOpenPermission}>手动确认</button> },
      { icon: <KeyRound size={18} />, title: 'Toolsets', desc: `${enabledToolsetCount}/${toolsets.length || config?.toolsets.length || 0} 已启用，写入 platform_toolsets.cli。`, control: <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void loadToolsets()}>{settingsBusy === 'toolsets:load' ? '同步中' : '同步'}</button> },
      ...toolsets.flatMap((toolset) => {
        const label = toolset.label || toolset.name;
        const configInfo = toolsetConfigs[toolset.name];
        const providers = configInfo?.providers || [];
        const selectedProviderName = toolsetProviderDrafts[toolset.name] || configInfo?.active_provider || providers.find((provider) => provider.is_active)?.name || providers[0]?.name || '';
        const selectedProvider = providers.find((provider) => provider.name === selectedProviderName) || providers[0];
        const envDraft = toolsetEnvDrafts[toolset.name] || {};
        const configOpen = expandedToolsetName === toolset.name;
        const rows: Array<{ desc: string; icon: React.ReactNode; title: string; control: React.ReactNode }> = [
          {
            icon: <Wrench size={18} />,
            title: label,
            desc: `${toolset.name} · ${toolset.description || toolset.tools?.slice(0, 4).join(', ') || 'Hermes toolset'}`,
            control: (
              <div className="settingInlineActions">
                <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => configOpen ? setExpandedToolsetName('') : void loadToolsetConfig(toolset)}>
                  {settingsBusy === `toolset:config:${toolset.name}` ? '读取中' : configOpen ? '收起' : '配置'}
                </button>
                <button
                  className={toolset.enabled ? 'toggle on' : 'toggle'}
                  type="button"
                  aria-label={`${toolset.enabled ? '停用' : '启用'} ${label}`}
                  disabled={settingsControlLocked}
                  onClick={() => void toggleToolset(toolset)}
                >
                  <span />
                </button>
              </div>
            ),
          },
        ];

        if (configOpen) {
          rows.push({
            icon: <SlidersHorizontal size={18} />,
            title: `${label} 配置`,
            desc: providers.length > 0 ? `当前 provider：${configInfo?.active_provider || '未设置'}，env key 只显示配置状态。` : '这个 toolset 没有官方 provider 配置项。',
            control: (
              <div className="toolsetConfigForm">
                {providers.length > 0 && (
                  <div className="toolsetProviderRow">
                    <select
                      aria-label={`${label} provider`}
                      className="settingSelect"
                      disabled={settingsControlLocked}
                      value={selectedProviderName}
                      onChange={(event) => setToolsetProviderDrafts((current) => ({ ...current, [toolset.name]: event.target.value }))}
                    >
                      {providers.map((provider) => (
                        <option key={provider.name} value={provider.name}>{provider.name}{provider.badge ? ` · ${provider.badge}` : ''}</option>
                      ))}
                    </select>
                    <button className="selectButton" type="button" disabled={settingsControlLocked || !selectedProviderName} onClick={() => void saveToolsetProvider(toolset)}>
                      {settingsBusy === `toolset:provider:${toolset.name}` ? '保存中' : '保存 provider'}
                    </button>
                    {selectedProvider?.post_setup && (
                      <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void runToolsetPostSetup(toolset, selectedProvider)}>
                        {settingsBusy === `toolset:post:${toolset.name}` ? '运行中' : 'Post setup'}
                      </button>
                    )}
                  </div>
                )}
                {selectedProvider?.env_vars?.length ? (
                  <div className="toolsetEnvGrid">
                    {selectedProvider.env_vars.map((env) => (
                      <label className="toolsetEnvField" key={env.key}>
                        <span>{env.prompt || env.key}</span>
                        <input
                          aria-label={`${label} ${env.key}`}
                          className="settingInput"
                          disabled={settingsControlLocked}
                          placeholder={env.is_set ? `${env.key} 已配置` : env.default || env.key}
                          type="password"
                          value={envDraft[env.key] || ''}
                          onChange={(event) => setToolsetEnvDrafts((current) => ({
                            ...current,
                            [toolset.name]: {
                              ...(current[toolset.name] || {}),
                              [env.key]: event.target.value,
                            },
                          }))}
                        />
                      </label>
                    ))}
                    <button className="selectButton" type="button" disabled={settingsControlLocked} onClick={() => void saveToolsetEnv(toolset, selectedProvider)}>
                      {settingsBusy === `toolset:env:${toolset.name}` ? '保存中' : '保存 env'}
                    </button>
                  </div>
                ) : (
                  <div className="toolsetConfigHint">当前 provider 不需要额外 env key。</div>
                )}
              </div>
            ),
          });
        }

        return rows;
      }),
    ],
  };
  const rows = rowsBySection[selected];

  return (
    <div className="settingsPanel">
      <div className="panelHeader">
        <button className="iconButton compact" type="button" aria-label="返回" onClick={() => onSelect('general')}>
          <ChevronLeft size={17} />
        </button>
        <div>
          <h2>{title.label}</h2>
          <p>{title.desc}</p>
        </div>
      </div>

      <div className="settingRows">
        {rows.map((row) => (
          <SettingRow key={row.title} icon={row.icon} title={row.title} desc={row.desc} control={row.control} />
        ))}
      </div>
      {settingsStatus && <p className="surfaceStatus settingsStatus" role="status">{settingsStatus}</p>}
    </div>
  );
}

function DiagnosticsSurface({
  runtime,
  onOpenPermission,
}: {
  runtime: HermesRuntime;
  onOpenPermission: () => void;
}) {
  const diagnostics = runtime.inventory?.diagnostics;
  const [diagnosticsBusy, setDiagnosticsBusy] = useState('');
  const [diagnosticsStatus, setDiagnosticsStatus] = useState('');
  const [updateCheck, setUpdateCheck] = useState<HermesUpdateCheckResponse | null>(null);
  const [actionStatus, setActionStatus] = useState<HermesActionStatusResponse | null>(null);
  const runDiagnosticAction = async (key: string, label: string, action: () => Promise<string | void>) => {
    try {
      setDiagnosticsBusy(key);
      setDiagnosticsStatus('');
      const nextStatus = await action();
      setDiagnosticsStatus(nextStatus || `${label} 已完成。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setDiagnosticsStatus(`${label} 失败：${message}`);
    } finally {
      setDiagnosticsBusy('');
    }
  };
  const openPermissionCheck = () => {
    onOpenPermission();
    setDiagnosticsStatus('已打开权限确认面板。');
  };
  const performGatewayAction = async (verb: 'restart' | 'start' | 'stop') => {
    const labels = {
      restart: '重启 Gateway',
      start: '启动 Gateway',
      stop: '停止 Gateway',
    };
    const label = labels[verb];
    await runDiagnosticAction(`gateway:${verb}`, label, async () => {
      const result = await runtime.apiRequest<HermesActionStartResponse>({
        method: 'POST',
        path: `/api/gateway/${verb}`,
        timeoutMs: 45000,
      });
      if (verb === 'stop') {
        await runtime.stopGateway();
      } else if (verb === 'start') {
        await runtime.startGateway();
      } else {
        await runtime.restartGateway();
      }
      await runtime.refreshInventory();
      return `${label} 已发送${result.pid ? ` · pid ${result.pid}` : ''}${result.source ? ` · ${result.source}` : ''}`;
    });
  };
  const checkUpdates = async () => {
    await runDiagnosticAction('update:check', '检查更新', async () => {
      const result = await runtime.apiRequest<HermesUpdateCheckResponse>({
        path: '/api/hermes/update/check?force=true',
        timeoutMs: 60000,
      });
      setUpdateCheck(result);
      return `更新检查完成：${formatUpdateCheckSummary(result)}`;
    });
  };
  const runUpdate = async () => {
    await runDiagnosticAction('update:apply', '执行更新', async () => {
      const result = await runtime.apiRequest<HermesActionStartResponse>({
        method: 'POST',
        path: '/api/hermes/update',
        timeoutMs: 60000,
      });
      if (result.ok === false) {
        throw new Error(result.message || result.error || 'Hermes update 未能启动');
      }
      const status = await runtime.apiRequest<HermesActionStatusResponse>({
        path: '/api/actions/hermes-update/status?lines=30',
        timeoutMs: 15000,
      }).catch(() => null);
      setActionStatus(status);
      return `Hermes 更新已启动${result.pid ? ` · pid ${result.pid}` : ''}`;
    });
  };
  const refreshUpdateStatus = async () => {
    await runDiagnosticAction('update:status', '更新状态', async () => {
      const result = await runtime.apiRequest<HermesActionStatusResponse>({
        path: '/api/actions/hermes-update/status?lines=60',
        timeoutMs: 15000,
      });
      setActionStatus(result);
      return updateActionStatusText(result);
    });
  };
  const copyDiagnosticsSummary = async () => {
    await runDiagnosticAction('copy', '复制诊断摘要', async () => {
      if (!navigator.clipboard?.writeText) {
        throw new Error('当前环境无法访问剪贴板');
      }

      await navigator.clipboard.writeText([
        `Beauty Hermes GUI diagnostics`,
        `Desktop: ${diagnostics?.desktopVersion || 'unknown'}`,
        `Hermes: ${diagnostics?.hermesVersion || 'unknown'}`,
        `Home: ${diagnostics?.hermesHome || 'unknown'}`,
        `Config: ${diagnostics?.configExists ? 'exists' : 'missing'}`,
        `Agent repo: ${diagnostics?.agentRepoExists ? 'exists' : 'missing'}`,
        `Gateway: ${runtime.connectionLabel} / ${runtime.gatewayStatus} / pid ${diagnostics?.gatewayPid ?? runtime.connection?.pid ?? '-'}`,
        `Update: ${formatUpdateCheckSummary(updateCheck)}`,
        `Logs:`,
        ...runtime.logs.slice(0, 12),
      ].join('\n'));
      return '诊断摘要已复制。';
    });
  };
  const updateApplyDisabled = Boolean(diagnosticsBusy) || updateCheck?.can_apply === false;
  const updateCommits = updateCheck?.commits?.slice(0, 4) || [];

  return (
    <section className="pageSurface diagnostics">
      <div className="pageIntro">
        <div>
          <h2>诊断与更新</h2>
          <p>启动、权限、连接、版本和日志问题都可以在这里直接处理。</p>
        </div>
        <div className="diagnosticActionBar">
          <button className="lightButton" type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void runDiagnosticAction('refresh', '重新诊断', runtime.refreshInventory)}>
            <RefreshCw className={diagnosticsBusy === 'refresh' ? 'spinIcon' : undefined} size={15} />
            {diagnosticsBusy === 'refresh' ? '诊断中' : '重新诊断'}
          </button>
          <button className="lightButton" type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void checkUpdates()}>
            <Download className={diagnosticsBusy === 'update:check' ? 'spinIcon' : undefined} size={15} />
            检查更新
          </button>
          <button className="lightButton" type="button" disabled={updateApplyDisabled} onClick={() => void runUpdate()}>
            <Rocket className={diagnosticsBusy === 'update:apply' ? 'spinIcon' : undefined} size={15} />
            {updateCheck?.can_apply === false ? '需手动更新' : '执行更新'}
          </button>
          <button className="lightButton" type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void refreshUpdateStatus()}>
            更新状态
          </button>
        </div>
      </div>
      {diagnosticsStatus && <p className="surfaceStatus" role="status">{diagnosticsStatus}</p>}
      <div className="diagnosticActionBar secondary">
        <button type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void performGatewayAction('start')}>
          <Play size={14} />
          启动 Gateway
        </button>
        <button type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void performGatewayAction('restart')}>
          <RefreshCw className={diagnosticsBusy === 'gateway:restart' ? 'spinIcon' : undefined} size={14} />
          重启 Gateway
        </button>
        <button type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void performGatewayAction('stop')}>
          <PauseCircle size={14} />
          停止 Gateway
        </button>
        <button type="button" disabled={Boolean(diagnosticsBusy)} onClick={openPermissionCheck}>
          <Shield size={14} />
          权限确认
        </button>
        <button type="button" disabled={Boolean(diagnosticsBusy)} onClick={() => void copyDiagnosticsSummary()}>
          <Copy size={14} />
          复制诊断摘要
        </button>
      </div>
      <div className="diagnosticGrid">
        <DiagnosticCard icon={<CheckCircle2 />} title="Desktop shell" desc="Electron IPC bridge 正常" state="正常" />
        <DiagnosticCard
          icon={diagnostics?.configExists ? <CheckCircle2 /> : <AlertTriangle />}
          title="Hermes 配置"
          desc={diagnostics?.configExists ? shortenPath(`${diagnostics.hermesHome}/config.yaml`) : '未找到 config.yaml'}
          state={diagnostics?.configExists ? '正常' : '需要检查'}
        />
        <DiagnosticCard
          icon={diagnostics?.agentRepoExists ? <CheckCircle2 /> : <AlertTriangle />}
          title="Hermes Agent"
          desc={`agent ${diagnostics?.hermesVersion || 'unknown'} · desktop ${diagnostics?.desktopVersion || 'unknown'}`}
          state={diagnostics?.agentRepoExists ? '已安装' : '缺失'}
        />
        <DiagnosticCard
          icon={<HardDrive />}
          title="Gateway"
          desc={`${runtime.connectionLabel} · ${diagnostics?.gatewayState || runtime.gatewayStatus} · pid ${diagnostics?.gatewayPid ?? '-'}`}
          state={runtime.gatewayStatus === 'connected' ? '正常' : '检查'}
        />
      </div>
      <section className="diagnosticPanel">
        <div>
          <span className="panelEyebrow">Hermes 更新</span>
          <strong>{formatUpdateCheckSummary(updateCheck)}</strong>
          {updateCheck?.message && <p>{updateCheck.message}</p>}
          {updateCheck?.update_command && <code>{updateCheck.update_command}</code>}
        </div>
        {updateCommits.length > 0 && (
          <ul>
            {updateCommits.map((commit) => (
              <li key={`${commit.sha}-${commit.summary}`}>
                <span>{commit.sha}</span>
                {compactLine(commit.summary || '', 76)}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="logPanel">
        <h3>最近日志</h3>
        <pre className="terminalBlock"><code>{[
          ...(actionStatus?.lines?.slice(-8) || []),
          ...(runtime.logs.length > 0 ? runtime.logs.slice(0, 10) : [runtime.inventoryError || '暂无 Gateway 日志。']),
        ].join('\n')}</code></pre>
      </section>
    </section>
  );
}

function DiagnosticCard({
  icon,
  title,
  desc,
  state,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  state: string;
}) {
  return (
    <article className="diagnosticCard">
      {icon}
      <strong>{title}</strong>
      <p>{desc}</p>
      <span className="diagnosticState">{state}</span>
    </article>
  );
}

function OnboardingSurface({
  runtime,
  onFinish,
}: {
  runtime: HermesRuntime;
  onFinish: (target: 'chat' | 'diagnostics' | 'integrations') => void;
}) {
  const [selectedMode, setSelectedMode] = useState<OnboardingMode>('local');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [remoteToken, setRemoteToken] = useState('');
  const [providerDraft, setProviderDraft] = useState('');
  const [modelDraft, setModelDraft] = useState('');
  const [autoStartGateway, setAutoStartGateway] = useState(true);
  const [onboardingConfig, setOnboardingConfig] = useState<HermesOnboardingConfig | null>(null);
  const [onboardingBusy, setOnboardingBusy] = useState('');
  const [onboardingStatus, setOnboardingStatus] = useState('');
  const finishTarget = selectedMode === 'remote' ? 'integrations' : selectedMode === 'status' ? 'diagnostics' : 'chat';
  const config = runtime.inventory?.config;
  const diagnostics = runtime.inventory?.diagnostics;
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const startGateway = runtime.startGateway;
  const loadOnboardingConfig = useCallback(async () => {
    try {
      setOnboardingBusy('load');
      const result = await apiRequest<HermesOnboardingConfig>({ path: '/api/onboarding/config', timeoutMs: 12000 });
      setOnboardingConfig(result);
      setSelectedMode(result.mode === 'remote' ? 'remote' : 'local');
      setRemoteUrl(result.remote_url || '');
      setRemoteToken('');
      setProviderDraft(result.provider || config?.provider || '');
      setModelDraft(result.model || config?.defaultModel || runtime.model || '');
      setAutoStartGateway(result.auto_start_gateway !== false);
      setOnboardingStatus('首次启动配置已读取。');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setOnboardingStatus(`读取首次启动配置失败：${message}`);
      setProviderDraft(config?.provider || '');
      setModelDraft(config?.defaultModel || runtime.model || '');
    } finally {
      setOnboardingBusy('');
    }
  }, [apiRequest, config?.defaultModel, config?.provider, runtime.model]);
  const runOnboardingAction = async (key: string, label: string, action: () => Promise<string | void>) => {
    try {
      setOnboardingBusy(key);
      setOnboardingStatus(`${label}处理中...`);
      const message = await action();
      setOnboardingStatus(message || `${label}已完成。`);
    } catch (error) {
      setOnboardingStatus(`${label}失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setOnboardingBusy('');
    }
  };
  const saveOnboardingConfig = () => {
    void runOnboardingAction('save', '保存首次启动配置', async () => {
      const result = await apiRequest<HermesOnboardingConfig>({
        body: {
          auto_start_gateway: autoStartGateway,
          mode: selectedMode === 'remote' ? 'remote' : 'local',
          model: modelDraft.trim(),
          provider: providerDraft.trim(),
          remote_token: remoteToken.trim(),
          remote_url: remoteUrl.trim(),
        },
        method: 'PUT',
        path: '/api/onboarding/config',
        timeoutMs: 30000,
      });
      setOnboardingConfig(result);
      await refreshInventory();
      return result.message || '首次启动配置已保存。';
    });
  };
  const checkOnboarding = () => {
    void runOnboardingAction('check', '检查连接', async () => {
      const result = await apiRequest<HermesOnboardingConfig>({
        body: {
          mode: selectedMode === 'remote' ? 'remote' : 'local',
          remote_token: remoteToken.trim(),
          remote_url: remoteUrl.trim(),
        },
        method: 'POST',
        path: '/api/onboarding/check',
        timeoutMs: 12000,
      });
      setOnboardingConfig(result);
      return result.message || (result.ok ? '检查通过。' : '检查未通过。');
    });
  };
  const startLocalGateway = () => {
    void runOnboardingAction('gateway:start', '启动 Gateway', async () => {
      await startGateway();
      await refreshInventory();
      return 'Gateway 启动请求已发送。';
    });
  };
  const openSetupTerminal = () => {
    void runOnboardingAction('setup:terminal', '打开 setup 终端', async () => {
      const result = await apiRequest<{ command?: string }>({
        method: 'POST',
        path: '/api/profiles/default/open-terminal',
        timeoutMs: 20000,
      });
      return `已打开终端：${result.command || 'hermes setup'}`;
    });
  };

  useEffect(() => {
    void loadOnboardingConfig();
  }, [loadOnboardingConfig]);

  return (
    <section className="onboardingSurface">
      <div className="onboardingPanel">
        <div className="brandMark">
          <img src={hermesAgentLogo} alt="" />
        </div>
        <h2>连接 Hermes 工作方式</h2>
        <p>选择连接方式、确认本机环境，并把默认模型和桌面启动配置保存到 Hermes 配置。</p>
        <div className="choiceGrid">
          <button className={selectedMode === 'local' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('local')}>
            <Monitor size={22} />
            <strong>复用本地 Hermes</strong>
            <span>{diagnostics?.gatewayPid ? `Gateway pid ${diagnostics.gatewayPid}` : '启动或复用本机 Gateway'}</span>
          </button>
          <button className={selectedMode === 'remote' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('remote')}>
            <Network size={22} />
            <strong>连接远程 Gateway</strong>
            <span>保存远程地址并进入集成配置</span>
          </button>
          <button className={selectedMode === 'status' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('status')}>
            <Eye size={22} />
            <strong>查看连接状态</strong>
            <span>确认 Gateway、会话和审批事件</span>
          </button>
        </div>
        <div className="onboardingConfigGrid">
          <label>
            <span>Hermes Home</span>
            <input className="settingInput" readOnly value={onboardingConfig?.hermes_home || diagnostics?.hermesHome || '浏览器预览不可用'} />
          </label>
          <label>
            <span>Provider</span>
            <input className="settingInput" disabled={Boolean(onboardingBusy)} placeholder="provider" value={providerDraft} onChange={(event) => setProviderDraft(event.target.value)} />
          </label>
          <label>
            <span>Model</span>
            <input className="settingInput" disabled={Boolean(onboardingBusy)} placeholder="model" value={modelDraft} onChange={(event) => setModelDraft(event.target.value)} />
          </label>
          <label className={selectedMode === 'remote' ? undefined : 'muted'}>
            <span>远程 Gateway URL</span>
            <input className="settingInput" disabled={Boolean(onboardingBusy) || selectedMode !== 'remote'} placeholder="https://gateway.example.com" value={remoteUrl} onChange={(event) => setRemoteUrl(event.target.value)} />
          </label>
          <label className={selectedMode === 'remote' ? undefined : 'muted'}>
            <span>Gateway Token</span>
            <input
              className="settingInput"
              disabled={Boolean(onboardingBusy) || selectedMode !== 'remote'}
              placeholder={onboardingConfig?.remote_token_set ? `已保存 ${onboardingConfig.remote_token_preview || 'token'}，留空保持不变` : '粘贴远程 Gateway token'}
              type="password"
              value={remoteToken}
              onChange={(event) => setRemoteToken(event.target.value)}
            />
          </label>
        </div>
        <label className="onboardingToggle">
          <input
            checked={autoStartGateway}
            disabled={Boolean(onboardingBusy)}
            type="checkbox"
            onChange={(event) => setAutoStartGateway(event.target.checked)}
          />
          <span>启动应用时自动启动或复用本机 Gateway</span>
        </label>
        <div className="onboardingChecklist" aria-label="首次启动检查">
          <span className={onboardingConfig?.config_exists ?? diagnostics?.configExists ? 'ok' : 'warn'}>配置文件</span>
          <span className={onboardingConfig?.agent_repo_exists ?? diagnostics?.agentRepoExists ? 'ok' : 'warn'}>Hermes Agent</span>
          <span className={runtime.gatewayStatus === 'connected' ? 'ok' : 'warn'}>{runtime.connectionLabel}</span>
          <span>{onboardingConfig?.desktop_config_path ? shortenPath(onboardingConfig.desktop_config_path) : 'desktop.json'}</span>
        </div>
        {onboardingStatus && <p className="surfaceStatus onboardingStatus" role="status">{onboardingStatus}</p>}
        <div className="onboardingActions">
          <button className="lightButton" type="button" disabled={Boolean(onboardingBusy)} onClick={() => void loadOnboardingConfig()}>
            <RefreshCw className={onboardingBusy === 'load' ? 'spinIcon' : undefined} size={15} />
            读取配置
          </button>
          <button className="lightButton" type="button" disabled={Boolean(onboardingBusy)} onClick={checkOnboarding}>
            <Eye size={15} />
            检查连接
          </button>
          <button className="lightButton" type="button" disabled={Boolean(onboardingBusy) || selectedMode !== 'local'} onClick={startLocalGateway}>
            <Play size={15} />
            启动 Gateway
          </button>
          <button className="lightButton" type="button" disabled={Boolean(onboardingBusy)} onClick={openSetupTerminal}>
            <TerminalSquare size={15} />
            Setup
          </button>
          <button className="primaryButtonInline" type="button" disabled={Boolean(onboardingBusy)} onClick={saveOnboardingConfig}>
            {onboardingBusy === 'save' ? '保存中' : '保存配置'}
          </button>
          <button className="primaryButtonInline" type="button" onClick={() => onFinish(finishTarget)}>
            {selectedMode === 'remote' ? '配置集成' : selectedMode === 'status' ? '查看诊断' : '进入工作台'}
          </button>
        </div>
      </div>
    </section>
  );
}

function SettingRow({
  icon,
  title,
  desc,
  control,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="settingRow">
      <div className="settingIcon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <span>{desc}</span>
      </div>
      {control}
    </div>
  );
}

function Toggle({ on, onClick }: { on?: boolean; onClick?: () => void }) {
  return (
    <button className={on ? 'toggle on' : 'toggle'} type="button" aria-label={on ? '已开启' : '已关闭'} onClick={onClick}>
      <span />
    </button>
  );
}

export default App;
