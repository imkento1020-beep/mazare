"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GUEST_SIDEBAR_NAV, isActivePath } from "@/lib/layout/nav";
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
  newShopsOnly?: boolean;
  onNewShopsOnlyChange?: (value: boolean) => void;
  showMenu?: boolean;
  menuOnly?: boolean;
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
  newShopsOnly = false,
  onNewShopsOnlyChange,
  showMenu = true,
  menuOnly = false,
}: FilterPanelProps) {
  const pathname = usePathname();

  return (
    <div>
      {showMenu && (
        <>
          <div className="mb-7">
            <p className="mb-2.5 px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5a5668]">
              メニュー
            </p>
            <div className="flex flex-col gap-1">
              {GUEST_SIDEBAR_NAV.map((item) => {
                const active = isActivePath(pathname, item.href);
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition ${
                      active
                        ? "bg-[#ff3d00]/10 text-[#ff3d00]"
                        : "text-[#9994a8] hover:bg-[#18181f] hover:text-[#eeeaf4]"
                    }`}
                  >
                    <span className="w-[22px] text-center text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="mb-7 h-px bg-white/7" />
        </>
      )}

      {!menuOnly && (
        <>
      {onNewShopsOnlyChange && (
        <>
          <FilterGroup title="新着">
            <FilterChip
              label="✨ 新しく追加されたお店"
              active={newShopsOnly}
              onClick={() => onNewShopsOnlyChange(!newShopsOnly)}
            />
          </FilterGroup>
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
        </>
      )}
    </div>
  );
}
