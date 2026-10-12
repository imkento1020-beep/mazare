"use client";

import { useState } from "react";

export default function ReelCaption({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const trimmed = text.trim();
  if (!trimmed) return null;

  const likelyLong = trimmed.length > 42;

  return (
    <div className="pointer-events-auto">
      {open || !likelyLong ? (
        <p className="text-[13px] leading-relaxed text-white/85">{trimmed}</p>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
          className="w-full text-left text-[13px] leading-relaxed text-white/85"
        >
          <span className="line-clamp-2">{trimmed}</span>
          <span className="mt-0.5 inline-block text-[11px] font-semibold text-[#ff3d00]">
            もっと見る
          </span>
        </button>
      )}
    </div>
  );
}
