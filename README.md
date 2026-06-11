# Beauty Hermes GUI

Beauty Hermes GUI is a lightweight desktop interface for Hermes Agent.

This repository intentionally contains the desktop GUI, Electron bridge, packaging scripts, and adapter boundaries. The official `NousResearch/hermes-agent` repository is treated as an upstream dependency/reference, not vendored into this project.

## Stack

- React + TypeScript for interface development
- Vite for fast local iteration
- Electron for the desktop shell
- Lucide React for a consistent icon language

## Scripts

```bash
npm install
npm run dev
npm run build
npm run desktop
```

Useful verification and packaging commands:

```bash
npm run smoke:windows-env
npm run smoke:full-gui
npm run pack
npm run dist:mac
npm run dist:win
```

`dist:win` must run on Windows because it uses Electron's Windows runtime and creates `Beauty Hermes GUI.exe`.

## Windows

The Windows build is produced by `.github/workflows/windows.yml` on GitHub Actions `windows-latest`.

The workflow:

- installs dependencies with Node 22
- validates the Windows native/WSL environment adapter
- builds the Vite/Electron app
- packages a portable Windows directory and zip
- launches the packaged `.exe` in smoke mode
- uploads the zip as the `Beauty-Hermes-GUI-windows` artifact

Runtime Hermes detection supports:

- Windows native Hermes CLI from `HERMES_CLI`, PATH, `~/.local/bin/hermes.exe`, or Python user scripts such as `%APPDATA%\Python\Python311\Scripts\hermes.exe`
- WSL Hermes CLI through `wsl.exe`, `HERMES_WSL_CLI`, and optional `HERMES_WSL_DISTRO`
- remote Gateway mode through the desktop config

Useful environment variables:

```text
HERMES_CLI=C:\path\to\hermes.exe
HERMES_HOME=C:\Users\you\.hermes
HERMES_DEPLOYMENT=wsl
BEAUTY_HERMES_FORCE_WSL=1
HERMES_WSL_CLI=/home/you/.local/bin/hermes
HERMES_WSL_HOME=/home/you/.hermes
HERMES_WSL_DISTRO=Ubuntu
```

If no explicit WSL home is provided, the app lets Hermes use the WSL-side default home instead of forcing a Windows path under `/mnt/c`.

## Scope

- Codex-like desktop shell
- Sidebar with pinned items, projects, and recent sessions
- Chat surface with human messages on the right and agent messages on the left
- Collapsible right workbench
- Composer with permission/model/context controls and attachment menu
- Settings deep pages backed by the Electron bridge where Hermes local config is available
- Gateway adapter with local, remote, Windows native, and WSL-aware startup paths
