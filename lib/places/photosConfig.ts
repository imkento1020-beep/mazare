/**
 * Place Photos API（getURI / place photo media）の利用可否。
 * 未設定時は false（意図しない課金を防ぐ）。本番で使う場合のみ true を明示。
 */
export function isPlacesPhotosEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_ENABLE_PLACES_PHOTOS;
  if (raw === "true" || raw === "1") return true;
  return false;
}

/**
 * 店舗詳細の cached-photo API のみ（検索・一覧とは別）。
 * サーバー env のみ。未設定時は true（1店1枚 DB キャッシュ）。
 */
export function isShopDetailPlacesPhotoFetchEnabled(): boolean {
  const server = process.env.ENABLE_PLACES_SHOP_DETAIL_PHOTOS?.trim();
  if (server === "false" || server === "0") return false;
  if (server === "true" || server === "1") return true;
  return true;
}

export function isPlacesPhotoMediaUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("places.googleapis.com/") ||
    url.includes("maps.googleapis.com/maps/api/place/photo")
  );
}
