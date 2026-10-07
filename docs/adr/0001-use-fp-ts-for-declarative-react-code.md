# 0001: Use fp-ts for declarative, readable React code

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The frontend is a Next.js 15 / React 19 app whose interesting logic lives in the
domain layer (`frontend/src/domain/**`): reading and sanitizing cached posts,
normalizing platform names, sanitizing CTA tone preferences. That code deals
with untrusted input at runtime (e.g. `localStorage` payloads that can be
malformed JSON, stale shapes, or missing fields) and a chain of small
transformations on top of it.

Written imperatively, this logic tends to become nested `if` guards, deep
indentation, and a trail of intermediate variables, which gets hard to read and
reason about as the number of edge cases grows.

## Decision

Use **fp-ts** in the frontend to express data transformations as
left-to-right declarative pipelines via `pipe`. Pure helper functions are kept
small and composable, and effects (reading `localStorage`, calling the API)
stay at the edges of the pipeline.

Example — reading the posts cache degrades gracefully and reads as a sequence
of steps rather than nested conditionals (`frontend/src/domain/post/context.tsx`):

```ts
const cached = pipe(
  GENERATE_POSTS_CACHE_KEY,
  (key) => localStorage.getItem(key),
  (raw) => (raw ? JSON.parse(raw) : null)
);
```

## Consequences

- **Positive**
  - Transformations read top-to-bottom and declare *what* happens, not *how*.
  - Pure steps are trivially composable and testable; effects stay isolated.
  - Defensive code (null/undefined/unknown handling) stays local and explicit
    instead of being scattered across `try/catch` and `?.` chains.
- **Negative**
  - Small learning curve for contributors unfamiliar with point-free style.
  - Some constructs are slightly verbose for one-off transforms.
- **Constraints**
  - `pipe` is used for data flow in the domain layer; React state updates
    themselves remain standard React (`setState`), keeping the boundary clear.

## Alternatives Considered

- **Plain imperative code** — simplest, but defensive chains get nested and
  hard to scan; rejected for domain logic.
- **io-ts / Effect** — a heavier ecosystem with a steeper learning curve than
  this app needs; rejected as overkill.
- **Ramda** — data-first utilities are useful, but fp-ts composes better with
  TypeScript's type inference for pipelines and typed effectful primitives.
