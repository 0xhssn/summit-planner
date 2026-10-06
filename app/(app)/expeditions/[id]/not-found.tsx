import Link from "next/link";
import { ArrowLeftIcon } from "@/app/components/icons";

export default function ExpeditionNotFound() {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <h1 className="font-semibold text-fg">Expedition not found</h1>
      <p className="mt-1 text-sm text-fg-muted">It may have been deleted, or it belongs to someone else.</p>
      <Link
        href="/dashboard"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-fg"
      >
        <ArrowLeftIcon className="size-4" />
        Back to your expeditions
      </Link>
    </div>
  );
}
