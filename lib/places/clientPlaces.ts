"use client";

import { importLibrary } from "@googlemaps/js-api-loader";
import { configureGoogleMapsLoader } from "@/lib/map/google";
import { ensureShopsFromPlacesClient } from "@/lib/places/cacheShopClient";
import type { PlaceSummary } from "@/lib/places/types";
import { labelsFromGooglePlaceTypes } from "@/lib/home/genreDisplay";
import {
  NEARBY_ALL_PRIMARY_TYPES,
  rankPlacesByNightlifeThenDistance,
  rankPlacesByTextQuery,
} from "@/lib/places/nightlifeRank";

/** 投稿画面の近くのお店候補（GPS） */
export const POST_PAGE_NEARBY_LIMIT = 8;
/** 投稿画面の検索結果上限 */
export const POST_PAGE_SEARCH_LIMIT = 20;

/** 投稿・チェックインの店舗候補（Place Photos は取得しない） */
const PLACE_FIELDS: Array<keyof google.maps.places.Place> = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "types",
  "regularOpeningHours",
];

function displayNameText(place: google.maps.places.Place) {
  const name = place.displayName;
  if (typeof name === "string") return name;
  if (name && typeof name === "object" && "text" in name) {
    return String((name as { text?: string }).text ?? "");
  }
  return "名称未設定";
}

function placeIdKey(place: google.maps.places.Place) {
  const id = place.id?.replace(/^places\//, "") ?? place.id;
  return id ?? null;
}

function rawGoogleTypes(place: google.maps.places.Place): string[] {
  return (place.types ?? []).map(String);
}

async function getPlacesLibrary(apiKey: string) {
  const trimmed = apiKey.trim();
  if (!trimmed) {
    throw new Error(
      "Google Maps API キーが読み込まれていません。/api/maps/config と GOOGLE_MAPS_BROWSER_API_KEY（Referer 制限）を確認してください。",
    );
  }
  configureGoogleMapsLoader(trimmed);
  return importLibrary("places");
}

async function summariesFromPlaces(
  places: google.maps.places.Place[],
): Promise<PlaceSummary[]> {
  const settled = await Promise.allSettled(
    places.map((place) => toPlaceSummary(place)),
  );
  return settled
    .filter(
      (result): result is PromiseFulfilledResult<PlaceSummary | null> =>
        result.status === "fulfilled",
    )
    .map((result) => result.value)
    .filter((place): place is PlaceSummary => place !== null);
}

async function toPlaceSummary(
  place: google.maps.places.Place,
): Promise<PlaceSummary | null> {
  if (!place.id || !place.location) {
    await place.fetchFields({ fields: PLACE_FIELDS });
  }

  const id = placeIdKey(place);
  const location = place.location;
  if (!id || !location) return null;

  const hours = place.regularOpeningHours?.weekdayDescriptions;

  return {
    googlePlaceId: id,
    name: displayNameText(place),
    address: place.formattedAddress ?? "",
    latitude: location.lat(),
    longitude: location.lng(),
    types: labelsFromGooglePlaceTypes(place.types ?? undefined, 3),
    openHoursText: hours?.length ? hours.join("\n") : null,
    photoUrl: null,
    shopId: null,
  };
}

function mergeGoogleTypes(
  target: Map<string, string[]>,
  placeId: string,
  types: string[],
) {
  const prev = target.get(placeId) ?? [];
  target.set(placeId, [...new Set([...prev, ...types])]);
}

async function runNearbySearch(
  Place: google.maps.PlacesLibrary["Place"],
  input: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    maxResultCount?: number;
  },
): Promise<{
  places: google.maps.places.Place[];
  googleTypesByPlaceId: Map<string, string[]>;
}> {
  const perTypeLimit = Math.min(Math.max(input.maxResultCount ?? POST_PAGE_NEARBY_LIMIT, 5), 10);
  const base = {
    fields: PLACE_FIELDS,
    locationRestriction: {
      center: { lat: input.latitude, lng: input.longitude },
      radius: input.radiusMeters ?? 1200,
    },
    maxResultCount: perTypeLimit,
    language: "ja",
    region: "jp",
  };

  const batches = await Promise.all(
    NEARBY_ALL_PRIMARY_TYPES.map(async (primaryType) => {
      try {
        const { places } = await Place.searchNearby({
          ...base,
          includedPrimaryTypes: [primaryType],
        });
        return places;
      } catch {
        return [] as google.maps.places.Place[];
      }
    }),
  );

  const byId = new Map<string, google.maps.places.Place>();
  const googleTypesByPlaceId = new Map<string, string[]>();

  for (const places of batches) {
    for (const place of places) {
      const id = placeIdKey(place);
      if (!id) continue;
      if (!byId.has(id)) byId.set(id, place);
      mergeGoogleTypes(googleTypesByPlaceId, id, rawGoogleTypes(place));
    }
  }

  if (byId.size === 0) {
    try {
      const { places } = await Place.searchNearby({
        ...base,
        includedPrimaryTypes: ["restaurant", "bar", "night_club", "cafe", "pub"],
      });
      for (const place of places) {
        const id = placeIdKey(place);
        if (!id) continue;
        if (!byId.has(id)) byId.set(id, place);
        mergeGoogleTypes(googleTypesByPlaceId, id, rawGoogleTypes(place));
      }
    } catch {
      // ignore — caller handles empty
    }
  }

  return {
    places: [...byId.values()],
    googleTypesByPlaceId,
  };
}

