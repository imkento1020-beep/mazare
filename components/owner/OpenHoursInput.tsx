"use client";

import { inputClassName } from "@/lib/ui/styles";

type OpenHoursInputProps = {
  start: string;
  end: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  idPrefix?: string;
};

const timeInputClassName = `${inputClassName} mt-0 [color-scheme:dark]`;

export default function OpenHoursInput({
  start,
  end,
  onStartChange,
  onEndChange,
  idPrefix = "openHours",
}: OpenHoursInputProps) {
  return (
    <div>
      <p className="text-sm font-medium">営業時間</p>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div>
          <label htmlFor={`${idPrefix}-start`} className="sr-only">
            開始時間
          </label>
          <input
            id={`${idPrefix}-start`}
            type="time"
            value={start}
            onChange={(e) => onStartChange(e.target.value)}
            className={timeInputClassName}
          />
        </div>
        <span className="pt-1 text-sm text-[#5a5668]">〜</span>
        <div>
          <label htmlFor={`${idPrefix}-end`} className="sr-only">
            終了時間
          </label>
          <input
            id={`${idPrefix}-end`}
            type="time"
            value={end}
            onChange={(e) => onEndChange(e.target.value)}
            className={timeInputClassName}
          />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-[#5a5668]">
        例: 19:00 〜 05:00（日をまたぐ場合もそのまま入力できます）
      </p>
    </div>
  );
}
