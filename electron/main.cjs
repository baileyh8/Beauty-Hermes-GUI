const { app, BrowserWindow, clipboard, dialog, ipcMain, Menu } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createGatewayManager } = require('./gateway-manager.cjs');

const isDev = Boolean(process.env.VITE_DEV_SERVER_URL);
const gatewayManager = createGatewayManager();
let mainWindow = null;
const localTelegramOnboardingPairings = new Map();

const LOCAL_MESSAGING_CATALOG = [
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Run Hermes from Telegram DMs, groups, and topics.',
    docs_url: 'https://core.telegram.org/bots/features#botfather',
    env_vars: ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_ALLOWED_USERS', 'TELEGRAM_PROXY'],
    required_env: ['TELEGRAM_BOT_TOKEN'],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Connect Hermes to Discord DMs, channels, and threads.',
    docs_url: 'https://discord.com/developers/applications',
    env_vars: ['DISCORD_BOT_TOKEN', 'DISCORD_ALLOWED_USERS', 'DISCORD_REPLY_TO_MODE'],
    required_env: ['DISCORD_BOT_TOKEN'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Use Hermes from Slack via Socket Mode.',
    docs_url: 'https://api.slack.com/apps',
    env_vars: ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'],
    required_env: ['SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN'],
  },
  {
    id: 'mattermost',
    name: 'Mattermost',
    description: 'Connect Hermes to Mattermost channels and direct messages.',
    docs_url: 'https://mattermost.com/deploy/',
    env_vars: ['MATTERMOST_URL', 'MATTERMOST_TOKEN', 'MATTERMOST_ALLOWED_USERS'],
    required_env: ['MATTERMOST_URL', 'MATTERMOST_TOKEN'],
  },
  {
    id: 'matrix',
    name: 'Matrix',
    description: 'Use Hermes in Matrix rooms and direct messages.',
    docs_url: 'https://matrix.org/ecosystem/servers/',
    env_vars: ['MATRIX_HOMESERVER', 'MATRIX_ACCESS_TOKEN', 'MATRIX_USER_ID', 'MATRIX_ALLOWED_USERS'],
    required_env: ['MATRIX_HOMESERVER', 'MATRIX_ACCESS_TOKEN', 'MATRIX_USER_ID'],
  },
  {
    id: 'signal',
    name: 'Signal',
    description: 'Connect through a signal-cli REST bridge.',
    docs_url: 'https://github.com/bbernhard/signal-cli-rest-api',
    env_vars: ['SIGNAL_HTTP_URL', 'SIGNAL_ACCOUNT', 'SIGNAL_ALLOWED_USERS'],
    required_env: ['SIGNAL_HTTP_URL', 'SIGNAL_ACCOUNT'],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Use Hermes through the bundled WhatsApp bridge with QR-based auth.',
    docs_url: 'https://github.com/tulir/whatsmeow',
    env_vars: ['WHATSAPP_ENABLED', 'WHATSAPP_MODE', 'WHATSAPP_ALLOWED_USERS'],
    required_env: [],
  },
  {
    id: 'homeassistant',
    name: 'Home Assistant',
    description: 'Control your smart home from Hermes via Home Assistant.',
    docs_url: 'https://www.home-assistant.io/docs/authentication/',
    env_vars: ['HASS_URL', 'HASS_TOKEN'],
    required_env: ['HASS_URL', 'HASS_TOKEN'],
  },
  {
    id: 'email',
    name: 'Email',
    description: 'Talk to Hermes through an IMAP/SMTP mailbox.',
    docs_url: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/',
    env_vars: ['EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'EMAIL_IMAP_HOST', 'EMAIL_SMTP_HOST'],
    required_env: ['EMAIL_ADDRESS', 'EMAIL_PASSWORD', 'EMAIL_IMAP_HOST', 'EMAIL_SMTP_HOST'],
  },
  {
    id: 'sms',
    name: 'SMS (Twilio)',
    description: 'Send and receive text messages via Twilio.',
    docs_url: 'https://www.twilio.com/console',
    env_vars: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
    required_env: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'],
  },
  {
    id: 'dingtalk',
    name: 'DingTalk',
    description: 'Connect Hermes to DingTalk groups.',
    docs_url: 'https://open.dingtalk.com/document/orgapp/the-robot-development-process',
    env_vars: ['DINGTALK_CLIENT_ID', 'DINGTALK_CLIENT_SECRET'],
    required_env: ['DINGTALK_CLIENT_ID', 'DINGTALK_CLIENT_SECRET'],
  },
  {
    id: 'feishu',
    name: 'Feishu / Lark',
    description: 'Use Hermes inside Feishu / Lark.',
    docs_url: 'https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/intro',
    env_vars: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET', 'FEISHU_ENCRYPT_KEY', 'FEISHU_VERIFICATION_TOKEN'],
    required_env: ['FEISHU_APP_ID', 'FEISHU_APP_SECRET'],
  },
  {
    id: 'wecom',
    name: 'WeCom (group bot)',
    description: 'Send-only WeCom group bot via webhook.',
    docs_url: 'https://developer.work.weixin.qq.com/document/path/91770',
    env_vars: ['WECOM_BOT_ID', 'WECOM_SECRET'],
    required_env: ['WECOM_BOT_ID'],
  },
  {
    id: 'wecom_callback',
    name: 'WeCom (app)',
    description: 'Two-way WeCom integration via callback app.',
    docs_url: 'https://developer.work.weixin.qq.com/document/path/90930',
    env_vars: ['WECOM_CALLBACK_CORP_ID', 'WECOM_CALLBACK_CORP_SECRET', 'WECOM_CALLBACK_AGENT_ID', 'WECOM_CALLBACK_TOKEN', 'WECOM_CALLBACK_ENCODING_AES_KEY'],
    required_env: ['WECOM_CALLBACK_CORP_ID', 'WECOM_CALLBACK_CORP_SECRET', 'WECOM_CALLBACK_AGENT_ID'],
  },
  {
    id: 'weixin',
    name: 'WeChat (Official Account)',
    description: 'Connect a WeChat Official Account.',
    docs_url: 'https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html',
    env_vars: ['WEIXIN_ACCOUNT_ID', 'WEIXIN_TOKEN', 'WEIXIN_BASE_URL'],
    required_env: ['WEIXIN_ACCOUNT_ID', 'WEIXIN_TOKEN'],
  },
  {
    id: 'bluebubbles',
    name: 'BlueBubbles (iMessage)',
    description: 'Use Hermes through iMessage via a BlueBubbles server.',
    docs_url: 'https://bluebubbles.app/',
    env_vars: ['BLUEBUBBLES_SERVER_URL', 'BLUEBUBBLES_PASSWORD', 'BLUEBUBBLES_ALLOWED_USERS'],
    required_env: ['BLUEBUBBLES_SERVER_URL', 'BLUEBUBBLES_PASSWORD'],
  },
  {
    id: 'qqbot',
    name: 'QQ Bot',
    description: 'Connect Hermes to a QQ Bot from the QQ Open Platform.',
    docs_url: 'https://q.qq.com',
    env_vars: ['QQ_APP_ID', 'QQ_CLIENT_SECRET', 'QQ_ALLOWED_USERS'],
    required_env: ['QQ_APP_ID', 'QQ_CLIENT_SECRET'],
  },
  {
    id: 'api_server',
    name: 'API server',
    description: 'Expose Hermes as an OpenAI-compatible HTTP API.',
    docs_url: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/',
    env_vars: ['API_SERVER_ENABLED', 'API_SERVER_KEY', 'API_SERVER_PORT', 'API_SERVER_HOST', 'API_SERVER_MODEL_NAME'],
    required_env: [],
  },
  {
    id: 'webhook',
    name: 'Webhooks',
    description: 'Receive events from GitHub, GitLab, and other webhook sources.',
    docs_url: 'https://hermes-agent.nousresearch.com/docs/user-guide/messaging/webhooks/',
    env_vars: ['WEBHOOK_ENABLED', 'WEBHOOK_PORT', 'WEBHOOK_SECRET'],
    required_env: [],
  },
];

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

  const profileMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)$/);
  if (method === 'PATCH' && profileMatch) {
    const name = decodeURIComponent(profileMatch[1]);
    return runHermesPython(`${profileToDict}
name = str(payload.get("name") or "").strip()
new_name = str(payload.get("new_name") or "").strip()
path = profiles_mod.rename_profile(name, new_name)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": new_name, "path": str(path), "source": "desktop-local-bridge"}))
`, { name, new_name: body?.new_name || '' }, 30000);
  }

  const soulMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/soul$/);
  if (method === 'GET' && soulMatch) {
    const name = decodeURIComponent(soulMatch[1]);
    return runHermesPython(`${profileToDict}
from pathlib import Path
name = str(payload.get("name") or "").strip()
profile_dir = profiles_mod.get_profile_dir(name)
soul_path = Path(profile_dir) / "SOUL.md"
if soul_path.exists():
    content = soul_path.read_text(encoding="utf-8")
    exists = True
else:
    content = ""
    exists = False
print("__BEAUTY_HERMES_JSON__" + json.dumps({"content": content, "exists": exists, "source": "desktop-local-bridge"}))
`, { name }, 20000);
  }

  if (method === 'PUT' && soulMatch) {
    const name = decodeURIComponent(soulMatch[1]);
    return runHermesPython(`${profileToDict}
from pathlib import Path
name = str(payload.get("name") or "").strip()
content = str(payload.get("content") or "")
profile_dir = profiles_mod.get_profile_dir(name)
soul_path = Path(profile_dir) / "SOUL.md"
soul_path.write_text(content, encoding="utf-8")
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "exists": True, "source": "desktop-local-bridge"}))
`, { name, content: body?.content || '' }, 20000);
  }

  const descriptionMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/description$/);
  if (method === 'PUT' && descriptionMatch) {
    const name = decodeURIComponent(descriptionMatch[1]);
    return runHermesPython(`${profileToDict}
name = str(payload.get("name") or "").strip()
description = str(payload.get("description") or "").strip()
profile_dir = profiles_mod.get_profile_dir(name)
profiles_mod.write_profile_meta(profile_dir, description=description, description_auto=False)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "description": description, "description_auto": False, "source": "desktop-local-bridge"}))
`, { name, description: body?.description || '' }, 20000);
  }

  const modelMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/model$/);
  if (method === 'PUT' && modelMatch) {
    const name = decodeURIComponent(modelMatch[1]);
    return runHermesPython(`${profileToDict}
from hermes_constants import reset_hermes_home_override, set_hermes_home_override
from hermes_cli.config import load_config, save_config
name = str(payload.get("name") or "").strip()
provider = str(payload.get("provider") or "").strip()
model = str(payload.get("model") or "").strip()
if not provider or not model:
    raise SystemExit("provider and model are required")
profile_dir = profiles_mod.get_profile_dir(name)
token = set_hermes_home_override(str(profile_dir))
try:
    cfg = load_config()
    model_cfg = cfg.get("model", {})
    if not isinstance(model_cfg, dict):
        model_cfg = {}
    model_cfg["provider"] = provider
    model_cfg["default"] = model
    model_cfg["name"] = model
    cfg["model"] = model_cfg
    save_config(cfg)
finally:
    reset_hermes_home_override(token)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "provider": provider, "model": model, "source": "desktop-local-bridge"}))
`, { name, model: body?.model || '', provider: body?.provider || '' }, 20000);
  }

  const terminalMatch = url.pathname.match(/^\/api\/profiles\/([^/]+)\/open-terminal$/);
  if (method === 'POST' && terminalMatch) {
    const name = decodeURIComponent(terminalMatch[1]);
    return runHermesPython(`${profileToDict}
import subprocess, sys
name = str(payload.get("name") or "").strip()
profiles_mod.get_profile_dir(name)
command = "hermes setup" if name == "default" else f"{name} setup"
if sys.platform == "darwin":
    escaped = command.replace("\\\\", "\\\\\\\\").replace('"', '\\\\"')
    applescript = 'tell application "Terminal"\\nactivate\\ndo script "' + escaped + '"\\nend tell'
    subprocess.Popen(["osascript", "-e", applescript])
else:
    raise SystemExit("Opening a profile terminal is currently implemented for macOS only")
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "command": command, "source": "desktop-local-bridge"}))
`, { name }, 20000);
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

  if (method === 'GET' && url.pathname === '/api/cron/delivery-targets') {
    return runHermesPython(`${script}
targets = [{"id": "local", "name": "Local (save only)", "home_target_set": True, "home_env_var": None}]
try:
    from cron.scheduler import cron_delivery_targets
    targets.extend(cron_delivery_targets())
except Exception:
    pass
print("__BEAUTY_HERMES_JSON__" + json.dumps({"targets": targets, "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  const actionMatch = url.pathname.match(/^\/api\/cron\/jobs\/([^/]+)(?:\/([^/]+))?$/);
  if (actionMatch) {
    const id = decodeURIComponent(actionMatch[1]);
    const action = actionMatch[2] || '';
    if (method === 'GET' && !action) {
      return runHermesPython(`${script}
job = cron_jobs.get_job(payload.get("id"))
if not job:
    raise SystemExit("Job not found")
print("__BEAUTY_HERMES_JSON__" + json.dumps(normalize(job)))
`, { id }, 20000);
    }
    if (method === 'PUT' && !action) {
      return runHermesPython(`${script}
updates = payload.get("updates") or {}
if not isinstance(updates, dict):
    raise SystemExit("updates must be an object")
job = cron_jobs.update_job(payload.get("id"), updates)
if not job:
    raise SystemExit("Job not found")
print("__BEAUTY_HERMES_JSON__" + json.dumps(normalize(job)))
`, { id, updates: body?.updates || {} }, 30000);
    }
    if (method === 'GET' && action === 'runs') {
      return runHermesPython(`${script}
from pathlib import Path
try:
    from hermes_state import SessionDB
    raw_limit = payload.get("limit") or 20
    limit = max(1, min(int(raw_limit), 100))
    job = cron_jobs.get_job(payload.get("id")) or {"id": payload.get("id")}
    canonical = str(job.get("id") or payload.get("id"))
    db = SessionDB(read_only=True)
    try:
        runs = db.list_cron_job_runs(canonical, limit=limit, offset=0)
    finally:
        db.close()
except Exception:
    limit = 20
    runs = []
print("__BEAUTY_HERMES_JSON__" + json.dumps({"runs": runs, "limit": limit, "source": "desktop-local-bridge"}))
`, { id, limit: Number(url.searchParams.get('limit') || 20) }, 20000);
    }
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
  const catalogJson = JSON.stringify(LOCAL_MESSAGING_CATALOG);
  const script = `
import json, os, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import get_env_value, load_config, remove_env_value, save_config, save_env_value
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
CATALOG = ${catalogJson}
CATALOG_BY_ID = {entry["id"]: entry for entry in CATALOG}
SECRET_WORDS = ("TOKEN", "SECRET", "PASSWORD", "KEY", "AUTH")
ENV_HINTS = {
    "TELEGRAM_BOT_TOKEN": {"prompt": "Bot token", "description": "Telegram BotFather 生成的 token", "password": True},
    "TELEGRAM_ALLOWED_USERS": {"prompt": "Allowed users", "description": "允许使用 bot 的 Telegram 用户 ID，多个用逗号分隔"},
    "TELEGRAM_PROXY": {"prompt": "Proxy", "description": "可选 HTTP/SOCKS proxy"},
    "DISCORD_BOT_TOKEN": {"prompt": "Bot token", "description": "Discord application bot token", "password": True},
    "DISCORD_ALLOWED_USERS": {"prompt": "Allowed users", "description": "允许访问的 Discord 用户 ID"},
    "DISCORD_REPLY_TO_MODE": {"prompt": "Reply mode", "description": "回复消息模式"},
    "SLACK_BOT_TOKEN": {"prompt": "Bot token", "description": "Slack xoxb bot token", "password": True},
    "SLACK_APP_TOKEN": {"prompt": "App token", "description": "Slack xapp Socket Mode token", "password": True},
    "MATTERMOST_URL": {"prompt": "Mattermost URL", "description": "Mattermost server base URL"},
    "MATTERMOST_TOKEN": {"prompt": "Access token", "description": "Mattermost access token", "password": True},
    "MATRIX_HOMESERVER": {"prompt": "Homeserver", "description": "Matrix homeserver URL"},
    "MATRIX_ACCESS_TOKEN": {"prompt": "Access token", "description": "Matrix access token", "password": True},
    "MATRIX_USER_ID": {"prompt": "User ID", "description": "Matrix bot user ID"},
    "SIGNAL_HTTP_URL": {"prompt": "Signal bridge URL", "description": "signal-cli REST API base URL"},
    "SIGNAL_ACCOUNT": {"prompt": "Signal account", "description": "Signal account phone number"},
    "HASS_URL": {"prompt": "Home Assistant URL", "description": "Home Assistant base URL"},
    "HASS_TOKEN": {"prompt": "Access token", "description": "Home Assistant long-lived access token", "password": True},
    "EMAIL_ADDRESS": {"prompt": "Email address", "description": "收发邮件的账号"},
    "EMAIL_PASSWORD": {"prompt": "Email password", "description": "邮箱密码或 app password", "password": True},
    "EMAIL_IMAP_HOST": {"prompt": "IMAP host", "description": "IMAP server host"},
    "EMAIL_SMTP_HOST": {"prompt": "SMTP host", "description": "SMTP server host"},
    "TWILIO_ACCOUNT_SID": {"prompt": "Twilio Account SID", "description": "Twilio Account SID"},
    "TWILIO_AUTH_TOKEN": {"prompt": "Twilio Auth Token", "description": "Twilio Auth Token", "password": True},
}
COMMON = [entry["id"] for entry in CATALOG]
def catalog_lookup(platform_id):
    entry = CATALOG_BY_ID.get(platform_id)
    if entry:
        return entry
    return {"id": platform_id, "name": platform_id.replace("_", " ").title(), "description": "Hermes Gateway platform", "docs_url": "", "env_vars": [], "required_env": []}
def redact(value):
    text = str(value or "")
    if not text:
        return None
    if len(text) <= 8:
        return "****"
    return f"{text[:4]}...{text[-4:]}"
def env_info(key):
    info = ENV_HINTS.get(key, {})
    return {
        "description": info.get("description", ""),
        "prompt": info.get("prompt", key),
        "url": info.get("url"),
        "is_password": bool(info.get("password") or any(word in key.upper() for word in SECRET_WORDS)),
        "advanced": bool(info.get("advanced", False)),
    }
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
    entry = catalog_lookup(platform_id)
    runtime = read_runtime_status() or {}
    runtime_platforms = runtime.get("platforms") if isinstance(runtime, dict) else {}
    runtime_platform = runtime_platforms.get(platform_id, {}) if isinstance(runtime_platforms, dict) else {}
    enabled = platform_enabled(platform_id)
    required_env = set(entry.get("required_env") or [])
    env_vars = []
    for key in entry.get("env_vars") or []:
        value = get_env_value(key) or ""
        env_vars.append({
            "key": key,
            "required": key in required_env,
            "is_set": bool(value),
            "redacted_value": redact(value),
            **env_info(key),
        })
    configured = all(bool(get_env_value(key)) for key in required_env)
    home_channel = None
    if Platform is not None and load_gateway_config is not None:
        try:
            gateway_config = load_gateway_config()
            platform = Platform(platform_id)
            platform_config = gateway_config.platforms.get(platform)
            if platform_config and getattr(platform_config, "home_channel", None):
                home_channel = platform_config.home_channel.to_dict()
        except Exception:
            home_channel = None
    state = runtime_platform.get("state") if isinstance(runtime_platform, dict) else None
    if not enabled:
        state = "disabled"
    elif not configured:
        state = "not_configured"
    elif not state:
        state = "gateway_stopped" if not get_running_pid() else "pending_restart"
    return {
        "id": platform_id,
        "name": entry.get("name") or platform_id.replace("_", " ").title(),
        "description": entry.get("description") or "",
        "docs_url": entry.get("docs_url") or "",
        "enabled": enabled,
        "configured": configured,
        "gateway_running": bool(get_running_pid()),
        "state": state,
        "error_code": runtime_platform.get("error_code") if isinstance(runtime_platform, dict) else None,
        "error_message": runtime_platform.get("error_message") if isinstance(runtime_platform, dict) else None,
        "updated_at": runtime_platform.get("updated_at") if isinstance(runtime_platform, dict) else None,
        "home_channel": home_channel,
        "env_vars": env_vars,
    }
`;

  if (method === 'POST' && url.pathname === '/api/messaging/telegram/onboarding/start') {
    const botName = String(body?.bot_name || 'Hermes Agent').trim() || 'Hermes Agent';
    const pairingId = `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const botSlug = botName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'hermes_agent';
    const record = {
      botToken: `local-telegram-token-${pairingId}`,
      botUsername: `${botSlug}_bot`,
      expiresAt,
      ownerUserId: '10001',
    };
    localTelegramOnboardingPairings.set(pairingId, record);
    return {
      deep_link: `https://t.me/${record.botUsername}?start=${encodeURIComponent(pairingId)}`,
      expires_at: expiresAt,
      pairing_id: pairingId,
      qr_payload: `https://t.me/${record.botUsername}?start=${encodeURIComponent(pairingId)}`,
      source: 'desktop-local-bridge',
      suggested_username: record.botUsername,
    };
  }

  const telegramOnboardingMatch = url.pathname.match(/^\/api\/messaging\/telegram\/onboarding\/([^/]+)(?:\/([^/]+))?$/);
  if (telegramOnboardingMatch) {
    const pairingId = decodeURIComponent(telegramOnboardingMatch[1]);
    const action = telegramOnboardingMatch[2] || '';
    const record = localTelegramOnboardingPairings.get(pairingId);
    if (method === 'GET' && !action) {
      if (!record) {
        throw new Error('Telegram setup session was not found. Start a new setup.');
      }
      return {
        bot_username: record.botUsername,
        expires_at: record.expiresAt,
        owner_user_id: record.ownerUserId,
        source: 'desktop-local-bridge',
        status: 'ready',
      };
    }
    if (method === 'DELETE' && !action) {
      localTelegramOnboardingPairings.delete(pairingId);
      return { ok: true, source: 'desktop-local-bridge' };
    }
    if (method === 'POST' && action === 'apply') {
      if (!record) {
        throw new Error('Telegram setup session was not found. Start a new setup.');
      }
      const allowedUserIds = Array.isArray(body?.allowed_user_ids)
        ? body.allowed_user_ids.map((item) => String(item).trim()).filter(Boolean)
        : [];
      if (!allowedUserIds.length || allowedUserIds.some((item) => !/^\d+$/.test(item))) {
        throw new Error('Allowed Telegram user IDs must be numeric.');
      }
      const result = await runHermesPython(`${script}
allowed_user_ids = [str(item).strip() for item in payload.get("allowed_user_ids", []) if str(item).strip()]
save_env_value("TELEGRAM_BOT_TOKEN", str(payload.get("bot_token") or "").strip())
save_env_value("TELEGRAM_ALLOWED_USERS", ",".join(allowed_user_ids))
set_platform_enabled("telegram", True)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "platform": "telegram", "bot_username": payload.get("bot_username"), "needs_restart": True, "source": "desktop-local-bridge"}))
`, {
        allowed_user_ids: allowedUserIds,
        bot_token: record.botToken,
        bot_username: record.botUsername,
      }, 30000);
      localTelegramOnboardingPairings.delete(pairingId);
      return result;
    }
  }

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
entry = catalog_lookup(platform_id)
allowed_env = set(entry.get("env_vars") or [])
for key in payload.get("clear_env") or []:
    if key not in allowed_env:
        raise SystemExit(f"{key} is not configurable for {entry.get('name') or platform_id}")
    remove_env_value(key)
for key, value in (payload.get("env") or {}).items():
    if key not in allowed_env:
        raise SystemExit(f"{key} is not configurable for {entry.get('name') or platform_id}")
    trimmed = str(value or "").strip()
    if trimmed:
        save_env_value(key, trimmed)
if "enabled" in payload and payload.get("enabled") is not None:
    set_platform_enabled(platform_id, bool(payload.get("enabled")))
item = payload_for(platform_id)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "platform": platform_id, "enabled": item.get("enabled"), "configured": item.get("configured"), "source": "desktop-local-bridge"}))
`, { ...(body || {}), id }, 20000);
    }
    if (method === 'POST' && action === 'test') {
      return runHermesPython(`${script}
