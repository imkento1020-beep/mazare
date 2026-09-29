"use client";

import { parseOpenHoursDisplay } from "@/lib/shop/openHoursDisplay";

type ShopOpenHoursProps = {
  hours: unknown;
  className?: string;
};

export default function ShopOpenHours({ hours, className = "" }: ShopOpenHoursProps) {
  const display = parseOpenHoursDisplay(hours);

  if (display.kind === "empty") {
    return (
      <p className={`text-sm text-[#9994a8] ${className}`}>
        <span className="mr-1">🕙</span>
        営業時間未登録
      </p>
    );
  }

  if (display.kind === "raw") {
    return (
      <div
        className={`rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 ${className}`}
      >
        <p className="text-[11px] font-bold tracking-wide text-[#5a5668]">営業時間</p>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[#eeeaf4]">
          {display.text}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 ${className}`}
    >
      <p className="text-[11px] font-bold tracking-wide text-[#5a5668]">営業時間</p>

      {display.kind === "simple" && (
        <p className="mt-1.5 text-base font-semibold tabular-nums text-[#eeeaf4]">
          {display.text}
        </p>
      )}

      {display.kind === "daily" && (
        <>
          <p className="mt-1 text-xs text-[#9994a8]">毎日同じ</p>
          <p className="mt-0.5 text-base font-semibold tabular-nums text-[#eeeaf4]">
            {display.hours}
          </p>
        </>
      )}

      {display.kind === "weekly" && (
        <ul className="mt-2 space-y-1">
          {display.lines.map((line) => (
            <li
              key={line.label}
              className={`flex items-baseline justify-between gap-3 rounded-[8px] px-2 py-1 text-sm ${
                line.isToday
                  ? "bg-[#ffaa00]/10 font-semibold text-[#eeeaf4]"
                  : "text-[#9994a8]"
              }`}
            >
              <span className="shrink-0">
                {line.label.replace("曜日", "")}
                {line.isToday && (
                  <span className="ml-1 text-[10px] font-bold text-[#ffaa00]">今日</span>
                )}
              </span>
              <span className="tabular-nums text-right">{line.hours}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
