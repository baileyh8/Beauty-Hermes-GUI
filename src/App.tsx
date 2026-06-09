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
  cwd?: null | string;
  id: string;
  last_active?: number;
  message_count?: number;
  model?: null | string;
  preview?: null | string;
  title?: null | string;
}

interface SessionListResponse {
  data?: SessionInfoResponse[];
  sessions?: SessionInfoResponse[];
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
}

interface HermesSkillInfo {
  description?: string;
  enabled?: boolean;
  name: string;
  path?: string;
  source?: string;
}

interface HermesCronJobInfo {
  id?: string;
  name?: string;
  paused?: boolean;
  prompt?: string;
  schedule?: string;
  profile?: string;
  enabled?: boolean;
  next_run?: string;
}

interface HermesMessagingPlatformInfo {
  configured?: boolean;
  description?: string;
  docs_url?: string;
  enabled?: boolean;
  error_message?: string;
  gateway_running?: boolean;
  id: string;
  name: string;
  state?: string;
  updated_at?: string;
  env_vars?: Array<{ is_set?: boolean; key: string; required?: boolean }>;
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
    '/diagnostics': 'diagnostics',
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

function bulletRows(rows: string[], fallback: string) {
  return rows.length > 0 ? rows.map((row) => `- ${row}`).join('\n') : `- ${fallback}`;
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
        '- `/workbench [activity|files|terminal|preview]` 打开右侧工作区',
      ].join('\n'),
    };
  }

  if (['/projects', '/agents', '/settings', '/cron', '/automation', '/messaging', '/diagnostics', '/onboarding', '/chat', '/workbench', '/terminal', '/files', '/preview', '/activity'].includes(name)) {
    const target = localSlashUiTarget(command);
    const surfaceLabel = target?.settingsSection
      ? settingsSections.find((section) => section.id === target.settingsSection)?.label
      : target?.surface;
    const workbenchLabel = target?.workbenchTab ? `，并展开 ${target.workbenchTab} 工作区` : '';

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

    return {
      title: '会话摘要',
      text: [
        `当前模型：**${context.model}**`,
        `工作目录：${context.cwd || '未设置'}`,
        `上下文：${context.contextPercent}% · 1M`,
        `消息：${userCount} 条用户消息，${assistantCount} 条最终结果`,
        `工具：${runningTools} 个运行中，${context.tools.length} 个已记录`,
        `文件：${changedFiles} 个变更条目`,
        `会话：${context.recentSessions.length} 个最近真实会话`,
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
    title: session.title || session.preview || '未命名会话',
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
      setCwd(compactCwd(info.cwd));
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
        const beforeId = assistantMessageIdRef.current;
        const beforeIndex = beforeId ? next.findIndex((item) => item.id === beforeId) : -1;
        next.splice(beforeIndex >= 0 ? beforeIndex : next.length, 0, message);
        return next;
      });
    },
    [],
  );

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

          setMessages((current) => {
            const index = current.findIndex((item) => item.id === id);
            if (index === -1) {
              return finalText
                ? [
                    ...current,
                    {
                      id,
                      kind: 'assistant',
                      sessionId,
                      status: payload.status === 'error' ? 'error' : 'done',
                      text: finalText,
                      title: '最终结果',
                    },
                  ]
                : current;
            }

            const next = [...current];
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
          setStatusText(payload.status === 'error' ? '回复中断' : '就绪');
          break;
        }
        case 'thinking.delta':
        case 'status.update': {
          const text = normalizeStatusText(coerceGatewayText(payload) || textFromUnknown(payload.kind));
          if (text) {
            setStatusText(text);
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
              const beforeId = assistantMessageIdRef.current;
              const beforeIndex = beforeId ? next.findIndex((item) => item.id === beforeId) : -1;
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
              status: 'running',
              text: existing?.text ?? '',
              title: '推理过程',
            };
            const next = index >= 0 ? current.filter((_, itemIndex) => itemIndex !== index) : [...current];
            const beforeId = assistantMessageIdRef.current;
            const beforeIndex = beforeId ? next.findIndex((item) => item.id === beforeId) : -1;
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
          const id = makeId('approval');
          const request = { command, description, messageId: id, sessionId };

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
    [appendToMessage, appendToolDigest, patchRuntimeInfo, upsertMessage],
  );

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

      setRecentSessionItems((current) => promoteSidebarItem(current, storedSessionId));
      setSelectedStoredSessionId(storedSessionId);
      selectedStoredSessionIdRef.current = storedSessionId;
      setActiveSessionId(null);
      activeSessionIdRef.current = null;
      assistantMessageIdRef.current = null;
      reasoningMessageIdRef.current = null;
      statusMessageIdRef.current = null;
      toolDigestMessageIdRef.current = null;
      setStatusText('正在加载会话');
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
    [resumeRuntimeSession, upsertMessage],
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

      await window.hermesDesktop.api({
        body: { archived: true },
        method: 'PATCH',
        path: `/api/sessions/${encodeURIComponent(item.id)}`,
        timeoutMs: 30000,
      });
      setRecentSessionItems((current) => current.filter((row) => row.id !== item.id));
      setStatusText('会话已归档');
      void refreshSessionList().catch((error) => {
        setLogs((current) => [`Session refresh error: ${error instanceof Error ? error.message : String(error)}`, ...current].slice(0, 120));
      });
      void refreshInventory();
    },
    [refreshInventory, refreshSessionList],
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
      if (selectedStoredSessionIdRef.current === item.id && activeRuntimeId && client?.connectionState === 'open') {
        await client.request('session.close', { session_id: activeRuntimeId }, 15000).catch(() => undefined);
      }

      await window.hermesDesktop.api({
        method: 'DELETE',
        path: `/api/sessions/${encodeURIComponent(item.id)}`,
        timeoutMs: 30000,
      });
      setRecentSessionItems((current) => current.filter((row) => row.id !== item.id));
      if (selectedStoredSessionIdRef.current === item.id) {
        setSelectedStoredSessionId(null);
        selectedStoredSessionIdRef.current = null;
        setActiveSessionId(null);
        activeSessionIdRef.current = null;
        assistantMessageIdRef.current = null;
        reasoningMessageIdRef.current = null;
        statusMessageIdRef.current = null;
        toolDigestMessageIdRef.current = null;
        setMessages([]);
      }
      setStatusText('会话已删除');
      void refreshSessionList().catch((error) => {
        setLogs((current) => [`Session refresh error: ${error instanceof Error ? error.message : String(error)}`, ...current].slice(0, 120));
      });
      void refreshInventory();
    },
    [refreshInventory, refreshSessionList],
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

