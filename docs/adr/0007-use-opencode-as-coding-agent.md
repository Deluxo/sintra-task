# 0007: Use OpenCode as the coding agent

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The task explicitly allows (and expects) the use of AI tooling: "Use any
tools you want - Cursor, Windsurf, Claude Code, GitHub Copilot, ChatGPT, v0,
whatever you'd use on the job." A coding agent accelerates scaffolding,
refactoring, and the repetitive parts of the task (validation wiring,
component variants, docs), while the human stays responsible for the
decisions.

## Decision

Use **OpenCode** as the AI coding agent for this project. It operates
agent-style over the repository (reading, editing, and running tools in the
shell) and is driven from the terminal, which fits the Neovim workflow
(ADR 0006).

## Consequences

- **Positive**
  - Terminal-native; composes with the same shell used for `lint` /
    `typecheck` / `dev`.
  - Agent operates on the real repo state, so its output is immediately
    checkable against the build.
  - Model-agnostic: it can point at any model provider, including the local
    llama.cpp setup (ADR 0008).
- **Negative**
  - Agent output still requires review: generated code must pass the same
    gates (ESLint, typecheck) as hand-written code.
  - Agent decisions are a second opinion, not an authority — the ADRs in
    this directory record the *human* decisions.
- **Constraints**
  - The agent must respect the repo's conventions (domain folder structure,
    atom components, Zod schemas at the edges) established in the other ADRs.

## Alternatives Considered

- **Cursor / Windsurf (IDE-embedded agents)** — tightly coupled to a GUI IDE;
  less composable with the terminal-first workflow chosen here.
- **No agent** — slower for the repetitive parts; the task explicitly
  encourages tooling.
