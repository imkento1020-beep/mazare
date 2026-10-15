export const MAP_ACTIVITY_WINDOWS = [
  { id: "30m", ms: 30 * 60 * 1000, label: "30分以内" },
  { id: "1h", ms: 60 * 60 * 1000, label: "1時間以内" },
  { id: "3h", ms: 3 * 60 * 60 * 1000, label: "3時間以内" },
  { id: "24h", ms: 24 * 60 * 60 * 1000, label: "24時間以内" },
] as const;

export type MapActivityWindowId = (typeof MAP_ACTIVITY_WINDOWS)[number]["id"];

export const DEFAULT_MAP_ACTIVITY_WINDOW_ID: MapActivityWindowId = "3h";

export function mapActivityWindowMs(id: MapActivityWindowId): number {
  return MAP_ACTIVITY_WINDOWS.find((w) => w.id === id)?.ms ?? MAP_ACTIVITY_WINDOWS[2].ms;
}

export function mapActivityWindowLabel(id: MapActivityWindowId): string {
  return MAP_ACTIVITY_WINDOWS.find((w) => w.id === id)?.label ?? "3時間以内";
}

export function isWithinMapActivityWindow(
  iso: string | null | undefined,
  windowMs: number,
  now = new Date(),
): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  const start = now.getTime() - windowMs;
  return t >= start && t <= now.getTime();
}
