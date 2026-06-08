# Beauty Hermes GUI

Beauty Hermes GUI is a lightweight desktop interface project for Hermes Agent.

This repository intentionally contains only the GUI shell, interaction patterns, mock data, and adapter boundaries. The official `NousResearch/hermes-agent` repository is treated as an upstream reference, not vendored into this project.

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

## Scope

- Codex-like desktop shell
- Sidebar with pinned items, projects, and recent sessions
- Chat surface with human messages on the right and agent messages on the left
- Collapsible right workbench
- Composer with permission/model/context controls and attachment menu
- Settings deep pages for product decisions and future implementation
- Mock Hermes adapter boundary for future IPC / HTTP / CLI integration

