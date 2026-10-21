import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { fetchPlacePhotoUrlForGooglePlaceId } from "@/lib/places/fetchPlacePhotoUrl";

export async function ensureShopCachedPhotoUrl(shopId: string): Promise<{
  cached_photo_url: string | null;
  error: string | null;
}> {
  try {
    const admin = createSupabaseAdminClient();
    const { data: shop, error: readError } = await admin
      .from("shops")
      .select("id, google_place_id, cached_photo_url")
      .eq("id", shopId)
      .maybeSingle();

    if (readError) {
      return { cached_photo_url: null, error: readError.message };
    }
    if (!shop) {
      return { cached_photo_url: null, error: "店舗が見つかりません" };
    }

    const existing = shop.cached_photo_url?.trim();
    if (existing) {
      return { cached_photo_url: existing, error: null };
    }

    const googlePlaceId =
      typeof shop.google_place_id === "string" ? shop.google_place_id.trim() : "";
    if (!googlePlaceId) {
      return { cached_photo_url: null, error: null };
    }

    const photoUrl = await fetchPlacePhotoUrlForGooglePlaceId(googlePlaceId);
    if (!photoUrl) {
      return { cached_photo_url: null, error: null };
    }

    const { error: updateError } = await admin
      .from("shops")
      .update({ cached_photo_url: photoUrl })
      .eq("id", shopId);

    if (updateError) {
      return { cached_photo_url: photoUrl, error: updateError.message };
    }

    return { cached_photo_url: photoUrl, error: null };
  } catch (err) {
    return {
      cached_photo_url: null,
      error: err instanceof Error ? err.message : "写真の保存に失敗しました",
    };
  }
}
