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
type GatewayStatus = 'browser' | 'starting' | 'connected' | 'skipped' | 'error';
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
  connection: HermesGatewayConnection | null;
  connectionLabel: string;
  contextPercent: number;
  cwd: string;
  files: GatewayFileItem[];
  gatewayStatus: GatewayStatus;
  logs: string[];
  messages: ChatMessageModel[];
  model: string;
  pendingApproval: null | PendingApproval;
  pendingClarify: null | PendingClarify;
  recentSessions: SidebarItem[];
  selectedStoredSessionId: null | string;
  socketState: GatewayConnectionState;
  statusText: string;
  selectSession: (sessionId: string) => Promise<void>;
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

const pinnedSessions = [
  { title: '修复桌面端审批流', meta: '正在等待确认 · 12m', color: 'blue' },
  { title: '整理 Hermes UI 方向', meta: '设计规格 · 今天', color: 'green' },
];

const projects = [
  { title: 'Hermes Desktop优化', meta: 'GUI · 进行中', active: true },
  { title: 'Agent Gateway', meta: 'IPC adapter · 本周' },
  { title: 'Skill Library', meta: '组件库 · 待续' },
];

const recentSessions = [
  { title: '排查 gateway 启动', meta: 'macOS · 昨天' },
  { title: 'Settings 深层页', meta: '视觉规范 · 2 天前' },
  { title: '周报自动化', meta: 'cron · 3 天前' },
];

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
    title: '修复桌面端审批流',
    subtitle: '目标：让手动 approval 在 GUI 中可见、可追踪、可恢复。',
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

const demoMessages: ChatMessageModel[] = [
  {
    id: 'demo-user-1',
    kind: 'user',
    text: '这个 GUI 在 Mac 下不太理想，先看看哪些方向值得优化。',
  },
  {
    checks: [
      { done: true, label: '检查本地 app 打包结构' },
      { done: true, label: '对比官方桌面端与 Tauri 参考项目' },
      { label: '整理 Codex-like 设计规格' },
    ],
    id: 'demo-assistant-1',
    kind: 'assistant',
    status: 'done',
    text: '我会先把体验问题分为两层：一层是日常可用性，例如审批、输入、滚动；另一层是工作台设计，例如命令中心、右侧预览和状态可见性。',
  },
  {
    command: 'npm run test:desktop -- --approval-ui',
    id: 'demo-approval-1',
    kind: 'approval',
    status: 'pending',
    text: '默认暂停，确认后继续执行。',
    title: '等待审批',
  },
  {
    artifacts: [
      { kind: 'file', meta: 'src/App.tsx', tab: 'files', title: '变更文件' },
      { kind: 'terminal', meta: 'typecheck · build', tab: 'terminal', title: '终端输出' },
      { kind: 'preview', meta: 'exports/contact-sheet.png', tab: 'preview', title: '预览产物' },
    ],
    id: 'demo-assistant-2',
    kind: 'assistant',
    status: 'done',
    text: '建议把 Hermes Desktop 从“聊天壳”升级为 Agent workbench：左侧管理会话和 profiles，中间是任务线程，右侧稳定承载文件、终端、预览和工具输出。',
  },
];

const fallbackTools: GatewayToolItem[] = [
  { detail: 'page-map.md', id: 'demo-tool-1', label: '读取 page-map.md', state: 'done', value: '0.2s' },
  { detail: 'design/index.html', id: 'demo-tool-2', label: '生成界面骨架', state: 'done', value: '完成' },
  { detail: 'smoke', id: 'demo-tool-3', label: '等待 Gateway 事件', state: 'pending', value: '待连接' },
];

