"use client";

import { useState } from "react";
import { PendingButton } from "@/app/components/pending-button";
import { signedMeters } from "@/lib/format";
import type { Day } from "@/lib/types";
import { deleteDay, moveDay, updateDay } from "./actions";

type Props = {
  expeditionId: string;
  day: Day;
  index: number;
  isLast: boolean;
  gain: number | null;
};

const iconButton =
  "rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100";

export function DayRow({ expeditionId, day, index, isLast, gain }: Props) {
  const [dirty, setDirty] = useState(false);

  async function save(formData: FormData) {
    await updateDay(expeditionId, day.id, formData);
    setDirty(false);
  }

  return (
    <li>
      <form
        action={save}
        onChange={() => setDirty(true)}
        className="grid grid-cols-[2.5rem_1fr_6.5rem] items-center gap-2 px-3 py-2 sm:grid-cols-[2.5rem_1fr_7rem_5rem_auto]"
      >
        <span className="text-sm font-medium text-slate-400">D{index + 1}</span>
        <input
          name="camp_name"
          defaultValue={day.camp_name}
          required
          aria-label={`Day ${index + 1} camp`}
          className="min-w-0 rounded border border-transparent px-2 py-1 text-sm text-slate-900 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
        />
        <div className="flex items-center gap-1">
          <input
            name="sleep_altitude_m"
            type="number"
            min={0}
            max={9000}
            required
            defaultValue={day.sleep_altitude_m}
            aria-label={`Day ${index + 1} sleeping altitude in meters`}
            className="w-full rounded border border-transparent px-2 py-1 text-right text-sm tabular-nums text-slate-900 hover:border-slate-200 focus:border-slate-400 focus:outline-none"
          />
          <span className="text-xs text-slate-400">m</span>
        </div>
        <span className="hidden text-right text-sm tabular-nums text-slate-500 sm:block">
          {gain === null ? "start" : signedMeters(gain)}
        </span>
        <div className="col-span-3 flex justify-end gap-1 sm:col-span-1">
          {dirty && (
            <PendingButton className="rounded bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700">
              Save
            </PendingButton>
          )}
          <PendingButton
            formAction={moveDay.bind(null, expeditionId, day.id, "up")}
            formNoValidate
            disabled={index === 0}
            aria-label="Move day up"
            className={iconButton}
          >
            ↑
          </PendingButton>
          <PendingButton
            formAction={moveDay.bind(null, expeditionId, day.id, "down")}
            formNoValidate
            disabled={isLast}
            aria-label="Move day down"
            className={iconButton}
          >
            ↓
          </PendingButton>
          <PendingButton
            formAction={deleteDay.bind(null, expeditionId, day.id)}
            formNoValidate
            aria-label="Delete day"
            className={`${iconButton} hover:border-red-200 hover:bg-red-50 hover:text-red-700`}
          >
            ✕
          </PendingButton>
        </div>
      </form>
    </li>
  );
}
