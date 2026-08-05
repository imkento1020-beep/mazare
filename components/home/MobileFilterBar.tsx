"use client";

import { useState } from "react";
import {
  AREA_FILTERS,
  GENRE_FILTERS,
  MOOD_FILTERS,
  isFilterActive,
  toggleMood,
  toggleSetValue,
} from "@/lib/home/filters";

type FilterSheet = "genres" | "areas" | "moods" | null;

type MobileFilterBarProps = {
  genres: Set<string>;
  moods: Set<string>;
  areas: Set<string>;
  onGenresChange: (value: Set<string>) => void;
  onMoodsChange: (value: Set<string>) => void;
  onAreasChange: (value: Set<string>) => void;
  newShopsOnly?: boolean;
  onNewShopsOnlyChange?: (value: boolean) => void;
};

const FILTER_BUTTONS = [
  { key: "genres" as const, label: "ジャンル" },
  { key: "areas" as const, label: "エリア" },
  { key: "moods" as const, label: "ムード" },
];

function getSheetOptions(sheet: Exclude<FilterSheet, null>) {
  if (sheet === "genres") {
    return GENRE_FILTERS.filter((item) => item.id !== "すべて");
  }
  if (sheet === "areas") {
    return AREA_FILTERS.filter((item) => item.id !== "すべて");
  }
  return MOOD_FILTERS;
}

function isOptionActive(
  sheet: Exclude<FilterSheet, null>,
  optionId: string,
  genres: Set<string>,
  moods: Set<string>,
  areas: Set<string>,
) {
  if (sheet === "genres") return genres.has(optionId);
  if (sheet === "areas") return areas.has(optionId);
  return moods.has(optionId);
}

function toggleOption(
  sheet: Exclude<FilterSheet, null>,
  optionId: string,
  genres: Set<string>,
  moods: Set<string>,
  areas: Set<string>,
  onGenresChange: (value: Set<string>) => void,
  onMoodsChange: (value: Set<string>) => void,
  onAreasChange: (value: Set<string>) => void,
) {
  if (sheet === "genres") {
    onGenresChange(toggleSetValue(genres, optionId, "すべて"));
    return;
  }
  if (sheet === "areas") {
    onAreasChange(toggleSetValue(areas, optionId, "すべて"));
    return;
  }
  onMoodsChange(toggleMood(moods, optionId));
}

export default function MobileFilterBar({
  genres,
  moods,
  areas,
  onGenresChange,
  onMoodsChange,
  onAreasChange,
  newShopsOnly = false,
  onNewShopsOnlyChange,
}: MobileFilterBarProps) {
  const [openSheet, setOpenSheet] = useState<FilterSheet>(null);

  return (
    <>
      {onNewShopsOnlyChange && (
        <button
          type="button"
          onClick={() => onNewShopsOnlyChange(!newShopsOnly)}
          className={`mb-2 w-full rounded-[10px] border px-3 py-2.5 text-xs font-bold transition md:hidden ${
            newShopsOnly
              ? "border-[#00e87a] bg-[#00e87a]/10 text-[#00e87a]"
              : "border-white/[0.12] bg-[#111118] text-[#9994a8]"
          }`}
        >
          ✨ 新しく追加されたお店
        </button>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 md:hidden">
        {FILTER_BUTTONS.map((button) => {
          const active = isFilterActive(genres, moods, areas, button.key);
          return (
            <button
              key={button.key}
              type="button"
              onClick={() => setOpenSheet(button.key)}
              className={`rounded-[10px] border px-3 py-2.5 text-xs font-bold transition ${
                active
                  ? "border-[#ff3d00] bg-[#ff3d00]/10 text-[#ff3d00]"
                  : "border-white/[0.12] bg-[#111118] text-[#9994a8]"
              }`}
            >
              {button.label}
            </button>
          );
        })}
      </div>

      {openSheet && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="閉じる"
            onClick={() => setOpenSheet(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-white/7 bg-[#111118] px-4 pb-24 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">
                {FILTER_BUTTONS.find((button) => button.key === openSheet)?.label}
              </h2>
              <button
                type="button"
                onClick={() => setOpenSheet(null)}
                className="rounded-lg px-3 py-1 text-sm text-[#9994a8]"
              >
                閉じる
              </button>
            </div>

            <div className="space-y-1">
              {getSheetOptions(openSheet).map((option) => {
                const active = isOptionActive(
                  openSheet,
                  option.id,
                  genres,
                  moods,
                  areas,
                );
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      toggleOption(
                        openSheet,
                        option.id,
                        genres,
                        moods,
                        areas,
                        onGenresChange,
                        onMoodsChange,
                        onAreasChange,
                      )
                    }
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                      active
                        ? "bg-[#ff3d00]/10 text-[#ff3d00]"
                        : "text-[#eeeaf4] hover:bg-[#18181f]"
                    }`}
                  >
                    <span>{option.label}</span>
                    {active && <span className="text-xs font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setOpenSheet(null)}
              className="mt-4 w-full rounded-xl bg-[#ff3d00] py-3 text-sm font-bold text-white"
            >
              適用する
            </button>
          </div>
        </div>
      )}
    </>
  );
}
