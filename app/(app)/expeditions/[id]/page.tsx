import Link from "next/link";
import { notFound } from "next/navigation";
import { PendingButton } from "@/app/components/pending-button";
import { RISK_STYLES } from "@/app/components/risk";
import { analyze, RULES } from "@/lib/acclimatization";
import { meters } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import type { Day, Expedition } from "@/lib/types";
import { deleteExpedition } from "../../dashboard/actions";
import { addDay } from "./actions";
import { AutoFix } from "./auto-fix";
import { DayRow } from "./day-row";
import { ElevationChart } from "./elevation-chart";

export default async function ExpeditionPage({ params }: PageProps<"/expeditions/[id]">) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const [{ data: expedition }, { data: days, error: daysError }] = await Promise.all([
    supabase
      .from("expeditions")
      .select("id, name, peak, summit_altitude_m, status, outcome_note, created_at")
      .eq("id", id)
      .maybeSingle<Expedition>(),
    supabase
      .from("days")
      .select("id, day_index, camp_name, sleep_altitude_m")
      .eq("expedition_id", id)
      .order("day_index")
      .returns<Day[]>(),
  ]);

  // RLS returns nothing for other users' expeditions, so this also covers "not yours".
  if (!expedition) notFound();
  if (daysError) throw new Error(daysError.message);

  const itinerary = days ?? [];
  const highest = itinerary.length ? Math.max(...itinerary.map((d) => d.sleep_altitude_m)) : null;
  const lastAltitude = itinerary.at(-1)?.sleep_altitude_m;
  const analysis = analyze(itinerary);
  const riskStyle = RISK_STYLES[analysis.risk];

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-800">
          ← All expeditions
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{expedition.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {[
            expedition.peak,
            expedition.summit_altitude_m && `summit ${meters(expedition.summit_altitude_m)}`,
            `${itinerary.length} ${itinerary.length === 1 ? "night" : "nights"}`,
            highest !== null && `highest camp ${meters(highest)}`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>

      {itinerary.length > 1 && (
        <section className={`rounded-lg border p-4 ${riskStyle.banner}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold">{riskStyle.label}</h2>
              <p className="mt-0.5 text-sm">{riskSummary(analysis.highCount, analysis.warningCount)}</p>
            </div>
            <AutoFix expeditionId={expedition.id} canFix={analysis.risk !== "low"} />
          </div>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer opacity-80 hover:opacity-100">How Summit Planner checks your plan</summary>
            <ul className="mt-2 list-disc space-y-1 pl-5 opacity-90">
              <li>
                Rules start once you sleep above {meters(RULES.thresholdM)}, and only count <em>new</em> altitude:
                higher than any night so far. Climb high, sleep low rotations are fine.
              </li>
              <li>
                More than {meters(RULES.maxNewAltitudePerNightM)} of new altitude in one night is a warning; more
                than {meters(RULES.highRiskNewAltitudeM)} is high risk.
              </li>
              <li>
                Take a rest night (no higher than the night before) for every {meters(RULES.restEveryM)} gained.
              </li>
              <li>
                Auto-fix splits big jumps into equal steps of at most {meters(RULES.maxNewAltitudePerNightM)} with
                intermediate nights, and adds rest nights where they&apos;re overdue.
              </li>
            </ul>
            <p className="mt-2 text-xs opacity-75">
              A planning aid based on Wilderness Medical Society guidance, not medical advice. Listen to your body:
              descend if symptoms get worse.
            </p>
          </details>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-medium text-slate-700">Elevation profile</h2>
        {itinerary.length > 0 ? (
          <ElevationChart
            days={itinerary}
            severities={analysis.days.map((d) =>
              d.flags.some((f) => f.severity === "high") ? "high" : d.flags.length ? "warning" : null,
            )}
            summitAltitude={expedition.summit_altitude_m}
          />
        ) : (
          <p className="py-12 text-center text-sm text-slate-400">
            Add your first night below to see the profile.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="hidden grid-cols-[2.5rem_1fr_7rem_5rem_auto] gap-2 border-b border-slate-100 px-3 py-2 text-xs font-medium uppercase tracking-wide text-slate-400 sm:grid">
          <span>Day</span>
          <span className="px-2">Camp</span>
          <span className="text-right">Sleep alt.</span>
          <span className="text-right">Gain</span>
          <span className="w-[7.5rem]" />
        </div>
        <ol className="divide-y divide-slate-100">
          {itinerary.map((day, i) => (
            <DayRow
              key={day.id}
              expeditionId={expedition.id}
              day={day}
              index={i}
              isLast={i === itinerary.length - 1}
              gain={analysis.days[i].gain}
              flags={analysis.days[i].flags}
            />
          ))}
        </ol>
        <form
          action={addDay.bind(null, expedition.id)}
          className="grid grid-cols-[1fr_7rem_auto] items-end gap-2 border-t border-slate-200 bg-slate-50 p-3"
        >
          <label className="text-xs font-medium text-slate-500">
            Next camp
            <input
              name="camp_name"
              required
              placeholder="e.g. Concordia"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Sleep alt. (m)
            <input
              // Re-mount when the itinerary changes so the default follows the last camp.
              key={`${itinerary.length}-${lastAltitude}`}
              name="sleep_altitude_m"
              type="number"
              min={0}
              max={9000}
              required
              defaultValue={lastAltitude}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm tabular-nums"
            />
          </label>
          <PendingButton className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
            Add day
          </PendingButton>
        </form>
      </section>

      <details className="text-sm">
        <summary className="cursor-pointer text-slate-400 hover:text-slate-600">Delete expedition</summary>
        <form action={deleteExpedition.bind(null, expedition.id)} className="mt-2">
          <PendingButton className="rounded-md border border-red-300 px-3 py-1.5 text-red-700 hover:bg-red-50">
            Yes, delete {expedition.name} permanently
          </PendingButton>
        </form>
      </details>
    </div>
  );
}

function riskSummary(highCount: number, warningCount: number) {
  if (highCount === 0 && warningCount === 0) {
    return "No acclimatization flags. This pacing gives your body time to adapt.";
  }
  const parts = [
    highCount && `${highCount} high-risk ${highCount === 1 ? "jump" : "jumps"}`,
    warningCount && `${warningCount} ${warningCount === 1 ? "warning" : "warnings"}`,
  ].filter(Boolean);
  return `${parts.join(" and ")}. Gains like these are how people end up with AMS, HAPE or HACE.`;
}
