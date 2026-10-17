"use client";

import {
  FireIcon,
  SparkleIcon,
  StorefrontIcon,
} from "@/components/icons/MazareIcons";
import { useSegmentIndicator } from "@/components/ui/useSegmentIndicator";

type HomeFeedToggleProps = {
  mode: "hot" | "popular" | "shops";
  onChange: (mode: "hot" | "popular" | "shops") => void;
  hotCount: number;
  popularCount: number;
  shopsCount: number;
};

export default function HomeFeedToggle({
  mode,
  onChange,
  hotCount,
  popularCount,
  shopsCount,
}: HomeFeedToggleProps) {
  const { containerRef, rect } = useSegmentIndicator(mode);

  const tabs = [
    {
      id: "hot" as const,
      label: "今夜ホット",
      count: hotCount,
      Icon: FireIcon,
    },
    {
      id: "popular" as const,
      label: "人気",
      count: popularCount,
      Icon: SparkleIcon,
    },
    {
      id: "shops" as const,
      label: "お店",
      count: shopsCount,
      Icon: StorefrontIcon,
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative mb-4 flex rounded-xl border border-white/[0.08] bg-[#111118] p-1"
    >
      <span
        aria-hidden
        className="mazare-segment-indicator pointer-events-none absolute bottom-1 top-1 rounded-lg bg-[#ff3d00] shadow-[0_4px_16px_rgba(255,61,0,0.25)]"
        style={{
          left: rect.left,
          width: rect.width,
          opacity: rect.ready ? 1 : 0,
        }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          data-segment-id={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative z-10 flex-1 rounded-lg px-2 py-2.5 text-center text-[11px] font-bold transition-colors duration-200 ease-out md:px-3 md:text-sm ${
            mode === tab.id ? "text-white" : "text-[#9994a8] hover:text-[#eeeaf4]"
          }`}
        >
          <span className="inline-flex items-center justify-center gap-1">
            <tab.Icon size={14} color="currentColor" />
            {tab.label}
          </span>
          <span className="ml-1 text-[10px] font-semibold opacity-80">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
