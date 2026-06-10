import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const port = 9400 + Math.floor(Math.random() * 400);
const runId = Math.random().toString(36).slice(2, 10);
const expectedText = process.env.BEAUTY_HERMES_LIVE_CHAT_EXPECTED || `BEAUTY_HERMES_GUI_LIVE_OK_${runId}`;
const prompt = process.env.BEAUTY_HERMES_LIVE_CHAT_PROMPT || `${expectedText}\n请只回复上面这一行，不要解释，不要调用工具。`;
const timeoutMs = Number(process.env.BEAUTY_HERMES_LIVE_CHAT_TIMEOUT_MS || 180000);
const allowSkip = process.env.BEAUTY_HERMES_ALLOW_GATEWAY_SKIP === '1';

const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['electron', `--remote-debugging-port=${port}`, '.'], {
  cwd: rootDir,
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
let exited = false;
let exitCode = 0;

child.stdout.on('data', (chunk) => {
  output += chunk.toString();
});

child.stderr.on('data', (chunk) => {
  output += chunk.toString();
});

child.on('exit', (code, signal) => {
  exited = true;
  if (code !== 0 && signal !== 'SIGTERM') {
    exitCode = code ?? 1;
  }
});

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function waitForTarget() {
  const deadline = Date.now() + 30000;
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

    const { reject, resolve, timer } = pending.get(message.id);
    clearTimeout(timer);
    pending.delete(message.id);

    if (message.error) {
      reject(new Error(message.error.message || JSON.stringify(message.error)));
    } else {
      resolve(message.result);
    }
  });

  ws.addEventListener('close', () => {
    for (const [, pendingRequest] of pending) {
      clearTimeout(pendingRequest.timer);
      pendingRequest.reject(new Error('CDP WebSocket closed'));
    }
    pending.clear();
  });

  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });

  return {
    async close() {
      ws.close();
    },
    async send(method, params = {}, requestTimeoutMs = 30000) {
      await opened;
      const messageId = ++id;
      const promise = new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          if (pending.delete(messageId)) {
            reject(new Error(`CDP timed out: ${method}`));
          }
        }, requestTimeoutMs);
        pending.set(messageId, { reject, resolve, timer });
      });
      ws.send(JSON.stringify({ id: messageId, method, params }));
      return promise;
    },
  };
}

async function evaluate(client, expression, requestTimeoutMs = 30000) {
  const result = await client.send(
    'Runtime.evaluate',
    {
      awaitPromise: true,
      expression,
      returnByValue: true,
      userGesture: true,
    },
    requestTimeoutMs,
  );

  if (result.exceptionDetails) {
    const details = result.exceptionDetails.exception?.description || result.exceptionDetails.text || 'Runtime evaluation failed.';
    throw new Error(details);
  }

  return result.result?.value;
}

async function stopChild() {
  if (exited) {
    return;
  }

  child.kill('SIGTERM');
  const deadline = Date.now() + 2500;
  while (!exited && Date.now() < deadline) {
    await wait(100);
  }
  if (!exited) {
    child.kill('SIGKILL');
  }
}

function failOrSkip(message) {
  if (allowSkip) {
    console.log(`Live GUI chat smoke skipped: ${message}`);
    return;
  }

  throw new Error(message);
}

let client = null;

