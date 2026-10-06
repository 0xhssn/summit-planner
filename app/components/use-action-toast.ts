"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";

// Wraps a server action so its result becomes a toast (and a navigation, if it asks for one).
export function useActionToast() {
  const router = useRouter();

  return async function run(pending: Promise<ActionResult>): Promise<boolean> {
    let result: ActionResult;
    try {
      result = await pending;
    } catch {
      toast.error("Couldn't reach the server. Check your connection and try again.");
      return false;
    }

    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    if (result.message) toast.success(result.message, { description: result.description });
    if (result.redirectTo) router.push(result.redirectTo);
    return true;
  };
}
