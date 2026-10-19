import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { resolveNearestTrainStationName } from "@/lib/places/nearestTrainStation";
import type { Shop } from "@/lib/home/types";

export async function ensureNearestStationForShop(
  shop: Pick<Shop, "id" | "latitude" | "longitude" | "nearest_station">,
): Promise<string | null> {
  const cached = shop.nearest_station?.trim();
  if (cached) return cached;

  if (shop.latitude == null || shop.longitude == null) return null;

  const station = await resolveNearestTrainStationName({
    latitude: Number(shop.latitude),
    longitude: Number(shop.longitude),
  });

  if (!station) return null;

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin
      .from("shops")
      .update({ nearest_station: station })
      .eq("id", shop.id);

    if (error) {
      console.warn("ensureNearestStationForShop update:", error.message);
    }
  } catch (err) {
    console.warn(
      "ensureNearestStationForShop:",
      err instanceof Error ? err.message : err,
    );
  }

  return station;
}

export async function ensureNearestStationsForShops(
  shops: Pick<Shop, "id" | "latitude" | "longitude" | "nearest_station">[],
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  const targets = shops.filter(
    (shop) =>
      !shop.nearest_station?.trim() &&
      shop.latitude != null &&
      shop.longitude != null,
  );

  for (const shop of targets) {
    const station = await ensureNearestStationForShop(shop);
    if (station) result[shop.id] = station;
  }

  for (const shop of shops) {
    const cached = shop.nearest_station?.trim();
    if (cached) result[shop.id] = cached;
  }

  return result;
}
