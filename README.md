# Beauty Hermes GUI

[English](./README.en.md) | 中文

Beauty Hermes GUI 是面向 [Hermes Agent](https://github.com/NousResearch/hermes-agent) 的桌面端工作台。它不是官方仓库的完整复制，也不内置 Hermes Agent 后端；它专注把 Hermes 的本机 CLI / Gateway 能力包装成更现代、更清晰、更接近 Codex Desktop 使用体验的 GUI。

当前版本：`0.1.0`，属于 `0.x.x` 早期正式发布阶段。核心目标是先把 macOS 与 Windows 桌面端跑通、看清楚、少出错，再逐步补齐签名、公证、自动更新和更深层的生产能力。

![Beauty Hermes GUI chat workbench](docs/screenshots/chat-workbench.png)

## 为什么做它

Hermes Agent 很强，但原始桌面体验在日常使用中容易暴露几个痛点：

- 会话、项目、文件、终端、审批状态分散，长任务时不容易看清进度。
- 工具调用、思考过程、最终回答混在一起时，阅读负担很重。
- macOS / Windows / WSL / 本机 Python 环境差异大，Gateway 启动失败时不够直观。
- 设置项、消息渠道、skills、自动化任务需要一个稳定的桌面入口。
- UI 密度、字号、间距和状态呈现不够适合长时间工作。

Beauty Hermes GUI 的方向是把 Hermes Desktop 变成一个真正的 Agent workbench：左侧管理项目和会话，中间专注聊天和结果，右侧承载活动、文件、终端和预览。

## 核心特性

- **Codex-like 桌面工作台**：三栏布局、低噪声状态、轻量按钮、稳定间距，适合长时间运行 Agent 任务。
- **清晰的消息渲染**：人类消息靠右，Agent 消息靠左；工具调用、思考过程、阶段输出和最终结果分层呈现。
- **项目与会话管理**：置顶、项目、最近会话分区；项目下聚合相关对话，支持归档、删除和快速打开。
- **可折叠右侧工作区**：活动、文件、终端、预览独立承载，聊天区域可以在工作区收起后自然扩展。
- **本机 Hermes bridge**：读取本机配置、profiles、skills、sessions、cron、messaging 等 Hermes 相关状态。
- **Gateway 适配**：支持 local Gateway、remote Gateway、Windows native Hermes、WSL Hermes，并带有环境检测与启动失败提示。
- **设置深层页**：模型、权限、集成、外观、高级配置不再只是只读展示，而是逐步接入可操作配置。
- **Windows CI 验证**：GitHub Actions `windows-latest` 会构建 Windows 便携版、启动 `.exe` smoke，并上传 artifact。

## 界面预览

### 聊天与右侧工作区

![Chat workbench](docs/screenshots/chat-workbench.png)

底部 Composer 聚合权限、模型、工作目录、上下文进度和附件入口；右侧工作区显示任务活动、工具调用和审批状态。

### 项目工作区

![Projects](docs/screenshots/projects.png)

项目页用于把路径、会话、模型配置和运行状态归到一起，避免所有会话都堆在单一列表里。

### 设置中心

![Settings](docs/screenshots/settings.png)

设置页覆盖模型、权限、集成、外观、高级等入口，面向真实桌面使用而不是单纯展示 mock 状态。

### 消息网关

![Messaging](docs/screenshots/messaging.png)

消息平台页用于管理 Telegram、飞书、微信等渠道状态，后续可以承载更多 pairing、token 和 channel 配置。

### 命令中心

![Command center](docs/screenshots/command-center.png)

命令中心用于快速跳转页面、打开文件、切换工作区、进入审批或执行常用操作。

## 安装方式

### Windows

当前 Windows 版通过 GitHub Actions artifact 分发：

1. 打开仓库的 **Actions** 页面。
2. 进入最新成功的 **Windows Build** workflow。
3. 下载 artifact：`Beauty-Hermes-GUI-windows`。
4. 解压下载得到的 artifact，再解压其中的 `Beauty-Hermes-GUI-0.1.0-windows-x64.zip`。
5. 运行 `Beauty Hermes GUI.exe`。

Windows 版本已在 GitHub Actions `windows-latest` 上完成：

- `npm ci`
- Windows native / WSL 环境适配 smoke
- Windows 便携版打包
- packaged `.exe` 启动 smoke
- artifact 上传

如果 Windows SmartScreen 提示未知发布者，这是因为 `0.x.x` 阶段还未接入商业代码签名。确认来源是本仓库 Actions artifact 后，可以选择“更多信息”继续运行。

### macOS

当前 macOS 版可以本地打包安装：

```bash
git clone https://github.com/baileyh8/Beauty-Hermes-GUI.git
cd Beauty-Hermes-GUI
npm ci
BEAUTY_HERMES_RELEASE_DIR=release/mac npm run dist:mac
```

Apple Silicon 机器通常会生成：

```bash
open "release/mac/Beauty Hermes GUI-darwin-arm64/Beauty Hermes GUI.app"
```

也可以复制到 `/Applications`：

```bash
cp -R "release/mac/Beauty Hermes GUI-darwin-arm64/Beauty Hermes GUI.app" /Applications/
```

Intel Mac 请把路径中的 `arm64` 替换为 `x64`。`0.x.x` 阶段暂未做 Apple notarization，如遇到 Gatekeeper 拦截，可以右键打开，或在确认来源后移除 quarantine 标记。

## Hermes Agent 连接方式

Beauty Hermes GUI 会优先连接或启动 Hermes Gateway：

- 本机 Hermes CLI：`hermes dashboard --no-open --host 127.0.0.1 --port ...`
- Remote Gateway：通过桌面配置连接远端 Gateway URL。
- Windows native：识别 `HERMES_CLI`、PATH、`~/.local/bin/hermes.exe`、`%APPDATA%\Python\Python311\Scripts\hermes.exe` 等路径。
- WSL：通过 `wsl.exe` 启动 WSL 内的 Hermes CLI，并支持 distro 与 home 目录配置。

常用环境变量：

```text
HERMES_CLI=C:\path\to\hermes.exe
HERMES_HOME=C:\Users\you\.hermes
HERMES_DEPLOYMENT=wsl
BEAUTY_HERMES_FORCE_WSL=1
HERMES_WSL_CLI=/home/you/.local/bin/hermes
HERMES_WSL_HOME=/home/you/.hermes
HERMES_WSL_DISTRO=Ubuntu
```

如果没有显式设置 `HERMES_WSL_HOME`，应用会让 Hermes 使用 WSL 侧默认 home，而不是强制把 Windows 路径映射到 `/mnt/c`。

## 本地开发

```bash
npm ci
npm run dev
npm run desktop
```

常用验证命令：

```bash
npm run typecheck
npm run smoke:windows-env
npm run smoke:ui
npm run smoke:full-gui
```

打包命令：

```bash
npm run dist:mac
npm run dist:win
```

`dist:win` 必须在 Windows 环境运行，因为它需要 Electron 的 Windows runtime 并生成 `Beauty Hermes GUI.exe`。

更新 README 截图：

```bash
npm run screenshots:readme
```

## 技术栈

- React + TypeScript
- Vite
- Electron
- Lucide React
- GitHub Actions Windows runner

## 当前边界

- `0.x.x` 阶段仍是早期正式发布，不代表企业级稳定版。
- macOS 尚未接入 notarization，Windows 尚未接入商业代码签名。
- Hermes Agent 仍作为外部上游依赖，需要用户本机、WSL 或远端 Gateway 提供真实后端能力。
- GUI 已具备真实 bridge 和 Gateway 启动适配，但不同用户环境仍可能需要补充诊断。

## 项目定位

Beauty Hermes GUI 的定位不是替代 Hermes Agent，而是为 Hermes Agent 提供一个更适合日常桌面工作的界面层：更漂亮、更清晰、更可追踪，也更接近现代 Agent IDE 的使用方式。
