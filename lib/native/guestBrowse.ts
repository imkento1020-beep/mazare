/** ネイティブアプリで「ゲストのまま見る」を選んだときに true */
export const NATIVE_GUEST_BROWSE_KEY = "mazare_native_guest_browse_v1";

export function hasNativeGuestBrowse(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(NATIVE_GUEST_BROWSE_KEY) === "1";
}

export function enableNativeGuestBrowse(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(NATIVE_GUEST_BROWSE_KEY, "1");
}