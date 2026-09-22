import { getGooglePlacesApiKey, PLACES_FIELD_MASK } from "@/lib/places/config";
import type { PlaceSummary } from "@/lib/places/types";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  types?: string[];
  regularOpeningHours?: { weekdayDescriptions?: string[] };
  photos?: Array<{ name?: string }>;
};

function mapTypesToGenre(types: string[] | undefined): string[] {
  if (!types?.length) return ["飲食店"];
  const foodish = types.filter((t) =>
    /restaurant|bar|cafe|night_club|food|meal/i.test(t),
  );
  if (foodish.length === 0) return ["飲食店"];
  return foodish.slice(0, 3).map((t) => t.replace(/_/g, " "));
}

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
    types: mapTypesToGenre(place.types),
    openHoursText: formatHours(place),
    photoUrl: photoUrlFromReference(apiKey, place.photos?.[0]?.name),
    shopId: null,
  };
}

async function placesRequest<T>(path: string, body: Record<string, unknown>) {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error("Google Places API キーが未設定です");
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

export async function searchNearbyPlaces(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}): Promise<PlaceSummary[]> {
  const apiKey = getGooglePlacesApiKey();
  const data = await placesRequest<{ places?: GooglePlace[] }>(
    "places:searchNearby",
    {
      locationRestriction: {
        circle: {
          center: {
            latitude: input.latitude,
            longitude: input.longitude,
          },
          radius: input.radiusMeters ?? 1200,
        },
      },
      includedPrimaryTypes: ["restaurant", "bar", "cafe", "night_club"],
      maxResultCount: 20,
      languageCode: "ja",
      regionCode: "JP",
    },
  );

  return (data.places ?? [])
    .map((place) => mapGooglePlaceToSummary(place, apiKey))
    .filter((place): place is PlaceSummary => place !== null);
}

export async function searchPlacesByText(query: string): Promise<PlaceSummary[]> {
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

export async function fetchPlaceById(placeId: string): Promise<PlaceSummary | null> {
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
}
