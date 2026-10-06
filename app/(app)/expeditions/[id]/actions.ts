"use server";

import { refresh } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireUser } from "@/lib/supabase/server";
import { parseAltitude, parseCampName } from "@/lib/validation";
import type { Day } from "@/lib/types";

async function loadDays(supabase: SupabaseClient, expeditionId: string): Promise<Day[]> {
  const { data, error } = await supabase
    .from("days")
    .select("id, day_index, camp_name, sleep_altitude_m")
    .eq("expedition_id", expeditionId)
    .order("day_index");
  if (error) throw new Error(error.message);
  return data;
}

// Persist a reordered list in one round trip: day_index becomes the array position.
async function saveOrder(supabase: SupabaseClient, expeditionId: string, days: Day[]) {
  const rows = days.map((d, i) => ({ ...d, day_index: i, expedition_id: expeditionId }));
  if (rows.length === 0) return;
  const { error } = await supabase.from("days").upsert(rows);
  if (error) throw new Error(error.message);
}

export async function addDay(expeditionId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const camp_name = parseCampName(formData.get("camp_name"));
  const sleep_altitude_m = parseAltitude(formData.get("sleep_altitude_m"));

  const days = await loadDays(supabase, expeditionId);
  const { error } = await supabase.from("days").insert({
    expedition_id: expeditionId,
    day_index: days.length,
    camp_name,
    sleep_altitude_m,
  });
  if (error) throw new Error(error.message);
  refresh();
}

export async function updateDay(expeditionId: string, dayId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const camp_name = parseCampName(formData.get("camp_name"));
  const sleep_altitude_m = parseAltitude(formData.get("sleep_altitude_m"));

  const { error } = await supabase
    .from("days")
    .update({ camp_name, sleep_altitude_m })
    .eq("id", dayId)
    .eq("expedition_id", expeditionId);
  if (error) throw new Error(error.message);
  refresh();
}

export async function deleteDay(expeditionId: string, dayId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("days")
    .delete()
    .eq("id", dayId)
    .eq("expedition_id", expeditionId);
  if (error) throw new Error(error.message);

  await saveOrder(supabase, expeditionId, await loadDays(supabase, expeditionId));
  refresh();
}

export async function moveDay(expeditionId: string, dayId: string, direction: "up" | "down") {
  const { supabase } = await requireUser();
  const days = await loadDays(supabase, expeditionId);

  const from = days.findIndex((d) => d.id === dayId);
  const to = direction === "up" ? from - 1 : from + 1;
  if (from === -1 || to < 0 || to >= days.length) return;

  [days[from], days[to]] = [days[to], days[from]];
  await saveOrder(supabase, expeditionId, days);
  refresh();
}
