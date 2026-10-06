"use server";

import { refresh } from "next/cache";
import { attempt } from "@/lib/action-result";
import { requireUser } from "@/lib/supabase/server";
import { getTemplate } from "@/lib/templates";
import { parseAltitude } from "@/lib/validation";

export async function createExpedition(formData: FormData) {
  return attempt(async () => {
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

    return {
      message: `Created ${name}`,
      description: "Add your first night to start the plan.",
      redirectTo: `/expeditions/${data.id}`,
    };
  });
}

export async function cloneTemplate(slug: string) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const template = getTemplate(slug);
    if (!template) throw new Error("That route template doesn't exist.");

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

    return {
      message: `${template.name} added to your expeditions`,
      description: `${template.days.length} days from ${template.region}. Check the risk banner.`,
      redirectTo: `/expeditions/${expedition.id}`,
    };
  });
}

export async function deleteExpedition(id: string) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("expeditions")
      .delete()
      .eq("id", id)
      .select("name")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("That expedition no longer exists.");
    refresh();
    return { message: `Deleted ${data.name}`, redirectTo: "/dashboard" };
  });
}
