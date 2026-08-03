"use client";

import { useEffect, useRef } from "react";
import { recordPostView } from "./postViews";

/** カードが画面に50%以上表示されたら1回だけ表示回数を記録 */
export function usePostViewTracking(postId: string) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || !postId) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          recordPostView(postId);
          observer.disconnect();
        }
      },
      { threshold: [0.5] },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [postId]);

  return ref;
}
