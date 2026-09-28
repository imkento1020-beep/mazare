"use client";

import { useRef, useState } from "react";

/** Instagram フィード寄り（縦 4:5） */
export const GUEST_POST_IMAGE_ASPECT = "aspect-[4/5]";
/** TikTok / Reels 寄り（縦 9:16） */
export const GUEST_POST_VIDEO_ASPECT = "aspect-[9/16]";

type GuestPostMediaProps = {
  mediaType: "image" | "video" | null | undefined;
  images?: string[] | null;
  videoUrl?: string | null;
  fallbackEmoji?: string;
  /** 一覧などで高さを抑える */
  compact?: boolean;
  className?: string;
};

export default function GuestPostMedia({
  mediaType,
  images,
  videoUrl,
  fallbackEmoji = "🍻",
  compact = false,
  className = "",
}: GuestPostMediaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const validImages = (images ?? []).filter(
    (src) => src.startsWith("http") || src.startsWith("data:"),
  );
  const isVideo = mediaType === "video" && Boolean(videoUrl);
  const aspectClass = isVideo
    ? compact
      ? "aspect-[9/16] max-h-[420px]"
      : `${GUEST_POST_VIDEO_ASPECT} max-h-[min(78vh,680px)]`
    : compact
      ? "aspect-[4/5] max-h-[360px]"
      : GUEST_POST_IMAGE_ASPECT;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || validImages.length <= 1) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(index, validImages.length - 1));
  }

  if (isVideo && videoUrl) {
    return (
      <div
        className={`relative mx-auto w-full overflow-hidden bg-black ${aspectClass} ${className}`}
      >
        <video
          src={videoUrl}
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
        />
      </div>
    );
  }

  if (validImages.length > 0) {
    return (
      <div
        className={`relative mx-auto w-full overflow-hidden bg-[#0a0a10] ${aspectClass} ${className}`}
      >
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {validImages.map((src, index) => (
            <div key={`${src}-${index}`} className="h-full w-full shrink-0 snap-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
        {validImages.length > 1 && (
          <>
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {validImages.map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {activeIndex + 1}/{validImages.length}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto flex w-full items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#120810] to-[#2d1200] ${aspectClass} ${className}`}
    >
      <span className="text-5xl opacity-90">{fallbackEmoji}</span>
    </div>
  );
}
