"use client";

import { useTransition } from "react";
import { useActionToast } from "@/app/components/use-action-toast";
import { autoFixItinerary } from "./actions";

export function AutoFix({ expeditionId, canFix }: { expeditionId: string; canFix: boolean }) {
  const [pending, startTransition] = useTransition();
  const run = useActionToast();

  if (!canFix) return null;

  return (
    <button
      data-tour="auto-fix"
      onClick={() => startTransition(() => run(autoFixItinerary(expeditionId)).then(() => {}))}
      disabled={pending}
      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? "Re-planning…" : "Auto-fix itinerary"}
    </button>
  );
}
