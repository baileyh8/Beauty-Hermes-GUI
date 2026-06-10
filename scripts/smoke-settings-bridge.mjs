import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const rootDir = new URL('..', import.meta.url);
const hermesAgentRepo = process.env.HERMES_AGENT_REPO || join(homedir(), '.hermes', 'hermes-agent');
const hermesHome = mkdtempSync(join(tmpdir(), 'beauty-hermes-bridge-smoke.'));
const port = 9600 + Math.floor(Math.random() * 300);

mkdirSync(hermesHome, { recursive: true });
writeFileSync(
  join(hermesHome, 'config.yaml'),
  [
    'model:',
    '  provider: deepseek',
    '  default: deepseek-v4-flash',
    'platform_toolsets:',
    '  cli: []',
    '',
  ].join('\n'),
);
writeFileSync(join(hermesHome, 'preview-smoke.md'), '# Preview Smoke\n\n- file preview works\n');

const hermesPython = existsSync(join(hermesAgentRepo, 'venv', 'bin', 'python'))
  ? join(hermesAgentRepo, 'venv', 'bin', 'python')
  : 'python3';
const seed = spawnSync(hermesPython, ['-c', `
from hermes_state import SessionDB
db = SessionDB()
try:
    db.create_session("smoke_project_session", "desktop", model="deepseek-v4-flash", cwd="/tmp/beauty-hermes")
    db.set_session_title("smoke_project_session", "Bridge Project Session")
    db.append_message("smoke_project_session", "user", "bridge ui search prompt")
    db.append_message("smoke_project_session", "assistant", "bridge ui search answer")
    db.end_session("smoke_project_session", "smoke")
    db.create_session("smoke_empty_session", "desktop", model="deepseek-v4-flash", cwd="/tmp/beauty-hermes")
    db.end_session("smoke_empty_session", "smoke")
finally:
    db.close()
`], {
  cwd: hermesAgentRepo,
  env: {
    ...process.env,
    HERMES_HOME: hermesHome,
    PYTHONPATH: [hermesAgentRepo, process.env.PYTHONPATH].filter(Boolean).join(delimiter),
  },
  encoding: 'utf8',
});
if (seed.status !== 0) {
  throw new Error(`Failed to seed Hermes sessions: ${seed.stderr || seed.stdout}`);
}

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron', `--remote-debugging-port=${port}`, '.'], {
  cwd: rootDir,
  env: {
    ...process.env,
    BEAUTY_HERMES_SKIP_GATEWAY: '1',
    ELECTRON_ENABLE_LOGGING: '1',
    HERMES_AGENT_REPO: hermesAgentRepo,
    HERMES_HOME: hermesHome,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let exited = false;

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

child.on('exit', () => {
  exited = true;
});

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function waitForTarget() {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline && !exited) {
    try {
      const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
      const page = targets.find((target) => target.type === 'page' && target.webSocketDebuggerUrl);
      if (page) {
        return page.webSocketDebuggerUrl;
      }
    } catch {
      // DevTools endpoint is not ready yet.
    }
    await wait(250);
  }
  throw new Error(`DevTools target was not ready.\n${output.slice(0, 4000)}`);
}

function createCdpClient(url) {
  const ws = new WebSocket(url);
  let id = 0;
  const pending = new Map();

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data.toString());
    if (!message.id || !pending.has(message.id)) {
      return;
    }

    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) {
      reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return {
    async close() {
      ws.close();
    },
    async send(method, params = {}) {
      await opened;
      const messageId = ++id;
      const promise = new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject });
      });
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return promise;
    },
  };
}

