---
name: route-template
description: Add or correct a seeded route template in lib/templates.ts, the real itineraries users clone from the dashboard. Use when adding a new peak or trek, or fixing an existing template's camps, altitudes or description.
---

# Route templates

Templates are a TypeScript constant in `lib/templates.ts`, not a database table. The dashboard lists them, `cloneTemplate(slug)` copies one into the user's expeditions, and `scripts/seed-demo.mts` seeds the demo account from them.

## Add one

1. **Use a real itinerary.** The existing templates come from real Karakoram and Andes trips, one of them the author's own. Ask the user for the source (their trip, an operator itinerary, a guidebook) rather than inventing camps or altitudes. Each entry is where you sleep that night, not the day's high point.
2. **Add the entry** with the `day(camp, altitude)` helper:
   - `slug`: kebab-case and permanent, because `cloneTemplate` and the seed script look templates up by it. Cloned expeditions don't reference it.
   - `name`, plus `peak` for the objective. The UI hides `peak` when it equals `name`.
   - `summit_altitude_m`: drawn as the summit line on the chart.
   - `region`, and a one- or two-sentence `blurb` that says what makes acclimatization interesting on this route.
   - Altitudes are whole meters from 0 to 9,000.
   - Follow the naming in existing templates: `<Camp> (rest)` for rest nights, `<Camp> (summit day)` for the night after the summit.
3. **Don't pre-fix it.** An honest itinerary that climbs too fast is the point; Huayna Potosí is deliberately high risk. It must still be fixable: `npm test` runs `autoFix` on every template and requires a clean plan within 40 days.
4. Run `npm test`.
5. **Update `README.md`**: "clone one of three real routes (…)" under What works, and the route list under Who it's for if it fits.
6. **Check the dashboard layout.** Templates sit in a `md:grid-cols-3` grid, so a fourth card wraps onto its own row.
7. To put it on the demo account too, add it to `seeds` in `scripts/seed-demo.mts`. Seeds are inserted oldest first and the dashboard lists newest first. Running the reseed is a separate step that needs the user's go-ahead (`run-app` skill).
8. Run the app, clone the template from the dashboard, and check the risk banner, chart and summit line.

## Edit one

Edits only affect future clones, because existing expeditions are copies. Renaming a slug breaks the seed script. Some template data is repeated by hand elsewhere, so update it there too:

- `app/page.tsx` quotes the Khosar Gang and Huayna Potosí summit altitudes, and its hero chart plots the Huayna Potosí nights (`acclimatization-engine` skill has the command to recompute them).
- `README.md` names all three routes and uses Huayna Potosí's 3,640 → 4,700 jump as its auto-fix example.
