import { describe, expect, it } from "vitest";
import { analyze, autoFix } from "./acclimatization";
import { TEMPLATES } from "./templates";
import type { ItineraryDay } from "./types";

const plan = (...altitudes: number[]): ItineraryDay[] =>
  altitudes.map((sleep_altitude_m, i) => ({ camp_name: `Camp ${i + 1}`, sleep_altitude_m }));

const codes = (days: ItineraryDay[]) => analyze(days).days.map((d) => d.flags.map((f) => f.code));

describe("analyze", () => {
  it("passes a well-paced itinerary as low risk", () => {
    const result = analyze(plan(2800, 3200, 3600, 3600, 4000, 4400, 4400, 4800));
    expect(result.risk).toBe("low");
    expect(result.days.every((d) => d.flags.length === 0)).toBe(true);
  });

  it("ignores big gains below 3,000m", () => {
    expect(analyze(plan(400, 2900)).risk).toBe("low");
  });

  it("warns on more than 500m of new altitude in a night", () => {
    const result = analyze(plan(3000, 3600));
    expect(result.days[1].flags.map((f) => f.code)).toEqual(["fast-gain"]);
    expect(result.days[1].newAltitude).toBe(600);
    expect(result.risk).toBe("moderate");
  });

  it("only counts the part of a gain that is above 3,000m", () => {
    // 2,800 → 3,400 is +600m, but only 400m of it is above 3,000m.
    expect(analyze(plan(2800, 3400)).risk).toBe("low");
  });

  it("flags more than 1,000m of new altitude in a night as high risk", () => {
    const result = analyze(plan(3640, 4700));
    expect(result.days[1].flags.map((f) => f.code)).toEqual(["very-fast-gain"]);
    expect(result.risk).toBe("high");
  });

  it("flags an overdue rest day after 1,000m without a rest night", () => {
    expect(codes(plan(3000, 3400, 3800, 4200))).toEqual([[], [], [], ["rest-overdue"]]);
  });

  it("resets the rest counter on a night that doesn't go higher", () => {
    expect(analyze(plan(3000, 3400, 3800, 3800, 4200, 4600)).risk).toBe("low");
  });

  it("doesn't penalize climbing back to an altitude you've already slept at", () => {
    // Base camp 4,300 → camp 1 4,700 → back to BC → camp 1 again → camp 2.
    expect(analyze(plan(4300, 4700, 4300, 4700, 5100)).risk).toBe("low");
  });
});

describe("autoFix", () => {
  it("leaves a clean itinerary untouched", () => {
    const days = plan(3000, 3400, 3400, 3800);
    const result = autoFix(days);
    expect(result.days).toEqual(days);
    expect(result.restDaysAdded + result.stopsAdded).toBe(0);
    expect(result.clean).toBe(true);
  });

  it("inserts a rest night at the previous camp when one is overdue", () => {
    const result = autoFix(plan(3000, 3400, 3800, 4200));
    expect(result.restDaysAdded).toBe(1);
    expect(result.days.map((d) => d.sleep_altitude_m)).toEqual([3000, 3400, 3800, 3800, 4200]);
    expect(result.days[3].camp_name).toBe("Camp 3 (rest)");
    expect(result.clean).toBe(true);
  });

  it("splits a big jump with intermediate nights and keeps the original days in order", () => {
    const days = plan(3640, 3640, 4700, 4700, 5130);
    const result = autoFix(days);

    expect(result.clean).toBe(true);
    expect(result.stopsAdded).toBeGreaterThan(0);
    expect(analyze(result.days).risk).toBe("low");
    // Every original night is still there, in the same order.
    expect(result.days.filter((d) => days.includes(d as ItineraryDay))).toEqual(days);
    expect(result.days.find((d) => d.camp_name.startsWith("En route to"))?.camp_name).toBe(
      "En route to Camp 3",
    );
  });

  it("splits a jump into equal steps rather than leaving a tiny first step", () => {
    const result = autoFix(plan(3640, 4700));
    expect(result.days.map((d) => d.sleep_altitude_m)).toEqual([3640, 3993, 4347, 4347, 4700]);
    expect(result.stopsAdded).toBe(2);
    expect(result.restDaysAdded).toBe(1);
  });

  it("stops at the day cap and reports that the plan isn't clean", () => {
    const result = autoFix(plan(3000, 6000), 3);
    expect(result.days).toHaveLength(3);
    expect(result.clean).toBe(false);
  });

  it.each(TEMPLATES.map((t) => [t.name, t] as const))("makes the %s template safe", (_, template) => {
    const result = autoFix(template.days);
    expect(result.clean).toBe(true);
    expect(result.days.length).toBeLessThanOrEqual(40);
  });
});
