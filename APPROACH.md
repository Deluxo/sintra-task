# Approach — Tone & CTA customization

Branch: `feature/cta-tone-customization` (10 commits, `main..HEAD`).

## What I built

A **tone & CTA control set** that sits between the product form and the generate
button and shapes every generated post:

- **Tone chips** — six presets (professional, friendly, playful, bold,
  inspirational, luxurious), each with a one-line hint.
- **Per-platform tone** — a disclosure with a select per platform. The default
  tone applies everywhere; editing one platform writes an *override* for just
  that platform, and **changing the default clears all overrides** (agreed
  semantics: an override only survives while the default is untouched).
  Choosing the default option in a select doubles as the reset affordance.
- **Style toggles** — emoji level (none/subtle/heavy), post length
  (concise/standard/detailed, mapped onto each platform's real character
  limit from `config.ts`), and an on/off call-to-action switch.
- **Extra instructions** — free text, capped at 300 characters with a live
  counter, injected into the prompt inside a delimited block.

Preferences live in the existing `frontend/src/domain/post` context (posts +
preferences persist together in the same localStorage entry), survive reloads
through a sanitising hydrator, and travel with the request as
`{ product, ctaTone }`.

### Why the model looks like this

```ts
interface CtaTonePreferences {
  tone: Tone;                                   // default for all platforms
  overrides?: Partial<Record<Platform, Tone>>;  // only written by per-platform edits
  emoji: EmojiLevel;
  length: PostLength;
  includeCta: boolean;
  customInstructions?: string;                  // ≤300 chars
}
```

Effective tone = `overrides[platform] ?? tone`. Because `setTone` clears
`overrides`, the state can never drift into "default changed but overrides
still point at the old default" — there is exactly one invariant to reason
about, and it serialises cleanly.

## Reliability work that came with it (Part 1)

The feature needed a trustworthy pipeline to sit on, so these shipped together:

- **Request validation (zod)** — product name/description required and length
  capped, price must be a finite non-negative number, tone must be a known
  value, override keys must be real platforms, instructions ≤300 chars.
  Failures return `400 { error: { message, fields } }` keyed by field path.
- **Async error handling** — Express 4 does *not* forward rejected promises
  from async handlers; failures now go through an explicit `catch` → error
  middleware → JSON `500` instead of a request that hangs. Malformed JSON and
  oversized bodies map to `400`/`413` rather than `500`.
- **Model output validation** — the completion is parsed defensively, platform
  keys are normalised (`"LinkedIn"`/`"Twitter/X"` → `linkedin`/`twitter`),
  unusable entries are dropped, and empty/garbage responses become readable
  errors. Format rules moved into a **system message** so product text and
  user instructions stay untrusted payload.
- **Frontend error surfacing** — `api.ts` checked neither `response.ok` nor the
  error body; it now throws `ApiError` with the backend's message and field
  detail, which the generate button displays before its existing 5-second
  auto-clear.
- **Platform identity** — backend typed `platform` as `'twitter' | …` while the
  frontend model claimed `"Twitter" | "Linkedin"` and keyed icons off it. One
  `PLATFORM_META` map + `toPlatform()` now own display names, icons and cache
  migration.
- **Cache hydration** — localStorage is treated as untrusted: malformed JSON,
  unknown platforms and out-of-range preferences degrade to defaults instead
  of crashing the form.
- `npm run lint` passes across `src` for the first time (two pre-existing
  `no-explicit-any` errors on `main` were fixed).

## Verification

- `cd frontend && npm run typecheck && npm run lint && npm run build`
- `cd backend-ts && npx tsc --noEmit`
- **`cd frontend && npm test`** — a committed jsdom harness
  (`scripts/cta-tone-check.cjs`) renders the real page, drives it like a user
  and asserts 23 checks: tone switching, override written/count shown,
  override cleared by a default change, all toggles, the character counter,
  localStorage persistence, a `400` surfacing on the button and auto-clearing
  back to idle, and a **real generation** asserting the preferences arrive in
  the request body. Needs the backend on `:3001`.
- Manual `curl` matrix against the backend: missing name, string price, bad
  tone value, >300-char instructions, malformed JSON, oversized body, plus a
  real generation with an Instagram tone override (verified the override and
  CTA actually land in the output).

## Tradeoffs & decisions

- **One prompt, per-platform tone lines** instead of one API call per platform.
  Cheaper and faster; the risk is weaker tone adherence per platform since a
  single completion writes all three posts. Fallback if quality disappoints:
  split into three calls (≈3× cost).
- **Fixed tone whitelist** rather than free-form tone text — keeps the prompt
  predictable, makes validation trivial, and gives the UI meaningful presets.
  Free-form needs still have `customInstructions`, which is length-capped and
  delimited in the prompt.
- **Types are duplicated** across `backend-ts` and `frontend` (zod schemas are
  the backend's source of truth; the frontend mirrors them as interfaces).
  The two packages share no code today — a shared package is the follow-up.
- **Kept Chat Completions** rather than migrating to the Responses API: this
  feature doesn't need tools, and a silent API migration alongside a feature
  would have muddied the review. Good standalone next step.
- **Test harness choice**: I tried a real browser (Playwright) first, but the
  sandbox lacks the system libraries and has no root. The jsdom harness runs
  the real components, real state and a real backend, which covers the logic;
  a browser-level E2E is the upgrade path.
- `POST_COUNT=5` across 3 platforms still produces duplicate platforms —
  pre-existing behaviour, left untouched to keep this branch focused.

## Tools used

OpenCode (agent-driven exploration, edits, commits), zod, TypeScript/eslint/
Next build for static checks, jsdom + esbuild for the harness, curl for the
API error matrix, git for incremental commits.

## With more time

1. Per-platform generation in parallel (three calls) + a "regenerate this one
   post" affordance and tone preview per card.
2. A shared types package so the zod schemas are genuinely single-source.
3. Unit tests for the prompt builder and schemas (`node:test`, no framework).
4. Migrate to the Responses API and evaluate `web_search` for the product
   description step (half-filled descriptions are the most common input).
5. Rate limiting, request IDs and structured server logs.
6. Clarify `POST_COUNT` semantics (per platform vs total).
