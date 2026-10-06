import Link from "next/link";
import { meters } from "@/lib/format";
import { TEMPLATES } from "@/lib/templates";

// Huayna Potosí, before and after auto-fix, plotted on a shared day axis (see lib/acclimatization.ts).
const RAW = [3640, 3640, 3640, 4700, 4700, 5130, 3640];
const FIXED = [3640, 3640, 3640, 3993, 4347, 4347, 4700, 4700, 5130, 3640];
const x = (day: number) => 40 + day * 60;
const y = (altitude: number) => 200 - ((altitude - 3400) / (5300 - 3400)) * 180;
const points = (altitudes: number[]) => altitudes.map((a, i) => `${x(i)},${y(a)}`).join(" ");

const FEATURES = [
  {
    title: "Plan it night by night",
    body: "Each day is a camp and a sleeping altitude. Add, edit and reorder days, or start from a real Karakoram or Andes route.",
  },
  {
    title: "See every risky night",
    body: "Every night is checked against acclimatization guidelines: too much new altitude, missing rest days, high-risk jumps.",
  },
  {
    title: "Auto-fix the plan",
    body: "One click splits big jumps with intermediate camps and adds rest days where they're overdue. Then log how it went.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <span className="font-semibold text-slate-900">🏔️ Summit Planner</span>
        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Log in
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-sky-700">
            For trekkers & climbers heading above 5,000m
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Plan the climb.
            <br />
            Respect the altitude.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Summit Planner checks your high-altitude itinerary night by night, flags the days that will hurt, and
            re-plans it with rest days and intermediate camps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
            >
              Start planning
            </Link>
            <a
              href="#routes"
              className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-white"
            >
              See the routes
            </a>
          </div>
        </div>

        <figure className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <figcaption className="text-sm font-medium text-slate-700">
            Huayna Potosí (6,088m), as it&apos;s often sold vs. after auto-fix
          </figcaption>
          <svg viewBox="0 0 620 220" className="mt-2 w-full" role="img" aria-label="Elevation profile before and after auto-fix">
            {[3500, 4000, 4500, 5000].map((a) => (
              <g key={a}>
                <line x1={30} x2={600} y1={y(a)} y2={y(a)} stroke="#e2e8f0" strokeDasharray="3 3" />
                <text x={0} y={y(a) + 4} fontSize={11} fill="#94a3b8">
                  {a / 1000}k
                </text>
              </g>
            ))}
            <polyline points={points(FIXED)} fill="none" stroke="#059669" strokeWidth={2.5} />
            <polyline points={points(RAW)} fill="none" stroke="#dc2626" strokeWidth={2} strokeDasharray="6 4" />
            <circle cx={x(3)} cy={y(4700)} r={6} fill="#dc2626" stroke="#fff" strokeWidth={2} />
            <text x={x(3) - 8} y={y(4700) - 12} fontSize={12} fill="#b91c1c" textAnchor="end">
              +1,060m in one night
            </text>
            {FIXED.map((a, i) => (
              <circle key={i} cx={x(i)} cy={y(a)} r={3} fill="#059669" />
            ))}
          </svg>
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-red-600" /> La Paz straight to base camp: high risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-emerald-600" /> 2 stops + 1 rest day: low risk
            </span>
          </div>
        </figure>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title}>
              <h2 className="font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="routes" className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-lg font-semibold text-slate-900">Start from a real route</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.slug} className="rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t.region}</p>
              <h3 className="mt-1 font-medium text-slate-900">{t.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {meters(t.summit_altitude_m)} · {t.days.length} days
              </p>
            </li>
          ))}
        </ul>
      </section>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-xs text-slate-400">
        Built by a trekker who turned back on Khosar Gang. Rules are simplified from Wilderness Medical Society
        guidance; this is a planning aid, not medical advice.
      </footer>
    </main>
  );
}
