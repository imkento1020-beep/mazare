import {
  getGooglePlacesApiKey,
  getGooglePlacesSetupHint,
  PLACES_FIELD_MASK,
} from "@/lib/places/config";
import { formatPlacesApiError, isNewPlacesApiBlocked } from "@/lib/places/errors";
import {
  fetchPlaceByIdLegacy,
  searchNearbyPlacesLegacy,
  searchPlacesByTextLegacy,
} from "@/lib/places/legacyPlaces";
import type { PlaceSummary } from "@/lib/places/types";
import { labelsFromGooglePlaceTypes } from "@/lib/home/genreDisplay";
import {
  NEARBY_ALL_PRIMARY_TYPES,
  rankPlacesByNightlifeThenDistance,
} from "@/lib/places/nightlifeRank";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: Array<{ name?: string }>;
};

function photoUrlFromReference(apiKey: string, photoName: string | undefined) {
  if (!photoName || !apiKey) return null;
  return `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`;
}

function formatHours(place: GooglePlace): string | null {
  const lines = place.regularOpeningHours?.weekdayDescriptions;
  if (!lines?.length) return null;
  return lines.join("\n");
}

export function mapGooglePlaceToSummary(
  place: GooglePlace,
  apiKey: string,
): PlaceSummary | null {
  const googlePlaceId = place.id?.replace(/^places\//, "") ?? place.id;
  if (!googlePlaceId) return null;

  const lat = place.location?.latitude;
  const lng = place.location?.longitude;
  if (lat == null || lng == null) return null;

  return {
    googlePlaceId,
    name: place.displayName?.text ?? "名称未設定",
    address: place.formattedAddress ?? "",
    latitude: lat,
    longitude: lng,
    types: labelsFromGooglePlaceTypes(place.types, 3),
    openHoursText: formatHours(place),
    photoUrl: photoUrlFromReference(apiKey, place.photos?.[0]?.name),
    shopId: null,
  };
}

async function placesRequest<T>(path: string, body: Record<string, unknown>) {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error(`Google Places API キーが未設定です。${getGooglePlacesSetupHint()}`);
  }

  const response = await fetch(`https://places.googleapis.com/v1/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_FIELD_MASK,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Places API error (${response.status})`);
  }

  return (await response.json()) as T;
}

async function withLegacyFallback<T>(
  callNew: () => Promise<T>,
  callLegacy: () => Promise<T>,
): Promise<T> {
  try {
    return await callNew();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isNewPlacesApiBlocked(message)) {
      throw new Error(formatPlacesApiError(message));
    }

    try {
      return await callLegacy();
    } catch (legacyError) {
      const legacyMessage =
        legacyError instanceof Error ? legacyError.message : String(legacyError);
      throw new Error(
        `${formatPlacesApiError(message)} 詳細: ${legacyMessage}`,
      );
    }
  }
}

async function searchNearbyPlacesNew(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  limit?: number;
}): Promise<PlaceSummary[]> {
  const apiKey = getGooglePlacesApiKey();
  const limit = input.limit ?? 20;
  const radius = input.radiusMeters ?? 1200;
  const circle = {
    center: {
      latitude: input.latitude,
      longitude: input.longitude,
    },
    radius,
  };

  const batches = await Promise.all(
    NEARBY_ALL_PRIMARY_TYPES.map(async (primaryType) => {
      try {
        const data = await placesRequest<{ places?: GooglePlace[] }>(
          "places:searchNearby",
          {
            locationRestriction: { circle },
            includedPrimaryTypes: [primaryType],
            maxResultCount: 10,
            languageCode: "ja",
            regionCode: "JP",
          },
        );
        return data.places ?? [];
      } catch {
        return [] as GooglePlace[];
      }
    }),
  );

  const googleTypesByPlaceId = new Map<string, string[]>();
  const byId = new Map<string, GooglePlace>();

  for (const places of batches) {
    for (const place of places) {
      const googlePlaceId =
        place.id?.replace(/^places\//, "") ?? place.id ?? "";
      if (!googlePlaceId) continue;

      if (!byId.has(googlePlaceId)) byId.set(googlePlaceId, place);
      const prev = googleTypesByPlaceId.get(googlePlaceId) ?? [];
      googleTypesByPlaceId.set(googlePlaceId, [
        ...new Set([...prev, ...(place.types ?? [])]),
      ]);
    }
  }

  const summaries = [...byId.values()]
    .map((place) => mapGooglePlaceToSummary(place, apiKey))
    .filter((place): place is PlaceSummary => place !== null);

  return rankPlacesByNightlifeThenDistance(
    summaries,
    { latitude: input.latitude, longitude: input.longitude },
    googleTypesByPlaceId,
    limit,
  );
}

export async function searchNearbyPlaces(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  limit?: number;
}): Promise<PlaceSummary[]> {
  return withLegacyFallback(
    () => searchNearbyPlacesNew(input),
    () => searchNearbyPlacesLegacy(input),
  );
}

async function searchPlacesByTextNew(query: string): Promise<PlaceSummary[]> {
  const apiKey = getGooglePlacesApiKey();
  const data = await placesRequest<{ places?: GooglePlace[] }>(
    "places:searchText",
    {
      textQuery: query,
      languageCode: "ja",
      regionCode: "JP",
      maxResultCount: 20,
    },
  );

  return (data.places ?? [])
    .map((place) => mapGooglePlaceToSummary(place, apiKey))
    .filter((place): place is PlaceSummary => place !== null);
}

export async function searchPlacesByText(query: string): Promise<PlaceSummary[]> {
  return withLegacyFallback(
    () => searchPlacesByTextNew(query),
    () => searchPlacesByTextLegacy(query),
  );
}

export async function fetchPlaceById(placeId: string): Promise<PlaceSummary | null> {
  return withLegacyFallback(
    async () => {
      const apiKey = getGooglePlacesApiKey();
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": PLACES_FIELD_MASK.replace("places.", ""),
          },
        },
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Place details error (${response.status})`);
      }

      const place = (await response.json()) as GooglePlace;
      return mapGooglePlaceToSummary({ ...place, id: placeId }, apiKey);
    },
    () => fetchPlaceByIdLegacy(placeId),
  );
}
