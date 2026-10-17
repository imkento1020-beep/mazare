"use client";

import { useSyncExternalStore } from "react";

export type HomeLayoutMode = "mobile" | "desktop";

/** Tailwind `md` — home uses reels below this width. */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onStoreChange);
  return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot(): HomeLayoutMode {
  return window.matchMedia(DESKTOP_QUERY).matches ? "desktop" : "mobile";
}

function getServerSnapshot(): HomeLayoutMode {
  return "mobile";
}

export function useHomeLayout(): HomeLayoutMode {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
