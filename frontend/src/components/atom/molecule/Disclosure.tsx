import type { ComponentProps, ReactNode } from "react";

type DisclosureProps = {
  summary: ReactNode;
} & ComponentProps<"details">;

/**
 * Stateless disclosure built on the native <details> element.
 * Open/closed state is owned by the browser — no React state required.
 */
export const Disclosure = ({ summary, children, ...props }: DisclosureProps) => (
  <details className="group" {...props}>
    <summary className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-500 bg-transparent px-3 py-2 text-sm text-blue-500 transition-colors hover:border-blue-800 hover:text-blue-800 hover:bg-transparent list-none dark:hover:bg-transparent [&::-webkit-details-marker]:hidden">
      {summary}
      <svg
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90"
      >
        <path
          d="M6 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </summary>
    {children}
  </details>
);
