"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

export type SegmentIndicatorRect = {
  left: number;
  width: number;
  ready: boolean;
};

export function useSegmentIndicator(activeId: string) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<SegmentIndicatorRect>({
    left: 0,
    width: 0,
    ready: false,
  });

  const measure = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;
    const target = root.querySelector<HTMLElement>(
      `[data-segment-id="${CSS.escape(activeId)}"]`,
    );
    if (!target) return;
    setRect({
      left: target.offsetLeft,
      width: target.offsetWidth,
      ready: true,
    });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(root);
    return () => observer.disconnect();
  }, [measure]);

  return { containerRef, rect };
}
