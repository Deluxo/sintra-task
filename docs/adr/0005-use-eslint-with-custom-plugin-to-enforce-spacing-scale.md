# 0005: Use ESLint with a custom plugin to enforce the spacing scale

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

Tailwind CSS v4 computes spacing as `calc(var(--spacing) * N)`, which means
**every number compiles** — `mb-5`, `mb-97`, and `p-[13px]` all build and
silently ship. Unlike Tailwind v3's `theme.spacing` object, which could drop
off-scale values, the CSS `@theme` approach in v4 cannot enforce a scale at
build time.

Without enforcement, each developer gradually invents their own sizes
(`mt-7` here, `px-4.5` there), and the UI drifts into an uncoordinated set of
spacing values that is impossible to audit visually.

## Decision

Use **ESLint** as the gatekeeper, with a **custom inline plugin**
(`frontend/eslint-rules/allowed-spacing.js`, registered as `style/allowed-spacing`
in `frontend/eslint.config.mjs`) that bans spacing utilities outside an agreed
scale (`0, px, 1, 2, 3, 4, 6, 8`):

- Reports off-scale values in static `className` strings.
- Reports *dynamic* spacing (`` `mb-${n}` ``, `"mb-" + n``) because the value
  is unknowable at lint time — and Tailwind's scanner can't see it either, so
  the class would silently never be generated.
- Exempts `src/components/atom/**` (see ADR 0003): the atom files own the
  base look of each element and are where the scale is applied in the first
  place.

It is paired with the standard Tailwind rules:

```js
rules: {
  "tailwindcss/no-arbitrary-value": "error",
  "tailwindcss/no-contradicting-classname": "error",
  "tailwindcss/enforces-canonical-classname": "error",
  "style/allowed-spacing": "error",
}
```

## Consequences

- **Positive**
  - Arbitrary sizing is caught in CI/lint, not in design review.
  - The scale is a one-line `Set` in the rule — changing the scale is a
    one-file change, and the rule is configurable via its `allowed` option.
  - The dynamic-class detection doubles as a Tailwind v4 gotcha guard
    (runtime-built classes are never scanned).
  - The rule reads as documentation: its message tells the developer to add a
    size *deliberately* rather than reach for an arbitrary number.
- **Negative**
  - A custom rule is custom maintenance: new Tailwind spacing utility forms
    must be added to the rule's patterns.
  - Enforced by convention + linter, not by the compiler.
- **Constraints**
  - New spacing values require an intentional edit of the allowed set, not an
    ad-hoc utility at the call site.

## Alternatives Considered

- **Tailwind v3-style `theme.spacing` whitelist** — not available in the v4
  CSS-first configuration that this app uses.
- **`@theme` spacing scale only** — v4 accepts any number, so a custom scale
  doesn't remove off-scale utilities.
- **Code review only** — scales poorly and lets drift in between reviews.
- **A full design-token system (Style Dictionary etc.)** — more machinery
  than this app needs; the scale is four numbers and a hairline.
