"use client";

import { useRouter } from "next/navigation";
import type { DriveStep } from "driver.js";
import { useTour } from "@/app/components/tour";

type Props = {
  // The expedition the tour continues into: the riskiest one, so the editor tour has flags to show.
  next: { href: string; name: string; riskLabel: string } | null;
};

export function DashboardTour({ next }: Props) {
  const router = useRouter();

  useTour("dashboard", (tour) => {
    const steps: DriveStep[] = [
      {
        popover: {
          title: "Welcome to base camp 🏔️",
          description:
            "Summit Planner checks a high-altitude itinerary night by night and tells you which nights will hurt. Here's the 60-second tour.",
        },
      },
      {
        element: '[data-tour="expeditions"]',
        skipMissingElement: true,
        popover: {
          title: "Your expeditions",
          description:
            "Each card carries a live risk badge from the acclimatization engine, or how the climb ended: summited or turned back.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: '[data-tour="templates"]',
        popover: {
          title: "Start from a real route",
          description:
            "K2 Base Camp + Gondogoro La, Khosar Gang (my own turnaround) and Huayna Potosí, with real camps and altitudes. One click clones a route.",
          side: "top",
          align: "start",
        },
      },
      {
        element: '[data-tour="scratch"]',
        popover: {
          title: "Or plan your own",
          description: "Any objective at any altitude, from a 4,000m pass to an 8,000m peak.",
          side: "top",
          align: "start",
        },
      },
    ];

    steps.push(
      next
        ? {
            element: '[data-tour-next="true"]',
            popover: {
              title: `Next: ${next.name}`,
              description: `The engine rates this plan <strong>${next.riskLabel.toLowerCase()}</strong>. Let's open it, see why, and fix it.`,
              side: "bottom",
              align: "start",
              nextBtnText: "Open it →",
              onNextClick: () => {
                tour.destroy();
                router.push(`${next.href}?tour=1`);
              },
            },
          }
        : {
            element: '[data-tour="templates"]',
            popover: {
              title: "Pick a route to continue",
              description: "Clone any route above. The planner tour starts as soon as it opens.",
              side: "top",
            },
          },
    );

    return steps;
  });

  return null;
}