const fallbackFiles: GatewayFileItem[] = [
  { change: 'add', label: 'src/App.tsx', meta: 'UI' },
  { change: 'mod', label: 'src/styles.css', meta: 'CSS' },
  { change: 'mod', label: 'electron/main.cjs', meta: 'Gateway' },
];

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

  return sessions.slice(0, 5).map((session, index) => ({
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
  const [messages, setMessages] = useState<ChatMessageModel[]>(demoMessages);
  const [activeSessionId, setActiveSessionId] = useState<null | string>(null);
  const [selectedStoredSessionId, setSelectedStoredSessionId] = useState<null | string>(null);
  const [model, setModel] = useState('deepseek-v4-flash');
  const [cwd, setCwd] = useState('Hermes Desktop优化');
  const [contextPercent, setContextPercent] = useState(42);
  const [statusText, setStatusText] = useState('正在连接 Hermes Gateway');
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
              text: compactDuplicateReasoning(existing?.text ?? '', delta),
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
          desktop.api<SessionListResponse>({
            path: '/api/sessions?limit=20&offset=0&min_messages=1&archived=exclude&order=recent',
            timeoutMs: 12000,
          }),
          desktop.api<Record<string, unknown>>({ path: '/api/status', timeoutMs: 12000 }),
        ]);

        if (sessionsResponse.status === 'fulfilled') {
          const nextItems = sessionsToSidebarItems(sessionsResponse.value);
          if (nextItems.length > 0) {
            setRecentSessionItems(nextItems);
          }
        } else {
          setLogs((current) => [`Session list error: ${sessionsResponse.reason}`, ...current].slice(0, 120));
        }

        if (statusResponse.status === 'fulfilled') {
          const version = typeof statusResponse.value.version === 'string' ? statusResponse.value.version : '';
          setLogs((current) => [`Hermes status OK${version ? ` · ${version}` : ''}`, ...current].slice(0, 120));
        } else {
          setLogs((current) => [`Hermes status error: ${statusResponse.reason}`, ...current].slice(0, 120));
        }
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
  }, [handleGatewayEvent, resumeRuntimeSession, upsertMessage]);

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
        if (!sessionId) {
          const created = await client.request<SessionCreateResponse>('session.create', { cols: 96 }, 60000);
          sessionId = created.session_id;
          const storedId = created.stored_session_id || created.session_id;
          setActiveSessionId(sessionId);
          setSelectedStoredSessionId(storedId);
          selectedStoredSessionIdRef.current = storedId;
          setRecentSessionItems((current) => promoteSidebarItem(current, storedId, trimmed));
          patchRuntimeInfo(created.info);

          if (created.messages?.length) {
            const transcript = messagesFromStoredTranscript(created.messages, sessionId);
            if (transcript.length) {
              setMessages(transcript);
            }
          }
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
    [patchRuntimeInfo, upsertMessage],
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
    connection,
    connectionLabel,
    contextPercent,
    cwd,
    files,
    gatewayStatus,
    logs,
    messages,
    model,
    pendingApproval,
    pendingClarify,
    recentSessions: recentSessionItems,
    selectedStoredSessionId,
    selectSession,
    respondApproval,
    respondClarify,
    socketState,
    statusText,
    submitPrompt,
    tools,
  };
}

function App() {
  const runtime = useHermesRuntime();
  const [surface, setSurface] = useState<Surface>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('activity');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [approvalVariant, setApprovalVariant] = useState<ApprovalVariant | null>(null);
  const [deniedRecovery, setDeniedRecovery] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');

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

  const chatTitle = useMemo(() => {
    if (!runtime.selectedStoredSessionId) {
      return surfaceMeta.chat.title;
    }

    return runtime.recentSessions.find((item) => item.id === runtime.selectedStoredSessionId)?.title || surfaceMeta.chat.title;
  }, [runtime.recentSessions, runtime.selectedStoredSessionId]);
  const currentMeta = surface === 'chat' ? { ...surfaceMeta.chat, title: chatTitle } : surfaceMeta[surface];
  const showWorkbench = surface === 'chat';

  return (
    <div className={rightOpen && showWorkbench ? 'appShell workbenchOpen' : 'appShell'} data-testid="app-shell">
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
        recentItems={runtime.recentSessions}
        selectedStoredSessionId={runtime.selectedStoredSessionId}
        statusText={runtime.connectionLabel}
      />

      <main className={rightOpen && showWorkbench ? 'content withWorkbench' : 'content'}>
        <header className={surface === 'chat' ? 'topBar chatTopBar' : 'topBar'}>
          <div className="topBarTitle">
            <h1 data-testid="surface-title">{currentMeta.title}</h1>
            {surface === 'chat' && (
              <button className="titleMoreButton" type="button" aria-label="会话更多操作">
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
            onOpenWorkbenchTab={(tab) => {
              setRightOpen(true);
              setWorkbenchTab(tab);
            }}
          />
        )}
        {surface === 'projects' && <ProjectsSurface />}
        {surface === 'agents' && <AgentsSurface onOpenApproval={() => setApprovalVariant('risk')} />}
        {surface === 'profiles' && <ProfilesSurface />}
        {surface === 'skills' && <SkillsSurface />}
        {surface === 'cron' && <CronSurface />}
        {surface === 'messaging' && <MessagingSurface />}
        {surface === 'settings' && (
          <SettingsSurface selected={settingsSection} onSelect={setSettingsSection} />
        )}
        {surface === 'diagnostics' && <DiagnosticsSurface onOpenPermission={() => setApprovalVariant('permission')} />}
        {surface === 'onboarding' && <OnboardingSurface onFinish={() => setSurface('chat')} />}
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
          onOpenApproval={() => {
            setCommandOpen(false);
            setApprovalVariant('risk');
          }}
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
  onSelectSession,
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
  onSelectSession: (sessionId: string) => void;
  recentItems: SidebarItem[];
  selectedStoredSessionId: null | string;
  statusText: string;
}) {
  const utilityItems: Array<{ id: Surface; label: string; meta: string; icon: React.ReactNode }> = [
    { id: 'agents', label: 'Agents', meta: '并行任务 · 3', icon: <Bot size={15} /> },
    { id: 'profiles', label: 'Profiles', meta: 'Bailey / Product', icon: <UsersRound size={15} /> },
    { id: 'skills', label: '技能库', meta: '12 已启用', icon: <Puzzle size={15} /> },
    { id: 'cron', label: '自动化', meta: '2 运行中', icon: <CalendarClock size={15} /> },
    { id: 'messaging', label: '消息网关', meta: '2 平台连接', icon: <Network size={15} /> },
    { id: 'diagnostics', label: '诊断', meta: '1 个警告', icon: <Wrench size={15} /> },
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
          selectedSessionId={selectedStoredSessionId || activeSessionId}
        />
        <ProjectSection items={projects} onOpenProjects={() => onSurfaceChange('projects')} />
        <SidebarSection
          title="最近"
          items={recentItems.length > 0 ? recentItems : recentSessions}
          muted
          onOpenChat={() => onSurfaceChange('chat')}
          onSelectSession={onSelectSession}
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
        <span className={`statusDot ${gatewayStatus === 'error' ? 'red' : gatewayStatus === 'starting' ? 'amber' : 'green'}`} />
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
  onOpenChat,
  onSelectSession,
  selectedSessionId,
}: {
  title: string;
  muted?: boolean;
  items: SidebarItem[];
  onOpenChat: () => void;
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
        />
      ))}
    </section>
  );
}

