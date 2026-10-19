import { haversineDistanceKm, type GeoPoint } from "@/lib/geo/haversine";

export type { GeoPoint };
import { formatJapaneseStationName } from "@/lib/shops/stationName";

export type PostCardLocationShop = {
  latitude?: number | null;
  longitude?: number | null;
  nearest_station?: string | null;
};

export function getPostCardDistanceKmLabel(
  user: GeoPoint | null | undefined,
  shop: PostCardLocationShop,
): string | null {
  if (!user || shop.latitude == null || shop.longitude == null) return null;

  const distanceKm = haversineDistanceKm(user, {
    latitude: Number(shop.latitude),
    longitude: Number(shop.longitude),
  });

  if (!Number.isFinite(distanceKm)) return null;
  return `${distanceKm.toFixed(1)}km`;
}

/** 「渋谷駅 · 0.3km」形式。距離が取れない場合は駅名のみ。 */
export function getPostCardLocationLabel(
  user: GeoPoint | null | undefined,
  shop: PostCardLocationShop | null | undefined,
): string {
  if (!shop) return "—";

  const rawStation = shop.nearest_station?.trim();
  const stationLabel = rawStation
    ? formatJapaneseStationName(rawStation)
    : null;
  const distance = getPostCardDistanceKmLabel(user, shop);

  if (stationLabel && distance) return `${stationLabel} · ${distance}`;
  if (stationLabel) return stationLabel;
  return "—";
}
