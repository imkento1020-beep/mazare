import { supabase } from "@/lib/supabase";
import type { PlaceSummary } from "@/lib/places/types";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type ShopCacheRow = { id: string; cached_at: string | null };

function isCacheFresh(cachedAt: string | null | undefined) {
  if (!cachedAt) return false;
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

function placePayload(place: PlaceSummary) {
  return {
    google_place_id: place.googlePlaceId,
    name: place.name,
    address: place.address,
    genre: place.types,
    open_hours: place.openHoursText,
    latitude: place.latitude,
    longitude: place.longitude,
    cached_at: new Date().toISOString(),
    owner_id: null as string | null,
  };
}

async function upsertShopFromPlaceClient(
  place: PlaceSummary,
  existing: ShopCacheRow | null,
): Promise<{ shopId: string; error: string | null }> {
  const payload = placePayload(place);

  if (existing?.id && isCacheFresh(existing.cached_at)) {
    return { shopId: existing.id, error: null };
  }

  if (existing?.id) {
    const updated = await supabase
      .from("shops")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (updated.error) {
      return { shopId: "", error: updated.error.message };
    }
    return { shopId: updated.data.id, error: null };
  }

  const inserted = await supabase
    .from("shops")
    .insert({ ...payload, cover_image: null })
    .select("id")
    .single();

  if (inserted.error) {
    if (inserted.error.message.includes("duplicate")) {
      const retry = await supabase
        .from("shops")
        .select("id")
        .eq("google_place_id", place.googlePlaceId)
        .maybeSingle();
      if (retry.data?.id) {
        return { shopId: retry.data.id, error: null };
      }
    }
    return { shopId: "", error: inserted.error.message };
  }

  return { shopId: inserted.data.id, error: null };
}

export async function ensureShopFromPlaceClient(
  place: PlaceSummary,
): Promise<{ shopId: string; error: string | null }> {
  const existing = await supabase
    .from("shops")
    .select("id, cached_at")
    .eq("google_place_id", place.googlePlaceId)
    .maybeSingle();

  if (existing.error) {
    return { shopId: "", error: existing.error.message };
  }

  return upsertShopFromPlaceClient(
    place,
    existing.data
      ? { id: existing.data.id, cached_at: existing.data.cached_at }
      : null,
  );
}

export async function ensureShopsFromPlacesClient(places: PlaceSummary[]) {
  if (places.length === 0) return [];

  const googleIds = [...new Set(places.map((place) => place.googlePlaceId))];
  const { data: rows, error: fetchError } = await supabase
    .from("shops")
    .select("id, google_place_id, cached_at")
    .in("google_place_id", googleIds);

  const existingByGoogleId = new Map<string, ShopCacheRow>();
  if (!fetchError) {
    for (const row of rows ?? []) {
      if (!row.google_place_id) continue;
      existingByGoogleId.set(row.google_place_id, {
        id: row.id,
        cached_at: row.cached_at,
      });
    }
  }

  const settled = await Promise.all(
    places.map(async (place) => {
      const existing = fetchError
        ? null
        : (existingByGoogleId.get(place.googlePlaceId) ?? null);
      const { shopId, error } = fetchError
        ? await ensureShopFromPlaceClient(place)
        : await upsertShopFromPlaceClient(place, existing);
      if (error && !shopId) return { place: null, error };
      if (!shopId) return { place: null, error: null };
      return { place: { ...place, shopId }, error: null };
    }),
  );

  const results = settled
    .map((entry) => entry.place)
    .filter((place) => place !== null);
  const errors = settled
    .map((entry) => entry.error)
    .filter((message): message is string => Boolean(message));

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results;
}