async function evaluate(client, expression) {
  const result = await client.send('Runtime.evaluate', {
    awaitPromise: true,
    expression,
    returnByValue: true,
    userGesture: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
  }

  return result.result?.value;
}

let client = null;
try {
  const wsUrl = await waitForTarget();
  client = createCdpClient(wsUrl);
  await client.send('Runtime.enable');
  const result = await evaluate(client, `(${async () => {
    const smokeHermesHome = '__SMOKE_HERMES_HOME__';
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const waitFor = async (predicate, label, timeout = 15000) => {
      const deadline = Date.now() + timeout;
      while (Date.now() < deadline) {
        const value = predicate();
        if (value) {
          return value;
        }
        await sleep(100);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };
    await waitFor(() => window.hermesDesktop?.api, 'desktop api');
    const api = (request) => window.hermesDesktop.api(request);
    const runtimePolicyPath = '/api/settings/runtime-policy';
    const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);
    const runtimePolicyWritableKeys = [
      'clarify_timeout',
      'environment_probe',
      'gateway_timeout',
      'gateway_timeout_warning',
      'image_input_mode',
      'max_turns',
      'task_completion_guidance',
      'tool_use_enforcement',
    ];
    const approvalPolicyPath = '/api/settings/approval-policy';
    const approvalPolicyWritableKeys = [
      'command_allowlist',
      'cron_mode',
      'gateway_timeout',
      'mode',
      'timeout',
    ];
    const extractRuntimePolicy = (response) => {
      const directPolicy = response?.policy || response?.runtime_policy || response?.runtimePolicy || response?.settings;
      const rawPolicy = directPolicy && typeof directPolicy === 'object' && !Array.isArray(directPolicy)
        ? directPolicy
        : response;
      if (!rawPolicy || typeof rawPolicy !== 'object' || Array.isArray(rawPolicy)) {
        throw new Error('Runtime policy response did not return an object');
      }
      const policy = Object.fromEntries(runtimePolicyWritableKeys
        .filter((key) => hasOwn(rawPolicy, key) && rawPolicy[key] !== null && rawPolicy[key] !== undefined)
        .map((key) => [key, rawPolicy[key]]));
      if (!Object.keys(policy).length) {
        throw new Error('Runtime policy response did not expose writable fields');
      }
      return policy;
    };
    const buildTemporaryRuntimePolicy = (readResponse) => {
      const originalPolicy = extractRuntimePolicy(readResponse);
      const temporaryPolicy = {
        ...originalPolicy,
        clarify_timeout: 90,
        environment_probe: false,
        gateway_timeout: 120,
        gateway_timeout_warning: 60,
        image_input_mode: 'text',
        max_turns: 91,
        task_completion_guidance: true,
      };
      if (originalPolicy.tool_use_enforcement !== 'custom') {
        temporaryPolicy.tool_use_enforcement = 'auto';
      }
      return { originalPolicy, temporaryPolicy };
    };
    const assertRuntimePolicyContains = (actualPolicy, expectedPolicy, label) => {
      const comparableEntries = Object.entries(expectedPolicy)
        .filter(([, value]) => value !== null && value !== undefined && ['boolean', 'number', 'string'].includes(typeof value));
      if (!comparableEntries.length) {
        throw new Error(`Runtime policy ${label} had no comparable primitive fields`);
      }
      for (const [key, expectedValue] of comparableEntries) {
        const actualValue = actualPolicy[key];
        if (String(actualValue) !== String(expectedValue)) {
          throw new Error(`Runtime policy ${label} mismatch for ${key}: expected ${String(expectedValue)}, got ${String(actualValue)}`);
        }
      }
    };
    const putRuntimePolicy = async (policy, label) => {
      try {
        const response = await api({
          body: policy,
          method: 'PUT',
          path: runtimePolicyPath,
          timeoutMs: 30000,
        });
        return { response, submittedPolicy: policy };
      } catch (error) {
        throw new Error(`Runtime policy ${label} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    const extractApprovalPolicy = (response) => {
      const directPolicy = response?.policy || response?.approval_policy || response?.approvalPolicy || response?.settings;
      const rawPolicy = directPolicy && typeof directPolicy === 'object' && !Array.isArray(directPolicy)
        ? directPolicy
        : response;
      if (!rawPolicy || typeof rawPolicy !== 'object' || Array.isArray(rawPolicy)) {
        throw new Error('Approval policy response did not return an object');
      }
      const policy = Object.fromEntries(approvalPolicyWritableKeys
        .filter((key) => hasOwn(rawPolicy, key) && rawPolicy[key] !== null && rawPolicy[key] !== undefined)
        .map((key) => [key, rawPolicy[key]]));
      if (!Object.keys(policy).length) {
        throw new Error('Approval policy response did not expose writable fields');
      }
      return policy;
    };
    const assertApprovalPolicyContains = (actualPolicy, expectedPolicy, label) => {
      for (const [key, expectedValue] of Object.entries(expectedPolicy)) {
        const actualValue = actualPolicy[key];
        if (Array.isArray(expectedValue)) {
          const actualList = Array.isArray(actualValue) ? actualValue : [];
          if (actualList.join('\n') !== expectedValue.join('\n')) {
            throw new Error(`Approval policy ${label} mismatch for ${key}`);
          }
        } else if (String(actualValue) !== String(expectedValue)) {
          throw new Error(`Approval policy ${label} mismatch for ${key}: expected ${String(expectedValue)}, got ${String(actualValue)}`);
        }
      }
    };
    const putApprovalPolicy = async (policy, label) => {
      try {
        const response = await api({
          body: {
            ...policy,
            mode_off_confirmed: policy.mode === 'off',
          },
          method: 'PUT',
          path: approvalPolicyPath,
          timeoutMs: 30000,
        });
        return { response, submittedPolicy: policy };
      } catch (error) {
        throw new Error(`Approval policy ${label} failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    const status = await api({ path: '/api/status', timeoutMs: 30000 });
    if (!status.hermes_home || !status.config_path || status.source !== 'desktop-local-bridge') {
      throw new Error('Local status fallback did not return desktop diagnostics');
    }
    const runtimePolicyBefore = await api({ path: runtimePolicyPath, timeoutMs: 30000 });
    const { originalPolicy, temporaryPolicy } = buildTemporaryRuntimePolicy(runtimePolicyBefore);
    let runtimePolicyRestoreStatus = 'pending';
    try {
      const savedRuntimePolicy = await putRuntimePolicy(temporaryPolicy, 'temporary save');
      assertRuntimePolicyContains(extractRuntimePolicy(savedRuntimePolicy.response), savedRuntimePolicy.submittedPolicy, 'temporary save response');
      const runtimePolicyAfterSave = await api({ path: runtimePolicyPath, timeoutMs: 30000 });
      assertRuntimePolicyContains(extractRuntimePolicy(runtimePolicyAfterSave), savedRuntimePolicy.submittedPolicy, 'temporary save readback');
    } finally {
      const restoredRuntimePolicy = await putRuntimePolicy(originalPolicy, 'restore original');
      assertRuntimePolicyContains(extractRuntimePolicy(restoredRuntimePolicy.response), restoredRuntimePolicy.submittedPolicy, 'restore response');
      const runtimePolicyAfterRestore = await api({ path: runtimePolicyPath, timeoutMs: 30000 });
      assertRuntimePolicyContains(extractRuntimePolicy(runtimePolicyAfterRestore), restoredRuntimePolicy.submittedPolicy, 'restore readback');
      runtimePolicyRestoreStatus = 'restored';
    }
    const approvalPolicyBefore = await api({ path: approvalPolicyPath, timeoutMs: 30000 });
    const originalApprovalPolicy = extractApprovalPolicy(approvalPolicyBefore);
    const temporaryApprovalPolicy = {
      command_allowlist: ['echo bridge-approval-smoke', 'npm run smoke:ui'],
      cron_mode: 'deny',
      gateway_timeout: 45,
      mode: 'smart',
      timeout: 15,
    };
    let approvalPolicyRestoreStatus = 'pending';
    try {
      const savedApprovalPolicy = await putApprovalPolicy(temporaryApprovalPolicy, 'temporary save');
      assertApprovalPolicyContains(extractApprovalPolicy(savedApprovalPolicy.response), savedApprovalPolicy.submittedPolicy, 'temporary save response');
      const approvalPolicyAfterSave = await api({ path: approvalPolicyPath, timeoutMs: 30000 });
      assertApprovalPolicyContains(extractApprovalPolicy(approvalPolicyAfterSave), savedApprovalPolicy.submittedPolicy, 'temporary save readback');
    } finally {
      const restoredApprovalPolicy = await putApprovalPolicy(originalApprovalPolicy, 'restore original');
      assertApprovalPolicyContains(extractApprovalPolicy(restoredApprovalPolicy.response), restoredApprovalPolicy.submittedPolicy, 'restore response');
      const approvalPolicyAfterRestore = await api({ path: approvalPolicyPath, timeoutMs: 30000 });
      assertApprovalPolicyContains(extractApprovalPolicy(approvalPolicyAfterRestore), restoredApprovalPolicy.submittedPolicy, 'restore readback');
      approvalPolicyRestoreStatus = 'restored';
    }
    const gatewayStart = await api({ method: 'POST', path: '/api/gateway/start', timeoutMs: 30000 });
    if (!gatewayStart.name || !['gateway-start', 'gateway-restart'].includes(gatewayStart.name)) {
      throw new Error('Local gateway start fallback did not return action metadata');
    }
    const gatewayStop = await api({ method: 'POST', path: '/api/gateway/stop', timeoutMs: 30000 });
    if (!gatewayStop.ok || gatewayStop.name !== 'gateway-stop') {
      throw new Error('Local gateway stop fallback did not return action metadata');
    }
    const updateCheck = await api({ path: '/api/hermes/update/check', timeoutMs: 60000 });
    if (!updateCheck.current_version || !updateCheck.update_command) {
      throw new Error('Local update check fallback did not return version metadata');
    }
    const updateStatus = await api({ path: '/api/actions/hermes-update/status?lines=5', timeoutMs: 30000 });
    if (updateStatus.name !== 'hermes-update' || !Array.isArray(updateStatus.lines)) {
      throw new Error('Local action status fallback did not return log metadata');
    }
    const actionsBefore = await api({ path: '/api/actions', timeoutMs: 30000 });
    if (!Array.isArray(actionsBefore.actions)) {
      throw new Error('Local actions list did not return an array');
    }
    const stopMissingAction = await api({ method: 'POST', path: '/api/actions/not-running-smoke/stop', timeoutMs: 30000 });
    if (stopMissingAction.ok !== false || stopMissingAction.running !== false) {
      throw new Error('Local action stop should be safe for non-running actions');
    }
    const sessions = await api({ path: '/api/sessions?limit=20&archived=include&order=recent', timeoutMs: 30000 });
    if (!sessions.sessions?.some((session) => session.id === 'smoke_project_session')) {
      throw new Error('Local sessions fallback did not list seeded session');
    }
    const sessionStats = await api({ path: '/api/sessions/stats', timeoutMs: 30000 });
    if (!sessionStats.total || !sessionStats.messages) {
      throw new Error('Local session stats fallback did not report totals');
    }
    const sessionSearch = await api({ path: '/api/sessions/search?q=bridge%20ui&limit=10', timeoutMs: 30000 });
    if (!sessionSearch.results?.some((result) => result.session_id === 'smoke_project_session')) {
      throw new Error('Local session search fallback did not find seeded content');
    }
    const sessionMessages = await api({ path: '/api/sessions/smoke_project_session/messages', timeoutMs: 30000 });
    if (!sessionMessages.messages?.some((message) => String(message.content || message.text || '').includes('bridge ui search prompt'))) {
      throw new Error('Local session messages fallback did not return transcript');
    }
    await api({
      body: { title: 'Bridge Project Session Renamed' },
      method: 'PATCH',
      path: '/api/sessions/smoke_project_session',
      timeoutMs: 30000,
    });
    const renamedSession = await api({ path: '/api/sessions/smoke_project_session', timeoutMs: 30000 });
    if (renamedSession.title !== 'Bridge Project Session Renamed') {
      throw new Error('Local session rename fallback did not persist');
    }
    await api({
      body: { archived: true },
      method: 'PATCH',
      path: '/api/sessions/smoke_project_session',
      timeoutMs: 30000,
    });
    const archivedSessions = await api({ path: '/api/sessions?limit=20&archived=only', timeoutMs: 30000 });
    if (!archivedSessions.sessions?.some((session) => session.id === 'smoke_project_session' && session.archived === true)) {
      throw new Error('Local session archive fallback did not persist');
    }
    await api({
      body: { archived: false },
      method: 'PATCH',
      path: '/api/sessions/smoke_project_session',
      timeoutMs: 30000,
    });
    const exportedSession = await api({ path: '/api/sessions/smoke_project_session/export', timeoutMs: 30000 });
    if (!exportedSession.session?.session?.id && !exportedSession.session?.id) {
      throw new Error('Local session export fallback did not return session data');
    }
    const emptyBefore = await api({ path: '/api/sessions/empty/count', timeoutMs: 30000 });
    if (!emptyBefore.count) {
      throw new Error('Local empty session count fallback did not see seeded empty session');
    }
    const emptyDeleted = await api({ method: 'DELETE', path: '/api/sessions/empty', timeoutMs: 30000 });
    if (!emptyDeleted.deleted) {
      throw new Error('Local empty session delete fallback did not delete seeded empty session');
    }
    const bulkDeleted = await api({
      body: { ids: ['smoke_project_session'] },
      method: 'POST',
      path: '/api/sessions/bulk-delete',
      timeoutMs: 30000,
    });
    if (bulkDeleted.deleted !== 1) {
      throw new Error('Local bulk session delete fallback did not delete seeded session');
    }

    const toolsets = await api({ path: '/api/tools/toolsets', timeoutMs: 30000 });
    const firstToolset = Array.isArray(toolsets) ? toolsets[0] : null;
    if (!firstToolset?.name) {
      throw new Error('No toolsets returned from desktop bridge');
    }
    await api({
      body: { enabled: true },
      method: 'PUT',
      path: '/api/tools/toolsets/' + encodeURIComponent(firstToolset.name),
      timeoutMs: 30000,
    });
    const webConfig = await api({ path: '/api/tools/toolsets/web/config', timeoutMs: 30000 });
    const firecrawl = webConfig.providers?.find((provider) => provider.name === 'Firecrawl Self-Hosted');
    if (!firecrawl?.env_vars?.some((env) => env.key === 'FIRECRAWL_API_URL')) {
      throw new Error('Toolset config did not expose Firecrawl env metadata');
    }
    await api({
      body: { provider: 'Firecrawl Self-Hosted' },
      method: 'PUT',
      path: '/api/tools/toolsets/web/provider',
      timeoutMs: 30000,
    });
    await api({
      body: { env: { FIRECRAWL_API_URL: 'https://firecrawl.smoke.local' } },
      method: 'PUT',
      path: '/api/tools/toolsets/web/env',
      timeoutMs: 30000,
    });
    const webConfigAfter = await api({ path: '/api/tools/toolsets/web/config', timeoutMs: 30000 });
    if (webConfigAfter.active_provider !== 'Firecrawl Self-Hosted') {
      throw new Error('Toolset provider selection did not persist');
    }
    const firecrawlAfter = webConfigAfter.providers?.find((provider) => provider.name === 'Firecrawl Self-Hosted');
    if (!firecrawlAfter?.env_vars?.some((env) => env.key === 'FIRECRAWL_API_URL' && env.is_set === true)) {
      throw new Error('Toolset env save did not persist');
    }

    await api({
      body: { model: 'smoke-model-next', provider: 'smoke-provider', scope: 'main' },
      method: 'POST',
      path: '/api/model/set',
      timeoutMs: 30000,
    });
    const onboardingBefore = await api({ path: '/api/onboarding/config', timeoutMs: 30000 });
    if (!onboardingBefore.hermes_home || onboardingBefore.mode !== 'local') {
      throw new Error('Onboarding config did not expose local Hermes state');
    }
    const onboardingRemote = await api({
      body: {
        auto_start_gateway: false,
        mode: 'remote',
        model: 'smoke-model-onboarding',
        provider: 'smoke-provider-onboarding',
        remote_token: 'smoke-remote-token',
        remote_url: 'https://gateway.smoke.local',
      },
      method: 'PUT',
      path: '/api/onboarding/config',
      timeoutMs: 30000,
    });
    if (onboardingRemote.mode !== 'remote' || onboardingRemote.remote_url !== 'https://gateway.smoke.local' || onboardingRemote.auto_start_gateway !== false) {
      throw new Error('Onboarding remote config did not persist desktop settings');
    }
    if (onboardingRemote.remote_token_set !== true || String(onboardingRemote.remote_token_preview || '').includes('smoke-remote-token')) {
      throw new Error('Onboarding remote token should persist without leaking the raw value');
    }
    const onboardingCheck = await api({
      body: { mode: 'local' },
      method: 'POST',
      path: '/api/onboarding/check',
      timeoutMs: 30000,
    });
    if (!onboardingCheck.message || onboardingCheck.ok !== true) {
      throw new Error('Onboarding local check did not report ready state');
    }
    const filePreview = await api({
      path: `/api/files/preview?path=${encodeURIComponent('preview-smoke.md')}&cwd=${encodeURIComponent(smokeHermesHome)}`,
      timeoutMs: 30000,
    });
    if (filePreview.kind !== 'text' || !filePreview.text?.includes('Preview Smoke') || !filePreview.path?.endsWith('preview-smoke.md')) {
      throw new Error('File preview fallback did not return readable text content');
    }
    const onboardingLocal = await api({
      body: {
        auto_start_gateway: true,
        mode: 'local',
        model: 'smoke-model-final',
        provider: 'smoke-provider-final',
        remote_url: '',
      },
      method: 'PUT',
      path: '/api/onboarding/config',
      timeoutMs: 30000,
    });
    if (onboardingLocal.mode !== 'local' || onboardingLocal.provider !== 'smoke-provider-final' || onboardingLocal.model !== 'smoke-model-final') {
      throw new Error('Onboarding local config did not persist model settings');
    }

    const messagingBefore = await api({ path: '/api/messaging/platforms', timeoutMs: 30000 });
    const telegramBefore = messagingBefore.platforms?.find((platform) => platform.id === 'telegram');
    if (!telegramBefore?.env_vars?.some((env) => env.key === 'TELEGRAM_BOT_TOKEN' && env.required === true)) {
      throw new Error('Messaging platform metadata did not expose Telegram token config');
    }
    await api({
      body: {
        enabled: false,
        env: {
          TELEGRAM_ALLOWED_USERS: '10001',
          TELEGRAM_BOT_TOKEN: '1234567890:bridge-smoke-token',
        },
      },
      method: 'PUT',
      path: '/api/messaging/platforms/telegram',
      timeoutMs: 30000,
    });
    const messagingAfterSave = await api({ path: '/api/messaging/platforms', timeoutMs: 30000 });
    const telegramAfterSave = messagingAfterSave.platforms?.find((platform) => platform.id === 'telegram');
    if (
      telegramAfterSave?.enabled !== false
      || !telegramAfterSave.env_vars?.some((env) => env.key === 'TELEGRAM_BOT_TOKEN' && env.is_set === true)
      || !telegramAfterSave.env_vars?.some((env) => env.key === 'TELEGRAM_ALLOWED_USERS' && env.is_set === true)
    ) {
      throw new Error('Messaging platform env save did not persist');
    }
    await api({
      body: { clear_env: ['TELEGRAM_ALLOWED_USERS'] },
      method: 'PUT',
      path: '/api/messaging/platforms/telegram',
      timeoutMs: 30000,
    });
    const messagingAfterClear = await api({ path: '/api/messaging/platforms', timeoutMs: 30000 });
    const telegramAfterClear = messagingAfterClear.platforms?.find((platform) => platform.id === 'telegram');
    if (telegramAfterClear?.env_vars?.some((env) => env.key === 'TELEGRAM_ALLOWED_USERS' && env.is_set === true)) {
      throw new Error('Messaging platform env clear did not persist');
    }
    const pairing = await api({
      body: { bot_name: 'Bridge Smoke' },
      method: 'POST',
      path: '/api/messaging/telegram/onboarding/start',
      timeoutMs: 30000,
    });
    if (!pairing.pairing_id || !pairing.deep_link) {
      throw new Error('Telegram onboarding start did not return pairing metadata');
    }
    const pairingStatus = await api({
      path: '/api/messaging/telegram/onboarding/' + encodeURIComponent(pairing.pairing_id),
      timeoutMs: 30000,
    });
    if (pairingStatus.status !== 'ready' || !pairingStatus.owner_user_id) {
      throw new Error('Telegram onboarding status did not become ready in local bridge');
    }
    await api({
      body: { allowed_user_ids: [pairingStatus.owner_user_id] },
      method: 'POST',
      path: '/api/messaging/telegram/onboarding/' + encodeURIComponent(pairing.pairing_id) + '/apply',
      timeoutMs: 30000,
    });
    const messagingAfterOnboarding = await api({ path: '/api/messaging/platforms', timeoutMs: 30000 });
    const telegramAfterOnboarding = messagingAfterOnboarding.platforms?.find((platform) => platform.id === 'telegram');
    if (
      telegramAfterOnboarding?.enabled !== true
      || !telegramAfterOnboarding.env_vars?.some((env) => env.key === 'TELEGRAM_ALLOWED_USERS' && env.is_set === true)
    ) {
      throw new Error('Telegram onboarding apply did not persist env and enablement');
    }

    const deliveryTargets = await api({ path: '/api/cron/delivery-targets', timeoutMs: 30000 });
    if (!deliveryTargets.targets?.some((target) => target.id === 'local')) {
      throw new Error('Cron delivery targets should include local');
    }
    const createdCron = await api({
      body: {
        deliver: 'local',
        name: 'bridge cron',
        prompt: 'say bridge smoke',
        schedule: '0 9 * * *',
      },
      method: 'POST',
      path: '/api/cron/jobs?profile=default',
      timeoutMs: 30000,
    });
    const cronId = createdCron.id || createdCron.name;
    if (!cronId) {
      throw new Error('Cron create did not return an id');
    }
    const updatedCron = await api({
      body: {
        updates: {
          deliver: 'local',
          name: 'bridge cron updated',
          prompt: 'say bridge smoke updated',
          schedule: '0 10 * * *',
        },
      },
      method: 'PUT',
      path: '/api/cron/jobs/' + encodeURIComponent(cronId),
      timeoutMs: 30000,
    });
    if (
      updatedCron.name !== 'bridge cron updated'
      || updatedCron.prompt !== 'say bridge smoke updated'
      || !String(updatedCron.schedule || updatedCron.schedule_display || '').includes('10')
    ) {
      throw new Error('Cron update did not persist');
    }
    const cronRuns = await api({
      path: '/api/cron/jobs/' + encodeURIComponent(cronId) + '/runs?limit=5',
      timeoutMs: 30000,
    });
    if (!Array.isArray(cronRuns.runs)) {
      throw new Error('Cron runs endpoint did not return an array');
    }
    await api({
      method: 'DELETE',
      path: '/api/cron/jobs/' + encodeURIComponent(cronId),
      timeoutMs: 30000,
    });
    const cronListAfterDelete = await api({ path: '/api/cron/jobs', timeoutMs: 30000 });
    const cronRows = Array.isArray(cronListAfterDelete) ? cronListAfterDelete : cronListAfterDelete.jobs || [];
    if (cronRows.some((job) => job.id === cronId || job.name === 'bridge cron updated')) {
      throw new Error('Cron delete did not persist');
    }

    const profileName = 'smoke-bridge-profile';
    const renamedProfileName = 'smoke-bridge-profile-renamed';
    const createdProfile = await api({
      body: { clone_from_default: true, name: profileName },
      method: 'POST',
      path: '/api/profiles',
      timeoutMs: 60000,
    });
    if (createdProfile.name !== profileName) {
      throw new Error('Profile create returned wrong name');
    }
    await api({
      body: { description: 'Bridge smoke editable profile' },
      method: 'PUT',
      path: '/api/profiles/' + encodeURIComponent(profileName) + '/description',
      timeoutMs: 30000,
    });
    await api({
      body: { model: 'profile-smoke-model', provider: 'profile-smoke-provider' },
      method: 'PUT',
      path: '/api/profiles/' + encodeURIComponent(profileName) + '/model',
      timeoutMs: 30000,
    });
    await api({
      body: { content: '# Smoke SOUL\\nKeep profile edits writable.\\n' },
      method: 'PUT',
      path: '/api/profiles/' + encodeURIComponent(profileName) + '/soul',
      timeoutMs: 30000,
    });
    const soul = await api({
      path: '/api/profiles/' + encodeURIComponent(profileName) + '/soul',
      timeoutMs: 30000,
    });
    if (!soul.content?.includes('Keep profile edits writable')) {
      throw new Error('Profile SOUL save/read did not persist');
    }
    const profileList = await api({ path: '/api/profiles', timeoutMs: 30000 });
    const savedProfile = profileList.profiles?.find((profile) => profile.name === profileName);
    if (
      !savedProfile
      || savedProfile.description !== 'Bridge smoke editable profile'
      || savedProfile.provider !== 'profile-smoke-provider'
      || savedProfile.model !== 'profile-smoke-model'
    ) {
      throw new Error('Profile description/model edits did not persist');
    }
    await api({
      body: { new_name: renamedProfileName },
      method: 'PATCH',
      path: '/api/profiles/' + encodeURIComponent(profileName),
      timeoutMs: 30000,
    });
    const profileListAfterRename = await api({ path: '/api/profiles', timeoutMs: 30000 });
    if (!profileListAfterRename.profiles?.some((profile) => profile.name === renamedProfileName)) {
      throw new Error('Profile rename did not persist');
    }
    await api({
      method: 'DELETE',
      path: '/api/profiles/' + encodeURIComponent(renamedProfileName),
      timeoutMs: 30000,
    });
    const profileListAfterDelete = await api({ path: '/api/profiles', timeoutMs: 30000 });
    if (profileListAfterDelete.profiles?.some((profile) => profile.name === renamedProfileName)) {
      throw new Error('Profile delete did not persist');
    }

    const created = await api({
      body: {
        args: ['-c', "print('smoke')"],
        command: 'python',
        name: 'smoke-bridge-mcp',
      },
      method: 'POST',
      path: '/api/mcp/servers',
      timeoutMs: 30000,
    });
    if (created.name !== 'smoke-bridge-mcp') {
      throw new Error('MCP create returned wrong server');
    }
    await api({
      body: { enabled: false },
      method: 'PUT',
      path: '/api/mcp/servers/smoke-bridge-mcp/enabled',
      timeoutMs: 30000,
    });
    const afterToggle = await api({ path: '/api/mcp/servers', timeoutMs: 30000 });
    const toggled = afterToggle.servers?.find((server) => server.name === 'smoke-bridge-mcp');
    if (!toggled || toggled.enabled !== false) {
      throw new Error('MCP toggle did not persist');
    }
    await api({
      method: 'DELETE',
      path: '/api/mcp/servers/smoke-bridge-mcp',
      timeoutMs: 30000,
    });
    const afterDelete = await api({ path: '/api/mcp/servers', timeoutMs: 30000 });
    if (afterDelete.servers?.some((server) => server.name === 'smoke-bridge-mcp')) {
      throw new Error('MCP delete did not persist');
    }

    return {
      mcp: 'create-toggle-delete',
      messaging: 'env-save-clear-onboarding',
      model: 'saved',
      onboarding: 'read-save-check',
      preview: 'file-read',
      profiles: 'create-edit-soul-rename-delete',
      approvalPolicy: `read-save-${approvalPolicyRestoreStatus}`,
      runtimePolicy: `read-save-${runtimePolicyRestoreStatus}`,
      sessions: 'list-search-rename-archive-export-clean-delete',
      system: 'status-gateway-update-check-actions',
      cron: 'create-update-runs-delete',
      toolset: firstToolset.name,
      toolsetConfig: 'provider-env',
    };
  }})()`.replace('__SMOKE_HERMES_HOME__', hermesHome.replace(/\\/g, '\\\\').replace(/'/g, "\\'")));

  console.log(`Settings bridge smoke passed. ${JSON.stringify({ hermesHome, ...result })}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  console.error(output.slice(0, 4000));
  process.exitCode = 1;
} finally {
  if (client) {
    await client.close().catch(() => undefined);
  }
  child.kill('SIGTERM');
  await wait(1000);
}
