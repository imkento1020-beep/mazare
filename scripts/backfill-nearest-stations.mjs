/**
 * 既存 shops の nearest_station を一括取得して DB に保存する。
 * 用法: node --env-file=.env.local scripts/backfill-nearest-stations.mjs
 *
 * 必要: SUPABASE_SERVICE_ROLE_KEY, GOOGLE_MAPS_API_KEY（または Places 用キー）
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const placesKey =
  process.env.GOOGLE_PLACES_API_KEY ?? process.env.GOOGLE_MAPS_API_KEY;

if (!url || !serviceKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です");
  process.exit(1);
}
if (!placesKey) {
  console.error("GOOGLE_PLACES_API_KEY または GOOGLE_MAPS_API_KEY が必要です");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const RADIUS = 1500;
const TYPES = ["train_station", "subway_station"];

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function formatStation(name) {
  const t = name.trim();
  if (!t) return t;
  if (t.includes("駅")) return t;
  return `${t.replace(/\s*(駅|Station)\s*$/i, "").trim()}駅`;
}

async function nearestStation(lat, lng) {
  let best = null;
  let bestKm = Infinity;

  for (const includedType of TYPES) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": placesKey,
        "X-Goog-FieldMask": "places.displayName,places.location",
      },
      body: JSON.stringify({
        locationRestriction: {
          circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS },
        },
        includedTypes: [includedType],
        maxResultCount: 10,
        languageCode: "ja",
        regionCode: "JP",
      }),
    });
    if (!res.ok) continue;
    const data = await res.json();
    for (const place of data.places ?? []) {
      const plat = place.location?.latitude;
      const plng = place.location?.longitude;
      const label = place.displayName?.text;
      if (plat == null || plng == null || !label) continue;
      const km = haversineKm({ lat, lng }, { lat: plat, lng: plng });
      if (km < bestKm) {
        bestKm = km;
        best = formatStation(label);
      }
    }
  }
  return best;
}

const { data: shops, error } = await admin
  .from("shops")
  .select("id, name, latitude, longitude, nearest_station")
  .is("nearest_station", null)
  .not("latitude", "is", null)
  .not("longitude", "is", null);

if (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Backfill targets: ${shops?.length ?? 0}`);

for (const shop of shops ?? []) {
  const station = await nearestStation(Number(shop.latitude), Number(shop.longitude));
  if (!station) {
    console.warn(`skip (no station): ${shop.name}`);
    continue;
  }
  const { error: upErr } = await admin
    .from("shops")
    .update({ nearest_station: station })
    .eq("id", shop.id);
  if (upErr) console.error(shop.id, upErr.message);
  else console.log(`ok: ${shop.name} → ${station}`);
  await new Promise((r) => setTimeout(r, 120));
}

console.log("done");
