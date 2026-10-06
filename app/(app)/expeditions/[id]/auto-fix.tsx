"use client";

import { useState, useTransition } from "react";
import { autoFixItinerary, type AutoFixSummary } from "./actions";

function describe({ restDaysAdded, stopsAdded, clean }: AutoFixSummary) {
  const parts = [
    stopsAdded && `${stopsAdded} acclimatization ${stopsAdded === 1 ? "stop" : "stops"}`,
    restDaysAdded && `${restDaysAdded} rest ${restDaysAdded === 1 ? "day" : "days"}`,
  ].filter(Boolean);
  if (parts.length === 0) return "Nothing to fix.";
  const outcome = clean
    ? "Your itinerary is now low risk."
    : "Some flags remain: the plan hit the 40-day limit.";
  return `Added ${parts.join(" and ")}. ${outcome}`;
}

export function AutoFix({ expeditionId, canFix }: { expeditionId: string; canFix: boolean }) {
  const [summary, setSummary] = useState<AutoFixSummary | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canFix && (
        <button
          onClick={() => startTransition(async () => setSummary(await autoFixItinerary(expeditionId)))}
          disabled={pending}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "Re-planning…" : "Auto-fix itinerary"}
        </button>
      )}
      {summary && <p className="text-sm">{describe(summary)}</p>}
    </div>
  );
}
