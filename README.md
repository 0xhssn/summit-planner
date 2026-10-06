# 🏔️ Summit Planner

Plan a high-altitude trek day by day and instantly see whether your acclimatization is safe.

**Live:** https://summit-planner.vercel.app
**Demo login:** `demo@summitplanner.dev` / `Summit-bc910de9` (or sign up with any email; no confirmation needed)

## Who it's for

Trekkers and climbers planning 5,000–6,000m objectives like K2 Base Camp, Gondogoro La, Khosar Gang or Huayna Potosí, who want a sanity check on their itinerary before they go. Most altitude trouble comes from a plan that climbs too fast, and that's visible on paper weeks before anyone gets a headache. The seeded routes come from real Karakoram and Andes itineraries, including a Khosar Gang trip I turned back on.

## What works

- **Auth:** email/password sign-up, login and logout with Supabase. Protected routes redirect to login, and row-level security means users only ever see their own data.
- **Dashboard:** your expeditions with status and a live risk badge. Create one from scratch or clone one of three real routes (K2 BC + Gondogoro La, Khosar Gang, Huayna Potosí).
- **Itinerary editor:** each day is a camp and a sleeping altitude. Edit inline, add, delete, and move days up or down. Each row shows the gain from the previous night.
- **Elevation profile:** a Recharts chart with a 3,000m line and a summit line. Flagged nights are colored amber or red, and the chart updates as you edit.
- **Acclimatization engine:** per-night flags and an overall risk (low, moderate or high), with an explainer of the rules.
- **Auto-fix:** one click re-plans the itinerary with intermediate camps and rest days, saves it, and reports what changed.
- **Outcome tracking:** mark an expedition summited or turned back, with a note.
- Landing page, empty states, not-found and loading states, and an error boundary.

## The core logic: `lib/acclimatization.ts`

Pure functions with no I/O, covered by 16 Vitest tests (`npm test`).

**Rules** (simplified from Wilderness Medical Society guidance):

| Rule | Flag |
|---|---|
| More than 500m of new altitude in one night | warning |
| More than 1,000m of new altitude in one night | high risk |
| More than 1,000m gained without a rest night (no higher than the night before) | warning |

The overall risk is high if any night is high risk, moderate if there are only warnings, and low if there are no flags.

**Design decisions worth discussing:**

- **"New altitude" instead of the raw daily gain.** Gains only count above 3,000m and above the highest night slept so far. Without this, standard climb-high, sleep-low rotations (BC → C1 → BC → C1) get flagged every time you go back up, which is wrong. The same measure drives both rules.
- **No double flags.** A single 1,060m night is flagged as high risk only, not also as "rest overdue", because a rest day wouldn't fix it.
- **Auto-fix uses intermediate nights, not just rest days.** Rest days can't fix a single big jump. For a too-fast night, `autoFix` splits the climb into the fewest equal steps of 500m or less (e.g. 3,640 → 3,993 → 4,347 → 4,700, rather than leaving a wasted +60m day). For an overdue rest, it inserts a rest night at the previous camp. It repeats from the earliest flag until the plan is clean or reaches 40 days. Original days keep their identity, so persisting the result is one upsert plus one insert.

## Architecture

- **Next.js 16 (App Router, TypeScript strict), Tailwind 4, Recharts.** Mutations are server actions. `proxy.ts` (Next 16's renamed middleware) refreshes the Supabase session and redirects anonymous users. Pages and actions re-check auth with `requireUser()`.
- **Supabase** handles auth and Postgres. The schema and RLS policies are in `supabase/migrations/0001_init.sql`. Days are authorized through their parent expedition.
- Cache Components is turned off on purpose: every page is per-user and reads cookies.
- Templates are a TypeScript constant (`lib/templates.ts`), not a table.

```
app/
  page.tsx                      landing
  login/                        auth page + server actions
  (app)/layout.tsx              authenticated shell
  (app)/dashboard/              list, create, clone template
  (app)/expeditions/[id]/       editor, chart, risk banner, auto-fix, outcome
lib/
  acclimatization.ts (+ .test)  the engine
  templates.ts                  seeded routes
  supabase/                     server client, proxy session refresh
supabase/migrations/            schema + RLS
scripts/seed-demo.mts           resets the demo account
```

## What's incomplete / next steps

- **Weather/summit-window ranking** (Open-Meteo) was the stretch goal and isn't started.
- **Error messages in production:** server actions throw, and Next masks thrown messages in production, so the error boundary shows a generic message. HTML validation catches most bad input first. Next step: return errors through `useActionState`.
- **Atomicity:** cloning and auto-fix use several PostgREST calls, not one transaction. Cloning cleans up if it fails partway. Next step: move these into Postgres functions called over RPC.
- **Khosar Gang template:** the camp names are approximate and need replacing with the real camps from my trip.
- No password reset, no optimistic UI (each edit is a server round trip), no end-to-end tests.

## Run locally

Requires Node 22+ and a Supabase project.

```bash
git clone https://github.com/0xhssn/summit-planner && cd summit-planner
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
npm test                     # engine tests
```

Supabase setup:

1. In the SQL editor, run `supabase/migrations/0001_init.sql`.
2. Go to Authentication → Sign In / Providers → Email and turn off **Confirm email**, so sign-ups log straight in.
3. Copy the project URL and publishable key from Project Settings → API Keys.

| Env var | Where |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (or the legacy anon key) |
| `DEMO_EMAIL`, `DEMO_PASSWORD` | Optional, only for `npm run seed:demo` |

`npm run seed:demo` signs in as the demo user (creating it if needed), wipes its expeditions and re-seeds the three routes.
