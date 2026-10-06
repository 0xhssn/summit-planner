---
name: new-page
description: Add a page or route segment to the Next.js 16 app, either a signed-in screen under app/(app)/ or a public one, including its loading, not-found and error states. Use when adding a new screen or a nested route.
---

# Add a page

First read the bundled docs for the file conventions you'll use, in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/` (`page.md`, `layout.md`, `loading.md`, `not-found.md`, `error.md`). Next 16 differs from older versions.

## Signed-in pages

1. **Put it under `app/(app)/`.** That group's `layout.tsx` renders the header, and its `loading.tsx` and `error.tsx` cover the new page.
2. **Call `requireUser()` in the page itself**, and fetch with the `supabase` client it returns. The layout's check doesn't protect the page, because layouts don't re-render on client navigation.
3. **Add the path prefix to `PROTECTED_PREFIXES` in `lib/supabase/proxy.ts`.** Without it, signed-out visitors fall through to `requireUser()`'s bare redirect and lose the `?next=` return path.
4. **Type props with the global helpers**, which need no import, and await them:

   ```tsx
   export default async function Page({ params }: PageProps<"/expeditions/[id]">) {
     const { id } = await params;
   ```

5. **Fetch explicit columns** and type them with `lib/types.ts`, for example `.maybeSingle<Expedition>()`. If the row is missing, call `notFound()`. Under RLS another user's row looks missing too, so that one check covers both cases. Add a `not-found.tsx` beside the page, like `expeditions/[id]/not-found.tsx`.
6. **Put mutations in an `actions.ts` beside the page** (`server-action` skill).
7. **Link to it** from somewhere real, such as a dashboard card or the header in `app/(app)/layout.tsx`.

## Public pages

Put them at the top level of `app/`. If the page changes when someone is signed in, as the landing page does, use `getCurrentUser()` rather than `requireUser()`.

## Don't

- Add `"use cache"`, `cacheLife`, `generateStaticParams`, or segment config meant for static rendering. Cache Components is off on purpose, because every page reads cookies.
- Create `middleware.ts`. Request-level logic goes in `proxy.ts` and `lib/supabase/proxy.ts`.
- Fetch data in client components. Server components fetch and pass props down. Mark a component `"use client"` only when it needs interactivity or Recharts.

## Check

- `npx next typegen && npx tsc --noEmit`. This also catches a `PageProps` route string that doesn't match a real route.
- `npm run lint`.
- Run the app (`run-app` skill). Open the page signed in, signed out (expect `/login?next=…`), with an id that doesn't exist, and at phone width.
