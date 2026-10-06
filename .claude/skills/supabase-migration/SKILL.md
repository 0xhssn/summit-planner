---
name: supabase-migration
description: Change the Supabase schema, meaning new tables or columns, constraints, RLS policies, or Postgres functions called over RPC. Use when a feature needs data the expeditions and days tables can't hold, or to make a multi-step write such as cloning or auto-fix atomic.
---

# Supabase migrations

The schema lives in `supabase/migrations/` and is applied **by hand** in the Supabase SQL editor. There is no Supabase CLI, no local database and no generated types. `0001_init.sql` holds both tables, their RLS policies and the grants.

## Write the migration

- **Never edit a migration that has been applied.** Add `supabase/migrations/000N_<what>.sql` with the next number and a snake_case name.
- Write plain SQL the user can paste and run once. Use `if not exists` or `or replace` where it's cheap.
- **Every new table** gets `enable row level security`, policies `to authenticated`, and an explicit `grant select, insert, update, delete … to authenticated`, because the project may not expose new tables to the Data API by default.
- **Copy the policy style from `0001_init.sql`:**
  - Write `(select auth.uid())`, not a bare `auth.uid()`, so Postgres evaluates it once per query.
  - User-owned tables get `user_id uuid not null default auth.uid() references auth.users (id) on delete cascade`, so the app never passes `user_id`.
  - Child tables are authorized through their parent with `exists (…)` in both `using` and `with check`, as `days` is.
- Index what RLS and queries filter and sort on: `user_id`, foreign keys plus their sort column.
- **Mirror app validation in check constraints.** Altitudes are `between 0 and 9000` in SQL and `MAX_ALTITUDE_M` in `lib/validation.ts`. Change both together.
- **For atomic multi-step writes**, which the README names as the fix for cloning and auto-fix, write a Postgres function. Leave it `security invoker` (the default) so RLS still applies, `grant execute` to `authenticated`, and call it with `supabase.rpc(...)`. Don't use `security definer` unless the user explicitly agrees.

## Update the app

1. `lib/types.ts`: the hand-written row types.
2. The explicit `select("…")` column lists that need the new field: `app/(app)/expeditions/[id]/page.tsx`, `app/(app)/dashboard/page.tsx`, and `loadDays` in `app/(app)/expeditions/[id]/actions.ts`.
3. Writes and validation (`server-action` skill), plus `cloneTemplate` and `scripts/seed-demo.mts` if they insert into the table.
4. `README.md`: step 1 of "Supabase setup" names the migration files to run. Add the new one.

When typing new queries, note that `.returns<T>()` (still used in the expedition page) is deprecated in the installed postgrest-js in favor of `.overrideTypes<T>()`.

## Apply it

You can't apply it yourself. Give the user the SQL to run in the SQL editor and say so in the PR description. Ask whether `.env.local` points at the project behind the live site. If it does, order matters: additive changes (a new table, a nullable column) go in before the code that uses them, and destructive ones (drop, rename, a tighter constraint) go in after the code stops depending on the old shape.
