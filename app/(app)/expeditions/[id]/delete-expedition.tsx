"use client";

import { useId, useRef } from "react";
import { ActionForm } from "@/app/components/action-form";
import { TrashIcon } from "@/app/components/icons";
import { PendingButton } from "@/app/components/pending-button";
import { BUTTON } from "@/app/components/ui";
import { deleteExpedition } from "../../dashboard/actions";

type Props = { expeditionId: string; name: string; dayCount: number };

// A button that asks for confirmation in a modal before deleting. The native <dialog> handles focus
// trapping and Escape; the open and close animations are CSS transitions on [open].
export function DeleteExpedition({ expeditionId, name, dayCount }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  return (
    <>
      <button type="button" onClick={() => dialog.current?.showModal()} className={BUTTON.dangerOutline}>
        <TrashIcon className="size-4" />
        Delete expedition
      </button>

      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        // A click that lands on the dialog itself, not its content, was on the backdrop.
        onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md scale-95 rounded-xl border border-line bg-surface text-fg opacity-0 shadow-2xl transition-[opacity,scale,overlay,display] transition-discrete duration-200 backdrop:bg-slate-950/0 backdrop:backdrop-blur-none backdrop:transition-all backdrop:transition-discrete backdrop:duration-200 open:scale-100 open:opacity-100 open:backdrop:bg-slate-950/50 open:backdrop:backdrop-blur-[2px] starting:open:scale-95 starting:open:opacity-0 starting:open:backdrop:bg-slate-950/0"
      >
        <div className="p-6">
          <div className="flex gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger-fg">
              <TrashIcon className="size-5" />
            </span>
            <div>
              <h2 id={titleId} className="font-semibold">
                Delete {name}?
              </h2>
              <p className="mt-1 text-sm text-fg-muted">
                {dayCount > 0 ? `Its ${dayCount}-day itinerary` : "The expedition"} and outcome will be gone for good.
                This can&apos;t be undone.
              </p>
            </div>
          </div>
          <ActionForm
            action={deleteExpedition.bind(null, expeditionId)}
            className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
          >
            {/* First in the DOM, so showModal() focuses Cancel rather than the destructive button. */}
            <button type="button" onClick={() => dialog.current?.close()} className={BUTTON.secondary}>
              Cancel
            </button>
            <PendingButton className={BUTTON.danger}>Delete expedition</PendingButton>
          </ActionForm>
        </div>
      </dialog>
    </>
  );
}
