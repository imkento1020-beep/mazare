"use client";

import { useMemo } from "react";
import type { VibePost } from "@/lib/home/types";
import {
  calendarMonthMeta,
  groupPostsByDayJST,
} from "@/lib/profile/drinkLogStats";

const WEEK_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

type DrinkLogCalendarProps = {
  posts: VibePost[];
};

export default function DrinkLogCalendar({ posts }: DrinkLogCalendarProps) {
  const { year, month, startWeekday, daysInMonth } = calendarMonthMeta();
  const byDay = useMemo(() => groupPostsByDayJST(posts), [posts]);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = `${year}年${month}月`;

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#111118] p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-[#eeeaf4]">{monthLabel}</h2>
        <p className="text-[11px] font-bold text-[#00e87a]">
          今月{byDay.size}日飲みに行った
        </p>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#5a5668]">
        {WEEK_LABELS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day == null) {
            return <div key={`e-${idx}`} className="aspect-square" />;
          }
          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const count = byDay.get(key)?.length ?? 0;
          const intensity =
            count === 0
              ? "bg-[#18181f]"
              : count === 1
                ? "bg-[#ff3d00]/35"
                : count === 2
                  ? "bg-[#ff3d00]/55"
                  : "bg-[#ff3d00]";

          return (
            <div
              key={key}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg ${intensity} ${count > 0 ? "ring-1 ring-[#ff3d00]/40" : ""}`}
              title={count > 0 ? `${count}件の投稿` : undefined}
            >
              <span
                className={`text-[11px] font-bold ${count > 0 ? "text-white" : "text-[#5a5668]"}`}
              >
                {day}
              </span>
              {count > 0 && (
                <span className="mt-0.5 h-1 w-1 rounded-full bg-white/90" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
