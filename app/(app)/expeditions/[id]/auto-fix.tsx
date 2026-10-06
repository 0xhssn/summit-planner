"use client";

import { useTransition } from "react";
import { BUTTON } from "@/app/components/ui";
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
      className={`${BUTTON.primary} disabled:cursor-wait disabled:opacity-60`}
    >
      {pending ? "Re-planning…" : "Auto-fix itinerary"}
    </button>
  );
}
