---
name: acclimatization-engine
description: Change how Summit Planner judges or repairs an itinerary, meaning the rules, flags, risk levels or auto-fix in lib/acclimatization.ts. Use when adjusting a threshold, adding a flag type, changing auto-fix behavior, or explaining why a night was or wasn't flagged.
---

# Acclimatization engine

`lib/acclimatization.ts` is the core of the product. It is pure TypeScript with no I/O, and `lib/acclimatization.test.ts` pins its behavior. Work test-first.

The rules are simplified from Wilderness Medical Society guidance, and the UI calls the result "a planning aid, not medical advice". Loosening a limit is a safety call: confirm it with the user and record the source in a comment next to `RULES`.

## How it works

- The input is an ordered list of nights, `{ camp_name, sleep_altitude_m }`. Only where you sleep matters.
- **New altitude** is how far a night sits above both 3,000m (`RULES.thresholdM`) and the highest night slept so far. Every rule uses it, so climb-high, sleep-low rotations (BC → C1 → BC → C1) aren't penalized. Don't switch a rule to the raw daily gain.
- Flags per night:
  - `very-fast-gain` (high): more than 1,000m of new altitude.
  - `fast-gain` (warning): more than 500m.
  - `rest-overdue` (warning): more than 1,000m of new altitude since the last rest night, meaning a night no higher than the one before.
- No double flags. A night whose new altitude alone is over `restEveryM` doesn't also get `rest-overdue`, because a rest day wouldn't fix it.
- Risk is high if any flag is high, moderate if there are only warnings, and low otherwise.
- `autoFix` repeatedly fixes the earliest flagged night. A gain flag inserts `ceil(newAltitude / 500) - 1` equal intermediate nights named `En route to <camp>`. A `rest-overdue` flag inserts `<previous camp> (rest)` at the previous altitude. It stops when the plan is clean or reaches `maxDays` (40).

## Invariants other code relies on

- `autoFix` returns the original day objects by reference and in their original order. Inserted nights are plain `{ camp_name, sleep_altitude_m }` objects with no `id`. `autoFixItinerary` in `app/(app)/expeditions/[id]/actions.ts` upserts existing rows and inserts new ones by testing `"id" in d`, so never copy original days or give inserted ones an `id`.
- `analyze(days).days[i]` describes `days[i]`. The editor rows and the chart index into it.
- `Severity` and `Risk` drive styling in `app/components/risk.tsx` and the dot colors in `elevation-chart.tsx`. A new severity or risk level needs styles in both.
- Every template in `lib/templates.ts` must auto-fix clean within 40 days. A `test.each` enforces this.

## Steps

1. Add or change a test in `lib/acclimatization.test.ts` with the `plan(...)` helper. Run `npm test` and watch it fail.
2. Change `RULES` or the logic. Keep it pure and synchronous.
3. Run `npm test`, then `npx next typegen && npx tsc --noEmit`.
4. Update everything that restates the rules by hand:
   - The "How Summit Planner checks your plan" explainer in `app/(app)/expeditions/[id]/page.tsx`. It reads numbers from `RULES`, but the sentences are hand-written.
   - The hero chart in `app/page.tsx`. `RAW` and `FIXED` are the Huayna Potosí template before and after `autoFix`. If auto-fix output changes, recompute `FIXED` with the command below and check the chart's `y()` scale still fits.
   - `README.md`: the rules table, the design-decision bullets (including the 3,640 → 3,993 → 4,347 → 4,700 example), and the test count in "covered by 16 Vitest tests".
5. Run the app (`run-app` skill) and open each demo expedition. Check the risk banner, row flags, chart colors, and the Auto-fix button and its toast.

Recompute the hero's `FIXED` array (Node 22.18+ runs `.ts` directly):

```bash
node -e 'import("./lib/acclimatization.ts").then(async ({ autoFix }) => { const { getTemplate } = await import("./lib/templates.ts"); console.log(autoFix(getTemplate("huayna-potosi").days).days.map((d) => d.sleep_altitude_m).join(", ")) })'
```
