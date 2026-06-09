import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8');
const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');

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
  'deepseek-v4-flash',
  '文件...',
  '文件夹...',
  '图片...',
  '粘贴图片',
  'URL...',
  '提示片段...',
  'selectSession',
  'session.resume',
  'messageStackRef',
  'finalAnswerCard',
  'toolDisplayFromContent',
  'appendToolDigest',
  'safeMarkdownHref',
  "kind === 'heading'",
  "kind === 'orderedList'",
  "kind === 'quote'",
  'pendingSidebarDeleteKey',
  'pendingCronDeleteId',
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
];

const missingText = requiredText.filter((token) => !app.includes(token));
const missingStyles = requiredStyles.filter((token) => !styles.includes(token));
const requiredConfig = ["base: './'"];
const missingConfig = requiredConfig.filter((token) => !viteConfig.includes(token));
const forbiddenAppText = ['window.confirm('];
const forbiddenText = forbiddenAppText.filter((token) => app.includes(token));

if (missingText.length || missingStyles.length || missingConfig.length || forbiddenText.length) {
  console.error('UI contract check failed.');
  if (missingText.length) console.error('Missing App tokens:', missingText.join(', '));
  if (missingStyles.length) console.error('Missing CSS tokens:', missingStyles.join(', '));
  if (missingConfig.length) console.error('Missing Vite config tokens:', missingConfig.join(', '));
  if (forbiddenText.length) console.error('Forbidden App tokens:', forbiddenText.join(', '));
  process.exit(1);
}

console.log('UI contract check passed.');
