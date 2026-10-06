// Same mark as app/icon.svg, so the tab icon and the header match.
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0f172a" />
      <path d="M3 25 12 11l4.5 7 3.5-4.5L29 25Z" fill="#38bdf8" />
      <path d="M12 11 9.4 15l1.8-.8 1.4 1.4 1.7-1.3Z" fill="#f8fafc" />
      <path d="m20 13.5-1.7 2.3 1.3-.5 1.1 1 1.1-.7Z" fill="#f8fafc" />
    </svg>
  );
}

export function Logo({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className={`font-semibold tracking-tight ${tone === "light" ? "text-white" : "text-slate-900"}`}>
        Summit Planner
      </span>
    </span>
  );
}
