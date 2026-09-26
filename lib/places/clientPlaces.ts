"use client";

import { importLibrary } from "@googlemaps/js-api-loader";
import { configureGoogleMapsLoader } from "@/lib/map/google";
import { ensureShopsFromPlacesClient } from "@/lib/places/cacheShopClient";
import type { PlaceSummary } from "@/lib/places/types";

const PLACE_FIELDS: Array<keyof google.maps.places.Place> = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "regularOpeningHours",
  "photos",
];

function displayNameText(place: google.maps.places.Place) {
  const name = place.displayName;
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "text" in name) {
    return String((name as { text?: string }).text ?? "");
  }
  return "名称未設定";
}

function mapTypesToGenre(types: string[] | undefined): string[] {
  if (!types?.length) return ["飲食店"];
  const foodish = types.filter((t) =>
    /restaurant|bar|cafe|night_club|food|meal/i.test(t),
  );
  if (foodish.length === 0) return ["飲食店"];
  return foodish.slice(0, 3).map((t) => t.replace(/_/g, " "));
}

async function getPlacesLibrary(apiKey: string) {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error(
      "Google Maps API キーが読み込まれていません。Vercel の NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を確認し、再デプロイしてください。",
    );
  }
  configureGoogleMapsLoader(trimmed);
  return importLibrary("places");
}

async function toPlaceSummary(
  place: google.maps.places.Place,
): Promise<PlaceSummary | null> {
  if (!place.id || !place.location) {
    await place.fetchFields({ fields: PLACE_FIELDS });
  }

  const id = place.id?.replace(/^places\//, "") ?? place.id;
  const location = place.location;
  if (!id || !location) return null;

  let photoUrl: string | null = null;
  try {
    photoUrl =
      place.photos?.[0]?.getURI?.({ maxWidth: 800, maxHeight: 800 }) ?? null;
  } catch {
    photoUrl = null;
  }

  const hours = place.regularOpeningHours?.weekdayDescriptions;

  return {
    googlePlaceId: id,
    name: displayNameText(place),
    address: place.formattedAddress ?? "",
    latitude: location.lat(),
    longitude: location.lng(),
    types: mapTypesToGenre(place.types ?? undefined),
    openHoursText: hours?.length ? hours.join("\n") : null,
    photoUrl,
    shopId: null,
  };
}

async function runNearbySearch(
  Place: google.maps.PlacesLibrary["Place"],
  input: { latitude: number; longitude: number; radiusMeters?: number },
) {
  const base = {
    fields: PLACE_FIELDS,
    locationRestriction: {
      center: { lat: input.latitude, lng: input.longitude },
      radius: input.radiusMeters ?? 1200,
    },
    maxResultCount: 20,
    language: "ja",
    region: "jp",
  };

  const primaryTypes = ["restaurant", "bar", "cafe", "night_club"] as const;
  for (const type of primaryTypes) {
    const { places } = await Place.searchNearby({
      ...base,
      includedPrimaryTypes: [type],
    });
    if (places.length > 0) return places;
  }

  const { places } = await Place.searchNearby({
    ...base,
    includedPrimaryTypes: ["restaurant"],
  });
  return places;
}

export async function searchNearbyPlacesClient(
  apiKey: string,
  input: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
  },
): Promise<PlaceSummary[]> {
  try {
    const { Place } = (await getPlacesLibrary(apiKey)) as google.maps.PlacesLibrary;
    const places = await runNearbySearch(Place, input);

    const summaries = await Promise.all(places.map((place) => toPlaceSummary(place)));
    const filtered = summaries.filter((place): place is PlaceSummary => place !== null);

    if (filtered.length === 0) {
      throw new Error(
        "近くに飲食店が見つかりませんでした。位置情報または検索でお店を選んでください。",
      );
    }

    return filtered;
  } catch (error) {
    if (error instanceof Error && error.message.includes("近くに飲食店")) {
      throw error;
    }
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Places の検索に失敗しました。API キーの Referer 制限に https://www.mazare.app/* が含まれているか確認してください。(${detail})`,
    );
  }
}

export async function searchPlacesByTextClient(
  apiKey: string,
  query: string,
): Promise<PlaceSummary[]> {
  try {
    const { Place } = (await getPlacesLibrary(apiKey)) as google.maps.PlacesLibrary;
    const { places } = await Place.searchByText({
      fields: PLACE_FIELDS,
      textQuery: query.includes("飲食") ? query : `${query} 飲食店`,
      maxResultCount: 20,
      language: "ja",
      region: "jp",
    });

    const summaries = await Promise.all(places.map((place) => toPlaceSummary(place)));
    return summaries.filter((place): place is PlaceSummary => place !== null);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `お店の検索に失敗しました。(${detail})`,
    );
  }
}

export async function cachePlacesForPost(places: PlaceSummary[]) {
  if (places.length === 0) return [];

  try {
    const response = await fetch("/api/places/cache", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places }),
    });

    const json = (await response.json()) as {
      places?: PlaceSummary[];
      error?: string;
    };

    if (response.ok && (json.places?.length ?? 0) > 0) {
      return json.places ?? [];
    }
  } catch {
    // fall through to client cache
  }

  return ensureShopsFromPlacesClient(places);
}
