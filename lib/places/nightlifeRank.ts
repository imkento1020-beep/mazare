import { haversineDistanceKm, type GeoPoint } from "@/lib/geo/haversine";
import type { PlaceSummary } from "@/lib/places/types";

/** Places API (New) の includedPrimaryTypes — 並列検索用 */
export const NEARBY_NIGHTLIFE_PRIMARY_TYPES = [
  "izakaya",
  "bar",
  "pub",
  "wine_bar",
  "cocktail_bar",
  "sports_bar",
  "night_club",
] as const;

export const NEARBY_OTHER_PRIMARY_TYPES = ["restaurant"] as const;

export const NEARBY_LOW_PRIORITY_PRIMARY_TYPES = ["cafe"] as const;

export const NEARBY_ALL_PRIMARY_TYPES = [
  ...NEARBY_NIGHTLIFE_PRIMARY_TYPES,
  ...NEARBY_OTHER_PRIMARY_TYPES,
  ...NEARBY_LOW_PRIORITY_PRIMARY_TYPES,
] as const;

function normalizeType(token: string) {
  return token.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

const NIGHTLIFE_TYPE_SCORE: Record<string, number> = {
  izakaya: 100,
  bar: 95,
  pub: 90,
  wine_bar: 88,
  cocktail_bar: 88,
  sports_bar: 85,
  night_club: 82,
  karaoke: 80,
  live_music_venue: 75,
  japanese_restaurant: 55,
  yakiniku_restaurant: 50,
  ramen_restaurant: 45,
  sushi_restaurant: 45,
  restaurant: 40,
  cafe: 10,
  coffee_shop: 8,
  bakery: 5,
};

/** Google types から「居酒屋・バー系」優先度（大きいほど上位） */
export function nightlifePriorityScore(googleTypes: string[] | undefined): number {
  if (!googleTypes?.length) return 20;

  let best = 0;
  for (const raw of googleTypes) {
    const key = normalizeType(raw);
    const score = NIGHTLIFE_TYPE_SCORE[key];
    if (score != null && score > best) best = score;
  }

  return best > 0 ? best : 25;
}

export function rankPlacesByNightlifeThenDistance(
  places: PlaceSummary[],
  origin: GeoPoint | null,
  googleTypesByPlaceId: Map<string, string[]>,
  limit: number,
): PlaceSummary[] {
  const ranked = places
    .map((place) => ({
      place,
      score: nightlifePriorityScore(
        googleTypesByPlaceId.get(place.googlePlaceId),
      ),
      distanceKm: origin
        ? haversineDistanceKm(origin, {
            latitude: place.latitude,
            longitude: place.longitude,
          })
        : 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (origin) return a.distanceKm - b.distanceKm;
      return a.place.name.localeCompare(b.place.name, "ja");
    });

  return ranked.slice(0, limit).map((row) => row.place);
}