function ProjectSection({
  items,
  onOpenProjects,
}: {
  items: Array<{ title: string; meta: string; active?: boolean }>;
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
        />
      ))}
    </section>
  );
}

function SessionRow({
  item,
  active,
  muted,
  onSelect,
}: {
  item: SidebarItem;
  active?: boolean;
  muted?: boolean;
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
        <button type="button" aria-label="归档" title="归档">
          <Archive size={14} />
        </button>
        <button type="button" aria-label="删除" title="删除">
          <Trash2 size={14} />
        </button>
        <button type="button" aria-label="更多" title="更多">
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
  onOpenWorkbenchTab,
}: {
  attachmentOpen: boolean;
  deniedRecovery: boolean;
  runtime: HermesRuntime;
  setAttachmentOpen: (open: boolean) => void;
  onOpenApproval: () => void;
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

      <Composer attachmentOpen={attachmentOpen} setAttachmentOpen={setAttachmentOpen} runtime={runtime} />
    </section>
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
          <button type="button" onClick={() => void onRespondApproval('once')}>本次允许</button>
          <button type="button" onClick={() => void onRespondApproval('session')}>当前会话</button>
          <button type="button" onClick={() => void onRespondApproval('always')}>始终允许</button>
          <button className="danger" type="button" onClick={() => void onRespondApproval('deny')}>拒绝</button>
          <button className="ghost" type="button" onClick={onOpenApproval}>详情</button>
        </div>
      )}
      {isClarify && message.status === 'pending' && (
        <div className="clarifyInlineActions">
          {message.choices?.map((choice) => (
            <button key={choice} type="button" onClick={() => void onRespondClarify(choice)}>
              {choice}
            </button>
          ))}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (clarifyDraft.trim()) {
                void onRespondClarify(clarifyDraft.trim());
                setClarifyDraft('');
              }
            }}
          >
            <input
              aria-label="澄清回复"
              onChange={(event) => setClarifyDraft(event.target.value)}
              placeholder="输入补充信息"
              value={clarifyDraft}
            />
            <button type="submit">发送</button>
          </form>
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
  setAttachmentOpen,
  runtime,
}: {
  attachmentOpen: boolean;
  setAttachmentOpen: (open: boolean) => void;
  runtime: HermesRuntime;
}) {
  const [draft, setDraft] = useState('');
  const canSend = runtime.gatewayStatus === 'connected' && runtime.socketState === 'open';

  const submit = () => {
    const text = draft.trim();
    if (!text) {
      return;
    }

    setDraft('');
    void runtime.submitPrompt(text);
  };

  return (
    <div className="composerWrap" data-testid="composer">
      <div className="composerMeta" aria-label="任务状态">
        <button className="permission" type="button" title="完全访问">
          <Shield size={17} />
          完全访问
          <ChevronDown size={15} />
        </button>
        <button className="modelName" type="button" title={runtime.model}>
          <Zap size={16} />
          {runtime.model}
        </button>
        <button className="workdir" type="button" title={runtime.cwd}>
          <span className="workdirLabel">工作目录</span>
          <span className="workdirPath">{shortenPath(runtime.cwd)}</span>
        </button>
        <button className="contextMeter" type="button" title={`${runtime.contextPercent}% · 1M`}>
          <span className="contextTrack"><span style={{ width: `${Math.max(5, runtime.contextPercent)}%` }} /></span>
          {runtime.contextPercent}% · 1M
        </button>
      </div>

      <div className="composerInputRow">
        <button
          className="plusButton"
          type="button"
          aria-label="添加"
          onClick={() => setAttachmentOpen(!attachmentOpen)}
        >
          <Plus size={22} />
        </button>
        <textarea
          aria-label="消息"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder="继续描述你的目标，或输入 / 选择技能..."
          rows={1}
          value={draft}
        />
        <button className="ghostIcon" type="button" aria-label="语音输入">
          <Mic size={19} />
        </button>
        <button className="sendButton" type="button" aria-label="发送" disabled={!draft.trim() || !canSend} onClick={submit}>
          <SendHorizontal size={20} />
        </button>

        {attachmentOpen && <AttachmentMenu />}
      </div>
    </div>
  );
}

