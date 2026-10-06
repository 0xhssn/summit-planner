---
name: run-app
description: Start Summit Planner locally, sign in, and click through a change in the browser. Use to see a UI or server-action change working, reproduce a bug, take screenshots, or reset the demo account's data.
---

# Run the app

## Start it

1. **Check for `.env.local`.** It needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`). A new worktree doesn't have it, so copy it from the main checkout with `cp ../summit-planner/.env.local .`. Don't print its contents.
2. **Pick a free port.** Another worktree's dev server often holds 3000. Check with `lsof -nP -iTCP:3000 -sTCP:LISTEN`, and if it's taken, run `npm run dev -- --port 3001`.
3. Run the dev server in the background and wait for "Ready" in its output.
4. `next dev` may rewrite the managed block in `AGENTS.md`. That's expected; commit the change if one appears.

## Sign in

- For read-only checks, open `/login?demo=1`, which pre-fills the demo account from `lib/demo.ts`. It holds three expeditions: Huayna Potosí (planning, high risk), K2 Base Camp + Gondogoro La (planning), and Khosar Gang (turned back, with a note).
- For anything that writes data, sign up with a throwaway email instead. Email confirmation is off. The demo account is shared with everyone who tries the live site.
- If the demo login fails, that Supabase project hasn't been seeded. Sign up instead, or reseed after asking (see below).

## What to check

| Route | Look for |
|---|---|
| `/` | Hero chart; the call to action changes when signed in |
| `/dashboard` | Cards with a status and risk badge, the create form, cloning a template |
| `/expeditions/<id>` | Risk banner and Auto-fix, flagged chart dots, inline edit, move and delete of rows, Add day, outcome form, delete expedition |
| `/expeditions/<random uuid>` | The not-found page |
| `/dashboard` signed out | Redirect to `/login?next=/dashboard` |

Every action should show a toast, including failures (try an altitude of 9,001). Check a phone-width viewport (about 375px) too, because day rows reflow below the `sm` breakpoint.

## Reset the demo account

`npm run seed:demo` signs in with `DEMO_EMAIL` and `DEMO_PASSWORD` from `.env.local` (creating the account if needed), **deletes every expedition on that account**, and re-seeds from `lib/templates.ts`. If `.env.local` points at the project behind the live site, this changes what visitors see. Always ask the user before running it.
