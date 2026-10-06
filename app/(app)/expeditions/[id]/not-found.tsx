import Link from "next/link";

export default function ExpeditionNotFound() {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <h1 className="font-semibold text-slate-900">Expedition not found</h1>
      <p className="mt-1 text-sm text-slate-500">It may have been deleted, or it belongs to someone else.</p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-slate-700 underline">
        Back to your expeditions
      </Link>
    </div>
  );
}
