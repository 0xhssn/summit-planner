// The theme picked with the toggle, kept in a cookie so the server renders it and there's no flash.
// No cookie means "follow the OS" (see the color-scheme rules in app/globals.css).
export const THEME_COOKIE = "theme";

export type Theme = "light" | "dark";

export function parseTheme(value: string | undefined): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}
