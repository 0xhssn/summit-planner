import type { ItineraryDay } from "./types";

// Simplified from Wilderness Medical Society guidance. All rules count *new* altitude above
// 3,000m: sleeping higher than any previous night. Re-sleeping at an altitude you've already
// slept at (climb high, sleep low rotations) doesn't count against you.
export const RULES = {
  thresholdM: 3000,
  maxNewAltitudePerNightM: 500,
  highRiskNewAltitudeM: 1000,
  restEveryM: 1000,
} as const;

export type FlagCode = "fast-gain" | "very-fast-gain" | "rest-overdue";
export type Severity = "warning" | "high";
export type Risk = "low" | "moderate" | "high";

export type Flag = { code: FlagCode; severity: Severity; message: string };

export type DayAnalysis = {
  // Raw change from the previous night; null on the first night.
  gain: number | null;
  // Meters above both 3,000m and every previous night's sleeping altitude.
  newAltitude: number;
  flags: Flag[];
};

export type Analysis = {
  days: DayAnalysis[];
  risk: Risk;
  warningCount: number;
  highCount: number;
};

const m = (n: number) => `${n.toLocaleString("en-US")}m`;

export function analyze(days: ItineraryDay[]): Analysis {
  let highest = -Infinity;
  let sinceRest = 0;

  const analyzed = days.map((day, i): DayAnalysis => {
    const altitude = day.sleep_altitude_m;
    const flags: Flag[] = [];

    if (i === 0) {
      highest = altitude;
      return { gain: null, newAltitude: 0, flags };
    }

    const previous = days[i - 1].sleep_altitude_m;
    const newAltitude = Math.max(0, altitude - Math.max(highest, RULES.thresholdM));

    // A rest night is any night that doesn't sleep higher than the one before.
    if (altitude <= previous) sinceRest = 0;
    else sinceRest += newAltitude;

    if (newAltitude > RULES.highRiskNewAltitudeM) {
      flags.push({
        code: "very-fast-gain",
        severity: "high",
        message: `High risk: ${m(newAltitude)} of new altitude in one night (limit ${m(RULES.maxNewAltitudePerNightM)}).`,
      });
    } else if (newAltitude > RULES.maxNewAltitudePerNightM) {
      flags.push({
        code: "fast-gain",
        severity: "warning",
        message: `Too fast: ${m(newAltitude)} of new altitude in one night (limit ${m(RULES.maxNewAltitudePerNightM)}).`,
      });
    }

    // Skip when this night alone exceeds the limit: that's a too-fast night, and a rest day wouldn't fix it.
    if (newAltitude > 0 && newAltitude <= RULES.restEveryM && sinceRest > RULES.restEveryM) {
      flags.push({
        code: "rest-overdue",
        severity: "warning",
        message: `Rest day overdue: ${m(sinceRest)} gained since your last rest night.`,
      });
    }

    highest = Math.max(highest, altitude);
    return { gain: altitude - previous, newAltitude, flags };
  });

  const all = analyzed.flatMap((d) => d.flags);
  const highCount = all.filter((f) => f.severity === "high").length;
  const warningCount = all.length - highCount;
  const risk: Risk = highCount > 0 ? "high" : warningCount > 0 ? "moderate" : "low";

  return { days: analyzed, risk, warningCount, highCount };
}

export type AutoFixResult<T extends ItineraryDay> = {
  // Original days keep their identity (and any extra fields like `id`); inserted nights are plain.
  days: (T | ItineraryDay)[];
  restDaysAdded: number;
  stopsAdded: number;
  clean: boolean;
};

const EN_ROUTE = "En route to ";
const REST_SUFFIX = " (rest)";

// Repeatedly fix the earliest flagged night until the plan is clean or hits maxDays:
// - too much new altitude → insert intermediate nights that split the climb into equal steps
// - rest overdue → insert a rest night at the previous camp
export function autoFix<T extends ItineraryDay>(days: T[], maxDays = 40): AutoFixResult<T> {
  const result: (T | ItineraryDay)[] = [...days];
  let restDaysAdded = 0;
  let stopsAdded = 0;

  while (result.length < maxDays) {
    const analyzed = analyze(result).days;
    const i = analyzed.findIndex((d) => d.flags.length > 0);
    if (i === -1) break;

    const flags = analyzed[i].flags;
    const current = result[i];
    const previous = result[i - 1];

    if (flags.some((f) => f.code !== "rest-overdue")) {
      // Split the new altitude into the fewest equal steps that are each within the limit.
      const { newAltitude } = analyzed[i];
      const base = current.sleep_altitude_m - newAltitude;
      const steps = Math.ceil(newAltitude / RULES.maxNewAltitudePerNightM);
      const camp_name = current.camp_name.startsWith(EN_ROUTE)
        ? current.camp_name
        : `${EN_ROUTE}${current.camp_name}`;
      const stops = Array.from({ length: Math.min(steps - 1, maxDays - result.length) }, (_, k) => ({
        camp_name,
        sleep_altitude_m: Math.round(base + (newAltitude * (k + 1)) / steps),
      }));
      result.splice(i, 0, ...stops);
      stopsAdded += stops.length;
    } else {
      const camp = previous.camp_name.endsWith(REST_SUFFIX)
        ? previous.camp_name.slice(0, -REST_SUFFIX.length)
        : previous.camp_name;
      result.splice(i, 0, {
        camp_name: `${camp}${REST_SUFFIX}`,
        sleep_altitude_m: previous.sleep_altitude_m,
      });
      restDaysAdded++;
    }
  }

  return {
    days: result,
    restDaysAdded,
    stopsAdded,
    clean: analyze(result).risk === "low",
  };
}
