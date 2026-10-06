import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ActionForm } from "@/app/components/action-form";
import { ArrowLeftIcon, ChevronRightIcon, PlusIcon } from "@/app/components/icons";
import { PageTransition } from "@/app/components/page-transition";
import { PendingButton } from "@/app/components/pending-button";
import { RISK_STYLES } from "@/app/components/risk";
import { BUTTON, INPUT } from "@/app/components/ui";
import { analyze, RULES } from "@/lib/acclimatization";
import { meters } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import type { Day, Expedition } from "@/lib/types";
import { addDay } from "./actions";
import { AutoFix } from "./auto-fix";
import { DayRow } from "./day-row";
import { DeleteExpedition } from "./delete-expedition";
import { ElevationChart } from "./elevation-chart";
import { OutcomeBanner, OutcomeForm } from "./outcome";

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
    <PageTransition>
      <div className="space-y-8">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 rounded-md text-sm text-fg-muted transition-colors hover:text-fg"
          >
            <ArrowLeftIcon className="size-4" />
            All expeditions
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-fg">{expedition.name}</h1>
          <p className="mt-1 text-sm text-fg-muted">
            {[
              expedition.peak !== expedition.name && expedition.peak,
              expedition.summit_altitude_m && `summit ${meters(expedition.summit_altitude_m)}`,
              `${itinerary.length} ${itinerary.length === 1 ? "night" : "nights"}`,
              highest !== null && `highest camp ${meters(highest)}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <OutcomeBanner expedition={expedition} />

        {itinerary.length > 1 && (
          <section className={`rounded-lg border p-4 transition-colors duration-300 ${riskStyle.banner}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{riskStyle.label}</h2>
                <p className="mt-0.5 text-sm">{riskSummary(analysis.highCount, analysis.warningCount)}</p>
              </div>
              <AutoFix expeditionId={expedition.id} canFix={analysis.risk !== "low"} />
            </div>
            <details className="group mt-3 text-sm">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md opacity-80 transition-opacity hover:opacity-100 [&::-webkit-details-marker]:hidden">
                <ChevronRightIcon className="size-4 transition-transform duration-200 group-open:rotate-90" />
                How Summit Planner checks your plan
              </summary>
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

        <section className="rounded-lg border border-line bg-surface p-4 shadow-xs">
          <h2 className="text-sm font-medium text-fg-secondary">Elevation profile</h2>
          {itinerary.length > 0 ? (
            <ElevationChart
              days={itinerary}
              severities={analysis.days.map((d) =>
                d.flags.some((f) => f.severity === "high") ? "high" : d.flags.length ? "warning" : null,
              )}
              summitAltitude={expedition.summit_altitude_m}
            />
          ) : (
            <p className="py-12 text-center text-sm text-fg-subtle">Add your first night below to see the profile.</p>
          )}
        </section>

        <section className="overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
          {/* Same columns as DayRow. */}
          <div className="hidden grid-cols-[2.5rem_1fr_7rem_5rem_9rem] gap-2 border-b border-line bg-surface-subtle px-3 py-2 text-xs font-medium uppercase tracking-wide text-fg-subtle sm:grid">
            <span>Day</span>
            <span className="px-2">Camp</span>
            <span className="text-right">Sleep alt.</span>
            <span className="text-right">Gain</span>
            <span />
          </div>
          <ol className="divide-y divide-line">
            {itinerary.map((day, i) => (
              // Animates rows moving, appearing and disappearing when the itinerary changes.
              <ViewTransition key={day.id} default="day-row">
                <DayRow
                  expeditionId={expedition.id}
                  day={day}
                  index={i}
                  isLast={i === itinerary.length - 1}
                  gain={analysis.days[i].gain}
                  flags={analysis.days[i].flags}
                />
              </ViewTransition>
            ))}
          </ol>
          <ActionForm
            action={addDay.bind(null, expedition.id)}
            className="grid grid-cols-[1fr_7rem] items-end gap-2 border-t border-line bg-surface-subtle p-3 sm:grid-cols-[1fr_8rem_auto]"
          >
            <label className="text-xs font-medium text-fg-muted">
              Next camp
              <input name="camp_name" required placeholder="e.g. Concordia" className={`mt-1 ${INPUT}`} />
            </label>
            <label className="text-xs font-medium text-fg-muted">
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
                className={`mt-1 tabular-nums ${INPUT}`}
              />
            </label>
            <PendingButton className={`col-span-2 sm:col-span-1 ${BUTTON.primary}`}>
              <PlusIcon className="size-4" />
              Add day
            </PendingButton>
          </ActionForm>
        </section>

        <OutcomeForm expedition={expedition} />

        <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-lg border border-line bg-surface p-4 shadow-xs">
          <div>
            <h2 className="text-sm font-medium text-fg">Delete expedition</h2>
            <p className="mt-0.5 text-sm text-fg-muted">
              Removes {expedition.name}, its itinerary and its outcome for good.
            </p>
          </div>
          <DeleteExpedition expeditionId={expedition.id} name={expedition.name} dayCount={itinerary.length} />
        </section>
      </div>
    </PageTransition>
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
