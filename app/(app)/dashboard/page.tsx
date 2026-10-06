import { requireUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { supabase } = await requireUser();
  const { data: expeditions, error } = await supabase
    .from("expeditions")
    .select("id, name, peak, status")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Your expeditions</h1>
      {error && <p className="mt-4 text-sm text-red-600">Couldn&apos;t load expeditions: {error.message}</p>}
      {expeditions && expeditions.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">No expeditions yet.</p>
      )}
      <ul className="mt-4 space-y-2">
        {expeditions?.map((e) => (
          <li key={e.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
            {e.name} <span className="text-slate-500">· {e.peak}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
