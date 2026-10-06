"use client";

import { driver, type Driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect, useRef } from "react";

const START_TOUR_EVENT = "summit:start-tour";

// localStorage is a per-browser convenience here: if it's unavailable, don't auto-start (no nagging).
function hasSeen(key: string) {
  try {
    return localStorage.getItem(`summit-tour:${key}`) === "seen";
  } catch {
    return true;
  }
}

function markSeen(key: string) {
  try {
    localStorage.setItem(`summit-tour:${key}`, "seen");
  } catch {}
}

function clearTourParam() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("tour")) return;
  params.delete("tour");
  const query = params.toString();
  window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
}

/**
 * Runs a guided tour for the current page. It starts automatically the first time this browser
 * sees the page, when the URL has ?tour=1 (used to chain tours across pages), or when the header's
 * Tour button is clicked.
 */
export function useTour(key: string, buildSteps: (tour: Driver) => DriveStep[]) {
  const buildRef = useRef(buildSteps);
  useEffect(() => {
    buildRef.current = buildSteps;
  });

  useEffect(() => {
    let tour: Driver | null = null;

    const start = () => {
      clearTourParam();
      tour?.destroy();
      // Marked on start, not finish: re-renders during the tour must never launch a second one.
      markSeen(key);
      tour = driver({
        showProgress: true,
        progressText: "{{current}} of {{total}}",
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Done",
        popoverClass: "summit-tour",
        overlayOpacity: 0.55,
        stagePadding: 6,
        stageRadius: 10,
        // Instant scroll: snappier, and doesn't stall when the browser throttles animation frames.
        smoothScroll: false,
      });
      tour.setSteps(buildRef.current(tour));
      tour.drive();
    };

    const forced = new URLSearchParams(window.location.search).get("tour") === "1";

    // Give client-only pieces (like the chart) a moment to lay out before measuring them.
    const timer = forced || !hasSeen(key) ? window.setTimeout(start, 450) : undefined;
    window.addEventListener(START_TOUR_EVENT, start);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(START_TOUR_EVENT, start);
      tour?.destroy();
    };
  }, [key]);
}

export function TourButton() {
  return (
    <button
      type="button"
      data-tour="tour-button"
      onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))}
      className="rounded-md px-2.5 py-1.5 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    >
      Tour
    </button>
  );
}
