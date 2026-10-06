import type { Risk, Severity } from "@/lib/acclimatization";

export const RISK_STYLES: Record<Risk, { label: string; badge: string; banner: string }> = {
  low: {
    label: "Low risk",
    badge: "bg-emerald-100 text-emerald-800",
    banner: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  moderate: {
    label: "Moderate risk",
    badge: "bg-amber-100 text-amber-800",
    banner: "border-amber-200 bg-amber-50 text-amber-900",
  },
  high: {
    label: "High risk",
    badge: "bg-red-100 text-red-800",
    banner: "border-red-200 bg-red-50 text-red-900",
  },
};

export const SEVERITY_STYLES: Record<Severity, string> = {
  warning: "bg-amber-50 text-amber-800 ring-amber-200",
  high: "bg-red-50 text-red-800 ring-red-200",
};

export function RiskBadge({ risk }: { risk: Risk }) {
  const style = RISK_STYLES[risk];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
      {style.label}
    </span>
  );
}
