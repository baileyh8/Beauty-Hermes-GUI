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
import Square from 'lucide-react/dist/esm/icons/square.js';
import TerminalSquare from 'lucide-react/dist/esm/icons/terminal-square.js';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2.js';
import UserRound from 'lucide-react/dist/esm/icons/user-round.js';
import UsersRound from 'lucide-react/dist/esm/icons/users-round.js';
import Wrench from 'lucide-react/dist/esm/icons/wrench.js';
import X from 'lucide-react/dist/esm/icons/x.js';
import XCircle from 'lucide-react/dist/esm/icons/x-circle.js';
import Zap from 'lucide-react/dist/esm/icons/zap.js';
import { useEffect, useMemo, useState } from 'react';

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

function App() {
  const [surface, setSurface] = useState<Surface>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [workbenchTab, setWorkbenchTab] = useState<WorkbenchTab>('activity');
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [approvalVariant, setApprovalVariant] = useState<ApprovalVariant | null>(null);
  const [deniedRecovery, setDeniedRecovery] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');
  const [bridgeState, setBridgeState] = useState('浏览器预览');

  useEffect(() => {
    window.hermesDesktop?.getDesktopInfo().then((info) => setBridgeState(info.bridge));
  }, []);

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

  const currentMeta = surfaceMeta[surface];
  const showWorkbench = surface === 'chat';

  return (
    <div className="appShell" data-testid="app-shell">
      <Sidebar
        activeSurface={surface}
        onSurfaceChange={setSurface}
        onOpenCommand={() => setCommandOpen(true)}
      />

      <main className={rightOpen && showWorkbench ? 'content withWorkbench' : 'content'}>
        <header className="topBar">
          <div>
            <h1 data-testid="surface-title">{currentMeta.title}</h1>
            <p>{currentMeta.subtitle}</p>
          </div>
          <div className="topActions">
            {surface === 'chat' && (
              <>
                <button className="lightButton" type="button" onClick={() => setSurface('projects')}>
                  <Folder size={16} />
                  项目
                </button>
                <button className="lightButton" type="button" onClick={() => setSurface('cron')}>
                  <Zap size={16} />
                  自动
                </button>
              </>
            )}
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
        </header>

        {surface === 'chat' && (
          <ChatSurface
            attachmentOpen={attachmentOpen}
            deniedRecovery={deniedRecovery}
            setAttachmentOpen={setAttachmentOpen}
            bridgeState={bridgeState}
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
          />
        ) : (
          <button
            className="floatingWorkbenchButton hasBadge"
            type="button"
            aria-label="展开工作区"
            onClick={() => setRightOpen(true)}
          >
            <PanelRightOpen size={19} />
            <span>2</span>
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
  activeSurface,
  onSurfaceChange,
  onOpenCommand,
}: {
  activeSurface: Surface;
  onSurfaceChange: (surface: Surface) => void;
  onOpenCommand: () => void;
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
      <div className="windowControls" aria-hidden="true">
        <span className="traffic red" />
        <span className="traffic yellow" />
        <span className="traffic green" />
      </div>

      <button className="profileBlock" type="button" onClick={() => onSurfaceChange('profiles')}>
        <div className="avatar">H</div>
        <div>
          <strong>Hermes</strong>
          <span>本地运行 · DeepSeek V4</span>
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
        <SidebarSection title="置顶" items={pinnedSessions} />
        <ProjectSection items={projects} onOpenProjects={() => onSurfaceChange('projects')} />
        <SidebarSection title="最近" items={recentSessions} muted />

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
        <span className="statusDot green" />
        <div>
          <strong>Gateway</strong>
          <small>已连接 · IPC mock</small>
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
}: {
  title: string;
  muted?: boolean;
  items: Array<{ title: string; meta: string; color?: string }>;
}) {
  return (
    <section className="navSection">
      <h2>{title}</h2>
      {items.map((item, index) => (
        <SessionRow key={item.title} item={item} muted={muted} active={!muted && index === 0} />
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
        <SessionRow key={item.title} item={{ ...item, color: item.active ? 'indigo' : 'gray' }} active={item.active} />
      ))}
    </section>
  );
}

function SessionRow({
  item,
  active,
  muted,
}: {
  item: { title: string; meta: string; color?: string };
  active?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={active ? 'sessionRow active' : 'sessionRow'}>
      <span className={`statusDot ${item.color ?? (muted ? 'gray' : 'blue')}`} />
      <div className="sessionText">
        <strong>{item.title}</strong>
        <span>{item.meta}</span>
      </div>
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
  setAttachmentOpen,
  bridgeState,
  onOpenApproval,
  onOpenWorkbenchTab,
}: {
  attachmentOpen: boolean;
  deniedRecovery: boolean;
  setAttachmentOpen: (open: boolean) => void;
  bridgeState: string;
  onOpenApproval: () => void;
  onOpenWorkbenchTab: (tab: WorkbenchTab) => void;
}) {
  return (
    <section className="chatSurface" aria-label="会话">
      <div className="messageStack">
        <article className="message human">
          <div className="bubble">这个 GUI 在 Mac 下不太理想，先看看哪些方向值得优化。</div>
          <div className="miniAvatar user">
            <UserRound size={15} />
          </div>
        </article>

        <article className="message agent">
          <div className="miniAvatar agentMark">H</div>
          <div className="agentContent">
            <p>
              我会先把体验问题分为两层：一层是日常可用性，例如审批、输入、滚动；另一层是工作台设计，例如命令中心、右侧预览和状态可见性。
            </p>
            <div className="checkCard">
              <div>
                <CheckCircle2 size={15} />
                检查本地 app 打包结构
              </div>
              <div>
                <CheckCircle2 size={15} />
                对比官方桌面端与 Tauri 参考项目
              </div>
              <div className="current">
                <CircleDot size={15} />
                整理 Codex-like 设计规格
              </div>
            </div>
          </div>
        </article>

        <div className="toolStrip approval">
          <div>
            <Shield size={16} />
            等待审批 <code>npm run test:desktop -- --approval-ui</code>
          </div>
          <button type="button" onClick={onOpenApproval}>查看审批</button>
        </div>

        {deniedRecovery && (
          <article className="message agent">
            <div className="miniAvatar agentMark">H</div>
            <div className="agentContent">
              <div className="recoveryBlock">
                <strong>已拒绝高风险命令</strong>
                <p>我会改用只读检查：读取当前 UI 文件、运行类型检查，并把需要人工确认的命令保留在审批记录里。</p>
                <button type="button" onClick={() => onOpenWorkbenchTab('activity')}>
                  查看恢复路径
                </button>
              </div>
            </div>
          </article>
        )}

        <article className="message agent">
          <div className="miniAvatar agentMark">H</div>
          <div className="agentContent">
            <p>
              建议把 Hermes Desktop 从“聊天壳”升级为 Agent workbench：左侧管理会话和 profiles，中间是任务线程，右侧稳定承载文件、终端、预览和工具输出。
            </p>
            <div className="artifactGrid">
              <Artifact icon={<File size={19} />} title="变更文件" meta="src/App.tsx" onClick={() => onOpenWorkbenchTab('files')} />
              <Artifact icon={<TerminalSquare size={19} />} title="终端输出" meta="typecheck · build" onClick={() => onOpenWorkbenchTab('terminal')} />
              <Artifact icon={<Eye size={19} />} title="预览产物" meta="exports/contact-sheet.png" onClick={() => onOpenWorkbenchTab('preview')} />
            </div>
          </div>
        </article>
      </div>

      <Composer attachmentOpen={attachmentOpen} setAttachmentOpen={setAttachmentOpen} bridgeState={bridgeState} />
    </section>
  );
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
  bridgeState,
}: {
  attachmentOpen: boolean;
  setAttachmentOpen: (open: boolean) => void;
  bridgeState: string;
}) {
  return (
    <div className="composerWrap" data-testid="composer">
      <div className="composerMeta" aria-label="任务上下文">
        <button className="permission" type="button">
          <Shield size={17} />
          完全访问
          <ChevronDown size={15} />
        </button>
        <button className="modelName" type="button">
          <Zap size={16} />
          deepseek-v4-flash
        </button>
        <button className="workdir" type="button">
          <Folder size={16} />
          工作目录：Hermes Desktop优化
        </button>
        <button className="contextMeter" type="button">上下文 42%</button>
        <button className="statusIcon" type="button" aria-label="停止当前任务" title={`Bridge: ${bridgeState}`}>
          <Square size={14} />
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
        <textarea aria-label="消息" placeholder="继续描述你的目标，或输入 / 选择技能..." rows={1} />
        <button className="ghostIcon" type="button" aria-label="语音输入">
          <Mic size={19} />
        </button>
        <button className="sendButton" type="button" aria-label="发送">
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
}: {
  activeTab: WorkbenchTab;
  onTabChange: (tab: WorkbenchTab) => void;
  onCollapse: () => void;
  onOpenApproval: (variant: ApprovalVariant) => void;
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

      {activeTab === 'activity' && <WorkbenchActivity onOpenApproval={onOpenApproval} />}
      {activeTab === 'files' && <WorkbenchFiles />}
      {activeTab === 'terminal' && <WorkbenchTerminal />}
      {activeTab === 'preview' && <WorkbenchPreview />}
    </aside>
  );
}

function WorkbenchActivity({ onOpenApproval }: { onOpenApproval: (variant: ApprovalVariant) => void }) {
  return (
    <>
      <section className="taskCard">
        <span>当前任务</span>
        <strong>Hermes Desktop 设计方向</strong>
        <p>正在生成中文优先的 Codex-like 高保真界面稿。</p>
        <div className="progressBar">
          <span />
        </div>
      </section>
      <section className="workbenchList">
        <h3>工具调用</h3>
        <WorkbenchItem state="done" label="读取 page-map.md" value="0.2s" />
        <WorkbenchItem state="done" label="生成界面骨架" value="完成" />
        <WorkbenchItem state="running" label="运行 UI smoke" value="进行中" />
      </section>
      <section className="approvalCard">
        <Shield size={17} />
        <div>
          <strong>需要手动确认高风险命令</strong>
          <span>默认暂停，确认后继续执行。</span>
        </div>
        <button type="button" onClick={() => onOpenApproval('risk')}>查看</button>
      </section>
      <button className="subtleAction" type="button" onClick={() => onOpenApproval('timeout')}>
        <Clock size={15} />
        查看审批超时态
      </button>
    </>
  );
}

function WorkbenchFiles() {
  return (
    <>
      <section className="railSection">
        <h3>变更文件</h3>
        <button className="fileChangeRow selected" type="button">
          <span className="changeTag add">新</span>
          <span>src/App.tsx</span>
          <small>UI</small>
        </button>
        <button className="fileChangeRow" type="button">
          <span className="changeTag mod">改</span>
          <span>src/styles.css</span>
          <small>CSS</small>
        </button>
        <button className="fileChangeRow" type="button">
          <span className="changeTag mod">改</span>
          <span>package.json</span>
          <small>发布</small>
        </button>
      </section>
      <section className="railSection">
        <h3>Diff 摘要</h3>
        <pre className="miniCode"><code>+ Command Center states
+ Approval recovery flow
+ Right Workbench tabs
+ Release scripts</code></pre>
        <div className="workbenchActions">
          <button type="button">打开文件</button>
          <button type="button">复制路径</button>
        </div>
      </section>
    </>
  );
}

function WorkbenchTerminal() {
  return (
    <>
      <section className="railSection terminalSection">
        <div className="terminalHeader">
          <strong>node design/export-screenshots.mjs</strong>
          <button type="button">
            <PauseCircle size={15} />
            停止
          </button>
        </div>
        <pre className="terminalBlock"><code>✓ saved exports/01-chat-workbench.png
✓ saved exports/06a-right-workbench-activity.png
✓ saved exports/07-settings.png
running visual smoke...</code></pre>
      </section>
      <section className="railSection">
        <h3>退出状态</h3>
        <div className="statusLine good">
          <CheckCircle2 size={15} />
          最近一次构建通过 · 0.8s
        </div>
      </section>
    </>
  );
}

function WorkbenchPreview() {
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
        <p>当前产物来自设计截图导出，可打开、刷新或复制路径。</p>
        <div className="workbenchActions">
          <button type="button">刷新</button>
          <button type="button">打开文件</button>
        </div>
      </section>
    </>
  );
}

function WorkbenchItem({ state, label, value }: { state: 'done' | 'running' | 'pending'; label: string; value: string }) {
  return (
    <div className="workbenchItem">
      <span className={`${state}Mark`} />
      <strong>{label}</strong>
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
      desc: '原命令的上下文已经变化，需要重新计算风险和工作目录后再请求确认。',
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
