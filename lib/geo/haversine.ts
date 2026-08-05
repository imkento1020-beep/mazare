const EARTH_RADIUS_KM = 6371;

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function formatDistanceLabel(distanceKm: number): string {
  if (distanceKm < 1) {
    const minutes = Math.max(1, Math.round((distanceKm * 1000) / 80));
    return `徒歩${minutes}分`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }

  return `${Math.round(distanceKm)}km`;
}

export function getDistanceLabel(
  user: GeoPoint | null | undefined,
  shop: { latitude?: number | null; longitude?: number | null },
): string | null {
  if (!user || shop.latitude == null || shop.longitude == null) return null;

  const distanceKm = haversineDistanceKm(user, {
    latitude: Number(shop.latitude),
    longitude: Number(shop.longitude),
  });

  if (!Number.isFinite(distanceKm)) return null;
  return formatDistanceLabel(distanceKm);
}
