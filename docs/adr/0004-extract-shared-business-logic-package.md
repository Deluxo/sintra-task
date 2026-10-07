# 0004: Extract business logic into a shared package

- **Status:** Deferred (out of time for this task)
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The same domain rules are currently implemented independently on both sides:

- Backend: `backend-ts/src` — product/CTA-tone schemas, platform
  normalization, generation.
- Frontend: `frontend/src/domain` — product/post models, CTA tone
  sanitization and defaults, platform mapping.

Both sides carry their own copy of concepts like platforms, CTA tone
preferences, and post shape. This works today, but the rules can drift
between frontend and backend, and neither side is the single source of truth.

## Decision

**Defer** extracting the shared business logic into its own package
(e.g. `packages/core`) that both the backend and the frontend import. The
package would contain:

- **Models** — `Product`, `SocialMediaPost`, `CtaTonePreferences`, platforms.
- **Types & interfaces** — the contract between client and server.
- **Functional pipelines** — pure, composable transformations (normalize
  platform, sanitize tone, validate/shape a post), in the fp-ts style
  established in ADR 0001.
- **Schemas** — Zod schemas (ADR 0002) shared by both sides, so validation
  rules live in one place.

## Consequences

- **Positive (if done)**
  - One source of truth for domain rules; no drift between sides.
  - Shared validation means the client can catch bad input before sending it.
  - Pure pipelines are unit-testable without a server or a browser.
- **Negative / risks**
  - Adds a workspace/build step (monorepo tooling) for a two-consumer setup.
  - Requires discipline to keep the package free of runtime-specific code
    (no `express`, no `react`, no `localStorage`).
- **Follow-up steps**
  1. Create a `packages/core` workspace with the models, types, and pure
     pipelines.
  2. Move Zod schemas into it and import from both `backend-ts` and
     `frontend`.
  3. Replace the duplicated domain code on each side with imports.

## Alternatives Considered

- **Keep the duplication** — acceptable for the trial task's timebox; the
  drift risk is the reason to do the extraction next.
- **Backend-generated types (e.g. codegen from the API)** — solves the
  request/response shape, but not the shared pure logic and validation
  rules; can be combined with this later.