export async function searchNearbyPlacesClient(
  apiKey: string,
  input: {
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    limit?: number;
  },
): Promise<PlaceSummary[]> {
  const limit = input.limit ?? POST_PAGE_NEARBY_LIMIT;

  try {
    const { Place } = (await getPlacesLibrary(apiKey)) as google.maps.PlacesLibrary;
    const { places, googleTypesByPlaceId } = await runNearbySearch(Place, {
      ...input,
      maxResultCount: Math.min(Math.max(limit, 5), 10),
    });

    const filtered = await summariesFromPlaces(places);
    const ranked = rankPlacesByNightlifeThenDistance(
      filtered,
      { latitude: input.latitude, longitude: input.longitude },
      googleTypesByPlaceId,
      limit,
    );

    if (ranked.length === 0) {
      throw new Error(
        "近くに飲食店が見つかりませんでした。位置情報または検索でお店を選んでください。",
      );
    }

    return ranked;
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

async function searchPlacesByTextServer(
  query: string,
  limit: number,
  origin?: { latitude: number; longitude: number },
): Promise<PlaceSummary[] | null> {
  try {
    const response = await fetch("/api/places/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const json = (await response.json()) as {
      places?: PlaceSummary[];
      error?: string;
    };
    if (!response.ok) {
      throw new Error(json.error ?? `検索 API エラー (${response.status})`);
    }
    const places = json.places ?? [];
    return rankPlacesByTextQuery(places, query, origin ?? null, limit);
  } catch {
    return null;
  }
}

async function searchPlacesByTextClientLibrary(
  apiKey: string,
  query: string,
  limit: number,
  origin?: { latitude: number; longitude: number },
): Promise<PlaceSummary[]> {
  const capped = Math.min(Math.max(limit, 5), 20);

  const { Place } = (await getPlacesLibrary(apiKey)) as google.maps.PlacesLibrary;
  const { places } = await Place.searchByText({
    fields: PLACE_FIELDS,
    textQuery: query.trim(),
    maxResultCount: capped,
    language: "ja",
    region: "jp",
  });

  const filtered = await summariesFromPlaces(places);
  return rankPlacesByTextQuery(filtered, query, origin ?? null, capped);
}

/** 投稿・チェックイン: Google テキスト検索（サーバー API 優先） */
export async function searchPlacesByTextForPostPage(
  query: string,
  options?: {
    apiKey?: string | null;
    limit?: number;
    origin?: { latitude: number; longitude: number };
  },
): Promise<PlaceSummary[]> {
  const limit = options?.limit ?? POST_PAGE_SEARCH_LIMIT;
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const fromServer = await searchPlacesByTextServer(trimmed, limit, options?.origin);
  if (fromServer && fromServer.length > 0) {
    return fromServer;
  }

  const apiKey = options?.apiKey?.trim();
  if (!apiKey) {
    if (fromServer) return fromServer;
    throw new Error(
      "お店が見つかりませんでした。Google Maps API キーを確認するか、別のキーワードで試してください。",
    );
  }

  try {
    return await searchPlacesByTextClientLibrary(
      apiKey,
      trimmed,
      limit,
      options?.origin,
    );
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`お店の検索に失敗しました。(${detail})`);
  }
}

/** @deprecated searchPlacesByTextForPostPage を使用 */
export async function searchPlacesByTextClient(
  apiKey: string,
  query: string,
  limit = POST_PAGE_SEARCH_LIMIT,
  origin?: { latitude: number; longitude: number },
): Promise<PlaceSummary[]> {
  return searchPlacesByTextForPostPage(query, { apiKey, limit, origin });
}

const cachePlacesInflight = new Map<string, Promise<PlaceSummary[]>>();

export async function cachePlacesForPost(places: PlaceSummary[]) {
  if (places.length === 0) return [];

  const dedupeKey = places
    .map((place) => place.googlePlaceId)
    .sort()
    .join("|");
  const inflight = cachePlacesInflight.get(dedupeKey);
  if (inflight) return inflight;

  const promise = (async () => {
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
  })();

  cachePlacesInflight.set(dedupeKey, promise);
  try {
    return await promise;
  } finally {
    cachePlacesInflight.delete(dedupeKey);
  }
}
