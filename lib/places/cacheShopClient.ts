import { supabase } from "@/lib/supabase";
import type { PlaceSummary } from "@/lib/places/types";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

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
    cover_image: place.photoUrl,
    latitude: place.latitude,
    longitude: place.longitude,
    cached_at: new Date().toISOString(),
    owner_id: null as string | null,
  };
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

  const payload = placePayload(place);

  if (existing.data?.id && isCacheFresh(existing.data.cached_at)) {
    return { shopId: existing.data.id, error: null };
  }

  if (existing.data?.id) {
    const updated = await supabase
      .from("shops")
      .update(payload)
      .eq("id", existing.data.id)
      .select("id")
      .single();
    if (updated.error) {
      return { shopId: "", error: updated.error.message };
    }
    return { shopId: updated.data.id, error: null };
  }

  const inserted = await supabase
    .from("shops")
    .insert(payload)
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

export async function ensureShopsFromPlacesClient(places: PlaceSummary[]) {
  const results: PlaceSummary[] = [];
  const errors: string[] = [];

  for (const place of places) {
    const { shopId, error } = await ensureShopFromPlaceClient(place);
    if (error) errors.push(error);
    if (shopId) results.push({ ...place, shopId });
  }

  if (results.length === 0 && errors.length > 0) {
    throw new Error(errors[0]);
  }

  return results;
}
