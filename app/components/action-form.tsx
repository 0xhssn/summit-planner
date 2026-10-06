"use client";

import type { ActionResult } from "@/lib/action-result";
import { useActionToast } from "./use-action-toast";

type Props = Omit<React.FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: (formData: FormData) => Promise<ActionResult>;
};

// A <form> for server components: runs a server action and toasts its result.
export function ActionForm({ action, ...props }: Props) {
  const run = useActionToast();
  return <form {...props} action={async (formData) => void (await run(action(formData)))} />;
}
