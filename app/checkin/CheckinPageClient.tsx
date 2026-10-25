"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import GeolocationPermissionHelp from "@/components/geo/GeolocationPermissionHelp";
import { CheckinOutlineIcon } from "@/components/icons/CreateActionIcons";
import { FeedPinIcon } from "@/components/icons/FeedActionIcons";
import { createCheckin } from "@/lib/checkins/api";
import { getDisplayName, syncGuestDisplayName } from "@/lib/mypage/api";
import type { PlaceSummary } from "@/lib/places/types";
import {
  cachePlacesForPost,
  searchPlacesByTextForPostPage,
} from "@/lib/places/clientPlaces";
import { loadNearbyFromUserGesture } from "@/lib/places/loadNearbyFromUserGesture";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import { ensureAnonymousSession } from "@/lib/auth/anonymous";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";

export default function CheckinPageClient() {
  const { apiKey: mapsApiKey, loading: mapsKeyLoading } = useGoogleMapsApiKey();
  const { user, ready: authReady, authError } = useAnonymousAuth();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const [successShopName, setSuccessShopName] = useState<string | null>(null);

  const selectedPlace = useMemo(
    () => places.find((place) => place.shopId === selectedShopId) ?? null,
    [places, selectedShopId],
  );

  function handleLoadNearbyClick() {
    if (!mapsApiKey) return;
    setLoadingPlaces(true);
    setError(null);
    setLocationDenied(false);
    void loadNearbyFromUserGesture(mapsApiKey).then((result) => {
      if (result.ok) {
        setUserCoords(result.coords);
        setPlaces(result.places);
      } else if (result.kind === "denied") {
        setLocationDenied(true);
      } else {
        setError(result.message);
      }
      setLoadingPlaces(false);
    });
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;
    setLoadingPlaces(true);
    setError(null);
    try {
      const found = await searchPlacesByTextForPostPage(query, {
        apiKey: mapsApiKey,
        origin: userCoords ?? undefined,
      });
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
      if (cached.length === 0) {
        setError("該当するお店が見つかりませんでした。");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoadingPlaces(false);
    }
  }

  async function handleCheckin() {
    if (!selectedShopId || !selectedPlace) {
      setError("お店を選んでください");
      return;
    }
    if (!authReady) {
      setError("接続を準備しています。少し待ってから再度お試しください。");
      return;
    }

    setSubmitting(true);
    setError(null);

    let activeUser = user;
    if (!activeUser) {
      const session = await ensureAnonymousSession();
      activeUser = session.user;
      if (!activeUser) {
        setSubmitting(false);
        setError(
          session.error ??
            "ログインの準備に失敗しました。ページを再読み込みしてお試しください。",
        );
        return;
      }
    }

    await syncGuestDisplayName(activeUser.id, getDisplayName(activeUser));

    const { error: checkinError } = await createCheckin({
      userId: activeUser.id,
      shopId: selectedShopId,
    });

    setSubmitting(false);

    if (checkinError) {
      setError(checkinError);
      return;
    }

    setSuccessShopName(selectedPlace.name);
  }

  if (successShopName) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
        <Header />
        <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffaa00]/15 text-[#ffaa00]">
            <CheckinOutlineIcon size={32} color="#ffaa00" />
          </span>
          <h1 className="mt-6 text-xl font-black">チェックイン完了</h1>
          <p className="mt-2 text-sm text-[#9994a8]">
            {successShopName} に「今夜ここ」を記録しました。マップにも反映されます。
          </p>
          <Link
            href="/map"
            className="mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-6 py-3 text-sm font-bold text-white"
          >
            地図を見る
          </Link>
          <Link
            href="/home"
            className="mt-3 text-sm font-semibold text-[#9994a8]"
          >
            ホームへ
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] pb-28 text-[#eeeaf4] md:pb-8">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ffaa00]/15 text-[#ffaa00]">
            <CheckinOutlineIcon size={24} color="#ffaa00" />
          </span>
          <div>
            <h1 className="text-2xl font-black">チェックイン</h1>
            <p className="mt-1 text-sm text-[#9994a8]">
              写真なしで今夜のお店を記録。マップに反映されます。
            </p>
          </div>
        </div>

        {!mapsKeyLoading && !mapsApiKey && (
          <p className="mt-4 rounded-lg border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが未設定です。
          </p>
        )}
        {authReady && !user && authError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {authError}
          </p>
        )}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="お店名・エリアで検索"
            className="flex-1 rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 text-sm outline-none focus:border-[#ffaa00]/40"
          />
          <button
            type="submit"
            className="rounded-[12px] bg-[#111118] px-4 text-sm font-bold text-[#ffaa00]"
          >
            検索
          </button>
        </form>

        <button
          type="button"
          disabled={loadingPlaces || !mapsApiKey || mapsKeyLoading}
          onClick={handleLoadNearbyClick}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#ffaa00]/35 bg-[#ffaa00]/10 py-3.5 text-sm font-bold transition hover:bg-[#ffaa00]/15 disabled:opacity-50"
        >
          <FeedPinIcon size={16} color="currentColor" />
          現在地から近くのお店を表示
        </button>

        {locationDenied && <GeolocationPermissionHelp className="mt-3" />}

        <div className="mt-4 space-y-2">
          {loadingPlaces && (
            <p className="text-xs text-[#9994a8]">お店を読み込み中…</p>
          )}
          {places.map((place) => {
            const active = place.shopId === selectedShopId;
            return (
              <button
                key={place.googlePlaceId}
                type="button"
                disabled={!place.shopId}
                onClick={() => place.shopId && setSelectedShopId(place.shopId)}
                className={`w-full rounded-[12px] border p-4 text-left transition ${
                  active
                    ? "border-[#ffaa00]/50 bg-[#ffaa00]/10"
                    : "border-white/10 bg-[#111118]"
                }`}
              >
                <p className="font-bold">{place.name}</p>
                <p className="mt-1 text-xs text-[#9994a8]">{place.address}</p>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={submitting || !selectedShopId || !authReady}
          onClick={() => void handleCheckin()}
          className="mt-8 w-full rounded-[14px] bg-[#ffaa00] py-4 text-base font-black text-[#080810] disabled:opacity-50"
        >
          {!authReady
            ? "接続を準備中…"
            : submitting
              ? "チェックイン中…"
              : "このお店にチェックイン"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <GoogleAttribution className="mt-8" />
      </main>

      <BottomNav />
    </div>
  );
}
