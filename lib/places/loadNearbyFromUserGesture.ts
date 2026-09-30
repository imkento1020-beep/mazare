import {
  getDevicePositionOnUserGesture,
  isGeolocationDeniedError,
  type DeviceCoords,
} from "@/lib/geo/getDevicePosition";
import { loadNearbyShopCandidates } from "@/lib/places/loadNearbyShops";
import type { PlaceSummary } from "@/lib/places/types";

export type LoadNearbyFromGestureResult =
  | { ok: true; coords: DeviceCoords; places: PlaceSummary[] }
  | { ok: false; kind: "denied" }
  | { ok: false; kind: "error"; message: string };

/** タップ直後に GPS → 近くの店。getCurrentPosition は呼び出し元の同期スタックから開始すること。 */
export async function loadNearbyFromUserGesture(
  mapsApiKey: string,
): Promise<LoadNearbyFromGestureResult> {
  const coordsPromise = getDevicePositionOnUserGesture();

  try {
    const coords = await coordsPromise;
    const places = await loadNearbyShopCandidates(mapsApiKey, coords);
    return { ok: true, coords, places };
  } catch (error) {
    if (isGeolocationDeniedError(error)) {
      return { ok: false, kind: "denied" };
    }
    const message =
      error instanceof Error
        ? error.message
        : "位置情報またはお店の取得に失敗しました";
    return { ok: false, kind: "error", message };
  }
}
