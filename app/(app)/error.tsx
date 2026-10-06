"use client";

import { BUTTON } from "@/app/components/ui";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-lg border border-danger-line bg-danger-soft p-6 text-danger-fg">
      <h2 className="font-semibold">Something went wrong on the trail.</h2>
      <p className="mt-1 text-sm">{error.message}</p>
      <button onClick={reset} className={`mt-4 ${BUTTON.secondary}`}>
        Try again
      </button>
    </div>
  );
}
