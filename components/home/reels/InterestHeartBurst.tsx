"use client";

import { useEffect, useState } from "react";
import { PostLikeIcon } from "@/components/icons/FeedActionIcons";

type InterestHeartBurstProps = {
  trigger: number;
};

export default function InterestHeartBurst({ trigger }: InterestHeartBurstProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger <= 0) return;
    setVisible(true);
    const t = window.setTimeout(() => setVisible(false), 900);
    return () => window.clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
      aria-hidden
    >
      <span className="animate-[heart-pop_0.85s_ease-out_forwards] drop-shadow-[0_8px_24px_rgba(255,61,0,0.55)]">
        <PostLikeIcon size={88} color="#ff3d00" filled />
      </span>
    </div>
  );
}
