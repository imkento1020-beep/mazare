"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  fetchAllShops,
  fetchLatestVibePostsByShop,
  fetchLiveShopIds,
  type LatestVibePost,
} from "@/lib/home/api";
import type { Shop } from "@/lib/home/types";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleMapView from "@/components/map/GoogleMapView";
import MapShopCarousel from "@/components/map/MapShopCarousel";
import MapShopPopup from "@/components/map/MapShopPopup";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";

type MapPageClientProps = {
  googleMapsApiKey: string;
  setupHint: string;
};

export default function MapPageClient({
  googleMapsApiKey,
  setupHint,
}: MapPageClientProps) {
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [liveIds, setLiveIds] = useState<Set<string>>(new Set());
  const [latestPosts, setLatestPosts] = useState<Map<string, LatestVibePost>>(
    new Map(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { apiKey: resolvedMapsApiKey, loading: mapsKeyLoading } =
    useGoogleMapsApiKey(googleMapsApiKey);
  const hasGoogleMapsKey = resolvedMapsApiKey.length > 0;

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const [shopsResult, liveShopIds, postsByShop] = await Promise.all([
        fetchAllShops(),
        fetchLiveShopIds(),
        fetchLatestVibePostsByShop(),
      ]);

      if (shopsResult.error) {
        setLoadError(shopsResult.error);
      }

      setShops(shopsResult.data ?? []);
      setLiveIds(liveShopIds);
      setLatestPosts(postsByShop);
      setLoading(false);
    }

    load();
  }, [router]);

  const mapShops = useMemo(
    () =>
      shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        address: shop.address,
        live: liveIds.has(shop.id),
        latitude: shop.latitude,
        longitude: shop.longitude,
      })),
    [shops, liveIds],
  );

  const selectedShop = shops.find((shop) => shop.id === selectedId) ?? null;

  function handleSelectShop(shopId: string) {
    setSelectedId(shopId);
    setPopupOpen(true);
  }

  function handleCurrentLocation() {
    if (!navigator.geolocation) {
      setLocationError("お使いのブラウザは位置情報に対応していません");
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLocationError("位置情報を取得できませんでした。設定を確認してください");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <Header />

      <div className="relative min-h-0 flex-1 basis-0">
        <GoogleMapView
          apiKey={resolvedMapsApiKey}
          shops={mapShops}
          selectedId={selectedId}
          focusLocation={userLocation}
          onSelectShop={handleSelectShop}
        />

        {!mapsKeyLoading && !hasGoogleMapsKey && (
          <div className="pointer-events-none absolute inset-x-4 top-4 z-10 rounded-xl border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが読み込まれていません。
            {setupHint}
          </div>
        )}

        {loadError && (
          <div className="absolute inset-x-4 top-4 z-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            お店の読み込みに失敗しました: {loadError}
          </div>
        )}

        {locationError && (
          <div className="absolute inset-x-4 top-16 z-10 rounded-xl border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            {locationError}
          </div>
        )}

        {popupOpen && selectedShop && (
          <MapShopPopup
            shop={selectedShop}
            live={liveIds.has(selectedShop.id)}
            latestPost={latestPosts.get(selectedShop.id)}
            onClose={() => setPopupOpen(false)}
          />
        )}

        <button
          type="button"
          className="absolute bottom-[168px] right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#111118]/95 text-lg shadow-lg backdrop-blur-md md:bottom-[132px]"
          aria-label="現在地"
          onClick={handleCurrentLocation}
        >
          📍
        </button>

        <MapShopCarousel
          shops={shops}
          liveIds={liveIds}
          selectedId={selectedId}
          latestPosts={latestPosts}
          onSelectShop={handleSelectShop}
        />
      </div>

      <BottomNav />
    </div>
  );
}