platform_id = str(payload.get("id") or "").strip()
item = payload_for(platform_id)
missing = [field.get("key") for field in item.get("env_vars", []) if field.get("required") and not field.get("is_set")]
ok = bool(item.get("enabled") and item.get("configured") and item.get("gateway_running") and item.get("state") == "connected")
if not item.get("enabled"):
    message = "平台已停用。"
elif missing:
    message = "缺少必填配置：" + ", ".join(missing)
elif not item.get("gateway_running"):
    message = "配置已保存，Gateway 未运行或需要重启后检查连接。"
else:
    message = "配置已保存，等待 Gateway 报告连接状态。"
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": ok, "state": item.get("state"), "message": message, "source": "desktop-local-bridge"}))
`, { id }, 20000);
    }
  }

  return null;
}

async function localSettingsApi(method, url, body) {
  if (method === 'GET' && url.pathname === '/api/model/options') {
    return runHermesPython(`
import json
from hermes_cli.inventory import build_models_payload, load_picker_context
payload = build_models_payload(
    load_picker_context(),
    max_models=50,
    include_unconfigured=True,
    picker_hints=True,
    canonical_order=True,
    pricing=False,
    capabilities=False,
)
payload["source"] = "desktop-local-bridge"
print("__BEAUTY_HERMES_JSON__" + json.dumps(payload))
`, {}, 30000);
  }

  if (method === 'POST' && url.pathname === '/api/model/set') {
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config, save_config
scope = str(payload.get("scope") or "main").strip().lower()
provider = str(payload.get("provider") or "").strip()
model = str(payload.get("model") or "").strip()
if scope != "main":
    raise SystemExit("Only main model assignment is supported by the desktop local bridge.")
if not provider or not model:
    raise SystemExit("provider and model are required")
cfg = load_config()
model_cfg = cfg.get("model", {})
if not isinstance(model_cfg, dict):
    model_cfg = {}
model_cfg["provider"] = provider
model_cfg["default"] = model
model_cfg["name"] = model
cfg["model"] = model_cfg
save_config(cfg)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "scope": scope, "provider": provider, "model": model, "source": "desktop-local-bridge"}))
`, body || {}, 20000);
  }

  if (method === 'GET' && url.pathname === '/api/tools/toolsets') {
    return runHermesPython(`
import json
from hermes_cli.config import load_config
from hermes_cli.tools_config import _get_effective_configurable_toolsets, _get_platform_tools, _toolset_has_keys, gui_toolset_label
from toolsets import resolve_toolset
config = load_config()
enabled_toolsets = _get_platform_tools(config, "cli", include_default_mcp_servers=False)
rows = []
for name, label, desc in _get_effective_configurable_toolsets():
    try:
        tools = sorted(set(resolve_toolset(name)))
    except Exception:
        tools = []
    is_enabled = name in enabled_toolsets
    rows.append({
        "name": name,
        "label": gui_toolset_label(label),
        "description": desc,
        "enabled": is_enabled,
        "available": is_enabled,
        "configured": _toolset_has_keys(name, config),
        "tools": tools,
    })
print("__BEAUTY_HERMES_JSON__" + json.dumps(rows))
`, {}, 20000);
  }

  const toolsetConfigMatch = url.pathname.match(/^\/api\/tools\/toolsets\/([^/]+)\/config$/);
  if (method === 'GET' && toolsetConfigMatch) {
    const name = decodeURIComponent(toolsetConfigMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import get_env_value, load_config
from hermes_cli.tools_config import TOOL_CATEGORIES, _get_effective_configurable_toolsets, _is_provider_active, _visible_providers
name = str(payload.get("name") or "").strip()
valid = {item[0] for item in _get_effective_configurable_toolsets()}
if name not in valid:
    raise SystemExit(f"Unknown toolset: {name}")
config = load_config()
cat = TOOL_CATEGORIES.get(name)
providers = []
active_provider = None
if cat:
    for prov in _visible_providers(cat, config, force_fresh=True):
        env_vars = []
        for env in prov.get("env_vars", []):
            key = env["key"]
            env_vars.append({
                "key": key,
                "prompt": env.get("prompt", key),
                "url": env.get("url"),
                "default": env.get("default"),
                "is_set": bool(get_env_value(key)),
            })
        is_active = _is_provider_active(prov, config, force_fresh=True)
        if is_active and active_provider is None:
            active_provider = prov["name"]
        providers.append({
            "name": prov["name"],
            "badge": prov.get("badge", ""),
            "tag": prov.get("tag", ""),
            "env_vars": env_vars,
            "post_setup": prov.get("post_setup"),
            "requires_nous_auth": bool(prov.get("requires_nous_auth")),
            "is_active": is_active,
        })
print("__BEAUTY_HERMES_JSON__" + json.dumps({"name": name, "has_category": cat is not None, "providers": providers, "active_provider": active_provider, "source": "desktop-local-bridge"}))
`, { name }, 20000);
  }

  const toolsetMatch = url.pathname.match(/^\/api\/tools\/toolsets\/([^/]+)$/);
  if (method === 'PUT' && toolsetMatch) {
    const name = decodeURIComponent(toolsetMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config
from hermes_cli.tools_config import _get_effective_configurable_toolsets, _get_platform_tools, _save_platform_tools
name = str(payload.get("name") or "").strip()
enabled_next = bool(payload.get("enabled"))
valid = {item[0] for item in _get_effective_configurable_toolsets()}
if name not in valid:
    raise SystemExit(f"Unknown toolset: {name}")
config = load_config()
enabled = set(_get_platform_tools(config, "cli", include_default_mcp_servers=False))
if enabled_next:
    enabled.add(name)
else:
    enabled.discard(name)
_save_platform_tools(config, "cli", enabled)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "enabled": enabled_next, "source": "desktop-local-bridge"}))
`, { name, enabled: Boolean(body?.enabled) }, 20000);
  }

  const toolsetProviderMatch = url.pathname.match(/^\/api\/tools\/toolsets\/([^/]+)\/provider$/);
  if (method === 'PUT' && toolsetProviderMatch) {
    const name = decodeURIComponent(toolsetProviderMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config, save_config
from hermes_cli.tools_config import _get_effective_configurable_toolsets, apply_provider_selection
name = str(payload.get("name") or "").strip()
provider = str(payload.get("provider") or "").strip()
valid = {item[0] for item in _get_effective_configurable_toolsets()}
if name not in valid:
    raise SystemExit(f"Unknown toolset: {name}")
if not provider:
    raise SystemExit("provider is required")
config = load_config()
apply_provider_selection(name, provider, config)
save_config(config)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "provider": provider, "source": "desktop-local-bridge"}))
`, { name, provider: body?.provider || '' }, 20000);
  }

  const toolsetEnvMatch = url.pathname.match(/^\/api\/tools\/toolsets\/([^/]+)\/env$/);
  if (method === 'PUT' && toolsetEnvMatch) {
    const name = decodeURIComponent(toolsetEnvMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import get_env_value, load_config, save_env_value
from hermes_cli.tools_config import TOOL_CATEGORIES, _get_effective_configurable_toolsets, _visible_providers
name = str(payload.get("name") or "").strip()
env_payload = payload.get("env") or {}
if not isinstance(env_payload, dict):
    raise SystemExit("env must be an object")
valid = {item[0] for item in _get_effective_configurable_toolsets()}
if name not in valid:
    raise SystemExit(f"Unknown toolset: {name}")
config = load_config()
cat = TOOL_CATEGORIES.get(name)
allowed = set()
if cat:
    for prov in _visible_providers(cat, config, force_fresh=True):
        for env in prov.get("env_vars", []):
            allowed.add(env["key"])
unknown = [key for key in env_payload if key not in allowed]
if unknown:
    raise SystemExit(f"Unknown env var(s) for toolset {name}: {', '.join(sorted(unknown))}")
saved = []
skipped = []
for key, value in env_payload.items():
    text = str(value or "").strip()
    if text:
        save_env_value(key, text)
        saved.append(key)
    else:
        skipped.append(key)
status = {key: bool(get_env_value(key)) for key in allowed}
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "saved": saved, "skipped": skipped, "is_set": status, "source": "desktop-local-bridge"}))
`, { name, env: body?.env || {} }, 20000);
  }

  if (method === 'GET' && url.pathname === '/api/mcp/servers') {
    return runHermesPython(`
import json
from hermes_cli.mcp_config import _get_mcp_servers
def summary(name, cfg):
    return {
        "name": name,
        "transport": "http" if cfg.get("url") else ("stdio" if cfg.get("command") else "unknown"),
        "url": cfg.get("url"),
        "command": cfg.get("command"),
        "args": list(cfg.get("args") or []),
        "auth": cfg.get("auth"),
        "enabled": cfg.get("enabled", True) is not False,
        "tools": cfg.get("tools"),
    }
servers = _get_mcp_servers()
print("__BEAUTY_HERMES_JSON__" + json.dumps({"servers": [summary(name, cfg) for name, cfg in sorted(servers.items())], "source": "desktop-local-bridge"}))
`, {}, 20000);
  }

  if (method === 'POST' && url.pathname === '/api/mcp/servers') {
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.mcp_config import _get_mcp_servers, _save_mcp_server
name = str(payload.get("name") or "").strip()
url = str(payload.get("url") or "").strip()
command = str(payload.get("command") or "").strip()
args = payload.get("args") or []
env = payload.get("env") or {}
auth = payload.get("auth")
if not name:
    raise SystemExit("Server name is required")
if name in _get_mcp_servers():
    raise SystemExit(f"Server '{name}' already exists")
if not url and not command:
    raise SystemExit("Provide either a URL or a command")
cfg = {}
if url:
    cfg["url"] = url
if command:
    cfg["command"] = command
    if isinstance(args, list) and args:
        cfg["args"] = [str(item) for item in args]
if isinstance(env, dict) and env:
    cfg["env"] = env
if auth:
    cfg["auth"] = auth
_save_mcp_server(name, cfg)
transport = "http" if cfg.get("url") else ("stdio" if cfg.get("command") else "unknown")
result = {
    "name": name,
    "transport": transport,
    "url": cfg.get("url"),
    "command": cfg.get("command"),
    "args": list(cfg.get("args") or []),
    "auth": cfg.get("auth"),
    "enabled": cfg.get("enabled", True) is not False,
    "tools": cfg.get("tools"),
    "source": "desktop-local-bridge",
}
print("__BEAUTY_HERMES_JSON__" + json.dumps(result))
`, body || {}, 20000);
  }

  const mcpDeleteMatch = url.pathname.match(/^\/api\/mcp\/servers\/([^/]+)$/);
  if (method === 'DELETE' && mcpDeleteMatch) {
    const name = decodeURIComponent(mcpDeleteMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.mcp_config import _remove_mcp_server
name = str(payload.get("name") or "").strip()
if not _remove_mcp_server(name):
    raise SystemExit(f"Server '{name}' not found")
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "source": "desktop-local-bridge"}))
`, { name }, 20000);
  }

  const mcpEnabledMatch = url.pathname.match(/^\/api\/mcp\/servers\/([^/]+)\/enabled$/);
  if (method === 'PUT' && mcpEnabledMatch) {
    const name = decodeURIComponent(mcpEnabledMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.config import load_config, save_config
name = str(payload.get("name") or "").strip()
enabled = bool(payload.get("enabled"))
cfg = load_config()
servers = cfg.get("mcp_servers")
if not isinstance(servers, dict) or name not in servers:
    raise SystemExit(f"Server '{name}' not found")
if not isinstance(servers[name], dict):
    raise SystemExit("Malformed server config")
servers[name]["enabled"] = enabled
save_config(cfg)
print("__BEAUTY_HERMES_JSON__" + json.dumps({"ok": True, "name": name, "enabled": enabled, "source": "desktop-local-bridge"}))
`, { name, enabled: Boolean(body?.enabled) }, 20000);
  }

  const mcpTestMatch = url.pathname.match(/^\/api\/mcp\/servers\/([^/]+)\/test$/);
  if (method === 'POST' && mcpTestMatch) {
    const name = decodeURIComponent(mcpTestMatch[1]);
    return runHermesPython(`
import json, sys
payload = json.loads(sys.stdin.read() or "{}")
from hermes_cli.mcp_config import _get_mcp_servers, _probe_single_server
name = str(payload.get("name") or "").strip()
servers = _get_mcp_servers()
if name not in servers:
    raise SystemExit(f"Server '{name}' not found")
try:
    tools = _probe_single_server(name, servers[name])
    result = {"ok": True, "tools": [{"name": t, "description": d} for t, d in tools], "source": "desktop-local-bridge"}
except Exception as exc:
    result = {"ok": False, "error": str(exc), "tools": [], "source": "desktop-local-bridge"}
print("__BEAUTY_HERMES_JSON__" + json.dumps(result))
`, { name }, 30000);
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
    localSettingsApi,
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
    || url.pathname.startsWith('/api/model')
    || url.pathname.startsWith('/api/tools/toolsets')
    || url.pathname.startsWith('/api/mcp/servers')
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
