"use client";

import { countByArea, countByMood } from "@/lib/home/filters";
import type { VibePost } from "@/lib/home/types";
import HomeMapPreview from "./HomeMapPreview";

type HomeSidebarRightProps = {
  posts: VibePost[];
  filteredCount: number;
  areas: Set<string>;
  onAreasChange: (areas: Set<string>) => void;
  googleMapsApiKey?: string;
};

export default function HomeSidebarRight({
  posts,
  filteredCount,
  areas,
  onAreasChange,
  googleMapsApiKey = "",
}: HomeSidebarRightProps) {
  const areaCounts = countByArea(posts);
  const moodTrends = countByMood(posts);

  return (
    <aside className="hidden h-[calc(100vh-4rem)] w-[300px] shrink-0 overflow-y-auto border-l border-white/7 px-5 py-6 md:sticky md:top-16 md:block">
      <SectionLabel>地図</SectionLabel>
      <div className="mb-4">
        <HomeMapPreview
          posts={posts}
          filteredCount={filteredCount}
          googleMapsApiKey={googleMapsApiKey}
        />
      </div>

      <SectionLabel>人気エリア</SectionLabel>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {Object.entries(areaCounts).map(([area, count]) => {
          const active = areas.has(area);
          const hot = count > 0 && area === "渋谷";
          return (
            <button
              key={area}
              type="button"
              onClick={() => onAreasChange(new Set([area]))}
              className={`rounded-[10px] border px-3 py-2.5 text-center transition ${
                active || hot
                  ? "border-[#ff3d00]/40 bg-[#ff3d00]/8"
                  : "border-white/7 bg-[#111118] hover:border-[#ff3d00]/30"
              }`}
            >
              <p className="text-[13px] font-bold text-[#eeeaf4]">{area}</p>
              <p
                className={`mt-0.5 text-[10px] ${hot ? "text-[#ff3d00]" : "text-[#5a5668]"}`}
              >
                {count > 0 ? `${hot ? "🔥 " : ""}${count}件発信中` : "発信なし"}
              </p>
            </button>
          );
        })}
      </div>

      <SectionLabel>今夜のトレンド</SectionLabel>
      <div className="space-y-0">
        {moodTrends.length === 0 ? (
          <p className="text-xs text-[#5a5668]">トレンドデータがありません</p>
        ) : (
          moodTrends.map(([mood, count], index) => (
            <div
              key={mood}
              className="flex items-center gap-2.5 border-b border-white/7 py-2.5 last:border-b-0"
            >
              <span className="w-5 text-sm font-extrabold text-[#5a5668]">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-[#eeeaf4]">{mood}</p>
                <p className="text-[11px] text-[#5a5668]">{count}件のお店が発信</p>
              </div>
              <span className="text-xl">
                {mood === "激熱" ? "🔥" : mood === "音楽あり" ? "🎵" : "🤝"}
              </span>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a5668]">
      {children}
      <span className="h-px flex-1 bg-white/7" />
    </p>
  );
}
