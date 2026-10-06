import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-5xl">🏔️</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Summit Planner</h1>
      <p className="mt-3 max-w-md text-slate-600">
        Plan a high-altitude trek day by day and instantly see whether your acclimatization is safe.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
      >
        Start planning
      </Link>
    </main>
  );
}
