export type ExpeditionStatus = "planning" | "summited" | "turned_back";

export type Expedition = {
  id: string;
  name: string;
  peak: string | null;
  summit_altitude_m: number | null;
  status: ExpeditionStatus;
  outcome_note: string | null;
  created_at: string;
};

// A night on the mountain: where you sleep and how high.
export type ItineraryDay = {
  camp_name: string;
  sleep_altitude_m: number;
};

export type Day = ItineraryDay & {
  id: string;
  day_index: number;
};
