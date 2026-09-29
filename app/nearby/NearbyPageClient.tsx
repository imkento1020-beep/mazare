"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import type { PlaceSummary } from "@/lib/places/types";
import {
  cachePlacesForPost,
  POST_PAGE_NEARBY_LIMIT,
  POST_PAGE_SEARCH_LIMIT,
  searchNearbyPlacesClient,
  searchPlacesByTextClient,
} from "@/lib/places/clientPlaces";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import {
  formatDistanceLabel,
  haversineDistanceKm,
} from "@/lib/geo/haversine";
type NearbyPageClientProps = {
  googleMapsApiKey: string;
  setupHint: string;
};

export default function NearbyPageClient({
  googleMapsApiKey,
  setupHint,
}: NearbyPageClientProps) {
  const { apiKey: mapsApiKey, loading: mapsKeyLoading } =
    useGoogleMapsApiKey(googleMapsApiKey);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNearby = useCallback(async () => {
    if (!mapsApiKey) return;

    setLoadingPlaces(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserCoords(coords);

      const found = await searchNearbyPlacesClient(mapsApiKey, {
        ...coords,
        limit: POST_PAGE_NEARBY_LIMIT,
      });
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "位置情報またはお店の取得に失敗しました",
      );
    } finally {
      setLoadingPlaces(false);
    }
  }, [mapsApiKey]);

  useEffect(() => {
    if (mapsKeyLoading || !mapsApiKey) return;
    void loadNearby();
  }, [mapsKeyLoading, mapsApiKey, loadNearby]);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!mapsApiKey || !query) return;

    setLoadingPlaces(true);
    setError(null);
    try {
      const found = await searchPlacesByTextClient(
        mapsApiKey,
        query,
        POST_PAGE_SEARCH_LIMIT,
        userCoords ?? undefined,
      );
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoadingPlaces(false);
    }
  }

  const placesWithDistance = useMemo(
    () =>
      places.map((place) => ({
        place,
        distanceKm: userCoords
          ? haversineDistanceKm(userCoords, {
              latitude: place.latitude,
              longitude: place.longitude,
            })
          : null,
      })),
    [places, userCoords],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] pb-24 text-[#eeeaf4]">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <h1 className="text-2xl font-black">近くのお店</h1>
        <p className="mt-2 text-sm text-[#9994a8]">
          居酒屋・バーなどを優先し、同じ優先度内では近い順に最大
          {POST_PAGE_NEARBY_LIMIT}件。ほかのお店は検索してください。
        </p>

        {!mapsKeyLoading && !mapsApiKey && (
          <p className="mt-3 rounded-lg border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが読み込まれていません。{setupHint}
          </p>
        )}

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="お店名・エリアで検索"
            className="flex-1 rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 text-sm outline-none focus:border-[#ff3d00]/40"
          />
          <button
            type="submit"
            className="rounded-[12px] bg-[#111118] px-4 text-sm font-bold text-[#ff3d00]"
          >
            検索
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
            一覧
          </p>
          <button
            type="button"
            onClick={() => void loadNearby()}
            disabled={loadingPlaces || !mapsApiKey}
            className="text-[11px] font-semibold text-[#ff3d00] disabled:opacity-50"
          >
            現在地で更新
          </button>
        </div>

        {loadingPlaces && (
          <p className="mt-3 text-xs text-[#9994a8]">お店を読み込み中…</p>
        )}

        {error && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {error}
          </p>
        )}

        <ul className="mt-3 space-y-2">
          {placesWithDistance.map(({ place, distanceKm }) => {
            const distanceLabel =
              distanceKm != null ? formatDistanceLabel(distanceKm) : null;

            const inner = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold">{place.name}</p>
                  {distanceLabel && (
                    <span className="shrink-0 text-[11px] font-semibold text-[#ffaa00]">
                      {distanceLabel}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-[#9994a8]">{place.address}</p>
              </>
            );

            if (place.shopId) {
              return (
                <li key={place.googlePlaceId}>
                  <Link
                    href={`/shop/${place.shopId}`}
                    className="block rounded-[12px] border border-white/10 bg-[#111118] p-4 transition hover:border-[#ff3d00]/30"
                  >
                    {inner}
                  </Link>
                </li>
              );
            }

            return (
              <li
                key={place.googlePlaceId}
                className="rounded-[12px] border border-white/10 bg-[#111118] p-4 opacity-70"
              >
                {inner}
              </li>
            );
          })}
        </ul>

        {!loadingPlaces && places.length === 0 && !error && (
          <p className="mt-6 text-center text-sm text-[#9994a8]">
            お店が見つかりませんでした
          </p>
        )}

        <div className="mt-8">
          <GoogleAttribution />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
