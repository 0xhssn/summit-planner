"use client";

import { useTour } from "@/app/components/tour";

export function ExpeditionTour() {
  useTour("expedition", () => [
    {
      element: '[data-tour="risk"]',
      skipMissingElement: true,
      popover: {
        title: "The verdict",
        description:
          "Low, moderate or high risk, recalculated on every edit. Open “How Summit Planner checks your plan” for the rules behind it.",
        side: "bottom",
      },
    },
    {
      element: '[data-tour="chart"]',
      popover: {
        title: "Every night, plotted",
        description:
          "Sleeping altitude by day. Amber and red dots are nights that climb too fast or skip a rest day. Dashed lines mark 3,000m and the summit.",
        side: "bottom",
      },
    },
    {
      // Point at a flagged night if there is one, so the explanation is right there.
      element: () =>
        document.querySelector('[data-flagged="true"]') ?? document.querySelector('[data-tour="days"]')!,
      popover: {
        title: "Edit the plan inline",
        description:
          "Rename camps, change altitudes, reorder or delete days. Flags say exactly what's wrong with a night and by how much.",
        side: "top",
      },
    },
    {
      element: '[data-tour="auto-fix"]',
      skipMissingElement: true,
      popover: {
        title: "One-click auto-fix",
        description:
          "Splits big jumps into steps of 500m or less with intermediate camps, and adds rest days where they're overdue. Try it after the tour; everything stays editable.",
        side: "left",
        align: "start",
      },
    },
    {
      element: '[data-tour="add-day"]',
      popover: {
        title: "Add the next night",
        description: "The altitude defaults to your last camp, so you only type what changes.",
        side: "top",
      },
    },
    {
      element: '[data-tour="outcome"]',
      popover: {
        title: "After the trip",
        description: "Log how it went. Summited or turned back, both are good outcomes if you came home.",
        side: "top",
      },
    },
    {
      element: '[data-tour="tour-button"]',
      popover: {
        title: "That's the tour",
        description: "Replay it any time from here. Now go plan something big.",
        side: "bottom",
        align: "end",
      },
    },
  ]);

  return null;
}
