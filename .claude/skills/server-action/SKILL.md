---
name: server-action
description: Add or change a mutation in Summit Planner, meaning a server action in app/**/actions.ts plus the client wiring that turns its result into a toast. Use for any create, update or delete on expeditions or days, or any new button or form that writes data.
---

# Server actions

Every write in this app is a server action that returns an `ActionResult` and shows up as a sonner toast. Copy the existing shape. The reference implementations are `app/(app)/expeditions/[id]/actions.ts` and `app/(app)/dashboard/actions.ts`.

## 1. Write the action

Put it in the `actions.ts` beside the page that uses it. The file starts with `"use server"`.

```ts
export async function renameExpedition(expeditionId: string, formData: FormData) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const name = String(formData.get("name") ?? "").trim();
    if (!name) throw new Error("Give your expedition a name.");

    const { error } = await supabase.from("expeditions").update({ name }).eq("id", expeditionId);
    if (error) throw new Error(error.message);
    refresh();
    return { message: `Renamed to ${name}` };
  });
}
```

Rules:

- **Wrap the whole body in `attempt()`** from `lib/action-result.ts`. Inside it, `throw new Error("…")` with a sentence the user can act on, and it becomes the error toast. An error that escapes `attempt` reaches the client as a generic message in production.
- **Call `requireUser()` first, every time**, even if the page already did, and use the `supabase` client it returns. RLS limits that client to the user's rows. Don't pass `user_id` on insert, because the column defaults to `auth.uid()`. Never use a service-role key.
- **Bound arguments come first** (`expeditionId`, `dayId`) and `formData` comes last. Bound arguments are client-controlled. RLS covers ownership, but still scope child rows to their parent, as `updateDay` does with `.eq("expedition_id", expeditionId)`.
- **Parse input with `lib/validation.ts`** (`parseAltitude`, `parseCampName`), or add a parser there. Keep its limits equal to the DB check constraints (altitude 0 to 9,000m). Clamp free text, as `setOutcome` does with `.slice(0, 500)`.
- **Validate enums against a `Record`** with `Object.hasOwn`, as `setOutcome` does with `OUTCOME_MESSAGES`.
- **Detect "nothing matched"** when it matters by adding `.select("…").maybeSingle()` and throwing if `data` is null. RLS turns "not yours" into zero rows, not into an error.
- **Call `refresh()` from `next/cache`** after a successful write. Don't use `revalidatePath` for data changes; only the auth actions use it.
- **Return** `{ message, description? }` for a success toast, add `redirectTo` to navigate after the toast, or return nothing for a silent action. `moveDay` is silent because the reorder is its own feedback.
- **Plan for partial failure.** PostgREST has no transactions. Order the steps so a failure leaves valid data, or clean up as `cloneTemplate` does. For real atomicity, write a Postgres function and call it with `supabase.rpc` (`supabase-migration` skill).
- `redirect()` and `notFound()` still work inside `attempt`, which calls `unstable_rethrow`.

## 2. Wire it to the UI

| Where the trigger lives | Use |
|---|---|
| A `<form>` in a server component | `<ActionForm action={myAction.bind(null, id)}>` with a `<PendingButton>` inside |
| A form in a client component | `const run = useActionToast()`, then `<form action={async (fd) => void (await run(myAction(id, fd)))}>` |
| A second button in the same form | `<PendingButton formAction={() => run(myAction(id)).then(() => {})} formNoValidate>`, as in `day-row.tsx` |
| A button with no form | `useTransition` and `run(...)`, as in `auto-fix.tsx` |

`PendingButton` reads `useFormStatus`, so it only works inside the form it submits. `run()` resolves to `true` on success, which is useful for resetting local state.

## 3. Check

- `npx next typegen && npx tsc --noEmit` and `npm run lint`.
- Run the app (`run-app` skill). Trigger the success path and at least one error path, such as an altitude of 9,001 or a blank camp name, and confirm both toasts.
