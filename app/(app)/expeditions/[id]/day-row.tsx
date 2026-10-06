"use client";

import { useState } from "react";
import { PendingButton } from "@/app/components/pending-button";
import { useActionToast } from "@/app/components/use-action-toast";
import { SEVERITY_STYLES } from "@/app/components/risk";
import type { Flag } from "@/lib/acclimatization";
import { signedMeters } from "@/lib/format";
import type { Day } from "@/lib/types";
import { deleteDay, moveDay, updateDay } from "./actions";

type Props = {
  expeditionId: string;
  day: Day;
  index: number;
  isLast: boolean;
  gain: number | null;
  flags: Flag[];
};

// Visible borders on touch screens (no hover to discover them); quiet until hover on desktop.
const editable =
  "rounded border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:border-slate-400 focus:outline-none sm:border-transparent sm:hover:border-slate-200";

const iconButton =
  "rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100";

export function DayRow({ expeditionId, day, index, isLast, gain, flags }: Props) {
  const [dirty, setDirty] = useState(false);
  const run = useActionToast();

  async function save(formData: FormData) {
    await run(updateDay(expeditionId, day.id, formData));
    // React resets the form after the action either way: to the saved values, or back to the old ones.
    setDirty(false);
  }

  const worst = flags.some((f) => f.severity === "high") ? "high" : flags.length ? "warning" : null;
  const accent =
    worst === "high" ? "border-l-red-500" : worst === "warning" ? "border-l-amber-400" : "border-l-transparent";

  return (
    <li className={`border-l-4 ${accent}`}>
      <form
        action={save}
        onChange={() => setDirty(true)}
        className="grid grid-cols-[2rem_1fr] items-center gap-x-2 gap-y-1 px-3 py-2 sm:grid-cols-[2.5rem_1fr_7rem_5rem_auto]"
      >
        <span className="text-sm font-medium text-slate-400">D{index + 1}</span>
        <input
          name="camp_name"
          defaultValue={day.camp_name}
          required
          aria-label={`Day ${index + 1} camp`}
          className={`min-w-0 ${editable}`}
        />
        {/* One line under the camp on mobile; its own grid columns from sm up. */}
        <div className="col-start-2 flex items-center gap-2 sm:contents">
          <div className="flex w-28 items-center gap-1 sm:w-auto">
            <input
              name="sleep_altitude_m"
              type="number"
              min={0}
              max={9000}
              required
              defaultValue={day.sleep_altitude_m}
              aria-label={`Day ${index + 1} sleeping altitude in meters`}
              className={`w-full text-right tabular-nums ${editable}`}
            />
            <span className="text-xs text-slate-400">m</span>
          </div>
          <span className="text-right text-sm tabular-nums text-slate-500">
            {gain === null ? "start" : signedMeters(gain)}
          </span>
          <div className="ml-auto flex justify-end gap-1">
            {dirty && (
              <PendingButton className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700">
                Save
              </PendingButton>
            )}
            <PendingButton
              formAction={() => run(moveDay(expeditionId, day.id, "up")).then(() => {})}
              formNoValidate
              disabled={index === 0}
              aria-label="Move day up"
              className={iconButton}
            >
              ↑
            </PendingButton>
            <PendingButton
              formAction={() => run(moveDay(expeditionId, day.id, "down")).then(() => {})}
              formNoValidate
              disabled={isLast}
              aria-label="Move day down"
              className={iconButton}
            >
              ↓
            </PendingButton>
            <PendingButton
              formAction={() => run(deleteDay(expeditionId, day.id)).then(() => {})}
              formNoValidate
              aria-label="Delete day"
              className={`${iconButton} hover:border-red-200 hover:bg-red-50 hover:text-red-700`}
            >
              ✕
            </PendingButton>
          </div>
        </div>
      </form>
      {flags.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 pb-2 pl-[3.25rem] pr-3 sm:pl-[3.75rem]">
          {flags.map((f) => (
            <li key={f.code} className={`rounded px-2 py-0.5 text-xs ring-1 ring-inset ${SEVERITY_STYLES[f.severity]}`}>
              {f.message}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
