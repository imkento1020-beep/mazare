import { getGooglePlacesApiKey } from "@/lib/places/config";
import type { PlaceSummary } from "@/lib/places/types";

type LegacyPlace = {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
  types?: string[];
  photos?: Array<{ photo_reference?: string }>;
  opening_hours?: { weekday_text?: string[] };
};

function mapTypesToGenre(types: string[] | undefined): string[] {
  if (!types?.length) return ["飲食店"];
  const foodish = types.filter((t) =>
    /restaurant|bar|cafe|night_club|food|meal/i.test(t),
  );
  if (foodish.length === 0) return ["飲食店"];
  return foodish.slice(0, 3).map((t) => t.replace(/_/g, " "));
}

function legacyPhotoUrl(apiKey: string, photoReference: string | undefined) {
  if (!photoReference) return null;
  const params = new URLSearchParams({
    maxwidth: "800",
    photo_reference: photoReference,
    key: apiKey,
  });
  return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`;
}

function mapLegacyPlace(place: LegacyPlace, apiKey: string): PlaceSummary | null {
  if (!place.place_id) return null;
  const lat = place.geometry?.location?.lat;
  const lng = place.geometry?.location?.lng;
  if (lat == null || lng == null) return null;

  const hours = place.opening_hours?.weekday_text;
  return {
    googlePlaceId: place.place_id,
    name: place.name ?? "名称未設定",
    address: place.formatted_address ?? "",
    latitude: lat,
    longitude: lng,
    types: mapTypesToGenre(place.types),
    openHoursText: hours?.length ? hours.join("\n") : null,
    photoUrl: legacyPhotoUrl(apiKey, place.photos?.[0]?.photo_reference),
    shopId: null,
  };
}

async function legacyGet<T>(path: string, params: Record<string, string>) {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error("Google Places API キーが未設定です");
  }

  const search = new URLSearchParams({ ...params, key: apiKey, language: "ja" });
  const response = await fetch(`${path}?${search.toString()}`);

  const data = (await response.json()) as T & {
    status?: string;
    error_message?: string;
    results?: LegacyPlace[];
  };

  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      data.error_message ??
        `Places API（従来版）エラー: ${data.status}`,
    );
  }

  return data;
}

const NEARBY_TYPES = ["restaurant", "bar", "cafe"] as const;

export async function searchNearbyPlacesLegacy(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}): Promise<PlaceSummary[]> {
  const apiKey = getGooglePlacesApiKey();
  const location = `${input.latitude},${input.longitude}`;
  const radius = String(input.radiusMeters ?? 1200);

  const responses = await Promise.all(
    NEARBY_TYPES.map((type) =>
      legacyGet<{ results?: LegacyPlace[] }>(
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        { location, radius, type },
      ),
    ),
  );

  const byId = new Map<string, PlaceSummary>();
  for (const response of responses) {
    for (const place of response.results ?? []) {
      const summary = mapLegacyPlace(place, apiKey);
      if (summary && !byId.has(summary.googlePlaceId)) {
        byId.set(summary.googlePlaceId, summary);
      }
    }
  }

  return [...byId.values()].slice(0, 20);
}

export async function searchPlacesByTextLegacy(query: string): Promise<PlaceSummary[]> {
  const apiKey = getGooglePlacesApiKey();
  const data = await legacyGet<{ results?: LegacyPlace[] }>(
    "https://maps.googleapis.com/maps/api/place/textsearch/json",
    { query: `${query} 飲食店`, region: "jp" },
  );

  return (data.results ?? [])
    .map((place) => mapLegacyPlace(place, apiKey))
    .filter((place): place is PlaceSummary => place !== null)
    .slice(0, 20);
}

export async function fetchPlaceByIdLegacy(
  placeId: string,
): Promise<PlaceSummary | null> {
  const apiKey = getGooglePlacesApiKey();
  const data = await legacyGet<{ result?: LegacyPlace }>(
    "https://maps.googleapis.com/maps/api/place/details/json",
    {
      place_id: placeId,
      fields: "place_id,name,formatted_address,geometry,types,photos,opening_hours",
    },
  );

  if (!data.result) return null;
  return mapLegacyPlace(data.result, apiKey);
}
