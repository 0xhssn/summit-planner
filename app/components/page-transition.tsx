import { ViewTransition } from "react";

// Fades a page's content in when it mounts: after a navigation, or when it replaces the loading
// skeleton. Server action refreshes re-render the page without remounting it, so they don't replay it.
// The animation is `.page-enter` in app/globals.css.
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" default="none">
      {children}
    </ViewTransition>
  );
}
