"use server";

import { refresh } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { autoFix } from "@/lib/acclimatization";
import { attempt } from "@/lib/action-result";
import { meters } from "@/lib/format";
import { requireUser } from "@/lib/supabase/server";
import { parseAltitude, parseCampName } from "@/lib/validation";
import type { Day, ExpeditionStatus } from "@/lib/types";

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
  return attempt(async () => {
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
    return { message: `Day ${days.length + 1} added: ${camp_name} at ${meters(sleep_altitude_m)}` };
  });
}

export async function updateDay(expeditionId: string, dayId: string, formData: FormData) {
  return attempt(async () => {
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
    return { message: `Saved ${camp_name}` };
  });
}

export async function deleteDay(expeditionId: string, dayId: string) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const { data, error } = await supabase
      .from("days")
      .delete()
      .eq("id", dayId)
      .eq("expedition_id", expeditionId)
      .select("camp_name")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("That day no longer exists. Refresh and try again.");

    await saveOrder(supabase, expeditionId, await loadDays(supabase, expeditionId));
    refresh();
    return { message: `Removed ${data.camp_name}` };
  });
}

export async function moveDay(expeditionId: string, dayId: string, direction: "up" | "down") {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const days = await loadDays(supabase, expeditionId);

    const from = days.findIndex((d) => d.id === dayId);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from === -1) throw new Error("That day no longer exists. Refresh and try again.");
    if (to < 0 || to >= days.length) return;

    [days[from], days[to]] = [days[to], days[from]];
    await saveOrder(supabase, expeditionId, days);
    refresh();
    // Reordering is visible immediately; a toast for every nudge would be noise.
  });
}

export async function autoFixItinerary(expeditionId: string) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const days = await loadDays(supabase, expeditionId);
    const { days: fixed, restDaysAdded, stopsAdded, clean } = autoFix(days);

    if (restDaysAdded + stopsAdded === 0) return { message: "Nothing to fix. This plan is already low risk." };

    const positioned = fixed.map((d, i) => ({ ...d, day_index: i, expedition_id: expeditionId }));
    const existing = positioned.filter((d) => "id" in d);
    const inserted = positioned.filter((d) => !("id" in d));

    const { error: moveError } = await supabase.from("days").upsert(existing);
    if (moveError) throw new Error(moveError.message);
    const { error: insertError } = await supabase.from("days").insert(inserted);
    if (insertError) throw new Error(insertError.message);
    refresh();

    const added = [
      stopsAdded && `${stopsAdded} acclimatization ${stopsAdded === 1 ? "stop" : "stops"}`,
      restDaysAdded && `${restDaysAdded} rest ${restDaysAdded === 1 ? "day" : "days"}`,
    ].filter(Boolean);
    return {
      message: clean ? "Itinerary re-planned: now low risk" : "Itinerary improved, but some flags remain",
      description: clean
        ? `Added ${added.join(" and ")}.`
        : `Added ${added.join(" and ")} before hitting the 40-day limit.`,
    };
  });
}

const OUTCOME_MESSAGES: Record<ExpeditionStatus, string> = {
  planning: "Back to planning",
  summited: "Marked as summited. Congratulations! 🏔️",
  turned_back: "Marked as turned back. Good call coming home.",
};

export async function setOutcome(expeditionId: string, formData: FormData) {
  return attempt(async () => {
    const { supabase } = await requireUser();
    const status = String(formData.get("status")) as ExpeditionStatus;
    if (!Object.hasOwn(OUTCOME_MESSAGES, status)) throw new Error("Pick an outcome first.");
    const outcome_note = String(formData.get("outcome_note") ?? "").trim().slice(0, 500) || null;

    const { error } = await supabase
      .from("expeditions")
      .update({ status, outcome_note })
      .eq("id", expeditionId);
    if (error) throw new Error(error.message);
    refresh();
    return { message: OUTCOME_MESSAGES[status] };
  });
}
