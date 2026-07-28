"use client";

import {
  AREA_FILTERS,
  GENRE_FILTERS,
  MOOD_FILTERS,
  toggleMood,
  toggleSetValue,
} from "@/lib/home/filters";

type FilterPanelProps = {
  genres: Set<string>;
  moods: Set<string>;
  areas: Set<string>;
  onGenresChange: (value: Set<string>) => void;
  onMoodsChange: (value: Set<string>) => void;
  onAreasChange: (value: Set<string>) => void;
  showMenu?: boolean;
};

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-xs transition ${
        active
          ? "bg-[#ff3d00]/10 text-[#ff3d00]"
          : "text-[#9994a8] hover:bg-[#18181f] hover:text-[#eeeaf4]"
      }`}
    >
      <span
        className={`h-2 w-2 shrink-0 rounded-full border ${
          active
            ? "border-[#ff3d00] bg-[#ff3d00]"
            : "border-white/20 bg-transparent"
        }`}
      />
      {label}
    </button>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 px-2 text-[11px] font-bold tracking-wider text-[#5a5668]">
        {title}
      </p>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

export default function FilterPanel({
  genres,
  moods,
  areas,
  onGenresChange,
  onMoodsChange,
  onAreasChange,
  showMenu = true,
}: FilterPanelProps) {
  return (
    <div>
      {showMenu && (
        <>
          <div className="mb-7">
            <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a5668]">
              メニュー
            </p>
            <div className="flex flex-col gap-1">
              {[
                { icon: "🏠", label: "ホーム", active: true },
                { icon: "🗺️", label: "地図で探す", active: false },
                { icon: "❤️", label: "お気に入り", active: false },
                { icon: "🕙", label: "履歴", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium ${
                    item.active
                      ? "bg-[#ff3d00]/10 text-[#ff3d00]"
                      : "text-[#9994a8]"
                  }`}
                >
                  <span className="w-[22px] text-center text-lg">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <div className="mb-7 h-px bg-white/7" />
        </>
      )}

      <FilterGroup title="ジャンル">
        {GENRE_FILTERS.map((item) => (
          <FilterChip
            key={item.id}
            label={item.label}
            active={genres.has(item.id)}
            onClick={() =>
              onGenresChange(toggleSetValue(genres, item.id, "すべて"))
            }
          />
        ))}
      </FilterGroup>

      <div className="mb-7 h-px bg-white/7" />

      <FilterGroup title="今夜の雰囲気">
        {MOOD_FILTERS.map((item) => (
          <FilterChip
            key={item.id}
            label={item.label}
            active={moods.has(item.id)}
            onClick={() => onMoodsChange(toggleMood(moods, item.id))}
          />
        ))}
      </FilterGroup>

      <div className="mb-7 h-px bg-white/7" />

      <FilterGroup title="エリア">
        {AREA_FILTERS.map((item) => (
          <FilterChip
            key={item.id}
            label={item.label}
            active={areas.has(item.id)}
            onClick={() =>
              onAreasChange(toggleSetValue(areas, item.id, "すべて"))
            }
          />
        ))}
      </FilterGroup>
    </div>
  );
}
