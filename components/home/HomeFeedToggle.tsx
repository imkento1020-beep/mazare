"use client";

import {
  FireIcon,
  SparkleIcon,
  StorefrontIcon,
} from "@/components/icons/MazareIcons";

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
    <div className="mb-4 flex rounded-xl border border-white/[0.08] bg-[#111118] p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-lg px-2 py-2.5 text-center text-[11px] font-bold transition md:px-3 md:text-sm ${
            mode === tab.id
              ? "bg-[#ff3d00] text-white shadow-[0_4px_16px_rgba(255,61,0,0.25)]"
              : "text-[#9994a8] hover:text-[#eeeaf4]"
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
