const OPEN_HOURS_PATTERN = /^(\d{2}:\d{2})\s*[-–]\s*(\d{2}:\d{2})$/;

export type OpenHoursRange = {
  start: string;
  end: string;
};

export function parseOpenHours(value: string | null | undefined): OpenHoursRange {
  if (!value || value === "—") {
    return { start: "", end: "" };
  }

  const match = value.trim().match(OPEN_HOURS_PATTERN);
  if (!match) {
    return { start: "", end: "" };
  }

  return { start: match[1], end: match[2] };
}

export function formatOpenHoursRange(start: string, end: string): string {
  if (!start && !end) return "—";
  if (!start || !end) return "";
  return `${start}-${end}`;
}

export function validateOpenHoursRange(start: string, end: string): string | null {
  if (!start && !end) return null;
  if (!start || !end) {
    return "開始時間と終了時間の両方を入力してください";
  }
  return null;
}

export function isValidOpenHoursString(value: string | null | undefined): boolean {
  if (!value || value === "—") return true;
  return OPEN_HOURS_PATTERN.test(value.trim());
}
