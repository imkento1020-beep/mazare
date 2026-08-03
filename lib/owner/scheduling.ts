import { getJSTParts, jstDateTimeToUtc } from "@/lib/home/dates";

/** 次の 17:00（JST）をデフォルトの予約時刻として返す */
export function getDefaultScheduledPostTimeJST(now = new Date()): Date {
  const parts = getJSTParts(now);

  if (parts.hour < 17) {
    return jstDateTimeToUtc(parts.year, parts.month, parts.day, 17);
  }

  const tomorrow = new Date(
    jstDateTimeToUtc(parts.year, parts.month, parts.day, 12),
  );
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const next = getJSTParts(tomorrow);
  return jstDateTimeToUtc(next.year, next.month, next.day, 17);
}

/** datetime-local 入力値（JST として解釈）→ ISO */
export function datetimeLocalJSTToIso(value: string): string {
  return `${value}:00+09:00`;
}

/** ISO → datetime-local 入力値（JST 表示） */
export function isoToDatetimeLocalJST(iso: string): string {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}
