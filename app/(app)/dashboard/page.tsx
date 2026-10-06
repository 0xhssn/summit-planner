import Link from "next/link";
import { ActionForm } from "@/app/components/action-form";
import { PageTransition } from "@/app/components/page-transition";
import { PendingButton } from "@/app/components/pending-button";
import { RiskBadge } from "@/app/components/risk";
import { BUTTON, INPUT } from "@/app/components/ui";
import { analyze } from "@/lib/acclimatization";
import { meters } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { TEMPLATES } from "@/lib/templates";
import type { ExpeditionStatus } from "@/lib/types";
import { cloneTemplate, createExpedition } from "./actions";

const STATUS_STYLES: Record<ExpeditionStatus, { label: string; className: string }> = {
  planning: { label: "Planning", className: "bg-surface-subtle text-fg-secondary ring-line-strong" },
  summited: { label: "Summited", className: "bg-success-soft text-success-fg ring-success-line" },
  turned_back: { label: "Turned back", className: "bg-warning-soft text-warning-fg ring-warning-line" },
};

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const { data: expeditions, error } = await supabase
    .from("expeditions")
    .select("id, name, peak, summit_altitude_m, status, outcome_note, days(day_index, camp_name, sleep_altitude_m)")
    .order("created_at", { ascending: false });

  return (
    <PageTransition>
      <div className="space-y-12">
        <section>
          <h1 className="text-2xl font-semibold text-fg">Your expeditions</h1>
          {error && (
            <p className="mt-4 text-sm text-danger-fg">Couldn&apos;t load expeditions: {error.message}</p>
          )}
          {expeditions?.length === 0 && (
            <p className="mt-4 rounded-lg border border-dashed border-line-strong bg-surface px-4 py-8 text-center text-sm text-fg-muted">
              No expeditions yet. Start from a classic route below, or plan your own from scratch.
            </p>
          )}
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {expeditions?.map((e) => {
              const status = STATUS_STYLES[e.status as ExpeditionStatus];
              const days = [...e.days].sort((a, b) => a.day_index - b.day_index);
              const dayCount = days.length;
              const risk = dayCount > 1 ? analyze(days).risk : null;
              return (
                <li key={e.id}>
                  <Link
                    href={`/expeditions/${e.id}`}
                    className="block h-full rounded-lg border border-line bg-surface p-4 shadow-xs transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-medium text-fg">{e.name}</h2>
                      <div className="flex shrink-0 gap-1.5">
                        {e.status === "planning" && risk && <RiskBadge risk={risk} />}
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-fg-muted">
                      {[
                        e.peak !== e.name && e.peak,
                        e.summit_altitude_m && meters(e.summit_altitude_m),
                        `${dayCount} ${dayCount === 1 ? "day" : "days"}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {e.outcome_note && e.status !== "planning" && (
                      <p className="mt-2 line-clamp-2 text-sm italic text-fg-secondary">“{e.outcome_note}”</p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Start from a classic route</h2>
          <p className="mt-1 text-sm text-fg-muted">
            Real itineraries with real camp altitudes. Clone one, then tweak it day by day.
          </p>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {TEMPLATES.map((t) => (
              <li key={t.slug} className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-xs">
                <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">{t.region}</p>
                <h3 className="mt-1 font-medium text-fg">{t.name}</h3>
                <p className="mt-1 text-sm text-fg-muted">
                  {meters(t.summit_altitude_m)} · {t.days.length} days · highest camp{" "}
                  {meters(Math.max(...t.days.map((d) => d.sleep_altitude_m)))}
                </p>
                <p className="mt-2 flex-1 text-sm text-fg-secondary">{t.blurb}</p>
                <ActionForm action={cloneTemplate.bind(null, t.slug)} className="mt-4">
                  <PendingButton className={`w-full ${BUTTON.secondary}`}>
                    Use this route
                  </PendingButton>
                </ActionForm>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-fg">Plan from scratch</h2>
          <ActionForm
            action={createExpedition}
            className="mt-4 grid gap-3 rounded-lg border border-line bg-surface p-4 shadow-xs sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end"
          >
            <label className="block text-sm">
              <span className="font-medium text-fg-secondary">Expedition name</span>
              <input
                name="name"
                required
                placeholder="Spring in the Karakoram"
                className={`mt-1 ${INPUT}`}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-fg-secondary">Objective</span>
              <input
                name="peak"
                placeholder="Spantik"
                className={`mt-1 ${INPUT}`}
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-fg-secondary">Summit (m)</span>
              <input
                name="summit_altitude_m"
                type="number"
                min={0}
                max={9000}
                placeholder="7027"
                className={`mt-1 ${INPUT}`}
              />
            </label>
            <PendingButton className={BUTTON.primary}>
              Create
            </PendingButton>
          </ActionForm>
        </section>
      </div>
    </PageTransition>
  );
}
