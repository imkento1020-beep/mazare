import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlaceSummary } from "@/lib/places/types";
import { ensureNearestStationForShop } from "@/lib/shops/ensureNearestStation";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type ShopCacheRow = { id: string; cached_at: string | null };

function isCacheFresh(cachedAt: string | null | undefined) {
  if (!cachedAt) return false;
  return Date.now() - new Date(cachedAt).getTime() < CACHE_TTL_MS;
}

function metadataPayload(place: PlaceSummary) {
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

function scheduleNearestStation(shopId: string, place: PlaceSummary) {
  void ensureNearestStationForShop({
    id: shopId,
    latitude: place.latitude,
    longitude: place.longitude,
    nearest_station: null,
  });
}

async function upsertShopFromPlace(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  place: PlaceSummary,
  existing: ShopCacheRow | null,
): Promise<{ shopId: string; error: string | null }> {
  const payload = metadataPayload(place);

  if (existing?.id && isCacheFresh(existing.cached_at)) {
    scheduleNearestStation(existing.id, place);
    return { shopId: existing.id, error: null };
  }

  if (existing?.id) {
    const updated = await admin
      .from("shops")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (updated.error) {
      return { shopId: "", error: updated.error.message };
    }
    scheduleNearestStation(updated.data.id, place);
    return { shopId: updated.data.id, error: null };
  }

  const inserted = await admin
    .from("shops")
    .insert({ ...payload, cover_image: null })
    .select("id")
    .single();

  if (inserted.error) {
    if (inserted.error.message.includes("duplicate")) {
      const retry = await admin
        .from("shops")
        .select("id")
        .eq("google_place_id", place.googlePlaceId)
        .maybeSingle();
      if (retry.data?.id) {
        scheduleNearestStation(retry.data.id, place);
        return { shopId: retry.data.id, error: null };
      }
    }
    return { shopId: "", error: inserted.error.message };
  }

  scheduleNearestStation(inserted.data.id, place);
  return { shopId: inserted.data.id, error: null };
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

    return upsertShopFromPlace(
      admin,
      place,
      existing.data
        ? { id: existing.data.id, cached_at: existing.data.cached_at }
        : null,
    );
  } catch (error) {
    return {
      shopId: "",
      error:
        error instanceof Error ? error.message : "店舗キャッシュに失敗しました",
    };
  }
}

export async function ensureShopsFromPlaces(places: PlaceSummary[]) {
  if (places.length === 0) return [];

  try {
    const admin = createSupabaseAdminClient();
    const googleIds = [...new Set(places.map((place) => place.googlePlaceId))];

    const { data: rows, error: fetchError } = await admin
      .from("shops")
      .select("id, google_place_id, cached_at")
      .in("google_place_id", googleIds);

    if (fetchError) {
      throw new Error(fetchError.message);
    }

    const existingByGoogleId = new Map<string, ShopCacheRow>();
    for (const row of rows ?? []) {
      if (!row.google_place_id) continue;
      existingByGoogleId.set(row.google_place_id, {
        id: row.id,
        cached_at: row.cached_at,
      });
    }

    const settled = await Promise.all(
      places.map(async (place) => {
        const existing = existingByGoogleId.get(place.googlePlaceId) ?? null;
        const { shopId } = await upsertShopFromPlace(admin, place, existing);
        if (!shopId) return null;
        return { ...place, shopId } satisfies PlaceSummary;
      }),
    );

    return settled.filter((place) => place !== null);
  } catch {
    const settled = await Promise.all(
      places.map(async (place) => {
        const { shopId, error } = await ensureShopFromPlace(place);
        if (error || !shopId) return null;
        return { ...place, shopId } satisfies PlaceSummary;
      }),
    );
    return settled.filter((place) => place !== null);
  }
}
