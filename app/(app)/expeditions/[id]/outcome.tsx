import { ActionForm } from "@/app/components/action-form";
import { MountainIcon, UndoIcon } from "@/app/components/icons";
import { PendingButton } from "@/app/components/pending-button";
import { BUTTON, INPUT } from "@/app/components/ui";
import type { Expedition, ExpeditionStatus } from "@/lib/types";
import { setOutcome } from "./actions";

const OPTIONS: { value: ExpeditionStatus; label: string }[] = [
  { value: "planning", label: "Still planning" },
  { value: "summited", label: "Summited" },
  { value: "turned_back", label: "Turned back" },
];

export function OutcomeBanner({ expedition }: { expedition: Expedition }) {
  if (expedition.status === "planning") return null;
  const summited = expedition.status === "summited";
  const Icon = summited ? MountainIcon : UndoIcon;

  return (
    <section
      className={`flex gap-3 rounded-lg border p-4 ${
        summited ? "border-success-line bg-success-soft text-success-fg" : "border-info-line bg-info-soft text-info-fg"
      }`}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div>
        <h2 className="font-semibold">
          {summited ? `Summited ${expedition.peak ?? ""}` : `Turned back on ${expedition.peak ?? "this one"}`}
        </h2>
        {expedition.outcome_note && <p className="mt-1 text-sm italic">“{expedition.outcome_note}”</p>}
        {!summited && (
          <p className="mt-2 text-xs opacity-75">
            Getting down safely is the only summit that&apos;s mandatory. The mountain will still be there.
          </p>
        )}
      </div>
    </section>
  );
}

export function OutcomeForm({ expedition }: { expedition: Expedition }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-4 shadow-xs">
      <h2 className="text-sm font-medium text-fg-secondary">How did it go?</h2>
      <ActionForm action={setOutcome.bind(null, expedition.id)} className="mt-3 space-y-3">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Outcome</legend>
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className="cursor-pointer rounded-full border border-line-strong px-3 py-1 text-sm text-fg-secondary transition-colors not-has-checked:hover:bg-surface-hover has-checked:border-primary has-checked:bg-primary has-checked:text-primary-fg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
            >
              <input
                type="radio"
                name="status"
                value={o.value}
                defaultChecked={expedition.status === o.value}
                className="sr-only"
              />
              {o.label}
            </label>
          ))}
        </fieldset>
        <textarea
          name="outcome_note"
          defaultValue={expedition.outcome_note ?? ""}
          maxLength={500}
          rows={2}
          placeholder="Turned back at 5,700m: whiteout on the summit ridge and a teammate with a pounding headache."
          className={`resize-y ${INPUT}`}
        />
        <PendingButton className={BUTTON.primary}>Save outcome</PendingButton>
      </ActionForm>
    </section>
  );
}