try {
  const wsUrl = await waitForTarget();
  client = createCdpClient(wsUrl);
  await client.send('Runtime.enable');

  const result = await evaluate(
    client,
    `
      window.__beautyHermesLivePrompt = ${JSON.stringify(prompt)};
      window.__beautyHermesLiveExpected = ${JSON.stringify(expectedText)};
      window.__beautyHermesLiveTimeoutMs = ${JSON.stringify(timeoutMs)};
      (${async () => {
        const promptText = window.__beautyHermesLivePrompt;
        const expected = window.__beautyHermesLiveExpected;
        const finalTimeoutMs = Number(window.__beautyHermesLiveTimeoutMs || 180000);
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        const normalize = (value) => String(value || '').replace(/\\s+/g, ' ').trim();
        const snippet = (value, max = 700) => normalize(value).slice(0, max);
        const messageList = () => document.querySelector('[data-testid="message-list"]');
        const messages = () => Array.from(messageList()?.querySelectorAll('.message') || []);
        const setNativeValue = (element, value) => {
          const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, 'value')?.set;
          if (!setter) {
            throw new Error('Cannot set textarea native value.');
          }
          setter.call(element, value);
          element.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const waitFor = async (predicate, label, waitMs = 10000, intervalMs = 120) => {
          const deadline = Date.now() + waitMs;
          let lastError = null;
          while (Date.now() < deadline) {
            try {
              const value = await predicate();
              if (value) {
                return value;
              }
            } catch (error) {
              lastError = error;
            }
            await sleep(intervalMs);
          }

          const connection = await window.hermesDesktop?.getConnection?.().catch((error) => ({
            error: error instanceof Error ? error.message : String(error),
          }));
          const statusText = snippet(document.body.innerText, 1200);
          const suffix = lastError ? ` Last error: ${lastError instanceof Error ? lastError.message : String(lastError)}` : '';
          throw new Error(`Timed out waiting for ${label}. Connection=${JSON.stringify(connection)} Page=${statusText}${suffix}`);
        };
        const findSection = (title) => Array.from(document.querySelectorAll('.navSection'))
          .find((section) => section.querySelector('h2')?.textContent?.trim() === title);
        const firstPromptLine = promptText.split(/\n|\r/).find((line) => line.trim())?.trim() || promptText;
        const expectedPrefix = expected.length > 32 ? expected.slice(0, 32) : expected;
        const sessionNeedles = Array.from(new Set([
          expected,
          expectedPrefix,
          firstPromptLine,
        ].filter((item) => item && item.length >= 6)));
        const sidebarPrefix = firstPromptLine.slice(0, Math.min(16, firstPromptLine.length));
        const rowMatchesSession = (row) => {
          const text = row?.textContent || '';
          return sessionNeedles.some((needle) => text.includes(needle));
        };
        const rowLooksLikeCurrentSidebarSession = (row) => {
          const text = row?.textContent || '';
          return sidebarPrefix.length >= 6 && text.includes(sidebarPrefix) && (text.includes('刚刚') || text.includes('进行中'));
        };
        const findCurrentRecentRow = () => {
          const section = findSection('最近');
          const rows = Array.from(section?.querySelectorAll('.sessionRow') || []);
          return rows.find((row) => rowMatchesSession(row)) || rows.find((row) => rowLooksLikeCurrentSidebarSession(row));
        };
        const findSessionRow = (sectionTitle) => {
          const root = sectionTitle ? findSection(sectionTitle) : document;
          if (!root) {
            return null;
          }
          return Array.from(root.querySelectorAll('.sessionRow'))
            .find((row) => rowMatchesSession(row));
        };
        const findButton = (label, root = document) => Array.from(root.querySelectorAll('button'))
          .find((button) => normalize(button.textContent).includes(label) || button.getAttribute('aria-label')?.includes(label));
        const providerErrorPattern = /api call failed|http 5\\d\\d|error code:\\s*5\\d\\d|provider error|traceback|exception/i;

        await waitFor(() => window.hermesDesktop, 'Electron desktop bridge', 8000);
        await waitFor(() => document.querySelector('[data-testid="composer"]'), 'composer', 20000);
        await waitFor(() => messageList(), 'message list', 20000);

        const newTaskButton = findButton('新建任务');
        if (newTaskButton) {
          newTaskButton.click();
          await waitFor(
            () => {
              const bodyText = normalize(document.body.innerText);
              return bodyText.includes('等待新任务')
                && !bodyText.includes('正在生成');
            },
            'new task clears the previous active transcript',
            20000,
          );
        }

        const textarea = await waitFor(() => document.querySelector('textarea[aria-label="消息"]'), 'message textarea', 20000);
        textarea.focus();
        setNativeValue(textarea, promptText);

        const sendButton = await waitFor(
          () => {
            const button = document.querySelector('.sendButton');
            return button && !button.disabled ? button : null;
          },
          'Gateway-connected send button',
          Math.min(90000, Math.max(30000, Math.floor(finalTimeoutMs / 2))),
        );

        sendButton.click();

        await waitFor(
          () => messages().some((message) => message.classList.contains('human') && message.textContent?.includes(promptText)),
          'user message rendered from UI submit',
          8000,
        );

        await waitFor(
          () => !document.querySelector('textarea[aria-label="消息"]')?.value,
          'composer clears after UI submit',
          5000,
        );

        const recentRow = await waitFor(
          () => findCurrentRecentRow() || findSessionRow(),
          'new session in recent sidebar',
          30000,
        );

        const activeRecentRow = Array.from(findSection('最近')?.querySelectorAll('.sessionRow.active') || [])
          .find((row) => rowMatchesSession(row));

        const finalMessage = await waitFor(
          () => {
            const rows = messages();
            const last = rows[rows.length - 1];
            const final = last?.classList.contains('assistant') ? last : null;
            const text = final?.textContent || '';
            if (!final || !text.trim()) {
              return null;
            }
            if (providerErrorPattern.test(text)) {
              throw new Error(`Provider error rendered in final answer: ${snippet(text)}`);
            }
            if (expected && !text.includes(expected)) {
              return null;
            }
            return { index: rows.length - 1, text };
          },
          expected ? `final assistant answer containing ${expected}` : 'final assistant answer',
          finalTimeoutMs,
          250,
        );

        const stack = messageList();
        const distanceFromBottom = stack ? stack.scrollHeight - stack.clientHeight - stack.scrollTop : 0;
        if (stack && distanceFromBottom > 96) {
          throw new Error(`Message list did not auto-scroll to bottom. distance=${Math.round(distanceFromBottom)}`);
        }
        const chatMessageCount = messages().length;

        const projectButton = findButton('项目');
        if (!projectButton) {
          throw new Error('Projects navigation button was not found.');
        }
        projectButton.click();
        await waitFor(() => document.querySelector('[data-testid="surface-title"]')?.textContent?.includes('项目'), 'projects surface title', 10000);

        const projectRow = await waitFor(
          async () => {
            const row = Array.from(document.querySelectorAll('.projectSessionRow'))
              .find((item) => rowMatchesSession(item));
            if (row) {
              return row;
            }
            const refresh = findButton('搜索/刷新');
            refresh?.click();
            await sleep(600);
            return Array.from(document.querySelectorAll('.projectSessionRow'))
              .find((item) => rowMatchesSession(item));
          },
          'new session in projects session list',
          60000,
          900,
        );

        return {
          activeSidebar: snippet(activeRecentRow?.textContent, 240),
          assistant: snippet(finalMessage.text, 1000),
          messageCount: chatMessageCount,
          projectSession: snippet(projectRow.textContent, 240),
          recentSidebar: snippet(recentRow.textContent, 240),
          selectedRecent: snippet(activeRecentRow?.textContent, 240),
        };
      }})()
    `,
    timeoutMs + 90000,
  );

  console.log(
    [
      'Live GUI chat smoke passed.',
      `prompt=${prompt}`,
      `expected=${expectedText}`,
      `recent=${result.recentSidebar}`,
      `projectSession=${result.projectSession}`,
      `assistant=${result.assistant}`,
      `messages=${result.messageCount}`,
    ].join('\n'),
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  try {
    failOrSkip(message);
  } catch (failure) {
    console.error('Live GUI chat smoke failed.');
    console.error(failure instanceof Error ? failure.message : String(failure));
    console.error(output.slice(-6000));
    process.exitCode = exitCode || 1;
  }
} finally {
  await client?.close().catch(() => undefined);
  await stopChild();
}
