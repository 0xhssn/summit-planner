import Link from "next/link";
import { ActionForm } from "@/app/components/action-form";
import { PendingButton } from "@/app/components/pending-button";
import { RISK_STYLES, RiskBadge } from "@/app/components/risk";
import { analyze, type Risk } from "@/lib/acclimatization";
import { meters } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { TEMPLATES } from "@/lib/templates";
import type { ExpeditionStatus } from "@/lib/types";
import { cloneTemplate, createExpedition } from "./actions";
import { DashboardTour } from "./dashboard-tour";

const STATUS_STYLES: Record<ExpeditionStatus, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-slate-100 text-slate-700" },
  summited: { label: "Summited", className: "bg-emerald-100 text-emerald-800" },
  turned_back: { label: "Turned back", className: "bg-amber-100 text-amber-800" },
};

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const { data: expeditions, error } = await supabase
    .from("expeditions")
    .select("id, name, peak, summit_altitude_m, status, outcome_note, days(day_index, camp_name, sleep_altitude_m)")
    .order("created_at", { ascending: false });

  const cards = (expeditions ?? []).map((e) => {
    const days = [...e.days].sort((a, b) => a.day_index - b.day_index);
    return { ...e, dayCount: days.length, risk: days.length > 1 ? analyze(days).risk : null };
  });

  // The tour continues into the riskiest plan, so the editor tour has flags to point at.
  const riskOrder: Risk[] = ["high", "moderate", "low"];
  const tourNext =
    riskOrder
      .map((r) => cards.find((c) => c.status === "planning" && c.risk === r))
      .find(Boolean) ?? cards[0];

  return (
    <div className="space-y-12">
      <DashboardTour
        next={
          tourNext
            ? {
                href: `/expeditions/${tourNext.id}`,
                name: tourNext.name,
                riskLabel: tourNext.risk ? RISK_STYLES[tourNext.risk].label : "unchecked",
              }
            : null
        }
      />
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Your expeditions</h1>
        {error && (
          <p className="mt-4 text-sm text-red-600">Couldn&apos;t load expeditions: {error.message}</p>
        )}
        {expeditions?.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No expeditions yet. Start from a classic route below, or plan your own from scratch.
          </p>
        )}
        <ul data-tour={cards.length ? "expeditions" : undefined} className="mt-4 grid gap-3 sm:grid-cols-2">
          {cards.map((e) => {
            const status = STATUS_STYLES[e.status as ExpeditionStatus];
            const { dayCount, risk } = e;
            return (
              <li key={e.id}>
                <Link
                  href={`/expeditions/${e.id}`}
                  data-tour-next={e.id === tourNext?.id ? "true" : undefined}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium text-slate-900">{e.name}</h2>
                    <div className="flex shrink-0 gap-1.5">
                      {e.status === "planning" && risk && <RiskBadge risk={risk} />}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {[
                      e.peak !== e.name && e.peak,
                      e.summit_altitude_m && meters(e.summit_altitude_m),
                      `${dayCount} ${dayCount === 1 ? "day" : "days"}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  {e.outcome_note && e.status !== "planning" && (
                    <p className="mt-2 line-clamp-2 text-sm italic text-slate-600">“{e.outcome_note}”</p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Start from a classic route</h2>
        <p className="mt-1 text-sm text-slate-500">
          Real itineraries with real camp altitudes. Clone one, then tweak it day by day.
        </p>
        <ul data-tour="templates" className="mt-4 grid gap-3 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.slug} className="flex flex-col rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.region}</p>
              <h3 className="mt-1 font-medium text-slate-900">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {meters(t.summit_altitude_m)} · {t.days.length} days · highest camp{" "}
                {meters(Math.max(...t.days.map((d) => d.sleep_altitude_m)))}
              </p>
              <p className="mt-2 flex-1 text-sm text-slate-600">{t.blurb}</p>
              <ActionForm action={cloneTemplate.bind(null, t.slug)} className="mt-4">
                <PendingButton className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                  Use this route
                </PendingButton>
              </ActionForm>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Plan from scratch</h2>
        <ActionForm
          data-tour="scratch"
          action={createExpedition}
          className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end"
        >
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Expedition name</span>
            <input
              name="name"
              required
              placeholder="Spring in the Karakoram"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Objective</span>
            <input
              name="peak"
              placeholder="Spantik"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Summit (m)</span>
            <input
              name="summit_altitude_m"
              type="number"
              min={0}
              max={9000}
              placeholder="7027"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <PendingButton className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Create
          </PendingButton>
        </ActionForm>
      </section>
    </div>
  );
}
