"use client";

import { useSegmentIndicator } from "@/components/ui/useSegmentIndicator";

export type SegmentedTab<T extends string> = {
  id: T;
  label: string;
  badge?: number | string;
};

type SegmentedTabsProps<T extends string> = {
  tabs: SegmentedTab<T>[];
  active: T;
  onChange: (id: T) => void;
  /** pill = filled segment; underline = SNS profile style */
  variant?: "pill" | "underline";
  className?: string;
};

export default function SegmentedTabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = "underline",
  className = "",
}: SegmentedTabsProps<T>) {
  const { containerRef, rect } = useSegmentIndicator(active);

  if (variant === "pill") {
    return (
      <div
        ref={containerRef}
        className={`relative flex rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-1 ${className}`}
      >
        <span
          aria-hidden
          className="mazare-segment-indicator pointer-events-none absolute bottom-1 top-1 rounded-xl bg-[#ff3d00] shadow-[0_4px_20px_rgba(255,61,0,0.35)]"
          style={{
            left: rect.left,
            width: rect.width,
            opacity: rect.ready ? 1 : 0,
          }}
        />
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-segment-id={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition-colors duration-200 ease-out ${
                isActive
                  ? "text-white"
                  : "text-[#9994a8] hover:text-[#eeeaf4]"
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge !== "" && (
                <span
                  className={`tabular-nums text-[11px] font-extrabold transition-colors duration-200 ${
                    isActive ? "text-white/90" : "text-[#5a5668]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative border-b border-white/[0.08] ${className}`}>
      <div ref={containerRef} className="relative flex">
        <span
          aria-hidden
          className="mazare-segment-indicator pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-[#ff3d00]"
          style={{
            left: rect.left + 12,
            width: Math.max(0, rect.width - 24),
            opacity: rect.ready ? 1 : 0,
          }}
        />
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              data-segment-id={tab.id}
              onClick={() => onChange(tab.id)}
              className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 px-3 py-3.5 text-sm font-bold transition-colors duration-200 ease-out ${
                isActive ? "text-[#eeeaf4]" : "text-[#5a5668] hover:text-[#9994a8]"
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge !== "" && (
                <span className="tabular-nums text-xs font-extrabold text-[#9994a8]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
