"use client";

import { useEffect, useState } from "react";

export type HomeLayoutMode = "mobile" | "desktop";

/** Tailwind `md` — home uses reels below this width. */
const DESKTOP_QUERY = "(min-width: 768px)";

export function useHomeLayout(): HomeLayoutMode | null {
  const [mode, setMode] = useState<HomeLayoutMode | null>(null);

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_QUERY);
    const sync = () => setMode(media.matches ? "desktop" : "mobile");
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return mode;
}
