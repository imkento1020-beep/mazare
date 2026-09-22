"use client";

import { importLibrary } from "@googlemaps/js-api-loader";
import { configureGoogleMapsLoader, getGoogleMapsApiKey } from "@/lib/map/google";
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

function mapTypesToGenre(types: string[] | undefined): string[] {
  if (!types?.length) return ["飲食店"];
  const foodish = types.filter((t) =>
    /restaurant|bar|cafe|night_club|food|meal/i.test(t),
  );
  if (foodish.length === 0) return ["飲食店"];
  return foodish.slice(0, 3).map((t) => t.replace(/_/g, " "));
}

async function getPlacesLibrary() {
  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    throw new Error(
      "Google Maps API キーが未設定です。Vercel または .env.local に NEXT_PUBLIC_GOOGLE_MAPS_API_KEY を設定してください。",
    );
  }
  configureGoogleMapsLoader(apiKey);
  return importLibrary("places");
}

async function toPlaceSummary(
  place: google.maps.places.Place,
): Promise<PlaceSummary | null> {
  await place.fetchFields({ fields: PLACE_FIELDS });

  const id = place.id?.replace(/^places\//, "") ?? place.id;
  const location = place.location;
  if (!id || !location) return null;

  const lat = location.lat();
  const lng = location.lng();

  const photoUrl =
    place.photos?.[0]?.getURI?.({ maxWidth: 800, maxHeight: 800 }) ?? null;

  const hours = place.regularOpeningHours?.weekdayDescriptions;

  return {
    googlePlaceId: id,
    name: place.displayName ?? "名称未設定",
    address: place.formattedAddress ?? "",
    latitude: lat,
    longitude: lng,
    types: mapTypesToGenre(place.types ?? undefined),
    openHoursText: hours?.length ? hours.join("\n") : null,
    photoUrl,
    shopId: null,
  };
}

export async function searchNearbyPlacesClient(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
}): Promise<PlaceSummary[]> {
  try {
    const { Place } = (await getPlacesLibrary()) as google.maps.PlacesLibrary;
    const { places } = await Place.searchNearby({
      fields: PLACE_FIELDS,
      locationRestriction: {
        center: { lat: input.latitude, lng: input.longitude },
        radius: input.radiusMeters ?? 1200,
      },
      includedPrimaryTypes: ["restaurant", "bar", "cafe", "night_club"],
      maxResultCount: 20,
      language: "ja",
      region: "jp",
    });

    const summaries = await Promise.all(places.map((place) => toPlaceSummary(place)));
    return summaries.filter((place): place is PlaceSummary => place !== null);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `近くのお店を取得できませんでした。Google Cloud で Maps JavaScript API と Places API (New) を有効化し、ブラウザ用 API キーの Referer に mazare.app を許可してください。(${detail})`,
    );
  }
}

export async function searchPlacesByTextClient(query: string): Promise<PlaceSummary[]> {
  try {
    const { Place } = (await getPlacesLibrary()) as google.maps.PlacesLibrary;
    const { places } = await Place.searchByText({
      fields: PLACE_FIELDS,
      textQuery: query,
      maxResultCount: 20,
      language: "ja",
      region: "jp",
    });

    const summaries = await Promise.all(places.map((place) => toPlaceSummary(place)));
    return summaries.filter((place): place is PlaceSummary => place !== null);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(
      `お店の検索に失敗しました。Places API (New) と Maps JavaScript API の有効化を確認してください。(${detail})`,
    );
  }
}

export async function cachePlacesOnServer(places: PlaceSummary[]) {
  const response = await fetch("/api/places/cache", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ places }),
  });

  const json = (await response.json()) as {
    places?: PlaceSummary[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(json.error ?? "お店情報の保存に失敗しました");
  }

  return json.places ?? [];
}
