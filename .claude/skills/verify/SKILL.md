---
name: verify
description: Run Summit Planner's pre-commit checks (tests, lint, typecheck, production build) and the manual checks they don't cover. Use before committing, before opening a PR, or when asked whether a change is ready.
---

# Verify a change

Run these in order and stop at the first failure:

```bash
npm test             # Vitest: the engine, plus auto-fixing every template
npm run lint         # ESLint flat config (there is no `next lint` in Next 16)
npx next typegen     # writes PageProps/LayoutProps route types; tsc fails without them in a new checkout
npx tsc --noEmit     # strict TypeScript; there's no npm script for it
npm run build        # needs .env.local; catches server/client boundary errors that tsc misses
```

`npm run build` can run while `next dev` is up, because Next 16 writes them to separate directories.

## What these don't cover

The only automated tests are for `lib/acclimatization.ts`. Nothing tests pages, server actions, RLS or the UI. If you touched any of those, run the app and exercise the change, including an error path (`run-app` skill).

## Extra checks by kind of change

- **Engine or templates:** the README's rules table, examples and test count still hold, and so do the landing hero's `RAW` and `FIXED` arrays (`acclimatization-engine` skill).
- **Schema:** there's a new numbered migration, `lib/types.ts` and the select lists are updated, and the README's setup step lists the file (`supabase-migration` skill).
- **New signed-in route:** its prefix is in `PROTECTED_PREFIXES`.
- **Copy or behavior described in the README:** the README still matches.
- **`git status`:** `.env.local`, `next-env.d.ts` and `*.tsbuildinfo` are untracked or ignored. An `AGENTS.md` change made by `next dev` should be committed.

When you report back, list which checks ran and their results. Name anything you skipped and why.
