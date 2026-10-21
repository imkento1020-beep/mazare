import { isPlacesPhotosEnabled } from "@/lib/places/photosConfig";
import { fetchPlaceById } from "@/lib/places/googlePlaces";

/** 店舗詳細用: Place Photos media URL を1回だけ取得（フラグ off なら null） */
export async function fetchPlacePhotoUrlForGooglePlaceId(
  googlePlaceId: string,
): Promise<string | null> {
  if (!isPlacesPhotosEnabled()) return null;
  if (!googlePlaceId.trim()) return null;

  const place = await fetchPlaceById(googlePlaceId, { includePhoto: true });
  return place?.photoUrl ?? null;
}
