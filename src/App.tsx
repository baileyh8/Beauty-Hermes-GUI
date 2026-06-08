import {
  Archive,
  Bot,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clipboard,
  Command,
  Ellipsis,
  File,
  Folder,
  Image,
  Inbox,
  Layers,
  Link,
  MessageSquare,
  Mic,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Search,
  SendHorizontal,
  Settings,
  Shield,
  Sparkles,
  Square,
  TerminalSquare,
  Trash2,
  UserRound,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Surface = 'chat' | 'projects' | 'settings';
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

const workbenchItems = [
  { label: '读取 page-map.md', value: '0.2s', done: true },
  { label: '生成界面骨架', value: '完成', done: true },
  { label: '运行 UI smoke', value: '队列', done: false },
];

const settingsSections: Array<{ id: SettingsSection; label: string; desc: string }> = [
  { id: 'general', label: '通用', desc: '语言、启动和窗口行为' },
  { id: 'models', label: '模型', desc: '默认模型和推理强度' },
  { id: 'permissions', label: '权限', desc: '审批、文件和命令策略' },
  { id: 'integrations', label: '集成', desc: 'Hermes Agent 与本地服务' },
  { id: 'appearance', label: '外观', desc: '主题、密度和字体' },
  { id: 'advanced', label: '高级', desc: '日志、诊断和实验项' },
];

function App() {
  const [surface, setSurface] = useState<Surface>('chat');
  const [rightOpen, setRightOpen] = useState(true);
  const [attachmentOpen, setAttachmentOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('general');
  const [bridgeState, setBridgeState] = useState('浏览器预览');

  useEffect(() => {
    window.hermesDesktop?.getDesktopInfo().then((info) => {
      setBridgeState(info.bridge);
    });
  }, []);

  const surfaceTitle = useMemo(() => {
    if (surface === 'projects') return '项目';
    if (surface === 'settings') return '设置';
    return '修复桌面端审批流';
  }, [surface]);

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="windowControls" aria-hidden="true">
          <span className="traffic red" />
          <span className="traffic yellow" />
          <span className="traffic green" />
        </div>

        <div className="profileBlock">
          <div className="avatar">H</div>
          <div>
            <strong>Hermes</strong>
            <span>本地运行 · DeepSeek V4</span>
          </div>
        </div>

        <button className="primaryButton" type="button" onClick={() => setSurface('chat')}>
          <Plus size={17} />
          新建任务
        </button>

        <label className="searchBox">
          <Search size={15} />
          <input aria-label="搜索" placeholder="搜索会话、文件、技能" />
          <kbd>⌘K</kbd>
        </label>

        <nav className="sidebarScroll" aria-label="会话导航">
          <SidebarSection title="置顶" items={pinnedSessions} />
          <ProjectSection items={projects} onOpenProjects={() => setSurface('projects')} />
          <SidebarSection title="最近" items={recentSessions} muted />
        </nav>

        <div className="sidebarFooter">
          <button
            className={surface === 'projects' ? 'footerButton active' : 'footerButton'}
            type="button"
            onClick={() => setSurface('projects')}
          >
            <Layers size={16} />
            项目
          </button>
          <button
            className={surface === 'settings' ? 'footerButton active' : 'footerButton'}
            type="button"
            onClick={() => setSurface('settings')}
          >
            <Settings size={16} />
            设置
          </button>
        </div>
      </aside>

      <main className={rightOpen && surface === 'chat' ? 'content withWorkbench' : 'content'}>
        <header className="topBar">
          <div>
            <h1>{surfaceTitle}</h1>
            <p>{surface === 'chat' ? '目标：让手动 approval 在 GUI 中可见、可追踪、可恢复。' : 'Beauty Hermes GUI'}</p>
          </div>
          <div className="topActions">
            {surface === 'chat' && (
              <>
                <button className="lightButton" type="button">
                  <Folder size={16} />
                  项目
                </button>
                <button className="lightButton" type="button">
                  <Zap size={16} />
                  自动
                </button>
              </>
            )}
            <button className="iconButton" type="button" aria-label="搜索">
              <Search size={17} />
            </button>
            {surface === 'chat' && (
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
            setAttachmentOpen={setAttachmentOpen}
            bridgeState={bridgeState}
          />
        )}
        {surface === 'projects' && <ProjectsSurface />}
        {surface === 'settings' && (
          <SettingsSurface selected={settingsSection} onSelect={setSettingsSection} />
        )}
      </main>

      {surface === 'chat' && (
        rightOpen ? (
          <Workbench onCollapse={() => setRightOpen(false)} />
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
    </div>
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
        <button type="button" aria-label="归档">
          <Archive size={14} />
        </button>
        <button type="button" aria-label="删除">
          <Trash2 size={14} />
        </button>
        <button type="button" aria-label="更多">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

function ChatSurface({
  attachmentOpen,
  setAttachmentOpen,
  bridgeState,
}: {
  attachmentOpen: boolean;
  setAttachmentOpen: (open: boolean) => void;
  bridgeState: string;
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
                <CircleDot size={15} />
                检查本地 app 打包结构
              </div>
              <div>
                <CircleDot size={15} />
                对比官方桌面端与 Tauri 参考项目
              </div>
              <div className="current">
                <CircleDot size={15} />
                整理 Codex-like 设计规格
              </div>
            </div>
          </div>
        </article>

        <article className="message agent">
          <div className="miniAvatar agentMark">H</div>
          <div className="agentContent">
            <p>
              建议把 Hermes Desktop 从“聊天壳”升级为 Agent workbench：左侧管理会话和 profiles，中间是任务线程，右侧稳定承载文件、终端、预览和工具输出。
            </p>
            <div className="artifactGrid">
              <Artifact icon={<File size={19} />} title="变更文件" meta="src/App.tsx" />
              <Artifact icon={<TerminalSquare size={19} />} title="终端输出" meta="typecheck · build" />
              <Artifact icon={<File size={19} />} title="设计规范" meta="docs/page-map.md" />
            </div>
          </div>
        </article>
      </div>

      <Composer attachmentOpen={attachmentOpen} setAttachmentOpen={setAttachmentOpen} bridgeState={bridgeState} />
    </section>
  );
}

function Artifact({ icon, title, meta }: { icon: React.ReactNode; title: string; meta: string }) {
  return (
    <button className="artifact" type="button">
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
    <div className="composerWrap">
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
        <button className="statusIcon" type="button" aria-label="运行中，可停止">
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

function Workbench({ onCollapse }: { onCollapse: () => void }) {
  return (
    <aside className="workbench">
      <div className="workbenchHeader">
        <div className="tabs">
          <button className="selected" type="button">活动</button>
          <button type="button">文件</button>
          <button type="button">终端</button>
        </div>
        <button className="iconButton compact" type="button" aria-label="收起工作区" onClick={onCollapse}>
          <PanelRightClose size={17} />
        </button>
      </div>

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
        {workbenchItems.map((item) => (
          <div className="workbenchItem" key={item.label}>
            <span className={item.done ? 'doneMark' : 'pendingMark'} />
            <strong>{item.label}</strong>
            <em>{item.value}</em>
          </div>
        ))}
      </section>

      <section className="approvalCard">
        <Shield size={17} />
        <div>
          <strong>需要手动确认高风险命令</strong>
          <span>默认暂停，确认后继续执行。</span>
        </div>
      </section>
    </aside>
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
                <Ellipsis size={17} />
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
      </div>
    </div>
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

