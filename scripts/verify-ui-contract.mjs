import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');
const electronMain = readFileSync(new URL('../electron/main.cjs', import.meta.url), 'utf8');
const gatewayManager = readFileSync(new URL('../electron/gateway-manager.cjs', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const interactionSmoke = readFileSync(new URL('../scripts/smoke-interactions.mjs', import.meta.url), 'utf8');
const settingsBridgeSmoke = readFileSync(new URL('../scripts/smoke-settings-bridge.mjs', import.meta.url), 'utf8');
const windowsEnvironmentSmoke = readFileSync(new URL('../scripts/smoke-windows-environment.mjs', import.meta.url), 'utf8');
const windowsPackageScript = readFileSync(new URL('../scripts/package-windows.mjs', import.meta.url), 'utf8');
const packagedSmoke = readFileSync(new URL('../scripts/smoke-packaged.mjs', import.meta.url), 'utf8');
const windowsWorkflow = readFileSync(new URL('../.github/workflows/windows.yml', import.meta.url), 'utf8');

const requiredText = [
  '置顶',
  '项目',
  '最近',
  'CommandCenter',
  'ApprovalModal',
  'WorkbenchFiles',
  'WorkbenchTerminal',
  'WorkbenchPreview',
  'Agents 并行任务',
  'Profiles',
  '技能库',
  '自动化',
  '消息网关',
  '诊断与更新',
  '首次启动',
  '文件...',
  '文件夹...',
  '图片...',
  '粘贴图片',
  'URL...',
  '提示片段...',
  'selectSession',
  'startNewTask',
  'session.resume',
  'session.close',
  'messageStackRef',
  'data-testid="message-list"',
  'emptyPromptActions',
  'onSubmitPrompt',
  'setMainModel',
  'data-testid="composer-model-button"',
  'data-testid="composer-model-menu"',
  '会话模型提供方',
  '会话模型名称',
  '/model ${savedModel} --provider ${savedProvider}',
  'onOpenSession',
  "onOpenWorkbenchTab('files')",
  'firstRecentSession',
  'hasPendingApproval',
  'onRespondApproval',
  'approval.respond',
  'finalAnswerCard',
  'toolDisplayFromContent',
  'appendToolDigest',
  'safeMarkdownHref',
  "kind === 'heading'",
  "kind === 'orderedList'",
  "kind === 'quote'",
  "kind === 'table'",
  'isMarkdownTableDivider',
  'parseMarkdownTableLine',
  'pendingSidebarDeleteKey',
  'pendingCronDeleteId',
  'saveCronJob',
  'loadCronRuns',
  "insert: '/messaging'",
  "insert: '/diagnostics'",
  "'/diagnose': 'diagnostics'",
  "'/gateway': 'diagnostics'",
  "insert: '/cron'",
  "insert: '/terminal'",
  'slashUiTargetLabel',
  'slashWorkbenchLabel',
  'ignoredSessionIdsRef',
  'clearConversationRuntime',
  'setPendingApproval(null)',
  'setPendingClarify(null)',
  'setTools([])',
  'setFiles([])',
  'preferenceStorageKeys',
  'readStoredDensity',
  'readStoredTheme',
  'writeStoredPreference',
  'selectedWorkbenchFileLabel',
  'selectedFileLabel',
  'onOpenWorkbenchFile',
  "group: '文件'",
  'runtime.files.slice',
  'createProfile',
  'toggleSkill',
  'createCronJob',
  'togglePlatform',
  'savePlatformConfig',
  'startTelegramOnboarding',
  'telegramOnboarding',
  'slashDismissedDraft',
  '关闭命令中心',
  'bridge-error',
  '桥接重连中',
  'autoStartGateway === false',
  'remoteTokenDraft',
  'remote_token',
  'remote_token_configured',
  'gatewayDisplayText',
  'gatewayStatusText',
  'cwdPath',
  'previewArtifacts',
  'scanPreviewArtifacts',
  'previewArtifactList',
];

const requiredStyles = [
  'grid-template-columns: 268px minmax(0, 1fr) auto',
  'width: 360px',
  '--radius-large: 28px',
  '.commandPanel',
  '.approvalModal',
  '.composerWrap',
  '.floatingWorkbenchButton',
  '.sessionMain',
  '.finalAnswerCard',
  '.finalAnswerBody',
  '.toolDetails',
  '.toolSummaryText',
  '.markdownText .markdownHeading',
  '.markdownText blockquote',
  '.markdownText ol',
  '.markdownTableWrap',
  '.emptyHints button',
  '.cronEditor',
  '.cronRunRow',
  '.platformConfig',
  '.platformEnvGrid',
  '.telegramOnboarding',
  '.commandCloseButton',
  '.gatewayStatusText',
  '.previewArtifactList',
  '.previewArtifactRow',
];

const missingText = requiredText.filter((token) => !app.includes(token));
const missingStyles = requiredStyles.filter((token) => !styles.includes(token));
const requiredConfig = ["base: './'"];
const missingConfig = requiredConfig.filter((token) => !viteConfig.includes(token));
const requiredElectronText = [
  'localApiFallback',
  'desktopApi',
  'desktop-local-bridge',
  'runHermesPython',
  'localProfilesApi',
  'localSkillsApi',
  'localCronApi',
  'localMessagingApi',
  "url.pathname === '/api/profiles'",
  "url.pathname === '/api/skills'",
  "url.pathname === '/api/cron/jobs'",
  "url.pathname === '/api/cron/delivery-targets'",
  "url.pathname === '/api/messaging/platforms'",
  '/api/messaging/telegram/onboarding/start',
  'save_env_value("TELEGRAM_BOT_TOKEN"',
  '当前 Hermes Gateway 不支持这个桌面增强操作',
  'autoStartGateway: desktopConfig.autoStartGateway !== false',
  'remoteGatewayToken:',
  'remote_token_configured',
  'gatewayManager.getEnvironment',
  'hermesDeployment',
  'hermes_deployment',
  'venv\', \'Scripts\', \'python.exe',
  "'py'",
];
const missingElectronText = requiredElectronText.filter((token) => !electronMain.includes(token));
const requiredPackageText = [
  '"smoke:full-gui"',
  '"pack:win"',
  '"dist:win"',
  '"smoke:packaged:win"',
  '"smoke:windows-env"',
  'smoke:ui',
  'smoke:interactions',
  'smoke:settings-bridge',
  'smoke:packaged',
];
const missingPackageText = requiredPackageText.filter((token) => !packageJson.includes(token));
const requiredSmokeText = [
  'assertNoRendererErrors',
  "result.result?.subtype === 'error'",
  'Uncaught \\(in promise\\)',
];
const missingSmokeText = requiredSmokeText.filter((token) => !interactionSmoke.includes(token) || !settingsBridgeSmoke.includes(token));
const requiredWindowsPackageText = [
  'electron.exe',
  'Beauty Hermes GUI.exe',
  'resources',
  'LICENSES.chromium.html',
  'win32',
];
const missingWindowsPackageText = requiredWindowsPackageText.filter((token) => !windowsPackageScript.includes(token));
const requiredWindowsEnvironmentText = [
  'windowsPathToWslPathFallback',
  'createGatewayLaunchPlan',
  'detectHermesEnvironment',
  'shellQuoteForSh',
  'windows-native',
  'windows-missing',
  'wsl',
  'wsl.exe',
  'HERMES_WSL_CLI',
  'HERMES_WSL_HOME',
  'listWindowsUserScriptHermesCandidates',
  'redactGatewayLog',
  'skipLocalProbe',
  'wslHermesHome: resolveWslHermesHome',
  'gatewayStartPorts',
  'environmentCacheKey',
];
const missingWindowsEnvironmentText = requiredWindowsEnvironmentText.filter((token) => {
  return !gatewayManager.includes(token) && !windowsEnvironmentSmoke.includes(token);
});
const requiredPackagedSmokeText = [
  'BEAUTY_HERMES_PACKAGE_PLATFORM',
  'win32',
  'Beauty Hermes GUI.exe',
  '--disable-gpu',
  '45000',
  'darwin',
];
const missingPackagedSmokeText = requiredPackagedSmokeText.filter((token) => !packagedSmoke.includes(token));
const requiredWorkflowText = [
  'windows-latest',
  'npm run smoke:windows-env',
  'npm run dist:win',
  'node scripts/smoke-packaged.mjs',
  'BEAUTY_HERMES_PACKAGE_PLATFORM: win32',
  'actions/upload-artifact',
  'Beauty-Hermes-GUI-windows',
];
const missingWorkflowText = requiredWorkflowText.filter((token) => !windowsWorkflow.includes(token));
const forbiddenAppText = [
  'window.confirm(',
  '<span>本地运行 · {model}</span>',
];
const forbiddenText = forbiddenAppText.filter((token) => app.includes(token));

if (
  missingText.length
  || missingStyles.length
  || missingConfig.length
  || missingElectronText.length
  || missingPackageText.length
  || missingSmokeText.length
  || missingWindowsPackageText.length
  || missingWindowsEnvironmentText.length
  || missingPackagedSmokeText.length
  || missingWorkflowText.length
  || forbiddenText.length
) {
  console.error('UI contract check failed.');
  if (missingText.length) console.error('Missing App tokens:', missingText.join(', '));
  if (missingStyles.length) console.error('Missing CSS tokens:', missingStyles.join(', '));
  if (missingConfig.length) console.error('Missing Vite config tokens:', missingConfig.join(', '));
  if (missingElectronText.length) console.error('Missing Electron tokens:', missingElectronText.join(', '));
  if (missingPackageText.length) console.error('Missing package tokens:', missingPackageText.join(', '));
  if (missingSmokeText.length) console.error('Missing smoke tokens:', missingSmokeText.join(', '));
  if (missingWindowsPackageText.length) console.error('Missing Windows package tokens:', missingWindowsPackageText.join(', '));
  if (missingWindowsEnvironmentText.length) console.error('Missing Windows environment tokens:', missingWindowsEnvironmentText.join(', '));
  if (missingPackagedSmokeText.length) console.error('Missing packaged smoke tokens:', missingPackagedSmokeText.join(', '));
  if (missingWorkflowText.length) console.error('Missing workflow tokens:', missingWorkflowText.join(', '));
  if (forbiddenText.length) console.error('Forbidden App tokens:', forbiddenText.join(', '));
  process.exit(1);
}

console.log('UI contract check passed.');
