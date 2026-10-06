import type { Risk, Severity } from "@/lib/acclimatization";

export const RISK_STYLES: Record<Risk, { label: string; badge: string; banner: string }> = {
  low: {
    label: "Low risk",
    badge: "bg-success-soft text-success-fg ring-success-line",
    banner: "border-success-line bg-success-soft text-success-fg",
  },
  moderate: {
    label: "Moderate risk",
    badge: "bg-warning-soft text-warning-fg ring-warning-line",
    banner: "border-warning-line bg-warning-soft text-warning-fg",
  },
  high: {
    label: "High risk",
    badge: "bg-danger-soft text-danger-fg ring-danger-line",
    banner: "border-danger-line bg-danger-soft text-danger-fg",
  },
};

export const SEVERITY_STYLES: Record<Severity, string> = {
  warning: "bg-warning-soft text-warning-fg ring-warning-line",
  high: "bg-danger-soft text-danger-fg ring-danger-line",
};

export function RiskBadge({ risk }: { risk: Risk }) {
  const style = RISK_STYLES[risk];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style.badge}`}>
      {style.label}
    </span>
  );
}
