# 0002: Use Zod for backend validation

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The Express backend (`backend-ts`) crosses two untrusted boundaries:

1. **HTTP input** — `POST /api/generate` receives a JSON body from the
   frontend (and potentially anyone else).
2. **LLM output** — the OpenAI API returns free-form JSON whose shape is only
   *prompted*, never guaranteed.

The task requires proper validation and edge-case handling, so both boundaries
need runtime validation that is type-safe, easy to extend, and produces
useful per-field error messages for the client.

## Decision

Use **Zod** as the single runtime validation layer, defined in one place
(`backend-ts/src/schema.ts`):

- `generateRequestSchema` validates the request body, including limits
  (e.g. `MAX.name = 120`) and numeric sanity (finite, non-negative price).
- `llmResponseSchema` validates the model's response, and
  `normalizeGeneratedPosts` filters out posts the model produced for
  platforms we don't support.
- TypeScript types are *derived* from the schemas with `z.infer`
  (`GenerateRequest`, `LlmResponse`), so types and validation can't drift.
- `toFieldErrors` maps a `ZodError` to a flat `Record<string, string>` so the
  API returns structured, per-field 400 responses:

```json
{ "error": { "message": "Invalid request", "fields": { "product.name": "Product name is required" } } }
```

## Consequences

- **Positive**
  - Validation happens at the edge, before any business logic runs.
  - One schema is the source of truth for both runtime checks and types.
  - LLM output is treated as untrusted input, so a malformed model response
    becomes a clean error instead of a crash.
  - Adding a new field or limit is a one-line schema change.
- **Negative**
  - Schemas are an extra layer to maintain when the API surface changes.
  - Zod's error mapping is a small convention (`toFieldErrors`) that has to be
    applied consistently in every route.
- **Constraints**
  - All external input (HTTP bodies, LLM responses, env vars) must be parsed
    with a schema before use; no raw `req.body` access in handlers.

## Alternatives Considered

- **Manual `if` checks in handlers** — no shared types, error handling
  scatters across routes, easy to forget a check; rejected.
- **JSON Schema + `ajv`** — powerful but more boilerplate and weaker
  type inference for a small API surface; rejected.
- **`class-validator` (decorators)** — tied to a class-based/TypeORM style
  that doesn't match this codebase; rejected.