function AttachmentMenu() {
  const items = [
    { icon: <File size={18} />, label: '文件...' },
    { icon: <Folder size={18} />, label: '文件夹...' },
    { icon: <Image size={18} />, label: '图片...' },
    { icon: <Clipboard size={18} />, label: '粘贴图片' },
    { icon: <Link size={18} />, label: 'URL...' },
    { icon: <MessageSquare size={18} />, label: '提示片段...' },
  ];

  return (
    <div className="attachmentMenu" role="menu">
      <span className="menuTitle">添加</span>
      {items.map((item, index) => (
        <button className={index === 5 ? 'menuItem divided' : 'menuItem'} type="button" key={item.label}>
          {item.icon}
          {item.label}
        </button>
      ))}
      <div className="menuHint">提示：输入 @ 可在正文中引用文件。</div>
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
      {activeTab === 'terminal' && <WorkbenchTerminal logs={runtime.logs} />}
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
        <strong>{runtime.activeSessionId ? 'Hermes Agent 会话' : 'Hermes Desktop 设计方向'}</strong>
        <p>{runtime.statusText}</p>
        <div className="progressBar">
          <span style={{ width: `${Math.max(8, runtime.contextPercent)}%` }} />
        </div>
      </section>
      <section className="workbenchList">
        <h3>工具调用</h3>
        {runtime.tools.map((item) => (
          <WorkbenchItem key={item.id} detail={item.detail} state={item.state} label={item.label} value={item.value} />
        ))}
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
  return (
    <>
      <section className="railSection">
        <h3>变更文件</h3>
        {files.map((file, index) => (
          <button className={index === 0 ? 'fileChangeRow selected' : 'fileChangeRow'} key={`${file.label}-${file.meta}`} type="button">
            <span className={file.change === 'add' ? 'changeTag add' : 'changeTag mod'}>{file.change === 'add' ? '新' : '改'}</span>
            <span>{file.label}</span>
            <small>{file.meta}</small>
          </button>
        ))}
      </section>
      <section className="railSection">
        <h3>Diff 摘要</h3>
        <pre className="miniCode"><code>{files.map((file) => `${file.change === 'add' ? '+' : '~'} ${file.label} · ${file.meta}`).join('\n')}</code></pre>
        <div className="workbenchActions">
          <button type="button">打开文件</button>
          <button type="button">复制路径</button>
        </div>
      </section>
    </>
  );
}

function WorkbenchTerminal({ logs }: { logs: string[] }) {
  const renderedLogs = logs.length > 0 ? logs.slice(-12).join('\n') : 'Gateway 日志会在这里显示。';

  return (
    <>
      <section className="railSection terminalSection">
        <div className="terminalHeader">
          <strong>Hermes Gateway</strong>
          <button type="button">
            <PauseCircle size={15} />
            停止
          </button>
        </div>
        <pre className="terminalBlock"><code>{renderedLogs}</code></pre>
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
  return (
    <>
      <section className="previewPanel">
        <div className="previewFrame">
          <div className="previewTop" />
          <div className="previewCanvas">
            <div />
            <span>contact-sheet.png</span>
          </div>
        </div>
      </section>
      <section className="railSection">
        <h3>预览产物</h3>
        <p>{runtime.connection?.baseUrl ? `Gateway: ${runtime.connection.baseUrl}` : '当前处于浏览器预览或等待连接。'}</p>
        <div className="workbenchActions">
          <button type="button">刷新</button>
          <button type="button">打开文件</button>
        </div>
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

function CommandCenter({
  query,
  onQueryChange,
  onClose,
  onNavigate,
  onOpenApproval,
}: {
  query: string;
  onQueryChange: (query: string) => void;
  onClose: () => void;
  onNavigate: (surface: Surface) => void;
  onOpenApproval: () => void;
}) {
  const normalized = query.trim().toLowerCase();
  const mode = normalized.includes('restricted') || normalized.includes('权限')
    ? 'permission'
    : normalized.length > 0 && !normalized.includes('approval') && !normalized.includes('设置')
      ? 'empty'
      : normalized.length > 0
        ? 'results'
        : 'default';

  return (
    <div className="overlayLayer" role="dialog" aria-modal="true" aria-label="命令中心" data-testid="command-center">
      <button className="overlayBackdrop" type="button" aria-label="关闭命令中心" onClick={onClose} />
      <div className="commandPanel">
        <div className="commandInput">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜索命令、会话、文件、设置或 skill"
          />
          <kbd>⌘K</kbd>
        </div>

        {mode === 'default' && (
          <div className="commandBody">
            <CommandGroup title="常用动作">
              <CommandRow icon={<Plus />} title="新建任务" desc="在当前项目中新建 Agent 线程" action="执行" onClick={() => onNavigate('chat')} />
              <CommandRow icon={<TerminalSquare />} title="打开终端" desc="在右侧工作区打开终端 tab" action="打开" />
              <CommandRow icon={<Shield />} title="查看待审批命令" desc="2 个命令正在等待确认" action="跳转" onClick={onOpenApproval} />
            </CommandGroup>
            <CommandGroup title="跳转">
              <CommandRow icon={<Bot />} title="Agents 并行任务" desc="查看运行中、待确认、已完成队列" action="跳转" onClick={() => onNavigate('agents')} />
              <CommandRow icon={<Settings />} title="设置" desc="打开偏好设置" action="⌘," onClick={() => onNavigate('settings')} />
              <CommandRow icon={<Puzzle />} title="技能库" desc="管理 skill 启用和更新" action="跳转" onClick={() => onNavigate('skills')} />
              <CommandRow icon={<Rocket />} title="首次启动" desc="选择本地、远程或离线预览" action="打开" onClick={() => onNavigate('onboarding')} />
            </CommandGroup>
          </div>
        )}

        {mode === 'results' && (
          <div className="commandBody">
            <CommandGroup title="命令">
              <CommandRow danger icon={<TerminalSquare />} title="运行桌面端审批测试" desc="npm run test:desktop -- --approval-ui" action="需审批" onClick={onOpenApproval} />
              <CommandRow icon={<Settings />} title="审批设置" desc="调整默认确认策略、规则范围和记住方式" action="跳转" onClick={() => onNavigate('settings')} />
            </CommandGroup>
            <CommandGroup title="会话">
              <CommandRow icon={<MessageSquare />} title="修复桌面端审批流" desc="正在等待确认 · 12m" action="打开" onClick={() => onNavigate('chat')} />
              <CommandRow icon={<FileText />} title="approval renderer 设计记录" desc="docs/page-map.md" action="打开" />
            </CommandGroup>
          </div>
        )}

        {mode === 'empty' && (
          <div className="commandEmpty">
            <Search size={26} />
            <strong>没有找到匹配结果</strong>
            <p>可以用“{query}”新建任务，或去技能库查找相关能力。</p>
            <div>
              <button type="button" onClick={() => onNavigate('chat')}>用查询新建任务</button>
              <button type="button" onClick={() => onNavigate('skills')}>打开技能库</button>
            </div>
          </div>
        )}

        {mode === 'permission' && (
          <div className="permissionState">
            <div className="approvalIcon">
              <Lock size={22} />
            </div>
            <div>
              <strong>当前 profile 无权访问这个目录</strong>
              <p>Bailey / Product 只允许读取当前项目。你可以本次审批、切换 profile，或打开权限设置。</p>
            </div>
            <div className="commandOptions">
              <button type="button" onClick={onOpenApproval}>
                <Shield size={16} />
                请求一次性审批
              </button>
              <button type="button" onClick={() => onNavigate('profiles')}>
                <UsersRound size={16} />
                切换 profile
              </button>
              <button type="button" onClick={() => onNavigate('settings')}>
                <Settings size={16} />
                打开权限设置
              </button>
            </div>
          </div>
        )}

        <div className="commandFooter">
          <span>↑↓ 选择</span>
          <span>Enter {mode === 'results' ? '查看审批或打开' : '执行'}</span>
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
  icon,
  title,
  desc,
  action,
  danger,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={danger ? 'commandRow danger' : 'commandRow'} type="button" onClick={onClick}>
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
  const content = {
    risk: {
      icon: <Shield size={24} />,
      title: '确认高风险命令',
      desc: 'Hermes 需要运行桌面端测试来确认 approval UI 的行为是否完整。',
      code: 'npm run test:desktop -- --approval-ui --update-snapshots',
      details: ['cwd: Beauty-Hermes-GUI', '来源: Bailey / Product', '可能修改: screenshots', '恢复: 可回滚生成物'],
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
        <div className="approvalSource">来自 Hermes · 修复桌面端审批流 · Bailey / Product · Hermes Desktop优化</div>
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
            <button className="primaryButtonInline" type="button" onClick={onClose}>
              重新请求审批
            </button>
          ) : variant === 'permission' ? (
            <button className="primaryButtonInline" type="button" onClick={onClose}>
              打开系统设置
            </button>
          ) : (
            <>
              <button className="secondaryButton" type="button" onClick={onClose}>
                本次允许
              </button>
              <button className="primaryButtonInline" type="button" onClick={onClose}>
                允许并记住当前项目
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectsSurface() {
  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>项目工作区</h2>
          <p>把会话、路径、模型配置和运行状态合并管理。</p>
        </div>
        <button className="lightButton" type="button">
          <Plus size={16} />
          新建项目
        </button>
      </div>

      <div className="projectGrid">
        {projects.map((project) => (
          <article className="projectCard" key={project.title}>
            <div className="cardTop">
              <div className="projectIcon">
                <Folder size={20} />
              </div>
              <button className="iconButton compact" type="button" aria-label="更多项目操作">
                <MoreHorizontal size={17} />
              </button>
            </div>
            <h3>{project.title}</h3>
            <p>{project.meta}</p>
            <div className="projectStats">
              <span>12 会话</span>
              <span>4 技能</span>
              <span>2 运行中</span>
            </div>
            <div className="projectActions">
              <button type="button">
                <Inbox size={15} />
                归档
              </button>
              <button type="button">
                <Trash2 size={15} />
                删除
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AgentsSurface({ onOpenApproval }: { onOpenApproval: () => void }) {
  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>并行任务</h2>
          <p>运行中、待确认、已完成三列看板，优先暴露审批阻塞。</p>
        </div>
        <button className="lightButton" type="button">
          <Plus size={16} />
          委派任务
        </button>
      </div>
      <div className="kanbanGrid">
        <KanbanColumn title="运行中" count="2">
          <AgentCard title="实现 GUI approval renderer" status="运行中" meta="branch: gui/approval · 18m" />
          <AgentCard title="重构 composer 状态" status="运行中" meta="apps/desktop · 9m" />
        </KanbanColumn>
        <KanbanColumn title="待确认" count="1">
          <AgentCard title="运行端到端测试" status="approval" meta="npm run test:desktop" danger onClick={onOpenApproval} />
        </KanbanColumn>
        <KanbanColumn title="已完成" count="2">
          <AgentCard title="整理技术栈选择" status="完成" meta="local-first · gateway adapter" muted />
          <AgentCard title="确定视觉规范" status="完成" meta="neutral workbench · 中文优先" muted />
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
  title,
  status,
  meta,
  danger,
  muted,
  onClick,
}: {
  title: string;
  status: string;
  meta: string;
  danger?: boolean;
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <button className={muted ? 'agentCard muted' : 'agentCard'} type="button" onClick={onClick}>
      <div className="cardHead">
        <strong>{title}</strong>
        <span className={danger ? 'pill red' : 'pill'}>{status}</span>
      </div>
      <p>最近动作已同步到当前线程，可随时进入查看。</p>
      <div className="cardFoot">
        <span>{meta}</span>
        <ChevronRight size={14} />
      </div>
    </button>
  );
}

function ProfilesSurface() {
  const profiles = [
    ['Bailey / Product', '中文优先 · 12 skills', '当前'],
    ['Engineering', '终端优先 · 完全访问', '可切换'],
    ['Research', '只读网络 · 文档总结', '可切换'],
  ];

  return (
    <section className="pageSurface twoColumnPage">
      <div className="listPanel">
        <div className="panelTitle">
          <h2>工作身份</h2>
          <button type="button">
            <Plus size={15} />
          </button>
        </div>
        {profiles.map(([name, meta, status]) => (
          <button className={status === '当前' ? 'profileRow active' : 'profileRow'} type="button" key={name}>
            <div className="profileAvatar">{name[0]}</div>
            <div>
              <strong>{name}</strong>
              <span>{meta}</span>
            </div>
            <em>{status}</em>
          </button>
        ))}
      </div>
      <div className="detailPanel">
        <div className="detailHero">
          <UsersRound size={26} />
          <div>
            <h2>Bailey / Product</h2>
            <p>产品与设计工作身份，默认中文优先，保留工程命名。</p>
          </div>
        </div>
        <div className="policyGrid">
          <PolicyCard icon={<Zap />} title="模型" desc="deepseek-v4-flash · 超高推理" />
          <PolicyCard icon={<Puzzle />} title="技能" desc="ui-ux-pro-max、browser、github" />
          <PolicyCard icon={<Shield />} title="权限" desc="高风险命令需手动确认" />
          <PolicyCard icon={<Database />} title="记忆" desc="项目规则覆盖全局偏好" />
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

function SkillsSurface() {
  const skills = [
    ['ui-ux-pro-max', '界面规范、间距、交互和视觉 QA', '已启用'],
    ['browser', '本地页面截图、点击和 smoke 检查', '已启用'],
    ['github', '仓库、PR、CI 和发布协作', '已启用'],
    ['lark-vc-agent', '会议事件读取和参会助手', '未安装'],
    ['documents', '文档渲染和视觉验证', '更新可用'],
    ['hyperframes', 'HTML 视频和动画产物', '未安装'],
  ];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>技能库</h2>
          <p>管理技能发现、启用、更新和创建。</p>
        </div>
        <label className="inlineSearch">
          <Search size={15} />
          <input placeholder="搜索 skill" />
        </label>
      </div>
      <div className="skillGrid">
        {skills.map(([name, desc, status]) => (
          <article className="skillCard" key={name}>
            <div className="skillIcon">
              <Puzzle size={20} />
            </div>
            <strong>{name}</strong>
            <p>{desc}</p>
            <div>
              <span className={status === '已启用' ? 'pill green' : status === '更新可用' ? 'pill amber' : 'pill'}>{status}</span>
              <button type="button">{status === '已启用' ? '配置' : '启用'}</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CronSurface() {
  const jobs = [
    ['每日 GUI smoke', '工作日 17:00 · 截图 + 构建检查', '启用'],
    ['依赖更新巡检', '每周一 10:00 · npm audit + release notes', '暂停'],
    ['设计稿回归报告', '每次发布候选 · Browser screenshot diff', '草稿'],
  ];

  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>Cron Automations</h2>
          <p>提醒、巡检、汇报和定时任务集中管理。</p>
        </div>
        <button className="lightButton" type="button">
          <Plus size={16} />
          新建自动化
        </button>
      </div>
      <div className="automationList">
        {jobs.map(([title, meta, status]) => (
          <article className="automationRow" key={title}>
            <CalendarClock size={18} />
            <div>
              <strong>{title}</strong>
              <span>{meta}</span>
            </div>
            <span className={status === '启用' ? 'pill green' : status === '暂停' ? 'pill amber' : 'pill'}>{status}</span>
            <button type="button">
              <MoreHorizontal size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function MessagingSurface() {
  return (
    <section className="pageSurface">
      <div className="pageIntro">
        <div>
          <h2>Messaging Gateway</h2>
          <p>连接外部消息平台，控制哪些消息可进入 Hermes。</p>
        </div>
        <button className="lightButton" type="button">
          <Network size={16} />
          测试连接
        </button>
      </div>
      <div className="gatewayGrid">
        <GatewayCard title="Lark" status="已连接" desc="审批、会议、消息事件可用" />
        <GatewayCard title="Slack" status="未配置" desc="等待 webhook 和 token" />
        <GatewayCard title="Email" status="需要密钥" desc="仅允许摘要，不允许自动发送" />
      </div>
      <section className="routeTable">
        <h3>路由规则</h3>
        <div className="tableRow head"><span>来源</span><span>目标 profile</span><span>权限</span><span>状态</span></div>
        <div className="tableRow"><span>Lark / Approval</span><span>Bailey / Product</span><span>需确认</span><span>启用</span></div>
        <div className="tableRow"><span>Slack / dev-alerts</span><span>Engineering</span><span>只读</span><span>草稿</span></div>
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
  selected,
  onSelect,
}: {
  selected: SettingsSection;
  onSelect: (section: SettingsSection) => void;
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
      <SettingsPanel selected={selected} />
    </section>
  );
}

function SettingsPanel({ selected }: { selected: SettingsSection }) {
  const title = settingsSections.find((item) => item.id === selected)!;

  return (
    <div className="settingsPanel">
      <div className="panelHeader">
        <button className="iconButton compact" type="button" aria-label="返回">
          <ChevronLeft size={17} />
        </button>
        <div>
          <h2>{title.label}</h2>
          <p>{title.desc}</p>
        </div>
      </div>

      <div className="settingRows">
        <SettingRow
          icon={<Command size={18} />}
          title={selected === 'models' ? '默认模型' : '启动行为'}
          desc={selected === 'models' ? 'deepseek-v4-flash，保留长模型名空间。' : '打开应用后恢复上次工作区。'}
          control={<Toggle on />}
        />
        <SettingRow
          icon={<Shield size={18} />}
          title={selected === 'permissions' ? '命令审批' : '安全边界'}
          desc={selected === 'permissions' ? '高风险命令进入确认队列。' : '文件、终端和网络访问保持可追踪。'}
          control={<button className="selectButton" type="button">手动确认</button>}
        />
        <SettingRow
          icon={<Sparkles size={18} />}
          title={selected === 'appearance' ? '界面密度' : '体验偏好'}
          desc={selected === 'appearance' ? '舒适间距，大圆角输入框，低噪声状态。' : '中文优先，保留英文技术名称。'}
          control={<button className="selectButton" type="button">舒适</button>}
        />
        <SettingRow
          icon={<KeyRound size={18} />}
          title="快捷键"
          desc="保留系统快捷键，Cmd+K 打开命令中心。"
          control={<button className="selectButton" type="button">查看</button>}
        />
      </div>
    </div>
  );
}

function DiagnosticsSurface({ onOpenPermission }: { onOpenPermission: () => void }) {
  return (
    <section className="pageSurface diagnostics">
      <div className="pageIntro">
        <div>
          <h2>诊断与更新</h2>
          <p>启动、权限、连接、版本和日志问题集中恢复。</p>
        </div>
        <button className="lightButton" type="button">
          <RefreshCw size={16} />
          重新诊断
        </button>
      </div>
      <div className="diagnosticGrid">
        <DiagnosticCard icon={<CheckCircle2 />} title="Desktop shell" desc="Electron runtime 正常" state="正常" />
        <DiagnosticCard icon={<AlertTriangle />} title="macOS 文件权限" desc="~/Library/Logs/Hermes 需要授权" state="警告" action={onOpenPermission} />
        <DiagnosticCard icon={<Download />} title="更新" desc="v0.1.0 release candidate" state="可发布" />
        <DiagnosticCard icon={<HardDrive />} title="打包目录" desc="dist + Electron app 可生成" state="正常" />
      </div>
      <section className="logPanel">
        <h3>最近日志</h3>
        <pre className="terminalBlock"><code>typecheck passed
vite build passed
electron smoke passed
waiting for signed release credentials...</code></pre>
      </section>
    </section>
  );
}

function DiagnosticCard({
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
}) {
  return (
    <article className="diagnosticCard">
      {icon}
      <strong>{title}</strong>
      <p>{desc}</p>
      <button type="button" onClick={action}>{state}</button>
    </article>
  );
}

function OnboardingSurface({ onFinish }: { onFinish: () => void }) {
  return (
    <section className="onboardingSurface">
      <div className="onboardingPanel">
        <div className="brandMark">H</div>
        <h2>连接 Hermes 工作方式</h2>
        <p>选择本地 Hermes、远程 Gateway，或先进入离线 UI 体验。</p>
        <div className="choiceGrid">
          <button type="button">
            <Monitor size={22} />
            <strong>复用本地 Hermes</strong>
            <span>读取本地配置和项目路径</span>
          </button>
          <button type="button">
            <Network size={22} />
            <strong>连接远程 Gateway</strong>
            <span>使用团队共享 Agent 服务</span>
          </button>
          <button type="button">
            <Eye size={22} />
            <strong>先预览界面</strong>
            <span>使用 mock 数据进入工作台</span>
          </button>
        </div>
        <button className="primaryButtonInline wide" type="button" onClick={onFinish}>
          进入工作台
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

function Toggle({ on }: { on?: boolean }) {
  return (
    <button className={on ? 'toggle on' : 'toggle'} type="button" aria-label={on ? '已开启' : '已关闭'}>
      <span />
    </button>
  );
}

export default App;
