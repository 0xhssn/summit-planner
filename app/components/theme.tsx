"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "sonner";
import { parseTheme, THEME_COOKIE, type Theme } from "@/lib/theme";
import { MoonIcon, SunIcon } from "./icons";

// The source of truth is <html data-theme>, which the server renders from the cookie.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}

function chosenTheme(): Theme | "system" {
  return parseTheme(document.documentElement.dataset.theme) ?? "system";
}

function setTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=31536000; samesite=lax`;
  const apply = () => {
    document.documentElement.dataset.theme = theme;
    listeners.forEach((listener) => listener());
  };
  // Crossfade the page instead of snapping every color at once. If the browser skips the transition
  // (hidden tab, another transition starting), `apply` still runs and only `ready` rejects.
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) apply();
  else document.startViewTransition(apply).ready.catch(() => {});
}

// The icon and label come from CSS (`dark:`), so the server can render the right one before it knows the OS theme.
export function ThemeToggle() {
  function toggle() {
    const current = chosenTheme();
    const dark = current === "system" ? matchMedia("(prefers-color-scheme: dark)").matches : current === "dark";
    setTheme(dark ? "light" : "dark");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-8 place-items-center rounded-md border border-line-strong text-fg-secondary transition-colors hover:bg-surface-hover hover:text-fg"
    >
      <MoonIcon className="col-start-1 row-start-1 size-4 transition duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <SunIcon className="col-start-1 row-start-1 size-4 rotate-90 scale-0 opacity-0 transition duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </button>
  );
}

export function ThemedToaster({ theme }: { theme: Theme | null }) {
  const current = useSyncExternalStore(subscribe, chosenTheme, () => theme ?? "system");
  return <Toaster theme={current} position="top-center" richColors closeButton />;
}
