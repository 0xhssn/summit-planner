"use server";

import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates";
import { parseAltitude } from "@/lib/validation";

export async function createExpedition(formData: FormData) {
  const { supabase } = await requireUser();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Give your expedition a name.");
  const peak = String(formData.get("peak") ?? "").trim() || null;
  const summitRaw = String(formData.get("summit_altitude_m") ?? "").trim();
  const summit_altitude_m = summitRaw ? parseAltitude(summitRaw) : null;

  const { data, error } = await supabase
    .from("expeditions")
    .insert({ name, peak, summit_altitude_m })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  redirect(`/expeditions/${data.id}`);
}

export async function cloneTemplate(slug: string) {
  const { supabase } = await requireUser();
  const template = getTemplate(slug);
  if (!template) throw new Error("Unknown template.");

  const { data: expedition, error } = await supabase
    .from("expeditions")
    .insert({
      name: template.name,
      peak: template.peak,
      summit_altitude_m: template.summit_altitude_m,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const { error: daysError } = await supabase.from("days").insert(
    template.days.map((d, i) => ({ ...d, expedition_id: expedition.id, day_index: i })),
  );
  if (daysError) {
    // No transactions over PostgREST, so clean up the half-created expedition.
    await supabase.from("expeditions").delete().eq("id", expedition.id);
    throw new Error(daysError.message);
  }

  redirect(`/expeditions/${expedition.id}`);
}

export async function deleteExpedition(id: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("expeditions").delete().eq("id", id);
  if (error) throw new Error(error.message);
  refresh();
  redirect("/dashboard");
}
