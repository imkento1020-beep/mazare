import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlaceSummary } from "@/lib/places/types";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function isCacheFresh(cachedAt: string | null | undefined) {
  if (!cachedAt) return false;
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

export async function ensureShopFromPlace(
  place: PlaceSummary,
): Promise<{ shopId: string; error: string | null }> {
  try {
    const admin = createSupabaseAdminClient();

    const existing = await admin
      .from("shops")
      .select("id, cached_at")
      .eq("google_place_id", place.googlePlaceId)
      .maybeSingle();

    if (existing.error) {
      return { shopId: "", error: existing.error.message };
    }

    const payload = {
      google_place_id: place.googlePlaceId,
      name: place.name,
      address: place.address,
      genre: place.types,
      open_hours: place.openHoursText,
      cover_image: place.photoUrl,
      latitude: place.latitude,
      longitude: place.longitude,
      cached_at: new Date().toISOString(),
      owner_id: null,
    };

    if (existing.data?.id && isCacheFresh(existing.data.cached_at)) {
      return { shopId: existing.data.id, error: null };
    }

    if (existing.data?.id) {
      const updated = await admin
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

    const inserted = await admin
      .from("shops")
      .insert(payload)
      .select("id")
      .single();

    if (inserted.error) {
      return { shopId: "", error: inserted.error.message };
    }

    return { shopId: inserted.data.id, error: null };
  } catch (error) {
    return {
      shopId: "",
      error: error instanceof Error ? error.message : "店舗キャッシュに失敗しました",
    };
  }
}

export async function ensureShopsFromPlaces(places: PlaceSummary[]) {
  const results: PlaceSummary[] = [];
  for (const place of places) {
    const { shopId, error } = await ensureShopFromPlace(place);
    if (error || !shopId) continue;
    results.push({ ...place, shopId });
  }
  return results;
}
