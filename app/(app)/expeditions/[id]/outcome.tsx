import { ActionForm } from "@/app/components/action-form";
import { PendingButton } from "@/app/components/pending-button";
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

  return (
    <section
      className={`rounded-lg border p-4 ${
        summited ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-sky-200 bg-sky-50 text-sky-900"
      }`}
    >
      <h2 className="font-semibold">
        {summited ? `🏔️ Summited ${expedition.peak ?? ""}` : `↩️ Turned back on ${expedition.peak ?? "this one"}`}
      </h2>
      {expedition.outcome_note && <p className="mt-1 text-sm italic">“{expedition.outcome_note}”</p>}
      {!summited && (
        <p className="mt-2 text-xs opacity-75">
          Getting down safely is the only summit that&apos;s mandatory. The mountain will still be there.
        </p>
      )}
    </section>
  );
}

export function OutcomeForm({ expedition }: { expedition: Expedition }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-medium text-slate-700">How did it go?</h2>
      <ActionForm action={setOutcome.bind(null, expedition.id)} className="mt-3 space-y-3">
        <fieldset className="flex flex-wrap gap-2">
          <legend className="sr-only">Outcome</legend>
          {OPTIONS.map((o) => (
            <label
              key={o.value}
              className="cursor-pointer rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700 has-checked:border-slate-900 has-checked:bg-slate-900 has-checked:text-white"
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
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <PendingButton className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
          Save outcome
        </PendingButton>
      </ActionForm>
    </section>
  );
}
