const { app, BrowserWindow, clipboard, dialog, ipcMain, Menu } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createGatewayManager } = require('./gateway-manager.cjs');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const gatewayManager = createGatewayManager();
let mainWindow = null;

app.setName('Beauty Hermes GUI');

function createApplicationMenu() {
  const template = [
    {
      label: 'Beauty Hermes GUI',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo', label: '撤销' },
        { role: 'redo', label: '重做' },
        { type: 'separator' },
        { role: 'cut', label: '剪切' },
        { role: 'copy', label: '复制' },
        { role: 'paste', label: '粘贴' },
        { role: 'selectAll', label: '全选' },
      ],
    },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'toggleDevTools', label: '切换开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '进入全屏' },
      ],
    },
    {
      label: '窗口',
      submenu: [
        { role: 'minimize', label: '最小化' },
        { role: 'close', label: '关闭窗口' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function createWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
    return mainWindow;
  }

  const win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1060,
    minHeight: 720,
    title: 'Beauty Hermes GUI',
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f6f7fb',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;

  let smokeCaptureWritten = false;
  let windowReadyLogged = false;
  const showWindow = () => {
    if (win.isDestroyed()) {
      return;
    }

    win.show();
    win.focus();
    if (!windowReadyLogged) {
      windowReadyLogged = true;
      process.stdout.write('[beauty-hermes] window-ready\n');
    }

    if (process.env.BEAUTY_HERMES_CAPTURE_PATH && !smokeCaptureWritten) {
      smokeCaptureWritten = true;
      const captureDelayMs = Number(process.env.BEAUTY_HERMES_CAPTURE_DELAY_MS || 300);
      setTimeout(() => {
        win.webContents.capturePage()
          .then((image) => {
            fs.writeFileSync(process.env.BEAUTY_HERMES_CAPTURE_PATH, image.toPNG());
            process.stdout.write('[beauty-hermes] capture-ready\n');
          })
          .catch((error) => {
            console.error(`[beauty-hermes] capture-failed ${error instanceof Error ? error.message : String(error)}`);
          });
      }, Number.isFinite(captureDelayMs) ? Math.max(0, captureDelayMs) : 300);
    }
  };

  win.once('ready-to-show', showWindow);
  win.webContents.once('did-finish-load', showWindow);
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedUrl) => {
    console.error(`[beauty-hermes] window-load-failed ${errorCode} ${errorDescription} ${validatedUrl}`);
  });
  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  if (isDev) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  return win;
}

async function pickAttachment(event, kind) {
  const owner = BrowserWindow.fromWebContents(event.sender) || mainWindow;

  if (kind === 'clipboard-image') {
    const image = clipboard.readImage();
    if (image.isEmpty()) {
      return [];
    }

    return [{
      kind,
      label: '剪贴板图片',
      text: '[clipboard image]',
    }];
  }

  const optionByKind = {
    file: {
      properties: ['openFile'],
      title: '选择文件',
    },
    folder: {
      properties: ['openDirectory'],
      title: '选择文件夹',
    },
    image: {
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'svg'] }],
      properties: ['openFile'],
      title: '选择图片',
    },
  };
  const options = optionByKind[kind];

  if (!options) {
    return [];
  }

  const result = await dialog.showOpenDialog(owner, {
    ...options,
    message: options.title,
  });

  if (result.canceled) {
    return [];
  }

  return result.filePaths.map((filePath) => ({
    kind,
    label: path.basename(filePath),
    path: filePath,
  }));
}

function safeReadText(filePath, maxBytes = 120000) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      return '';
    }

    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(Math.min(maxBytes, stat.size));
    fs.readSync(fd, buffer, 0, buffer.length, 0);
    fs.closeSync(fd);
    return buffer.toString('utf8');
  } catch {
    return '';
  }
}

function safeReadJson(filePath) {
  const text = safeReadText(filePath);
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function resolveHermesHome() {
  return process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
}

function resolveHermesAgentRepo() {
  const candidates = [
    process.env.HERMES_AGENT_REPO,
    path.join(resolveHermesHome(), 'hermes-agent'),
    path.join(os.homedir(), '.hermes', 'hermes-agent'),
  ].filter(Boolean);

  return candidates.find((candidate) => fs.existsSync(path.join(candidate, 'hermes_cli'))) || candidates[candidates.length - 1];
}

function resolveHermesPython() {
  const agentRepo = resolveHermesAgentRepo();
  const candidates = [
    process.env.HERMES_PYTHON,
    path.join(agentRepo, 'venv', 'bin', 'python'),
    path.join(agentRepo, '.venv', 'bin', 'python'),
    'python3',
    'python',
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === 'python' || candidate === 'python3') {
      return candidate;
    }

    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Try the next candidate.
    }
  }

  return 'python3';
}

