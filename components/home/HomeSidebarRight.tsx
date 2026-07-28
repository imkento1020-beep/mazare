"use client";

import Link from "next/link";
import { countByArea, countByMood } from "@/lib/home/filters";
import type { VibePost } from "@/lib/home/types";

type HomeSidebarRightProps = {
  posts: VibePost[];
  filteredCount: number;
  areas: Set<string>;
  onAreasChange: (areas: Set<string>) => void;
};

export default function HomeSidebarRight({
  posts,
  filteredCount,
  areas,
  onAreasChange,
}: HomeSidebarRightProps) {
  const areaCounts = countByArea(posts);
  const moodTrends = countByMood(posts);

  return (
    <aside className="hidden shrink-0 border-l border-white/7 px-5 py-6 xl:block xl:w-[320px]">
      <SectionLabel>地図</SectionLabel>
      <div className="mb-4 overflow-hidden rounded-2xl border border-white/7 bg-[#111118]">
        <div className="relative flex h-[180px] items-center justify-center bg-[radial-gradient(circle_at_40%_50%,rgba(255,61,0,0.2),transparent_40%),radial-gradient(circle_at_70%_30%,rgba(255,170,0,0.15),transparent_35%),#111118]">
          <span className="absolute left-[38%] top-[42%] text-xl">📍</span>
          <span className="absolute left-[58%] top-[35%] text-xl">📍</span>
          <span className="absolute left-[48%] top-[58%] text-xl">🔴</span>
        </div>
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <span className="text-xs text-[#9994a8]">{filteredCount}件表示中</span>
          <Link href="/map" className="text-[11px] font-bold text-[#ff3d00]">
            地図で開く →
          </Link>
        </div>
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
