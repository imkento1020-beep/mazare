export type MapActivityMetricId = "posts" | "checkins";

export const MAP_ACTIVITY_METRICS: Array<{
  id: MapActivityMetricId;
  label: string;
  pinHint: string;
}> = [
  { id: "posts", label: "投稿数", pinHint: "選択時間内の投稿数" },
  { id: "checkins", label: "チェックイン", pinHint: "いまチェックイン中" },
];

export function mapActivityMetricLabel(id: MapActivityMetricId): string {
  return MAP_ACTIVITY_METRICS.find((m) => m.id === id)?.label ?? "投稿数";
}
