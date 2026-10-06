// Shared class strings so buttons and fields look and behave the same on every page.
// Colors are theme tokens from app/globals.css.

const button =
  "inline-flex items-center justify-center gap-1.5 rounded-md border px-3.5 py-2 text-sm font-medium transition-colors";

export const BUTTON = {
  primary: `${button} border-transparent bg-primary text-primary-fg hover:bg-primary-hover`,
  secondary: `${button} border-line-strong bg-surface text-fg hover:bg-surface-hover`,
  danger: `${button} border-transparent bg-danger text-white hover:bg-danger-hover`,
  dangerOutline: `${button} border-line-strong bg-surface text-danger-fg hover:border-danger-line hover:bg-danger-soft`,
};

// Square, borderless icon buttons, like the move and delete controls on each day.
const iconButton = "inline-flex size-7 items-center justify-center rounded-md text-fg-muted transition-colors";

export const ICON_BUTTON = {
  default: `${iconButton} hover:bg-surface-hover hover:text-fg`,
  danger: `${iconButton} hover:bg-danger-soft hover:text-danger-fg`,
};

export const INPUT =
  "w-full rounded-md border border-line-strong bg-surface px-3 py-2 text-sm text-fg shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-fg-subtle focus:border-accent focus:ring-3 focus:ring-focus";
