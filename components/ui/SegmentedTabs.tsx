"use client";

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
  if (variant === "pill") {
    return (
      <div
        className={`flex rounded-2xl border border-white/[0.08] bg-[#0d0d12] p-1 ${className}`}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-bold transition ${
                isActive
                  ? "bg-[#ff3d00] text-white shadow-[0_4px_20px_rgba(255,61,0,0.35)]"
                  : "text-[#9994a8] hover:text-[#eeeaf4]"
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge !== "" && (
                <span
                  className={`tabular-nums text-[11px] font-extrabold ${
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
    <div className={`border-b border-white/[0.08] ${className}`}>
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`relative flex flex-1 items-center justify-center gap-1.5 py-3.5 text-sm font-bold transition ${
                isActive ? "text-[#eeeaf4]" : "text-[#5a5668] hover:text-[#9994a8]"
              }`}
            >
              {tab.label}
              {tab.badge != null && tab.badge !== "" && (
                <span className="tabular-nums text-xs font-extrabold text-[#9994a8]">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#ff3d00]"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