function parseJsonMarker(stdout) {
  const marker = '__BEAUTY_HERMES_JSON__';
  const lines = String(stdout || '').trim().split('\n').reverse();
  const line = lines.find((item) => item.startsWith(marker));
  if (!line) {
    throw new Error(`Hermes operation did not return JSON: ${String(stdout || '').slice(-800)}`);
  }
  return JSON.parse(line.slice(marker.length));
}

function runHermesPython(script, payload = {}, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const agentRepo = resolveHermesAgentRepo();
    const child = spawn(resolveHermesPython(), ['-c', script], {
      cwd: agentRepo,
      env: {
        ...process.env,
        HERMES_HOME: resolveHermesHome(),
        PYTHONPATH: [
          agentRepo,
          process.env.PYTHONPATH,
        ].filter(Boolean).join(path.delimiter),
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => {
      child.kill('SIGTERM');
      reject(new Error(`Hermes operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 240000) {
        stdout = stdout.slice(-240000);
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 24000) {
        stderr = stderr.slice(-24000);
      }
    });
    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr.trim() || stdout.trim() || `Hermes operation failed with exit code ${code}`));
        return;
      }

      try {
        resolve(parseJsonMarker(stdout));
      } catch (error) {
        reject(error);
      }
    });

    child.stdin.end(JSON.stringify(payload));
  });
}

async function localProfilesApi(method, url, body) {
  const profileToDict = `
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli import profiles as profiles_mod
def profile_to_dict(info):
    return {
        "name": getattr(info, "name", ""),
        "path": str(getattr(info, "path", "")),
        "is_default": bool(getattr(info, "is_default", False)),
        "model": getattr(info, "model", None),
        "provider": getattr(info, "provider", None),
        "has_env": bool(getattr(info, "has_env", False)),
        "skill_count": int(getattr(info, "skill_count", 0) or 0),
        "gateway_running": bool(getattr(info, "gateway_running", False)),
        "description": getattr(info, "description", "") or "",
        "description_auto": bool(getattr(info, "description_auto", False)),
        "distribution_name": getattr(info, "distribution_name", None),
        "distribution_version": getattr(info, "distribution_version", None),
        "distribution_source": getattr(info, "distribution_source", None),
        "has_alias": getattr(info, "alias_path", None) is not None,
    }
`;

  if (method === 'GET' && url.pathname === '/api/profiles') {
    return runHermesPython(`${profileToDict}
profiles = [profile_to_dict(item) for item in profiles_mod.list_profiles()]
print("__BEAUTY_HERMES_JSON__" + json.dumps({"profiles": profiles, "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  if (method === 'GET' && url.pathname === '/api/profiles/active') {
    return runHermesPython(`${profileToDict}
active = profiles_mod.get_active_profile() or "default"
current = profiles_mod.get_active_profile_name() or "default"
print("__BEAUTY_HERMES_JSON__" + json.dumps({"active": active, "current": current, "source": "desktop-local-bridge"}))
`, {}, 12000);
  }

  if (method === 'POST' && url.pathname === '/api/profiles') {
    return runHermesPython(`${profileToDict}
name = str(payload.get("name") or "").strip()
explicit_source = str(payload.get("clone_from") or "").strip()
clone_all = bool(payload.get("clone_all"))
no_skills = bool(payload.get("no_skills"))
description = payload.get("description")
if explicit_source:
    clone = True
    clone_from = explicit_source
    clone_config = not clone_all
else:
    clone = bool(payload.get("clone_from_default")) or clone_all
    clone_from = "default" if clone else None
    clone_config = bool(payload.get("clone_from_default")) and not clone_all
path = profiles_mod.create_profile(
    name=name,
    clone_from=clone_from,
    clone_all=clone_all,
    clone_config=clone_config,
    no_skills=no_skills,
    description=description,
)
if not clone:
    profiles_mod.seed_profile_skills(path, quiet=True)
try:
    if not profiles_mod.check_alias_collision(name):
        profiles_mod.create_wrapper_script(name)
except Exception:
    pass
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "path": str(path), "source": "desktop-local-bridge"}))
`, body || {}, 70000);
  }

  if (method === 'POST' && url.pathname === '/api/profiles/active') {
    return runHermesPython(`${profileToDict}
name = str(payload.get("name") or "").strip()
profiles_mod.set_active_profile(name)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "active": profiles_mod.normalize_profile_name(name), "source": "desktop-local-bridge"}))
`, body || {}, 20000);
  }

  const setupMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/setup-command$/);
  if (method === 'GET' && setupMatch) {
    const name = decodeURIComponent(setupMatch[1]);
    return {
      command: name === 'default' ? 'hermes' : `hermes -p ${name}`,
      source: 'desktop-local-bridge',
    };
  }

  const deleteMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)$/);
  if (method === 'DELETE' && deleteMatch) {
    const name = decodeURIComponent(deleteMatch[1]);
    return runHermesPython(`${profileToDict}
name = str(payload.get("name") or "").strip()
path = profiles_mod.delete_profile(name, yes=True)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "path": str(path), "source": "desktop-local-bridge"}))
`, { name }, 30000);
  }

  return null;
}

async function localSkillsApi(method, url, body) {
  const script = `
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config
from hermes_cli.skills_config import get_disabled_skills, save_disabled_skills
from tools.skills_tool import _find_all_skills
config = load_config()
disabled = get_disabled_skills(config)
`;

  if (method === 'GET' && url.pathname === '/api/skills') {
    return runHermesPython(`${script}
skills = _find_all_skills(skip_disabled=True)
for skill in skills:
    skill["enabled"] = skill.get("name") not in disabled
print("__BEAUTY_HERMES_JSON__" + json.dumps({"skills": skills, "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  if (method === 'PUT' && url.pathname === '/api/skills/toggle') {
    return runHermesPython(`${script}
name = str(payload.get("name") or "").strip()
enabled = bool(payload.get("enabled"))
if enabled:
    disabled.discard(name)
else:
    disabled.add(name)
save_disabled_skills(config, disabled)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "enabled": enabled, "source": "desktop-local-bridge"}))
`, body || {}, 20000);
  }

  return null;
}

async function localCronApi(method, url, body) {
  const script = `
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from cron import jobs as cron_jobs
def normalize(job):
    if not job:
        return job
    out = dict(job)
    schedule = out.get("schedule")
    if isinstance(schedule, dict):
        out["schedule_raw"] = schedule
        out["schedule"] = out.get("schedule_display") or schedule.get("display") or schedule.get("kind") or "未设置 schedule"
    elif schedule is None:
        out["schedule"] = out.get("schedule_display") or "未设置 schedule"
    out["paused"] = bool(out.get("enabled") is False or out.get("state") == "paused")
    return out
`;

  if (method === 'GET' && url.pathname === '/api/cron/jobs') {
    return runHermesPython(`${script}
items = [normalize(item) for item in cron_jobs.list_jobs(include_disabled=True)]
print("__BEAUTY_HERMES_JSON__" + json.dumps({"jobs": items, "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  if (method === 'POST' && url.pathname === '/api/cron/jobs') {
    return runHermesPython(`${script}
job = cron_jobs.create_job(
    prompt=payload.get("prompt"),
    schedule=payload.get("schedule") or "0 9 * * *",
    name=payload.get("name") or None,
    deliver=payload.get("deliver") or "local",
    profile=payload.get("profile"),
)
print("__BEAUTY_HERMES_JSON__" + json.dumps(normalize(job)))
`, { ...(body || {}), profile: url.searchParams.get('profile') || body?.profile || 'default' }, 30000);
  }

  const actionMatch = url.pathname.match(/^\/api\/cron\/jobs\/([^/]+)(?:\/([^/]+))?$/);
  if (actionMatch) {
    const id = decodeURIComponent(actionMatch[1]);
    const action = actionMatch[2] || '';
    if (method === 'DELETE' && !action) {
      return runHermesPython(`${script}
ok = cron_jobs.remove_job(payload.get("id"))
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": bool(ok), "source": "desktop-local-bridge"}))
`, { id }, 30000);
    }
    if (method === 'POST' && ['pause', 'resume', 'trigger'].includes(action)) {
      const functionName = action === 'pause' ? 'pause_job' : action === 'resume' ? 'resume_job' : 'trigger_job';
      return runHermesPython(`${script}
job = cron_jobs.${functionName}(payload.get("id"))
if not job:
    raise SystemExit("Job not found")
print("__BEAUTY_HERMES_JSON__" + json.dumps(normalize(job)))
`, { id }, 30000);
    }
  }

  return null;
}

async function localMessagingApi(method, url, body) {
  const script = `
import json, os, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config, save_config
try:
    from gateway.config import Platform, load_gateway_config
except Exception:
    Platform = None
    load_gateway_config = None
try:
    from gateway.status import get_running_pid, read_runtime_status
except Exception:
    get_running_pid = lambda: None
    read_runtime_status = lambda: {}
COMMON = ["telegram", "discord", "whatsapp", "slack", "signal", "mattermost", "matrix", "email", "sms", "dingtalk", "api_server", "webhook", "feishu", "wecom", "weixin", "qqbot"]
def platform_ids():
    ids = []
    if Platform is not None:
        ids.extend([m.value for m in Platform.__members__.values() if m.value != "local"])
    ids.extend(COMMON)
    cfg = load_config()
    platforms = cfg.get("platforms", {})
    if isinstance(platforms, dict):
        ids.extend(platforms.keys())
    seen = set()
    return [x for x in ids if isinstance(x, str) and x and not (x in seen or seen.add(x))]
def platform_enabled(platform_id):
    if Platform is not None and load_gateway_config is not None:
        try:
            gateway_config = load_gateway_config()
            platform = Platform(platform_id)
            platform_config = gateway_config.platforms.get(platform)
            return bool(platform_config and platform_config.enabled)
        except Exception:
            pass
    cfg = load_config()
    item = (cfg.get("platforms", {}) or {}).get(platform_id, {})
    return bool(isinstance(item, dict) and item.get("enabled") is not False and item)
def set_platform_enabled(platform_id, enabled):
    cfg = load_config()
    platforms = cfg.setdefault("platforms", {})
    if not isinstance(platforms, dict):
        platforms = {}
        cfg["platforms"] = platforms
    item = platforms.setdefault(platform_id, {})
    if not isinstance(item, dict):
        item = {}
        platforms[platform_id] = item
    item["enabled"] = bool(enabled)
    save_config(cfg)
def payload_for(platform_id):
    runtime = read_runtime_status() or {}
    runtime_platforms = runtime.get("platforms") if isinstance(runtime, dict) else {}
    runtime_platform = runtime_platforms.get(platform_id, {}) if isinstance(runtime_platforms, dict) else {}
    enabled = platform_enabled(platform_id)
    state = runtime_platform.get("state") if isinstance(runtime_platform, dict) else None
    if not enabled:
        state = "disabled"
    elif not state:
        state = "gateway_stopped" if not get_running_pid() else "pending_restart"
    return {
        "id": platform_id,
        "name": platform_id.replace("_", " ").title(),
        "description": "Hermes Gateway platform",
        "enabled": enabled,
        "configured": enabled,
        "gateway_running": bool(get_running_pid()),
        "state": state,
        "updated_at": runtime_platform.get("updated_at") if isinstance(runtime_platform, dict) else None,
        "env_vars": [],
    }
`;

  if (method === 'GET' && url.pathname === '/api/messaging/platforms') {
    return runHermesPython(`${script}
items = [payload_for(pid) for pid in platform_ids()]
print("__BEAUTY_HERMES_JSON__" + json.dumps({"platforms": items, "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  const match = url.pathname.match(/^\/api\/messaging\/platforms\/([^/]+)(?:\/([^/]+))?$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    const action = match[2] || '';
    if (method === 'PUT' && !action) {
      return runHermesPython(`${script}
platform_id = str(payload.get("id") or "").strip()
enabled = bool(payload.get("enabled"))
set_platform_enabled(platform_id, enabled)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "platform": platform_id, "enabled": enabled, "source": "desktop-local-bridge"}))
`, { ...(body || {}), id }, 20000);
    }
    if (method === 'POST' && action === 'test') {
      return runHermesPython(`${script}
platform_id = str(payload.get("id") or "").strip()
item = payload_for(platform_id)
ok = bool(item.get("enabled") and item.get("gateway_running") and item.get("state") == "connected")
message = "连接正常" if ok else ("Gateway 未运行，重启后检查连接。" if item.get("enabled") else "平台已停用。")
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": ok, "state": item.get("state"), "message": message, "source": "desktop-local-bridge"}))
`, { id }, 20000);
    }
  }

  return null;
}

function walkFiles(root, matcher, limit = 120) {
  const files = [];

  function walk(dir) {
    if (files.length >= limit) {
      return;
    }

    let entries = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= limit) {
        return;
      }
      if (entry.name === 'node_modules' || entry.name === '.git') {
        continue;
      }

      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && matcher(entryPath, entry.name)) {
        files.push(entryPath);
      }
    }
  }

  walk(root);
  return files;
}

function yamlValue(text, key) {
  const match = text.match(new RegExp(`(?:^|\\n)\\s*${key}:\\s*([^\\n]+)`));
  return match ? match[1].trim().replace(/^['"]|['"]$/g, '') : '';
}

function yamlNestedValue(text, section, key) {
  const sectionMatch = text.match(new RegExp(`(?:^|\\n)${section}:\\n([\\s\\S]*?)(?=\\n\\S|$)`));
  return sectionMatch ? yamlValue(sectionMatch[1], key) : '';
}

function yamlList(text, key) {
  const match = text.match(new RegExp(`(?:^|\\n)${key}:\\n((?:\\s*-.*\\n?)+)`));
  if (!match) {
    return [];
  }

  return match[1]
    .split('\n')
    .map((line) => line.replace(/^\s*-\s*/, '').trim())
    .filter(Boolean);
}

function parseSkillFile(filePath, root) {
  const text = safeReadText(filePath, 6000);
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---/);
  const meta = frontmatter?.[1] || '';
  const relative = path.relative(root, path.dirname(filePath));
  const name = yamlValue(meta, 'name') || relative.split(path.sep).filter(Boolean).pop() || 'skill';
  const description = yamlValue(meta, 'description') || text.split('\n').find((line) => line.trim() && !line.startsWith('#')) || '';

  return {
    description: String(description).slice(0, 160),
    name,
    path: relative,
    source: path.basename(root),
  };
}

function pairingCount(hermesHome, platform, state) {
  const data = safeReadJson(path.join(hermesHome, 'pairing', `${platform}-${state}.json`));
  return data && typeof data === 'object' ? Object.keys(data).length : 0;
}

function readHermesInventory() {
  const hermesHome = process.env.HERMES_HOME || path.join(os.homedir(), '.hermes');
  const agentRepo = path.join(hermesHome, 'hermes-agent');
  const configText = safeReadText(path.join(hermesHome, 'config.yaml'));
  const models = safeReadJson(path.join(hermesHome, 'models.json'));
  const gatewayState = safeReadJson(path.join(hermesHome, 'gateway_state.json'));
  const channelDirectory = safeReadJson(path.join(hermesHome, 'channel_directory.json'));
  const desktopSessions = safeReadJson(path.join(hermesHome, 'desktop', 'sessions.json'));
  const processList = safeReadJson(path.join(hermesHome, 'processes.json'));
  const desktopPackage = safeReadJson(path.join(hermesHome, 'package.json'));
  const agentRegistry = safeReadJson(path.join(agentRepo, 'acp_registry', 'agent.json'));

  const skillRoots = [
    path.join(hermesHome, 'skills'),
    path.join(hermesHome, 'hermes-agent', 'plugins'),
  ];
  const skills = skillRoots.flatMap((root) => (
    walkFiles(root, (_filePath, name) => name === 'SKILL.md', 90).map((filePath) => parseSkillFile(filePath, root))
  ));

  const pluginFiles = [
    ...walkFiles(path.join(hermesHome, 'plugins'), (_filePath, name) => name === 'plugin.yaml' || name.endsWith('.plugin.json'), 40),
    ...walkFiles(path.join(agentRepo, 'plugins'), (_filePath, name) => name === 'plugin.yaml' || name.endsWith('.plugin.json'), 40),
  ];
  const plugins = pluginFiles.map((filePath) => {
    const text = safeReadText(filePath, 4000);
    const json = filePath.endsWith('.json') ? safeReadJson(filePath) : null;
    return {
      name: (json && typeof json === 'object' && typeof json.name === 'string' ? json.name : yamlValue(text, 'name')) || path.basename(path.dirname(filePath)),
      path: filePath.replace(os.homedir(), '~'),
      status: 'installed',
    };
  });

  const modelList = Array.isArray(models)
    ? models.map((item) => ({
      baseUrl: typeof item.baseUrl === 'string' ? item.baseUrl : '',
      model: typeof item.model === 'string' ? item.model : '',
      name: typeof item.name === 'string' ? item.name : '',
      provider: typeof item.provider === 'string' ? item.provider : '',
    })).filter((item) => item.name || item.model)
    : [];

  const sessions = Array.isArray(desktopSessions?.sessions) ? desktopSessions.sessions : [];
  const platforms = gatewayState && typeof gatewayState === 'object' && gatewayState.platforms && typeof gatewayState.platforms === 'object'
    ? Object.entries(gatewayState.platforms).map(([name, value]) => ({
      name,
      state: value && typeof value === 'object' && typeof value.state === 'string' ? value.state : 'unknown',
      updatedAt: value && typeof value === 'object' && typeof value.updated_at === 'string' ? value.updated_at : '',
    }))
    : [];
  const channelCounts = channelDirectory && typeof channelDirectory === 'object' && channelDirectory.platforms && typeof channelDirectory.platforms === 'object'
    ? Object.fromEntries(Object.entries(channelDirectory.platforms).map(([name, rows]) => [name, Array.isArray(rows) ? rows.length : 0]))
    : {};

  return {
    config: {
      defaultModel: yamlNestedValue(configText, 'model', 'default'),
      gatewayTimeout: Number(yamlNestedValue(configText, 'agent', 'gateway_timeout')) || null,
      maxTurns: Number(yamlNestedValue(configText, 'agent', 'max_turns')) || null,
      provider: yamlNestedValue(configText, 'model', 'provider'),
      toolsets: yamlList(configText, 'toolsets'),
    },
    diagnostics: {
      agentRepoExists: fs.existsSync(agentRepo),
      configExists: Boolean(configText),
      desktopVersion: typeof desktopPackage?.version === 'string' ? desktopPackage.version : '',
      gatewayPid: typeof gatewayState?.pid === 'number' ? gatewayState.pid : null,
      gatewayState: typeof gatewayState?.gateway_state === 'string' ? gatewayState.gateway_state : '',
      hermesHome,
      hermesVersion: typeof agentRegistry?.version === 'string' ? agentRegistry.version : '',
      processCount: Array.isArray(processList) ? processList.length : 0,
    },
    messaging: {
      channelCounts,
      pairings: {
        feishuApproved: pairingCount(hermesHome, 'feishu', 'approved'),
        feishuPending: pairingCount(hermesHome, 'feishu', 'pending'),
        weixinApproved: pairingCount(hermesHome, 'weixin', 'approved'),
        weixinPending: pairingCount(hermesHome, 'weixin', 'pending'),
      },
      platforms,
      updatedAt: typeof gatewayState?.updated_at === 'string' ? gatewayState.updated_at : '',
    },
    models: modelList,
    plugins,
    sessions: {
      count: sessions.length,
      recent: sessions.slice(0, 8).map((session) => ({
        id: String(session.id || ''),
        messageCount: Number(session.messageCount || 0),
        model: String(session.model || ''),
        source: String(session.source || ''),
        title: String(session.title || '新对话'),
      })),
      sources: sessions.reduce((acc, session) => {
        const source = String(session.source || 'unknown');
        acc[source] = (acc[source] || 0) + 1;
        return acc;
      }, {}),
    },
    skills: skills.slice(0, 80),
  };
}

async function localApiFallback(request, error) {
  const rawPath = String(request?.path || '');
  const method = String(request?.method || 'GET').toUpperCase();

  if (!rawPath.startsWith('/')) {
    return { handled: false };
  }

  const url = new URL(rawPath, 'http://beauty-hermes.local');
  const body = request?.body && typeof request.body === 'object' ? request.body : {};

  const localApis = [
    localProfilesApi,
    localSkillsApi,
    localCronApi,
    localMessagingApi,
  ];

  for (const api of localApis) {
    const value = await api(method, url, body);
    if (value) {
      return { handled: true, value };
    }
  }

  const inventory = readHermesInventory();
  const defaultProfile = {
    description: '来自本机 Hermes 配置的默认工作身份',
    gateway_running: Boolean(inventory.diagnostics.gatewayPid) || inventory.diagnostics.gatewayState === 'connected',
    has_env: fs.existsSync(path.join(inventory.diagnostics.hermesHome, '.env')),
    is_default: true,
    model: inventory.config.defaultModel,
    name: 'default',
    path: inventory.diagnostics.hermesHome,
    provider: inventory.config.provider,
    source: 'desktop-local-bridge',
    skill_count: inventory.skills.length,
  };

  if (method === 'GET' && url.pathname === '/api/profiles') {
    return {
      handled: true,
      value: {
        profiles: [defaultProfile],
        source: 'desktop-local-bridge',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/profiles/active') {
    return {
      handled: true,
      value: {
        active: 'default',
        source: 'desktop-local-bridge',
      },
    };
  }

  const setupMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/setup-command$/);
  if (method === 'GET' && setupMatch) {
    const name = decodeURIComponent(setupMatch[1]);
    return {
      handled: true,
      value: {
        command: name === 'default' ? 'hermes' : '',
        source: 'desktop-local-bridge',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/skills') {
    return {
      handled: true,
      value: {
        skills: inventory.skills.map((skill) => ({
          ...skill,
          enabled: true,
        })),
        source: 'desktop-local-bridge',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/cron/jobs') {
    return {
      handled: true,
      value: {
        jobs: [],
        source: 'desktop-local-bridge',
      },
    };
  }

  if (method === 'GET' && url.pathname === '/api/messaging/platforms') {
    return {
      handled: true,
      value: {
        platforms: inventory.messaging.platforms.map((platform) => ({
          description: `${inventory.messaging.channelCounts[platform.name] ?? 0} 个频道 · ${platform.updatedAt || '未记录更新时间'}`,
          enabled: platform.state !== 'disabled',
          id: platform.name,
          name: platform.name,
          state: platform.state,
          updated_at: platform.updatedAt,
        })),
        source: 'desktop-local-bridge',
      },
    };
  }

  const messagingTestMatch = url.pathname.match(/^\/api\/messaging\/platforms\/([^/]+)\/test$/);
  if (method === 'POST' && messagingTestMatch) {
    const id = decodeURIComponent(messagingTestMatch[1]);
    const platform = inventory.messaging.platforms.find((item) => item.name === id);
    return {
      handled: true,
      value: {
        message: platform
          ? `本机状态：${platform.state || 'unknown'}；当前 Gateway 未暴露平台测试接口。`
          : '当前 Gateway 未暴露平台测试接口。',
        ok: Boolean(platform && platform.state === 'connected'),
        source: 'desktop-local-bridge',
        state: platform?.state || 'unavailable',
      },
    };
  }

  if (method !== 'GET' && (
    url.pathname.startsWith('/api/profiles')
    || url.pathname.startsWith('/api/skills')
    || url.pathname.startsWith('/api/cron/jobs')
    || url.pathname.startsWith('/api/messaging/platforms')
  )) {
    return {
      handled: false,
      error: new Error(`当前 Hermes Gateway 不支持这个桌面增强操作：${method} ${url.pathname}${error ? `；原始错误：${error instanceof Error ? error.message : String(error)}` : ''}`),
    };
  }

  return { handled: false };
}

async function desktopApi(request) {
  try {
    return await gatewayManager.api(request);
  } catch (error) {
    const fallback = await localApiFallback(request, error);
    if (fallback.handled) {
      return fallback.value;
    }
    throw fallback.error || error;
  }
}

app.whenReady().then(() => {
  createApplicationMenu();

  ipcMain.handle('hermes:desktop-info', () => ({
    appName: 'Beauty Hermes GUI',
    bridge: 'electron-ipc',
  }));

  ipcMain.handle('hermes:snapshot', () => ({
    sessions: 7,
    projects: 3,
    pendingApprovals: 0,
    gateway: gatewayManager.getConnection()?.status ?? 'idle',
  }));

  ipcMain.handle('hermes:get-connection', () => gatewayManager.getConnection());
  ipcMain.handle('hermes:start', (_event, options) => gatewayManager.start(options));
  ipcMain.handle('hermes:stop', () => gatewayManager.stop());
  ipcMain.handle('hermes:get-gateway-ws-url', () => gatewayManager.getGatewayWsUrl());
  ipcMain.handle('hermes:api', (_event, request) => desktopApi(request));
  ipcMain.handle('hermes:get-local-inventory', () => readHermesInventory());
  ipcMain.handle('hermes:pick-attachment', (event, kind) => pickAttachment(event, kind));

  createWindow();

  app.on('activate', () => {
    createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  gatewayManager.dispose();
});
