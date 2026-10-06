import { unstable_rethrow } from "next/navigation";

// What every mutating server action returns, so the client can show a toast.
// Actions return errors instead of throwing because Next masks thrown messages in production.
export type ActionResult =
  | { ok: true; message?: string; description?: string; redirectTo?: string }
  | { ok: false; message: string };

export async function attempt(
  fn: () => Promise<Omit<Extract<ActionResult, { ok: true }>, "ok"> | void>,
): Promise<ActionResult> {
  try {
    return { ok: true, ...(await fn()) };
  } catch (error) {
    // Let Next's own control flow (e.g. requireUser's redirect to /login) through.
    unstable_rethrow(error);
    return { ok: false, message: error instanceof Error ? error.message : "Something went wrong." };
  }
}
