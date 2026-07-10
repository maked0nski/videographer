import type { ReactNode } from "react";

/** Screen-reader-only content — visually hidden without removing it from the a11y tree. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
