import { haversineDistanceKm, type GeoPoint } from "@/lib/geo/haversine";
import {
  getGooglePlacesApiKey,
  getGooglePlacesSetupHint,
} from "@/lib/places/config";
import { formatPlacesApiError, isNewPlacesApiBlocked } from "@/lib/places/errors";
import { stationLabelFromPlaceName } from "@/lib/shops/stationName";
import { withPlacesApiRateLimit } from "@/lib/places/rateLimit";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  location?: { latitude?: number; longitude?: number };
};

const STATION_INCLUDED_TYPES = ["train_station", "subway_station"] as const;
const SEARCH_RADIUS_METERS = 1500;

function pickClosestStationName(
  origin: GeoPoint,
  places: GooglePlace[],
): string | null {
  let bestName: string | null = null;
  let bestKm = Number.POSITIVE_INFINITY;

  for (const place of places) {
    const lat = place.location?.latitude;
    const lng = place.location?.longitude;
    const label = place.displayName?.text;
    if (lat == null || lng == null || !label?.trim()) continue;

    const km = haversineDistanceKm(origin, {
      latitude: lat,
      longitude: lng,
    });
    if (km < bestKm) {
      bestKm = km;
      bestName = stationLabelFromPlaceName(label);
    }
  }

  return bestName;
}

async function searchNearbyStationsNew(
  origin: GeoPoint,
): Promise<string | null> {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error(
      `Google Places API キーが未設定です。${getGooglePlacesSetupHint()}`,
    );
  }

  const batches = await Promise.all(
    STATION_INCLUDED_TYPES.map(async (includedType) => {
      const response = await withPlacesApiRateLimit(() =>
        fetch("https://places.googleapis.com/v1/places:searchNearby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "places.displayName,places.location",
          },
          body: JSON.stringify({
            locationRestriction: {
              circle: {
                center: {
                  latitude: origin.latitude,
                  longitude: origin.longitude,
                },
                radius: SEARCH_RADIUS_METERS,
              },
            },
            includedTypes: [includedType],
            maxResultCount: 10,
            languageCode: "ja",
            regionCode: "JP",
          }),
        }),
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Places API error (${response.status})`);
      }

      const data = (await response.json()) as { places?: GooglePlace[] };
      return data.places ?? [];
    }),
  );

  const merged = batches.flat();
  return pickClosestStationName(origin, merged);
}

type LegacyPlace = {
  name?: string;
  geometry?: { location?: { lat?: number; lng?: number } };
};

async function searchNearbyStationsLegacy(
  origin: GeoPoint,
): Promise<string | null> {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    throw new Error("Google Places API キーが未設定です");
  }

  const batches = await Promise.all(
    STATION_INCLUDED_TYPES.map(async (type) => {
      const params = new URLSearchParams({
        location: `${origin.latitude},${origin.longitude}`,
        radius: String(SEARCH_RADIUS_METERS),
        type,
        key: apiKey,
        language: "ja",
      });
      const response = await withPlacesApiRateLimit(() =>
        fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`,
        ),
      );
      const data = (await response.json()) as {
        status?: string;
        results?: LegacyPlace[];
        error_message?: string;
      };
      if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
        throw new Error(
          data.error_message ?? `Places API（従来版）エラー: ${data.status}`,
        );
      }
      return data.results ?? [];
    }),
  );

  const asGoogle: GooglePlace[] = batches.flat().map((place) => ({
    displayName: { text: place.name },
    location: {
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
    },
  }));

  return pickClosestStationName(origin, asGoogle);
}

export async function resolveNearestTrainStationName(
  origin: GeoPoint,
): Promise<string | null> {
  try {
    return await searchNearbyStationsNew(origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isNewPlacesApiBlocked(message)) {
      console.warn("nearestTrainStation (new API):", formatPlacesApiError(message));
      return null;
    }
    try {
      return await searchNearbyStationsLegacy(origin);
    } catch (legacyError) {
      const legacyMessage =
        legacyError instanceof Error ? legacyError.message : String(legacyError);
      console.warn("nearestTrainStation (legacy):", legacyMessage);
      return null;
    }
  }
}
