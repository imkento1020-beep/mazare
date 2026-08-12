"use client";

import { useRef, useState } from "react";

type PostImageCarouselProps = {
  images: string[];
  fallbackEmoji?: string;
  aspectClassName?: string;
  overlay?: React.ReactNode;
};

export default function PostImageCarousel({
  images,
  fallbackEmoji = "🍻",
  aspectClassName = "aspect-[4/5] w-full min-h-[280px] max-h-[420px]",
  overlay,
}: PostImageCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const validImages = images.filter(
    (src) => src.startsWith("data:") || src.startsWith("http"),
  );
  const hasImages = validImages.length > 0;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || validImages.length <= 1) return;

    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(index, validImages.length - 1));
  }

  if (!hasImages) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#120810] to-[#2d1200] ${aspectClassName}`}
      >
        <div className="flex h-full items-center justify-center text-5xl opacity-90">
          {fallbackEmoji}
        </div>
        {overlay}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#18181f] ${aspectClassName}`}>
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
                  index === activeIndex
                    ? "w-4 bg-white"
                    : "w-1.5 bg-white/40"
                }`}
              />
            ))}
          </div>
          <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            {activeIndex + 1}/{validImages.length}
          </div>
        </>
      )}

      {overlay}
    </div>
  );
}
