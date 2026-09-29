import type { PlaceSummary } from "@/lib/places/types";
import {
  cachePlacesForPost,
  POST_PAGE_NEARBY_LIMIT,
  searchNearbyPlacesClient,
} from "@/lib/places/clientPlaces";

async function fetchNearbyPlacesFromServer(input: {
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  limit?: number;
}): Promise<PlaceSummary[]> {
  const response = await fetch("/api/places/nearby", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const json = (await response.json()) as {
    places?: PlaceSummary[];
    error?: string;
  };

  if (!response.ok) {
    throw new Error(json.error ?? "近くのお店の取得に失敗しました");
  }

  return json.places ?? [];
}

/** 投稿・お店ページ: クライアント Places → 失敗時はサーバー API */
export async function loadNearbyShopCandidates(
  mapsApiKey: string,
  coords: { latitude: number; longitude: number },
  limit = POST_PAGE_NEARBY_LIMIT,
): Promise<PlaceSummary[]> {
  const request = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    radiusMeters: 1200,
    limit,
  };

  try {
    const found = await searchNearbyPlacesClient(mapsApiKey, request);
    const cached = await cachePlacesForPost(found);
    if (cached.length > 0) return cached;
  } catch {
    // fall through to server-side Places (Referer 制限などの回避)
  }

  const fromServer = await fetchNearbyPlacesFromServer(request);
  if (fromServer.length === 0) {
    throw new Error(
      "近くに飲食店が見つかりませんでした。検索でお店を選んでください。",
    );
  }

  return fromServer;
}
