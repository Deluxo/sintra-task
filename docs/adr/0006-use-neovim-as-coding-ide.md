# 0006: Use Neovim as the coding IDE

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

A frontend + TypeScript backend trial task needs an editor that can handle
multi-file navigation, type-aware tooling, and running linters/tests from
the command line, without heavy GUI overhead. The work also involves driving
an AI coding agent (ADR 0007), which benefits from a terminal-native workflow.

## Decision

Use **Neovim** as the primary coding environment for this project:

- Terminal-native, so it composes with the shell workflows the task runs
  (`npm run dev`, `npm run lint`, `npm run typecheck`).
- LSP integration for TypeScript across `frontend/` and `backend-ts/`.
- Lightweight enough to stay responsive in a small codebase.

## Consequences

- **Positive**
  - Single environment across editor, lint, typecheck, and dev servers; no
    context switching between a GUI IDE and a terminal.
  - Pairs naturally with the AI agent (ADR 0007), which operates as a
    terminal/agent workflow.
  - Low overhead: fast startup, small memory footprint.
- **Negative**
  - Steeper setup/config curve; the config is bespoke to this machine.
  - Visual diffing and some GUI conveniences (inline preview panes) are
    weaker than in a full IDE.
- **Constraints**
  - None imposed on the codebase itself; this is a tooling choice only.

## Alternatives Considered

- **VS Code / Cursor** — more built-in GUI tooling, but heavier and less
  composable with terminal-driven agent workflows.
- **Emacs** — comparable capability; Neovim chosen for its LSP ecosystem and
  lower setup cost.
