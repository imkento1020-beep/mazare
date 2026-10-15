"use client";

import {
  MAP_ACTIVITY_WINDOWS,
  type MapActivityWindowId,
} from "@/lib/map/mapActivityWindow";

type MapActivityWindowFilterProps = {
  value: MapActivityWindowId;
  onChange: (id: MapActivityWindowId) => void;
};

export default function MapActivityWindowFilter({
  value,
  onChange,
}: MapActivityWindowFilterProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118]/95 p-1.5 shadow-lg backdrop-blur-md">
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#5a5668]">
        投稿数の集計
      </p>
      <div className="flex flex-wrap gap-1">
        {MAP_ACTIVITY_WINDOWS.map((window) => {
          const active = value === window.id;
          return (
            <button
              key={window.id}
              type="button"
              onClick={() => onChange(window.id)}
              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition ${
                active
                  ? "bg-[#ff3d00] text-white shadow-[0_2px_12px_rgba(255,61,0,0.35)]"
                  : "text-[#9994a8] hover:bg-white/5 hover:text-[#eeeaf4]"
              }`}
            >
              {window.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
