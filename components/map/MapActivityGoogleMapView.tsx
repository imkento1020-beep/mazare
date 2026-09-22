"use client";

import { useEffect, useRef, useState } from "react";
import { importLibrary } from "@googlemaps/js-api-loader";
import {
  configureGoogleMapsLoader,
  DARK_MAP_STYLES,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  getGoogleMapsApiKey,
} from "@/lib/map/google";
import { mapPinTier } from "@/lib/feed/recentFeed";

export type ActivityMapShop = {
  id: string;
  name: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  uniquePosterCount: number;
};

type MapActivityGoogleMapViewProps = {
  apiKey?: string;
  shops: ActivityMapShop[];
  selectedId?: string | null;
  focusLocation?: { lat: number; lng: number } | null;
  onSelectShop?: (shopId: string) => void;
};

function pinStyle(tier: 1 | 2 | 3, selected: boolean) {
  if (tier === 1) {
    return { scale: 12, fill: "#5a5668", stroke: selected ? "#ffffff" : "#9994a8", z: 1 };
  }
  if (tier === 2) {
    return { scale: 18, fill: "#ffaa00", stroke: "#ffffff", z: 2 };
  }
  return { scale: 26, fill: "#ff3d00", stroke: "#ffffff", z: 3 };
}

function createIcon(options: ReturnType<typeof pinStyle>) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: options.scale,
    fillColor: options.fill,
    fillOpacity: 1,
    strokeColor: options.stroke,
    strokeWeight: options.z === 3 ? 3 : 2,
  };
}

export default function MapActivityGoogleMapView({
  apiKey: apiKeyProp,
  shops,
  selectedId = null,
  focusLocation = null,
  onSelectShop,
}: MapActivityGoogleMapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const pulseRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const prevTierRef = useRef<Map<string, number>>(new Map());
  const onSelectShopRef = useRef(onSelectShop);
  const [mapReady, setMapReady] = useState(false);

  onSelectShopRef.current = onSelectShop;

  useEffect(() => {
    let cancelled = false;
    const apiKey = apiKeyProp?.trim() || getGoogleMapsApiKey();
    if (!apiKey || !containerRef.current) return;

    async function init() {
      configureGoogleMapsLoader(apiKey);
      const { Map } = await importLibrary("maps");
      if (cancelled || !containerRef.current) return;

      mapRef.current = new Map(containerRef.current, {
        center: DEFAULT_MAP_CENTER,
        zoom: DEFAULT_MAP_ZOOM,
        styles: DARK_MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        clickableIcons: false,
        backgroundColor: "#080810",
      });
      setMapReady(true);
    }

    void init();
    return () => {
      cancelled = true;
      for (const marker of markersRef.current.values()) marker.setMap(null);
      for (const marker of pulseRef.current.values()) marker.setMap(null);
      markersRef.current.clear();
      pulseRef.current.clear();
      mapRef.current = null;
      setMapReady(false);
    };
  }, [apiKeyProp]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    const visible = shops.filter((shop) => {
      const tier = mapPinTier(shop.uniquePosterCount);
      return tier > 0 && shop.latitude != null && shop.longitude != null;
    });

    const nextIds = new Set(visible.map((shop) => shop.id));

    for (const [id, marker] of markersRef.current.entries()) {
      if (!nextIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
        pulseRef.current.get(id)?.setMap(null);
        pulseRef.current.delete(id);
        prevTierRef.current.delete(id);
      }
    }

    const bounds = new google.maps.LatLngBounds();

    for (const shop of visible) {
      const tier = mapPinTier(shop.uniquePosterCount) as 1 | 2 | 3;
      const position = {
        lat: Number(shop.latitude),
        lng: Number(shop.longitude),
      };
      bounds.extend(position);

      const style = pinStyle(tier, shop.id === selectedId);
      let marker = markersRef.current.get(shop.id);

      const prevTier = prevTierRef.current.get(shop.id) ?? 0;
      if (tier > prevTier && marker) {
        const animatedScale = style.scale * 1.25;
        marker.setIcon(createIcon({ ...style, scale: animatedScale }));
        window.setTimeout(() => {
          marker?.setIcon(createIcon(style));
        }, 300);
      }
      prevTierRef.current.set(shop.id, tier);

      if (!marker) {
        marker = new google.maps.Marker({
          map,
          position,
          title: shop.name,
          icon: createIcon(style),
          zIndex: style.z,
        });
        marker.addListener("click", () => {
          onSelectShopRef.current?.(shop.id);
        });
        markersRef.current.set(shop.id, marker);
      } else {
        marker.setPosition(position);
        marker.setIcon(createIcon(style));
        marker.setZIndex(style.z);
        marker.setMap(map);
      }

      let pulse = pulseRef.current.get(shop.id);
      if (tier === 3) {
        if (!pulse) {
          pulse = new google.maps.Marker({
            map,
            position,
            clickable: false,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 34,
              fillColor: "#ff3d00",
              fillOpacity: 0.15,
              strokeWeight: 0,
            },
            zIndex: 0,
          });
          pulseRef.current.set(shop.id, pulse);
        } else {
          pulse.setPosition(position);
          pulse.setMap(map);
        }
      } else {
        pulse?.setMap(null);
        pulseRef.current.delete(shop.id);
      }
    }

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, 64);
    }
  }, [mapReady, shops, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusLocation) return;
    map.panTo(focusLocation);
    map.setZoom(Math.max(map.getZoom() ?? DEFAULT_MAP_ZOOM, 15));
  }, [focusLocation, mapReady]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
