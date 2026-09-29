import { OPEN_HOURS_PATTERN, parseOpenHours } from "@/lib/shop/openHours";

const JA_WEEKDAYS = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
] as const;

const EN_WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type OpenHoursLine = {
  label: string;
  hours: string;
  isToday: boolean;
};

export type OpenHoursDisplay =
  | { kind: "empty" }
  | { kind: "simple"; text: string }
  | { kind: "daily"; hours: string }
  | { kind: "weekly"; lines: OpenHoursLine[] }
  | { kind: "raw"; text: string };

function todayJaLabel() {
  return JA_WEEKDAYS[new Date().getDay()];
}

function normalizeDayLabel(day: string): string {
  const trimmed = day.trim();
  for (const en of EN_WEEKDAYS) {
    if (trimmed.toLowerCase().startsWith(en.toLowerCase())) {
      const index = EN_WEEKDAYS.indexOf(en);
      return JA_WEEKDAYS[index];
    }
  }
  if (/^月/.test(trimmed)) return "月曜日";
  if (/^火/.test(trimmed)) return "火曜日";
  if (/^水/.test(trimmed)) return "水曜日";
  if (/^木/.test(trimmed)) return "木曜日";
  if (/^金/.test(trimmed)) return "金曜日";
  if (/^土/.test(trimmed)) return "土曜日";
  if (/^日/.test(trimmed)) return "日曜日";
  return trimmed;
}

function normalizeTimeToken(token: string): string {
  let t = token.trim();
  t = t.replace(/\u202f/g, " ");
  t = t.replace(/[–—−~～]/g, "〜");

  const ampm = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampm) {
    let hour = Number(ampm[1]) % 12;
    if (ampm[3].toUpperCase() === "PM") hour += 12;
    if (ampm[3].toUpperCase() === "AM" && Number(ampm[1]) === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${ampm[2]}`;
  }

  const hm = t.match(/^(\d{1,2}):(\d{2})$/);
  if (hm) {
    return `${String(Number(hm[1])).padStart(2, "0")}:${hm[2]}`;
  }

  return t;
}

function normalizeHoursRange(raw: string): string {
  const closed =
    /closed|定休|休業|休み/i.test(raw) && !/\d/.test(raw);
  if (closed) return "定休日";

  const parts = raw.split(/[〜~–—−-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const start = normalizeTimeToken(parts[0]);
    const end = normalizeTimeToken(parts[parts.length - 1]);
    if (/^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end)) {
      const overnight = end <= start;
      return overnight
        ? `${start} 〜 翌${end}`
        : `${start} 〜 ${end}`;
    }
  }

  return raw.replace(/[–—−~～]/g, "〜").trim();
}

function formatOwnerSimpleRange(value: string): string {
  const { start, end } = parseOpenHours(value);
  if (!start || !end) return value;
  return normalizeHoursRange(`${start}-${end}`);
}

function parseMultilineHours(text: string): OpenHoursLine[] {
  const today = todayJaLabel();
  const lines: OpenHoursLine[] = [];

  for (const row of text.split("\n")) {
    const line = row.trim();
    if (!line) continue;

    const colon = line.match(/^([^:：]+)[：:]\s*(.+)$/);
    if (colon) {
      const label = normalizeDayLabel(colon[1]);
      const hours = normalizeHoursRange(colon[2]);
      lines.push({
        label,
        hours,
        isToday: label === today,
      });
      continue;
    }

    lines.push({
      label: "",
      hours: normalizeHoursRange(line),
      isToday: false,
    });
  }

  return lines;
}

function orderWeekdays(lines: OpenHoursLine[]): OpenHoursLine[] {
  const order = new Map(JA_WEEKDAYS.map((d, i) => [d, i]));
  return [...lines].sort((a, b) => {
    const ai = order.get(a.label as (typeof JA_WEEKDAYS)[number]) ?? 99;
    const bi = order.get(b.label as (typeof JA_WEEKDAYS)[number]) ?? 99;
    return ai - bi;
  });
}

export function parseOpenHoursDisplay(hours: unknown): OpenHoursDisplay {
  if (hours == null || hours === "" || hours === "—") {
    return { kind: "empty" };
  }

  if (typeof hours !== "string") {
    return { kind: "empty" };
  }

  const trimmed = hours.trim();
  if (!trimmed) return { kind: "empty" };

  if (OPEN_HOURS_PATTERN.test(trimmed)) {
    return { kind: "simple", text: formatOwnerSimpleRange(trimmed) };
  }

  if (!trimmed.includes("\n")) {
    if (/^\d{2}:\d{2}\s*[-–〜]/.test(trimmed)) {
      return { kind: "simple", text: normalizeHoursRange(trimmed) };
    }
    return { kind: "raw", text: trimmed };
  }

  const parsed = parseMultilineHours(trimmed);
  if (parsed.length === 0) {
    return { kind: "raw", text: trimmed };
  }

  const withLabels = parsed.filter((line) => line.label);
  if (withLabels.length === 0) {
    return { kind: "raw", text: trimmed };
  }

  const uniqueHours = new Set(withLabels.map((line) => line.hours));
  if (uniqueHours.size === 1) {
    return { kind: "daily", hours: [...uniqueHours][0] };
  }

  return { kind: "weekly", lines: orderWeekdays(withLabels) };
}

/** カード等向けの1行要約 */
export function formatOpenHoursSummary(hours: unknown): string {
  const display = parseOpenHoursDisplay(hours);

  switch (display.kind) {
    case "empty":
      return "—";
    case "simple":
      return display.text;
    case "daily":
      return `毎日 ${display.hours}`;
    case "weekly": {
      const todayLine = display.lines.find((line) => line.isToday);
      if (todayLine) {
        return `今日（${todayLine.label.replace("曜日", "")}） ${todayLine.hours}`;
      }
      return display.lines.map((line) => `${line.label} ${line.hours}`).join(" / ");
    }
    case "raw":
      return display.text;
    default:
      return "—";
  }
}
