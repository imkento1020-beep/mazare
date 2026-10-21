import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/home/types";

export const SHOP_SELECT_BASE =
  "id, name, address, genre, open_hours, cover_image, cover_images, owner_id, staff_ids, created_at";

export const SHOP_SELECT_WITH_COORDS = `${SHOP_SELECT_BASE}, latitude, longitude`;
export const SHOP_SELECT_WITH_COORDS_AND_STATION = `${SHOP_SELECT_WITH_COORDS}, nearest_station, cached_photo_url, google_place_id`;

function isMissingShopsColumnError(message: string, columns: string[]) {
  const normalized = message.toLowerCase();
  if (normalized.includes("column") && normalized.includes("shops")) {
    return columns.some((col) => normalized.includes(col.toLowerCase()));
  }
  return columns.some((col) => normalized.includes(col.toLowerCase()));
}

function isMissingCoordinateColumnError(message: string) {
  return isMissingShopsColumnError(message, ["latitude", "longitude"]);
}

function isMissingNearestStationColumnError(message: string) {
  return isMissingShopsColumnError(message, [
    "nearest_station",
    "cached_photo_url",
    "google_place_id",
  ]);
}

export async function fetchShopsFromDb(): Promise<{
  data: Shop[] | null;
  error: string | null;
}> {
  const withStation = await supabase
    .from("shops")
    .select(SHOP_SELECT_WITH_COORDS_AND_STATION);

  if (!withStation.error) {
    return { data: (withStation.data ?? []) as Shop[], error: null };
  }

  if (isMissingNearestStationColumnError(withStation.error.message)) {
    const withCoords = await supabase.from("shops").select(SHOP_SELECT_WITH_COORDS);
    if (!withCoords.error) {
      return { data: (withCoords.data ?? []) as Shop[], error: null };
    }
    if (isMissingCoordinateColumnError(withCoords.error.message)) {
      const fallback = await supabase.from("shops").select(SHOP_SELECT_BASE);
      if (fallback.error) {
        return { data: null, error: fallback.error.message };
      }
      return { data: (fallback.data ?? []) as Shop[], error: null };
    }
    return { data: null, error: withCoords.error.message };
  }

  const withCoords = await supabase.from("shops").select(SHOP_SELECT_WITH_COORDS);

  if (!withCoords.error) {
    return { data: (withCoords.data ?? []) as Shop[], error: null };
  }

  if (isMissingCoordinateColumnError(withCoords.error.message)) {
    const fallback = await supabase.from("shops").select(SHOP_SELECT_BASE);
    if (fallback.error) {
      return { data: null, error: fallback.error.message };
    }
    return { data: (fallback.data ?? []) as Shop[], error: null };
  }

  return { data: null, error: withCoords.error.message };
}

async function fetchShopRow(
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  fallbackQuery: PromiseLike<{ data: unknown; error: { message: string } | null }>,
) {
  const withCoords = await query;
  if (!withCoords.error) {
    return { data: withCoords.data as Shop | null, error: null as string | null };
  }

  if (isMissingCoordinateColumnError(withCoords.error.message)) {
    const fallback = await fallbackQuery;
    if (fallback.error) {
      return { data: null, error: fallback.error.message };
    }
    return { data: fallback.data as Shop | null, error: null };
  }

  return { data: null, error: withCoords.error.message };
}

export async function fetchShopByIdFromDb(id: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  return fetchShopRow(
    supabase
      .from("shops")
      .select(SHOP_SELECT_WITH_COORDS_AND_STATION)
      .eq("id", id)
      .maybeSingle(),
    supabase.from("shops").select(SHOP_SELECT_WITH_COORDS).eq("id", id).maybeSingle(),
  );
}

export async function fetchOwnerShopFromDb(ownerId: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  return fetchShopRow(
    supabase
      .from("shops")
      .select(SHOP_SELECT_WITH_COORDS)
      .eq("owner_id", ownerId)
      .maybeSingle(),
    supabase
      .from("shops")
      .select(SHOP_SELECT_BASE)
      .eq("owner_id", ownerId)
      .maybeSingle(),
  );
}

export async function fetchManagedShopFromDb(userId: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  return fetchShopRow(
    supabase
      .from("shops")
      .select(SHOP_SELECT_WITH_COORDS)
      .contains("staff_ids", [userId])
      .maybeSingle(),
    supabase
      .from("shops")
      .select(SHOP_SELECT_BASE)
      .contains("staff_ids", [userId])
      .maybeSingle(),
  );
}
