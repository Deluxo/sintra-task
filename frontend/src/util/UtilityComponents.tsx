import type { ReactNode } from "react";

/** Renders children only when `on` is truthy. */
export function Nullable({ on, children }: { on: boolean; children: ReactNode }) {
  if (!on) {
    return null;
  }
  return <>{children}</>;
}
