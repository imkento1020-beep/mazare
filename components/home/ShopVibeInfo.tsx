"use client";

import { moodEmoji, moodTagClass, type HeatInfo } from "@/lib/home/moods";
import { getAccessLabel, type GeoPoint } from "@/lib/geo/haversine";

export function HeatGauge({ heat }: { heat: HeatInfo }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-[#eeeaf4]">
          {heat.emoji} 盛り上がり
        </span>
        <span className={`text-sm font-extrabold ${heat.color}`}>
          {heat.percent}% · {heat.label}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${heat.percent}%`,
            backgroundColor: heat.barColor,
            boxShadow: `0 0 12px ${heat.barColor}66`,
          }}
        />
      </div>
    </div>
  );
}

export function MoodTagList({ moods }: { moods: string[] }) {
  if (moods.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {moods.map((mood) => (
        <span
          key={mood}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${moodTagClass(mood)}`}
        >
          <span>{moodEmoji(mood)}</span>
          {mood}
        </span>
      ))}
    </div>
  );
}

export function ShopAccessLabel({
  userLocation,
  shop,
}: {
  userLocation?: GeoPoint | null;
  shop: { latitude?: number | null; longitude?: number | null };
}) {
  const access = getAccessLabel(userLocation, shop);

  if (!access) {
    return (
      <p className="text-sm font-medium text-[#5a5668]">
        📍 現在地を許可すると距離が表示されます
      </p>
    );
  }

  return (
    <p className="text-sm font-semibold text-[#eeeaf4]">
      📍 {access.fullLabel}
    </p>
  );
}
