# 0008: Run Qwen Swift 1.5 27B locally via llama.cpp

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The coding agent (ADR 0007) needs a model backend. The obvious default is a
cloud API. This project's work involves sending the full codebase context to
a model, which raises two practical concerns: per-token cost for a
long-running task, and code leaving the machine.

## Decision

Run the model **locally with llama.cpp**, serving the
**Qwen Swift 1.5 27B** model, and point the coding agent (OpenCode) at it as
its provider. No cloud inference is used for the coding workflow.

## Consequences

- **Positive**
  - No per-token cost; the agent can run freely without watching usage.
  - Code and repo contents never leave the local machine.
  - No network dependency: the workflow works offline.
- **Negative**
  - A local 27B model is a smaller model than frontier cloud options, so
    reasoning on complex refactors is weaker; output needs more review.
  - Throughput is bound by local hardware; long generations are slower.
  - Model selection and quantization are a manual, one-off setup.
- **Constraints**
  - The agent's prompts and context size must stay practical for a local
    model (focused context, not whole-repo dumps).

## Alternatives Considered

- **Cloud API model** — stronger per-token reasoning, but cost per long
  session and code-egress concerns; rejected for this task.
- **A smaller local model (7–14B)** — faster, but not enough capability for
    multi-file refactors; rejected.
- **A larger local model** — beyond what the local hardware can serve at
    usable speed.