function App() {
  const runtime = useHermesRuntime();
  const [surface, setSurface] = useState<Surface>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('activity');
  const [uiDensity, setUiDensity] = useState<UiDensity>('comfortable');
  const [uiTheme, setUiTheme] = useState<UiTheme>('light');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [approvalVariant, setApprovalVariant] = useState<ApprovalVariant | null>(null);
  const [deniedRecovery, setDeniedRecovery] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');
  const [hiddenSidebarKeys, setHiddenSidebarKeys] = useState<string[]>([]);
  const [notice, setNotice] = useState('');

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
    () => runtime.recentSessions.filter((item) => !hiddenSidebarKeys.includes(item.id || item.title)),
    [hiddenSidebarKeys, runtime.recentSessions],
  );
  const visibleProjectItems = useMemo(
    () => projectItems.filter((item) => !hiddenSidebarKeys.includes(item.id || item.title)),
    [hiddenSidebarKeys, projectItems],
  );
  const showWorkbench = surface === 'chat';
  const hideSidebarItem = useCallback((item: SidebarItem) => {
    const key = item.id || item.title;
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
    if (!item.id) {
      if (window.confirm(`从侧边栏隐藏“${item.title}”？`)) {
        hideSidebarItem(item);
      }
      return;
    }

    if (!window.confirm(`删除真实 Hermes 会话“${item.title}”？这个操作不可恢复。`)) {
      return;
    }

    void runtime.deleteSession(item)
      .then(() => showNotice(`${item.title} 已删除`))
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        showNotice(`删除失败：${message}`);
      });
  }, [hideSidebarItem, runtime, showNotice]);

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
        onSurfaceChange={setSurface}
        onOpenCommand={() => setCommandOpen(true)}
        onSelectSession={(sessionId) => {
          setSurface('chat');
          void runtime.selectSession(sessionId);
        }}
        onArchiveItem={handleArchiveItem}
        onDeleteItem={handleDeleteItem}
        onMoreItem={(item) => {
          setCommandQuery(item.title);
          setCommandOpen(true);
        }}
        recentItems={visibleRecentItems}
        projectItems={visibleProjectItems}
        selectedStoredSessionId={runtime.selectedStoredSessionId}
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
            onOpenChat={() => setSurface('chat')}
            onOpenDiagnostics={() => setSurface('diagnostics')}
            onOpenProjectMenu={(projectTitle) => {
              setCommandQuery(projectTitle);
              setCommandOpen(true);
            }}
            onOpenSettings={() => setSurface('settings')}
          />
        )}
        {surface === 'agents' && <AgentsSurface runtime={runtime} onOpenApproval={() => setApprovalVariant('risk')} onOpenChat={() => setSurface('chat')} />}
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
            onOpenApproval={setApprovalVariant}
            runtime={runtime}
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
          onNavigate={(nextSurface) => {
            setSurface(nextSurface);
            setCommandOpen(false);
          }}
          onOpenWorkbenchTab={(tab) => {
            setRightOpen(true);
            setWorkbenchTab(tab);
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
          variant={approvalVariant}
          onClose={() => setApprovalVariant(null)}
          onDeny={() => {
            setApprovalVariant(null);
            setDeniedRecovery(true);
            setSurface('chat');
            setRightOpen(true);
            setWorkbenchTab('activity');
          }}
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
  onSurfaceChange,
  onOpenCommand,
  onArchiveItem,
  onDeleteItem,
  onMoreItem,
  onSelectSession,
  projectItems,
  recentItems,
  selectedStoredSessionId,
  statusText,
}: {
  activeSessionId: null | string;
  activeSurface: Surface;
  gatewayStatus: GatewayStatus;
  model: string;
  onSurfaceChange: (surface: Surface) => void;
  onOpenCommand: () => void;
  onArchiveItem: (item: SidebarItem) => void;
  onDeleteItem: (item: SidebarItem) => void;
  onMoreItem: (item: SidebarItem) => void;
  onSelectSession: (sessionId: string) => void;
  projectItems: SidebarItem[];
  recentItems: SidebarItem[];
  selectedStoredSessionId: null | string;
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

      <button className="primaryButton" type="button" onClick={() => onSurfaceChange('chat')}>
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
          selectedSessionId={selectedStoredSessionId || activeSessionId}
        />
        <ProjectSection
          items={projectItems}
          onOpenProjects={() => onSurfaceChange('projects')}
          onArchiveItem={onArchiveItem}
          onDeleteItem={onDeleteItem}
          onMoreItem={onMoreItem}
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
          selectedSessionId={selectedStoredSessionId || activeSessionId}
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
  selectedSessionId,
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
  selectedSessionId: null | string;
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
}: {
  items: SidebarItem[];
  onArchiveItem: (item: SidebarItem) => void;
  onDeleteItem: (item: SidebarItem) => void;
  onMoreItem: (item: SidebarItem) => void;
  onOpenProjects: () => void;
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
  muted,
  onArchive,
  onDelete,
  onMore,
  onSelect,
}: {
  item: SidebarItem;
  active?: boolean;
  muted?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  onSelect: () => void;
}) {
  return (
    <div className={active ? 'sessionRow active' : 'sessionRow'}>
      <button className="sessionMain" data-session-id={item.id} type="button" onClick={onSelect}>
        <span className={`statusDot ${item.color ?? (muted ? 'gray' : 'blue')}`} />
        <span className="sessionText">
          <strong>{item.title}</strong>
          <span>{item.meta}</span>
        </span>
      </button>
      <div className="rowActions" aria-label="会话操作">
        <button
          type="button"
          aria-label="归档"
          title="归档"
          onClick={(event) => {
            event.stopPropagation();
            onArchive?.();
          }}
        >
          <Archive size={14} />
        </button>
        <button
          type="button"
          aria-label="删除"
          title="删除"
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
      <div className="messageStack" ref={messageStackRef}>
        {runtime.messages.length === 0 && (
          <EmptyConversation
            gatewayStatus={runtime.gatewayStatus}
            model={runtime.model}
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
  statusText,
}: {
  gatewayStatus: GatewayStatus;
  model: string;
  statusText: string;
}) {
  const ready = gatewayStatus === 'connected';

  return (
    <div className="emptyConversation">
      <div className="emptyMark">
        <img src={hermesAgentLogo} alt="" />
      </div>
      <h2>{ready ? 'Hermes 已就绪' : '正在准备 Hermes'}</h2>
      <p>{ready ? `当前模型 ${model}，可以直接发送任务。` : statusText}</p>
      <div className="emptyHints" aria-label="可开始的任务">
        <span>让 Hermes 检查一个项目</span>
        <span>读取文件并总结</span>
        <span>运行命令前会请求审批</span>
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

function renderInlineMarkdown(text: string) {
  const nodes: React.ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
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
    } else {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    }
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function MarkdownText({ className, text }: { className?: string; text: string }) {
  const value = cleanDisplayText(text).trim();
  if (!value) {
    return null;
  }

  const blocks: Array<{ kind: 'code' | 'list' | 'paragraph'; lines: string[] }> = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ kind: 'paragraph', lines: paragraph });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      blocks.push({ kind: 'list', lines: list });
      list = [];
    }
  };

  value.split('\n').forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (code) {
        blocks.push({ kind: 'code', lines: code });
        code = null;
      } else {
        flushParagraph();
        flushList();
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
      return;
    }

    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      return;
    }

    flushList();
    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  if (code) {
    blocks.push({ kind: 'code', lines: code });
  }

  return (
    <div className={className ? `markdownText ${className}` : 'markdownText'}>
      {blocks.map((block, index) => {
        if (block.kind === 'code') {
          return <pre key={index}><code>{block.lines.join('\n')}</code></pre>;
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
  const phaseText = isReasoning ? reasoningPhaseText(message) : '';
  const detailsText = isTool ? (message.details || message.command) : (message.details || message.command || message.text);
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
      { desc: '打开设置页', icon: <Settings size={16} />, insert: '/settings', title: '/settings' },
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
  const slashOpen = visibleSlashOptions.length > 0;

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
    <div className="slashMenu" role="listbox" aria-label="斜杠指令">
      {options.map((option, index) => (
        <button
          className={index === selectedIndex ? 'slashItem selected' : 'slashItem'}
          key={option.title}
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
  onOpenApproval,
  runtime,
}: {
  activeTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
  onCollapse: () => void;
  onOpenApproval: (variant: ApprovalVariant) => void;
  runtime: HermesRuntime;
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

      {activeTab === 'activity' && <WorkbenchActivity onOpenApproval={onOpenApproval} runtime={runtime} />}
      {activeTab === 'files' && <WorkbenchFiles files={runtime.files} />}
      {activeTab === 'terminal' && <WorkbenchTerminal logs={runtime.logs} onStop={runtime.stopGateway} />}
      {activeTab === 'preview' && <WorkbenchPreview runtime={runtime} />}
    </aside>
  );
}

function WorkbenchActivity({
  onOpenApproval,
  runtime,
}: {
  onOpenApproval: (variant: ApprovalVariant) => void;
  runtime: HermesRuntime;
}) {
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
            <WorkbenchItem key={item.id} detail={item.detail} state={item.state} label={item.label} value={item.value} />
          ))
        ) : (
          <div className="railEmpty">工具调用会在运行任务时出现。</div>
        )}
      </section>
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

function WorkbenchFiles({ files }: { files: GatewayFileItem[] }) {
  const [copyBusy, setCopyBusy] = useState('');
  const [copyStatus, setCopyStatus] = useState('');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const selectedFile = files[selectedFileIndex] || files[0];
  const diffSummary = selectedFile
    ? `${selectedFile.change === 'add' ? '+' : '~'} ${selectedFile.label} · ${selectedFile.meta}`
    : '等待 Hermes 返回文件变更。';

  const copySummary = async (kind: 'entry' | 'summary') => {
    const label = kind === 'entry' ? '条目' : '摘要';
    if (!navigator.clipboard?.writeText) {
      setCopyStatus('当前环境无法访问剪贴板。');
      return;
    }

    try {
      setCopyBusy(kind);
      setCopyStatus('');
      await navigator.clipboard.writeText(diffSummary);
      setCopyStatus(`Diff ${label}已复制。`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCopyStatus(`复制失败：${message}`);
    } finally {
      setCopyBusy('');
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
        <h3>Diff 摘要</h3>
        <pre className="miniCode"><code>{diffSummary}</code></pre>
        <div className="workbenchActions">
          <button type="button" onClick={() => void copySummary('summary')} disabled={Boolean(copyBusy)}>
            {copyBusy === 'summary' ? '复制中' : '复制摘要'}
          </button>
          <button type="button" onClick={() => void copySummary('entry')} disabled={Boolean(copyBusy)}>
            {copyBusy === 'entry' ? '复制中' : '复制条目'}
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

function WorkbenchPreview({ runtime }: { runtime: HermesRuntime }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const previewText = runtime.connection?.baseUrl
    ? `Gateway: ${runtime.connection.baseUrl}`
    : '连接 Hermes Gateway 后，预览和外部产物会显示在这里。';
  const refreshPreview = async () => {
    try {
      setBusy(true);
      setStatus('');
      await runtime.refreshInventory();
      setStatus(runtime.connection?.baseUrl ? '预览状态已刷新。' : '已刷新，本机 Gateway 暂无可打开地址。');
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

  return (
    <>
      <section className="previewPanel">
        <div className="previewEmpty">
          <Eye size={22} />
          <strong>暂无预览产物</strong>
          <span>{previewText}</span>
        </div>
      </section>
      <section className="railSection">
        <h3>预览产物</h3>
        <p>{previewText}</p>
        <div className="workbenchActions">
          <button type="button" onClick={() => void refreshPreview()} disabled={busy}>
            {busy ? '刷新中' : '刷新'}
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
  detail,
  state,
  label,
  value,
}: {
  detail?: string;
  state: 'done' | 'running' | 'pending';
  label: string;
  value: string;
}) {
  return (
    <div className="workbenchItem">
      <span className={`${state}Mark`} />
      <div className="workbenchItemText">
        <strong>{label}</strong>
        {detail && <small>{detail}</small>}
      </div>
      <em>{value}</em>
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
  onNavigate,
  onOpenWorkbenchTab,
  onOpenApproval,
  onOpenSettingsSection,
  runtime,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onNavigate: (surface: Surface) => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
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
        run: () => onNavigate('chat'),
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
          void runtime.submitPrompt(queryText);
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
  }, [onClose, onNavigate, onOpenApproval, onOpenSettingsSection, onOpenWorkbenchTab, query, runtime]);
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
  variant,
  onClose,
  onDeny,
}: {
  variant: ApprovalVariant;
  onClose: () => void;
  onDeny: () => void;
}) {
  const [modalStatus, setModalStatus] = useState('');
  const content = {
    risk: {
      icon: <Shield size={24} />,
      title: '确认高风险命令',
      desc: 'Hermes 需要运行桌面端测试来确认 approval UI 的行为是否完整。',
      code: 'npm run test:desktop -- --approval-ui --update-snapshots',
      details: ['cwd: 当前工作区', '来源: Hermes Agent', '可能修改: 本地文件', '恢复: 可回滚生成物'],
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
          <button className="secondaryButton" type="button" onClick={onDeny}>
            拒绝
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
              <button className="secondaryButton" type="button" onClick={() => setModalStatus('已允许本次命令。')}>
                本次允许
              </button>
              <button className="primaryButtonInline" type="button" onClick={() => setModalStatus('已允许并记住当前项目。')}>
                允许并记住当前项目
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
  onOpenChat,
  onOpenDiagnostics,
  onOpenProjectMenu,
  onOpenSettings,
}: {
  runtime: HermesRuntime;
  onOpenChat: () => void;
  onOpenDiagnostics: () => void;
  onOpenProjectMenu: (projectTitle: string) => void;
  onOpenSettings: () => void;
}) {
  const [projectBusy, setProjectBusy] = useState<null | string>(null);
  const [projectStatus, setProjectStatus] = useState('');
  const gatewayReady = runtime.gatewayStatus === 'connected';
  const runProjectAction = async (
    key: string,
    label: string,
    action: () => Promise<void> | void,
    doneMessage: string,
  ) => {
    setProjectBusy(key);
    setProjectStatus(`${label}处理中...`);
    try {
      await action();
      setProjectStatus(doneMessage);
    } catch (error) {
      setProjectStatus(`${label}失败：${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setProjectBusy(null);
    }
  };

  const projectCards = [
    {
      action: '打开会话',
      icon: <Folder size={20} />,
      key: 'workspace',
      meta: runtime.cwd ? shortenPath(runtime.cwd) : '尚未从会话读取工作目录',
      onClick: () => runProjectAction('workspace', '本地工作区', onOpenChat, '本地工作区已打开。'),
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
      action: runtime.recentSessions.length > 0 ? '查看最近' : '新建任务',
      icon: <MessageSquare size={20} />,
      key: 'sessions',
      meta: runtime.recentSessions.length > 0 ? `${runtime.recentSessions.length} 个最近会话` : '还没有真实会话记录',
      onClick: () => runProjectAction('sessions', '会话入口', onOpenChat, '会话入口已打开。'),
      stats: runtime.recentSessions.slice(0, 2).map((item) => item.title),
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
  const runningCards = runningTools.length > 0
    ? runningTools.map((tool) => (
      <AgentCard
        key={tool.id}
        title={tool.label}
        status="运行中"
        desc="工具正在执行，输出会同步到聊天和右侧活动。"
        meta={tool.detail || tool.value}
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
      />
    )];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>Agents</h2>
          <p>运行中工具、待确认命令和最近完成事件集中在这里。</p>
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
}: {
  desc: string;
  title: string;
  status: string;
  meta: string;
  danger?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  const className = `${muted ? 'agentCard muted' : 'agentCard'}${onClick ? '' : ' static'}`;
  const content = (
    <>
      <div className="cardHead">
        <strong>{title}</strong>
        <span className={danger ? 'pill red' : 'pill'}>{status}</span>
      </div>
      <p>{desc}</p>
      <div className="cardFoot">
        <span>{meta}</span>
        {onClick && <ChevronRight size={14} />}
      </div>
    </>
  );

  if (!onClick) {
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
      skill_count: runtime.inventory?.skills.length ?? 0,
    },
  ];
  const [profiles, setProfiles] = useState<HermesProfileInfo[]>([]);
  const [activeName, setActiveName] = useState('default');
  const [selectedProfile, setSelectedProfile] = useState('default');
  const [newProfileName, setNewProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [profileBusy, setProfileBusy] = useState('');
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const visibleProfiles = profiles.length > 0 ? profiles : fallbackProfiles;
  const activeProfile = visibleProfiles.find((profile) => profile.name === selectedProfile) || visibleProfiles[0];
  const loadProfiles = useCallback(async () => {
    try {
      setProfileBusy('load');
      const [list, active] = await Promise.all([
        apiRequest<{ profiles?: HermesProfileInfo[] }>({ path: '/api/profiles', timeoutMs: 12000 }),
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
      const rows = await apiRequest<HermesSkillInfo[]>({ path: '/api/skills', timeoutMs: 12000 });
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
              <span className={(skill.enabled ?? true) ? 'pill green' : 'pill amber'}>{skill.source || ((skill.enabled ?? true) ? 'enabled' : 'disabled')}</span>
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
  const [newJobSchedule, setNewJobSchedule] = useState('daily@09:00');
  const [newJobPrompt, setNewJobPrompt] = useState('');
  const [cronBusy, setCronBusy] = useState('');
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const loadCronJobs = useCallback(async () => {
    try {
      setCronBusy('load');
      const rows = await apiRequest<HermesCronJobInfo[]>({ path: '/api/cron/jobs', timeoutMs: 20000 });
      setCronJobs(Array.isArray(rows) ? rows : []);
      setCronStatus(Array.isArray(rows) ? `已同步 ${rows.length} 个自动化任务` : 'Cron 返回为空');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`读取 cron 失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest]);
  const cronJobPath = (job: HermesCronJobInfo, action?: string) => {
    const id = job.id || job.name || '';
    const suffix = action ? `/${action}` : '';
    const profile = job.profile ? `?profile=${encodeURIComponent(job.profile)}` : '';
    return `/api/cron/jobs/${encodeURIComponent(id)}${suffix}${profile}`;
  };
  const runCronAction = useCallback(async (job: HermesCronJobInfo, action: 'delete' | 'pause' | 'resume' | 'trigger') => {
    const id = job.id || job.name;
    if (!id) {
      setCronStatus('这个任务缺少 id，无法操作。');
      return;
    }
    if (action === 'delete' && !window.confirm(`删除自动化任务 ${job.name || id}？`)) {
      return;
    }

    try {
      setCronBusy(`${action}:${id}`);
      await apiRequest({
        method: action === 'delete' ? 'DELETE' : 'POST',
        path: cronJobPath(job, action === 'delete' ? undefined : action),
        timeoutMs: action === 'trigger' ? 120000 : 30000,
      });
      setCronStatus(`${job.name || id} 已${action === 'pause' ? '暂停' : action === 'resume' ? '恢复' : action === 'trigger' ? '触发' : '删除'}`);
      await loadCronJobs();
      void refreshInventory();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setCronStatus(`操作失败：${message}`);
    } finally {
      setCronBusy('');
    }
  }, [apiRequest, loadCronJobs, refreshInventory]);
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
          deliver: 'local',
          name: newJobName.trim(),
          prompt,
          schedule: newJobSchedule.trim() || 'daily@09:00',
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
  }, [apiRequest, loadCronJobs, newJobName, newJobPrompt, newJobSchedule, refreshInventory]);
  useEffect(() => {
    void loadCronJobs();
  }, [loadCronJobs]);
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
        <input aria-label="计划表达式" disabled={Boolean(cronBusy)} placeholder="daily@09:00" value={newJobSchedule} onChange={(event) => setNewJobSchedule(event.target.value)} />
        <input aria-label="自动化 prompt" disabled={Boolean(cronBusy)} placeholder="让 Hermes 做什么..." value={newJobPrompt} onChange={(event) => setNewJobPrompt(event.target.value)} />
        <button type="submit" disabled={Boolean(cronBusy)}>{cronBusy === 'create' ? '创建中' : '新建'}</button>
      </form>
      {cronStatus && <p className="surfaceStatus">{cronStatus}</p>}
      <div className="automationList">
        {cronJobs.map((job) => {
          const id = job.id || job.name || 'cron-job';
          const paused = Boolean(job.paused) || job.enabled === false;
          return (
            <article className="automationRow" key={id}>
              <CalendarClock size={18} />
              <div>
                <strong>{job.name || id}</strong>
                <span>{job.schedule || '未设置 schedule'} · {compactLine(job.prompt || '', 64) || '无 prompt 预览'}</span>
              </div>
              <span className={paused ? 'pill amber' : 'pill green'}>{paused ? '已暂停' : '启用'}</span>
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
                type="button"
                aria-label="删除自动化任务"
                onClick={() => void runCronAction(job, 'delete')}
                disabled={Boolean(cronBusy)}
              >
                <Trash2 size={16} />
              </button>
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
  const apiRequest = runtime.apiRequest;
  const refreshInventory = runtime.refreshInventory;
  const loadPlatforms = useCallback(async () => {
    try {
      setMessagingBusy('load');
      const response = await apiRequest<{ platforms?: HermesMessagingPlatformInfo[] }>({ path: '/api/messaging/platforms', timeoutMs: 12000 });
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
          <h2>Messaging Gateway</h2>
          <p>读取 Hermes Gateway 平台状态、频道目录和用户配对。</p>
        </div>
        <button className="lightButton" type="button" onClick={() => void loadPlatforms()} disabled={Boolean(messagingBusy)}>
          <RefreshCw className={messagingBusy === 'load' ? 'spinIcon' : undefined} size={16} />
          {messagingBusy === 'load' ? '刷新中' : '刷新平台'}
        </button>
      </div>
      {messagingStatus && <p className="surfaceStatus">{messagingStatus}</p>}
      <div className="gatewayGrid">
        {platforms.length > 0 ? platforms.map((platform) => (
          <article className="gatewayCard" key={platform.id}>
            <div>
              <Network size={20} />
              <span className={platform.state === 'connected' ? 'pill green' : platform.enabled ? 'pill amber' : 'pill'}>{platform.state === 'connected' ? '已连接' : platform.state || (platform.enabled ? '待连接' : '已停用')}</span>
            </div>
            <strong>{platform.name}</strong>
            <p>{platform.description || `${messaging?.channelCounts[platform.id] ?? 0} 个频道 · ${platform.updated_at || '未记录更新时间'}`}</p>
            <div className="cardActions">
              <button type="button" onClick={() => void togglePlatform(platform)} disabled={Boolean(messagingBusy)}>
                {messagingBusy === `toggle:${platform.id}` ? '更新中' : platform.enabled ? '停用' : '启用'}
              </button>
              <button type="button" onClick={() => void testPlatform(platform)} disabled={Boolean(messagingBusy)}>
                {messagingBusy === `test:${platform.id}` ? '测试中' : '测试'}
              </button>
              {platform.docs_url && <button type="button" onClick={() => openPlatformDocs(platform)} disabled={Boolean(messagingBusy)}>文档</button>}
            </div>
          </article>
        )) : (
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
  const [settingsBusy, setSettingsBusy] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
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
  const rowsBySection: Record<SettingsSection, Array<{ desc: string; icon: React.ReactNode; title: string; control: React.ReactNode }>> = {
    advanced: [
      { icon: <HardDrive size={18} />, title: 'Hermes Home', desc: runtime.inventory?.diagnostics.hermesHome || '浏览器预览不可用', control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => void copyText(runtime.inventory?.diagnostics.hermesHome || '', 'Hermes Home')}>{settingsBusy === 'copy:Hermes Home' ? '复制中' : '复制'}</button> },
      { icon: <TerminalSquare size={18} />, title: 'Gateway PID', desc: String(runtime.inventory?.diagnostics.gatewayPid ?? '-'), control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => refreshSettings('advanced:pid', 'Gateway 状态')}>{settingsBusy === 'advanced:pid' ? '刷新中' : runtime.gatewayStatus}</button> },
      { icon: <RefreshCw size={18} />, title: '刷新本机状态', desc: runtime.inventoryError || '重新读取配置、skills、sessions 和 pairing。', control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => refreshSettings('advanced:refresh', '本机状态刷新')}>{settingsBusy === 'advanced:refresh' ? '刷新中' : '刷新'}</button> },
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
            disabled={Boolean(settingsBusy)}
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
            disabled={Boolean(settingsBusy)}
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
      { icon: <Command size={18} />, title: '启动行为', desc: '打开应用后连接本机 Hermes Gateway，并读取最近会话。', control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => runtime.gatewayStatus === 'connected' ? stopGateway() : restartGateway()}>{settingsBusy === 'gateway:stop' || settingsBusy === 'gateway:restart' ? '处理中' : runtime.gatewayStatus === 'connected' ? '停止' : '启动'}</button> },
      { icon: <Database size={18} />, title: '会话', desc: `${runtime.inventory?.sessions.count ?? runtime.recentSessions.length} 个本机会话`, control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => refreshSettings('general:sessions', '会话列表刷新')}>{settingsBusy === 'general:sessions' ? '刷新中' : '刷新'}</button> },
    ],
    integrations: [
      { icon: <Network size={18} />, title: 'Gateway', desc: runtime.connection?.baseUrl || runtime.connectionLabel, control: <div className="settingInlineActions"><button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={restartGateway}>{settingsBusy === 'gateway:restart' ? '重启中' : '重启'}</button><button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={stopGateway}>{settingsBusy === 'gateway:stop' ? '停止中' : '停止'}</button></div> },
      { icon: <MessageSquare size={18} />, title: '消息平台', desc: `${runtime.inventory?.messaging.platforms.length ?? 0} 个平台状态`, control: <div className="settingInlineActions"><button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => refreshSettings('integrations:messaging', '消息平台刷新')}>{settingsBusy === 'integrations:messaging' ? '刷新中' : '刷新'}</button><button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => onOpenSurface('messaging')}>管理</button></div> },
      { icon: <Puzzle size={18} />, title: 'Plugins', desc: `${runtime.inventory?.plugins.length ?? 0} 个本机插件`, control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => onOpenSurface('skills')}>查看</button> },
    ],
    models: [
      { icon: <Zap size={18} />, title: '默认模型', desc: `${config?.defaultModel || runtime.model} · ${config?.provider || 'provider 未设置'}`, control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => void copyText(config?.defaultModel || runtime.model, '默认模型')}>{settingsBusy === 'copy:默认模型' ? '复制中' : '复制'}</button> },
      { icon: <Database size={18} />, title: '模型库', desc: `${runtime.inventory?.models.length ?? 0} 个本机模型配置`, control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => refreshSettings('models:refresh', '模型库刷新')}>{settingsBusy === 'models:refresh' ? '刷新中' : '刷新'}</button> },
    ],
    permissions: [
      { icon: <Shield size={18} />, title: '命令审批', desc: '高风险命令进入确认队列。', control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={onOpenPermission}>手动确认</button> },
      { icon: <KeyRound size={18} />, title: 'Toolsets', desc: config?.toolsets.join(', ') || '未配置 toolset', control: <button className="selectButton" type="button" disabled={Boolean(settingsBusy)} onClick={() => void copyText(config?.toolsets.join(', ') || '', 'Toolsets')}>{settingsBusy === 'copy:Toolsets' ? '复制中' : '复制'}</button> },
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
  const runDiagnosticAction = async (key: string, label: string, action: () => Promise<void>) => {
    try {
      setDiagnosticsBusy(key);
      setDiagnosticsStatus('');
      await action();
      setDiagnosticsStatus(`${label} 已完成。`);
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

  return (
    <section className="pageSurface diagnostics">
      <div className="pageIntro">
        <div>
          <h2>诊断与更新</h2>
          <p>启动、权限、连接、版本和日志问题集中恢复。</p>
        </div>
        <button
          className="lightButton"
          type="button"
          disabled={Boolean(diagnosticsBusy)}
          onClick={() => void runDiagnosticAction('refresh', '重新诊断', runtime.refreshInventory)}
        >
          <RefreshCw className={diagnosticsBusy === 'refresh' ? 'spinIcon' : undefined} size={16} />
          {diagnosticsBusy === 'refresh' ? '诊断中' : '重新诊断'}
        </button>
      </div>
      {diagnosticsStatus && <p className="surfaceStatus" role="status">{diagnosticsStatus}</p>}
      <div className="diagnosticGrid">
        <DiagnosticCard icon={<CheckCircle2 />} title="Desktop shell" desc="Electron IPC bridge 正常" state="正常" />
        <DiagnosticCard
          icon={diagnostics?.configExists ? <CheckCircle2 /> : <AlertTriangle />}
          title="Hermes 配置"
          desc={diagnostics?.configExists ? shortenPath(`${diagnostics.hermesHome}/config.yaml`) : '未找到 config.yaml'}
          state={diagnostics?.configExists ? '正常' : '需要检查'}
          action={diagnostics?.configExists ? undefined : openPermissionCheck}
          actionLabel="检查权限"
          busy={diagnosticsBusy === 'permission'}
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
          action={runtime.gatewayStatus === 'connected' ? undefined : () => void runDiagnosticAction('gateway', 'Gateway 修复', runtime.restartGateway)}
          actionLabel={runtime.gatewayStatus === 'connected' ? undefined : '修复连接'}
          busy={diagnosticsBusy === 'gateway'}
        />
      </div>
      <section className="logPanel">
        <h3>最近日志</h3>
        <pre className="terminalBlock"><code>{runtime.logs.length > 0 ? runtime.logs.slice(0, 10).join('\n') : runtime.inventoryError || '暂无 Gateway 日志。'}</code></pre>
      </section>
    </section>
  );
}

function DiagnosticCard({
  actionLabel,
  busy,
  icon,
  title,
  desc,
  state,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  state: string;
  action?: () => void;
  actionLabel?: string;
  busy?: boolean;
}) {
  return (
    <article className="diagnosticCard">
      {icon}
      <strong>{title}</strong>
      <p>{desc}</p>
      <button type="button" onClick={action} disabled={!action || busy}>
        {busy ? '处理中' : action ? actionLabel || state : state}
      </button>
    </article>
  );
}

function OnboardingSurface({ onFinish }: { onFinish: (target: 'chat' | 'diagnostics' | 'integrations') => void }) {
  const [selectedMode, setSelectedMode] = useState<'local' | 'remote' | 'status'>('local');
  const finishTarget = selectedMode === 'remote' ? 'integrations' : selectedMode === 'status' ? 'diagnostics' : 'chat';

  return (
    <section className="onboardingSurface">
      <div className="onboardingPanel">
        <div className="brandMark">
          <img src={hermesAgentLogo} alt="" />
        </div>
        <h2>连接 Hermes 工作方式</h2>
        <p>优先复用本机 Hermes Gateway；连接失败时再进入诊断和权限恢复。</p>
        <div className="choiceGrid">
          <button className={selectedMode === 'local' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('local')}>
            <Monitor size={22} />
            <strong>复用本地 Hermes</strong>
            <span>读取本地配置和项目路径</span>
          </button>
          <button className={selectedMode === 'remote' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('remote')}>
            <Network size={22} />
            <strong>连接远程 Gateway</strong>
            <span>使用团队共享 Agent 服务</span>
          </button>
          <button className={selectedMode === 'status' ? 'selected' : undefined} type="button" onClick={() => setSelectedMode('status')}>
            <Eye size={22} />
            <strong>查看连接状态</strong>
            <span>确认 Gateway、会话和审批事件</span>
          </button>
        </div>
        <button className="primaryButtonInline wide" type="button" onClick={() => onFinish(finishTarget)}>
          {selectedMode === 'remote' ? '配置 Gateway' : selectedMode === 'status' ? '查看诊断' : '进入工作台'}
        </button>
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
