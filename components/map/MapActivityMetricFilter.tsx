"use client";

import {
  MAP_ACTIVITY_METRICS,
  type MapActivityMetricId,
} from "@/lib/map/mapActivityMetric";

type MapActivityMetricFilterProps = {
  value: MapActivityMetricId;
  onChange: (id: MapActivityMetricId) => void;
};

export default function MapActivityMetricFilter({
  value,
  onChange,
}: MapActivityMetricFilterProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#111118]/95 p-1.5 shadow-lg backdrop-blur-md">
      <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-[#5a5668]">
        地図の表示
      </p>
      <div className="flex flex-wrap gap-1">
        {MAP_ACTIVITY_METRICS.map((metric) => {
          const active = value === metric.id;
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => onChange(metric.id)}
              className={`rounded-xl px-2.5 py-1.5 text-[11px] font-bold transition-colors duration-200 ease-out ${
                active
                  ? "bg-[#ff3d00] text-white shadow-[0_2px_12px_rgba(255,61,0,0.35)]"
                  : "text-[#9994a8] hover:bg-white/5 hover:text-[#eeeaf4]"
              }`}
            >
              {metric.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
