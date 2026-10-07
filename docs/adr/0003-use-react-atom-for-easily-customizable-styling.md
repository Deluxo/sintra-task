# 0003: Use the react-atom package for easily customizable styling

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Trial task

## Context

The frontend is Tailwind CSS 4 + React 19. The UI is built from a set of
repeated primitives (labels, inputs, buttons, chips, toggles, segmented
controls) that appear in many places with small visual variations
(primary vs. danger vs. ghost buttons, selected vs. unselected chips, dark
mode variants).

If every class string lived at the call site, the same styling would be
copy-pasted across components, making consistent theming, dark mode, and
restyling painful.

## Decision

Use the **`@synergyeffect/react-atom`** package to define UI primitives as
atoms. An atom is a base element with its default styling, declared in one
place:

```ts
export const Button = atom<"button">(
  <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 ..." />
);
```

Variants are *derived* by composing an existing atom, so they inherit the
base and only override what differs:

```ts
export const ButtonDanger = atom<"button">(<Button className="bg-red-600 text-white hover:bg-red-700" />);
```

Primitives live in `frontend/src/components/atom/` (atoms: `form.tsx`,
`layout.tsx`, `surface.tsx`, `typography.tsx`), and composites of atoms live
in `frontend/src/components/atom/molecule/` (e.g. `FormControl`, `Disclosure`).

## Consequences

- **Positive**
  - Styling for a primitive exists in exactly one place; restyle once, update
    everywhere.
  - Variants are derived, not duplicated, so base changes propagate.
  - Atoms are typed by their intrinsic element (`atom<"button">`), so
    standard props still typecheck.
  - Dark-mode and hover states are colocated with the primitive they belong to.
- **Negative**
  - One more package to learn; atom composition has to be understood to
    customize correctly.
  - Heavy customization of a primitive sometimes means editing the atom
    definition, not just a call site.
- **Constraints**
  - Domain components (`frontend/src/domain/**`) consume atoms/molecules and
    don't define their own styling for shared primitives.

## Alternatives Considered

- **Scattered Tailwind utilities** — fastest to start, but the styling
  duplication is exactly what makes theming and dark mode fragile; rejected.
- **Headless component libraries (Radix UI / Headless UI)** — great for
  complex accessible widgets, but add dependency weight for this app's
  primitive needs; rejected.
- **CSS-in-JS / design-token libraries (styled-components)** — runtime cost
  and tooling overhead that don't fit a Tailwind-based app; rejected.
