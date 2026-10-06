import { ViewTransition } from "react";

export default function Loading() {
  return (
    // Fades out quickly as the page's content rises in (see PageTransition).
    <ViewTransition exit="skeleton-exit" default="none">
      <div className="animate-pulse space-y-4" aria-label="Loading">
        <div className="h-7 w-1/3 rounded bg-surface-hover" />
        <div className="h-24 rounded-lg bg-surface-hover" />
        <div className="h-64 rounded-lg bg-surface-hover" />
      </div>
    </ViewTransition>
  );
}
