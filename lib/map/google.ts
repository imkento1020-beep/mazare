import { setOptions } from "@googlemaps/js-api-loader";

/** 渋谷駅付近 — 東京エリアのデフォルト中心 */
export const DEFAULT_MAP_CENTER = { lat: 35.6595, lng: 139.7005 };

export const DEFAULT_MAP_ZOOM = 14;

export function getGoogleMapsApiKey(fallback = "") {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ||
    fallback ||
    ""
  );
}

export function isGoogleMapsConfigured() {
  return getGoogleMapsApiKey().length > 0;
}

let loaderConfigured = false;

export function configureGoogleMapsLoader(apiKey: string) {
  if (loaderConfigured || !apiKey) return;
  setOptions({
    key: apiKey,
    v: "weekly",
    language: "ja",
    region: "JP",
  });
  loaderConfigured = true;
}

/** mazare のダークテーマに合わせた地図スタイル */
export const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d0d18" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#9994a8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#080810" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#18181f" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111118" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#060610" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
];
