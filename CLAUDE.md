@AGENTS.md

# Summit Planner

Plan a high-altitude trek night by night and flag unsafe acclimatization. Next.js 16 (App Router, strict TS), Supabase (auth + Postgres with RLS), Tailwind 4, Recharts, sonner. `README.md` has the product story and setup; this file is for working on the code.

## Commands

| Command | Notes |
|---|---|
| `npm run dev` | :3000. Needs `.env.local`. Another worktree may hold 3000: `npm run dev -- --port 3001` |
| `npm test` | Vitest. Only `lib/acclimatization.test.ts` exists |
| `npm run lint` | ESLint flat config (`next lint` is gone in Next 16) |
| `npx next typegen && npx tsc --noEmit` | Typecheck. `typegen` writes the `PageProps`/`LayoutProps` route types; without it a fresh checkout fails |
| `npm run build` | Needs the Supabase env vars. Safe alongside `next dev` (separate output dirs) |
| `npm run seed:demo` | **Deletes and re-seeds the shared demo account.** Ask before running |

No e2e or component tests. Verify UI and server-action changes by running the app (`run-app` skill).

## Map

- `lib/acclimatization.ts`: the engine and the reason the app exists. Pure functions: `analyze()` flags nights, `autoFix()` re-plans. Everything else is CRUD around it.
- `lib/templates.ts`: seeded routes as a TS constant, not a table.
- `lib/action-result.ts`: `ActionResult` and `attempt()`, the contract every mutation follows.
- `lib/validation.ts`: form parsers. `MAX_ALTITUDE_M` mirrors the DB check constraint.
- `lib/supabase/server.ts`: `createClient()`, `requireUser()`, `getCurrentUser()`.
- `proxy.ts` and `lib/supabase/proxy.ts`: session refresh and the optimistic redirect for `PROTECTED_PREFIXES`.
- `app/(app)/`: the signed-in shell. `dashboard/` and `expeditions/[id]/` each keep an `actions.ts` beside the page.
- `app/components/`: `ActionForm`, `PendingButton`, `useActionToast`, risk styles.
- `supabase/migrations/`: schema and RLS, applied by hand in the Supabase SQL editor. No Supabase CLI, no generated DB types.

## Next.js 16 here

Your training data is probably Next 14/15. Read the bundled docs in `node_modules/next/dist/docs/01-app/` before using an API you're unsure of; `02-guides/upgrading/version-16.md` lists the breaks. The ones this code hits:

- `proxy.ts` replaces `middleware.ts`, and its export is named `proxy`.
- `params` and `searchParams` are Promises. Type pages with the global helpers `PageProps<"/expeditions/[id]">` and `LayoutProps<"/">` (no import needed).
- After a data mutation, call `refresh()` from `next/cache` inside the server action. Auth actions use `revalidatePath("/", "layout")` because the whole shell changes.
- Cache Components is off on purpose (`next.config.ts`): every page is per-user and reads cookies. Don't add `"use cache"`, `cacheLife` or `cacheTag`.
- `error.tsx` receives `retry()`, which re-fetches. The docs prefer it to `reset()`, which `app/(app)/error.tsx` still uses.

## Conventions

**Auth and data**
- Every page and server action calls `requireUser()` itself. The proxy redirect is a UX shortcut, not a security check, and layouts don't re-run on navigation.
- RLS is the authorization layer. Use the user-scoped client that `requireUser()` returns and never introduce a service-role key. Under RLS, another user's row looks like a missing row: handle it with `notFound()` or a friendly error.
- Select explicit columns and type results with `lib/types.ts`. Those types are hand-written; keep them in sync with migrations.
- `days.day_index` is the order. Reorders rewrite every index with one upsert (`saveOrder`).

**Mutations**
- Server actions return `ActionResult` from `attempt()` and never let an error escape, because Next masks thrown messages in production. Inside `attempt`, `throw new Error("a sentence the user can act on")`; it becomes the error toast.
- `redirect()` and `notFound()` still work inside `attempt` (it calls `unstable_rethrow`). To navigate after success, return `redirectTo` so the toast shows first.
- Client side: `ActionForm` for forms in server components, `useActionToast()` with `PendingButton` in client components.
- PostgREST has no transactions. Multi-step writes must leave valid data or clean up on failure (see `cloneTemplate`).

**Engine**
- `lib/acclimatization.ts` stays pure and synchronous, with no Supabase or React imports.
- Rule numbers live in `RULES`, but the editor's explainer, the README and the landing hero restate them by hand. Change them together (`acclimatization-engine` skill).

**UI**
- Tailwind utility classes inline, no component library. Slate neutrals; emerald, amber and red for low, warning/moderate and high. Reuse `RISK_STYLES` and `SEVERITY_STYLES` from `app/components/risk.tsx`.
- Meters everywhere. Format with `meters()` and `signedMeters()` from `lib/format.ts`.
- Check phone width: day rows reflow below `sm`.
- Every user action gets a toast. Copy is plain, second person, with a little mountaineering flavor.

## Workflow

- One sibling worktree per branch (`../summit-planner-<topic>`) and a PR into `main` (`worktree-pr` skill).
- Commit subjects: short, imperative, sentence case. README-only commits start with `README:`.
- Before committing, run the `verify` skill.
- `next dev` rewrites the managed block in `AGENTS.md`. If it changes, commit it with your work.

## Skills

In `.claude/skills/`:

- `server-action`: add or change a mutation and its toast wiring
- `acclimatization-engine`: change rules, flags, risk levels or auto-fix
- `route-template`: add or correct a seeded route
- `supabase-migration`: schema, RLS, or RPC functions for atomic writes
- `new-page`: add a page or route segment, signed-in or public
- `run-app`: start the app, sign in, click through a change, reset the demo account
- `verify`: tests, lint, typecheck and build before a commit or PR
- `worktree-pr`: start work in a worktree and finish it as a PR
