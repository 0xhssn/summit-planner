import Link from "next/link";
import { Logo } from "@/app/components/logo";
import { getCurrentUser } from "@/lib/supabase/server";

// Huayna Potosí, before and after auto-fix, plotted on a shared day axis (see lib/acclimatization.ts).
const RAW = [3640, 3640, 3640, 4700, 4700, 5130, 3640];
const FIXED = [3640, 3640, 3640, 3993, 4347, 4347, 4700, 4700, 5130, 3640];
const x = (day: number) => 40 + day * 60;
const y = (altitude: number) => 200 - ((altitude - 3400) / (5300 - 3400)) * 180;
const points = (altitudes: number[]) => altitudes.map((a, i) => `${x(i)},${y(a)}`).join(" ");

// Deterministic "random" stars so server and client render the same sky.
const STARS = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 53.3) % 60,
  size: i % 7 === 0 ? 2 : 1,
  opacity: 0.25 + (i % 5) * 0.15,
}));

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="relative isolate flex min-h-svh flex-col overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,#1e3a5f_0%,#0b1220_55%,#020617_100%)]" />
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity }}
          />
        ))}
        <svg
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-[34svh] w-full"
        >
          <path
            d="M0 210 120 150l90 40 140-110 110 70 70-40 160 120 120-90 150 80 110-60 130 90 140-100 100 60V320H0Z"
            fill="#13233a"
          />
          <path
            d="M0 250 160 190l120 50 150-90 90 60 130-70 170 110 110-60 160 80 140-90 110 70 100-40V320H0Z"
            fill="#0c1729"
          />
          <path d="M0 290 220 240l180 40 200-60 160 50 210-40 190 50 170-30 110 20V320H0Z" fill="#020617" />
        </svg>
      </div>

      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Logo className="text-white" />
        {user ? (
          <Link href="/dashboard" className="text-sm font-medium text-slate-200 transition-colors hover:text-white">
            Your expeditions →
          </Link>
        ) : (
          <Link href="/login" className="text-sm font-medium text-slate-200 transition-colors hover:text-white">
            Log in
          </Link>
        )}
      </nav>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-12 px-4 pb-24 pt-6 md:grid-cols-[1.1fr_1fr] md:pb-32">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-sky-300/80">
            02:00 · alpine start · Camp 2, 5,300m
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Climb high.
            <br />
            Sleep low.
            <br />
            <span className="text-sky-300">Come home.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-slate-300">
            Summit Planner reads your itinerary night by night, flags the days that climb too fast, and re-plans
            them with rest days and acclimatization camps, before the mountain does it for you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-md bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300"
              >
                Open your expeditions
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md bg-sky-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-sky-300"
                >
                  Plan your expedition
                </Link>
                <Link
                  href="/login?demo=1"
                  className="rounded-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Try the demo
                </Link>
              </>
            )}
          </div>
          <p className="mt-8 text-sm text-slate-400">
            Built after losing a summit window on Khosar Gang, 6,040m. Routes from the Karakoram and the Andes.
          </p>
        </div>

        <figure className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-sm">
          <figcaption className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-white">Huayna Potosí, 6,088m</span>
            <span className="text-xs text-slate-400">as it&apos;s often sold vs. auto-fixed</span>
          </figcaption>
          <svg viewBox="0 0 620 220" className="mt-3 w-full" role="img" aria-label="Elevation profile before and after auto-fix">
            {[3500, 4000, 4500, 5000].map((a) => (
              <g key={a}>
                <line x1={30} x2={600} y1={y(a)} y2={y(a)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <text x={0} y={y(a) + 4} fontSize={11} fill="#64748b">
                  {a / 1000}k
                </text>
              </g>
            ))}
            <polyline points={points(FIXED)} fill="none" stroke="#34d399" strokeWidth={2.5} />
            <polyline points={points(RAW)} fill="none" stroke="#f87171" strokeWidth={2} strokeDasharray="6 4" />
            <circle cx={x(3)} cy={y(4700)} r={6} fill="#f87171" stroke="#020617" strokeWidth={2} />
            <text x={x(3) - 10} y={y(4700) - 12} fontSize={12} fill="#fca5a5" textAnchor="end">
              +1,060m in one night
            </text>
            {FIXED.map((a, i) => (
              <circle key={i} cx={x(i)} cy={y(a)} r={3} fill="#34d399" />
            ))}
          </svg>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-red-400" /> City to base camp in a day: high risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 bg-emerald-400" /> 2 camps + 1 rest day: low risk
            </span>
          </div>
        </figure>
      </section>

      <footer className="absolute inset-x-0 bottom-0 px-4 py-4 text-center text-xs text-slate-500">
        Rules simplified from Wilderness Medical Society guidance. A planning aid, not medical advice.
      </footer>
    </main>
  );
}
