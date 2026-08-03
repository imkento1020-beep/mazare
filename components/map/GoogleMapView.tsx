"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import {
  DARK_MAP_STYLES,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getGoogleMapsApiKey,
} from "@/lib/map/google";
import {
  fitMapToLocations,
  focusMapOnShop,
  geocodeShopAddresses,
  type ShopLocation,
} from "@/lib/map/geocode";

type GoogleMapViewProps = {
  apiKey?: string;
  className?: string;
  preview?: boolean;
  onLoadError?: () => void;
  shops: Array<{
    id: string;
    name: string;
    address: string;
    live: boolean;
  }>;
  selectedId?: string | null;
  focusLocation?: { lat: number; lng: number } | null;
  onSelectShop?: (shopId: string) => void;
};

function createMarkerIcon(options: {
  live: boolean;
  selected: boolean;
  preview: boolean;
}): google.maps.Symbol {
  const { live, selected, preview } = options;

  let fillColor = "#5a5668";
  if (selected) fillColor = "#ffaa00";
  else if (live) fillColor = "#ff3d00";

  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: selected ? 14 : preview ? 8 : live ? 11 : 9,
    fillColor,
    fillOpacity: 1,
    strokeColor: selected ? "#ffffff" : live ? "#ffffff" : "#9994a8",
    strokeWeight: selected ? 3 : preview ? 1.5 : 2,
  };
}

export default function GoogleMapView({
  apiKey: apiKeyProp,
  className = "",
  preview = false,
  onLoadError,
  shops,
  selectedId = null,
  focusLocation = null,
  onSelectShop,
}: GoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const locationsRef = useRef<ShopLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiKey = apiKeyProp?.trim() || getGoogleMapsApiKey();

    if (!apiKey) {
      setError("Google Maps API キーが未設定です");
      setLoading(false);
      onLoadError?.();
      return;
    }

    if (!containerRef.current) return;

    function handleAuthFailure() {
      if (cancelled) return;
      setError(
        "APIキーの認証に失敗しました。HTTPリファラー制限・API有効化・請求設定を確認してください。",
      );
      setLoading(false);
      onLoadError?.();
    }

    window.gm_authFailure = handleAuthFailure;

    async function initMap() {
      try {
        setOptions({
          key: apiKey,
          v: "weekly",
          language: "ja",
          region: "JP",
        });

        const { Map } = await importLibrary("maps");
        const { Geocoder } = await importLibrary("geocoding");

        if (cancelled || !containerRef.current) return;

        const map = new Map(containerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: preview ? 13 : DEFAULT_MAP_ZOOM,
          styles: DARK_MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: !preview,
          fullscreenControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          gestureHandling: preview ? "none" : "auto",
          clickableIcons: !preview,
          backgroundColor: "#080810",
        });

        mapRef.current = map;

        // レイアウト確定後に地図サイズを再計算
        requestAnimationFrame(() => {
          if (!cancelled && mapRef.current) {
            google.maps.event.trigger(mapRef.current, "resize");
            mapRef.current.setCenter(DEFAULT_MAP_CENTER);
          }
        });

        const geocoder = new Geocoder();
        let locations: ShopLocation[] = [];
        try {
          locations =
            shops.length > 0
              ? await geocodeShopAddresses(geocoder, shops)
              : [];
        } catch {
          // Geocoding が失敗しても地図自体は表示する
        }

        if (cancelled) return;

        locationsRef.current = locations;
        markersRef.current.clear();
        for (const location of locations) {
          const live = shops.find((shop) => shop.id === location.shopId)?.live ?? false;
          const marker = new google.maps.Marker({
            map,
            position: { lat: location.lat, lng: location.lng },
            title: location.name,
            icon: createMarkerIcon({
              live,
              selected: false,
              preview,
            }),
          });

          if (!preview && onSelectShop) {
            marker.addListener("click", () => onSelectShop(location.shopId));
          }
          markersRef.current.set(location.shopId, marker);
        }

        fitMapToLocations(map, locations);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Google Maps の読み込みに失敗しました",
        );
        setLoading(false);
        onLoadError?.();
      }
    }

    initMap();

    return () => {
      cancelled = true;
      delete window.gm_authFailure;
      for (const marker of markersRef.current.values()) {
        marker.setMap(null);
      }
      markersRef.current.clear();
      mapRef.current = null;
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
    };
  }, [apiKeyProp, preview, shops, onSelectShop, onLoadError]);

  useEffect(() => {
    if (preview || loading || !selectedId || !mapRef.current) return;

    const location = locationsRef.current.find(
      (item) => item.shopId === selectedId,
    );
    if (!location) return;

    focusMapOnShop(mapRef.current, location);
  }, [selectedId, loading, preview]);

  useEffect(() => {
    if (preview || loading || !focusLocation || !mapRef.current) return;

    focusMapOnShop(mapRef.current, focusLocation);

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        map: mapRef.current,
        position: focusLocation,
        title: "現在地",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#00e87a",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: 4,
      });
      return;
    }

    userMarkerRef.current.setPosition(focusLocation);
    userMarkerRef.current.setMap(mapRef.current);
  }, [focusLocation, loading, preview]);

  useEffect(() => {
    if (preview) return;
    const container = containerRef.current;
    const map = mapRef.current;
    if (!container || !map) return;

    const observer = new ResizeObserver(() => {
      google.maps.event.trigger(map, "resize");
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [loading, error]);

  useEffect(() => {
    for (const [shopId, marker] of markersRef.current.entries()) {
      const live = shops.find((shop) => shop.id === shopId)?.live ?? false;
      const selected = shopId === selectedId;

      marker.setIcon(
        createMarkerIcon({ live, selected, preview }),
      );
      marker.setZIndex(selected ? 3 : live ? 1 : 0);
    }
  }, [selectedId, shops, preview]);

  if (error) {
    if (preview) return null;
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#0d0d18] px-6 text-center">
        <p className="text-sm font-semibold text-[#eeeaf4]">
          地図を表示できません
        </p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#9994a8]">
          {error}
        </p>
        <p className="mt-4 max-w-sm text-left text-[11px] leading-relaxed text-[#5a5668]">
          1. Google Cloud Console で「Maps JavaScript API」を有効化
          <br />
          2. ブラウザ用 API キーを作成
          <br />
          3. `.env.local` に{" "}
          <code className="text-[#9994a8]">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
          </code>
          を追加
          <br />
          4. 開発サーバーを再起動
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full ${preview ? "min-h-0" : "min-h-[50dvh]"} ${className}`}
    >
      <div ref={containerRef} className="absolute inset-0" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#080810]/80">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
        </div>
      )}
    </div>
  );
}
