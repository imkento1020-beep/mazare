import { Capacitor } from "@capacitor/core";
import { hasNativeGuestBrowse, NATIVE_GUEST_BROWSE_KEY } from "@/lib/native/guestBrowse";
import { NATIVE_UA_MARKER } from "@/lib/native/constants";

export { NATIVE_UA_MARKER };

const SHELL_STORAGE_KEY = "mazare_native_shell_v1";

export function markNativeShellPersistent(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SHELL_STORAGE_KEY, "1");
  } catch {
    /* private mode 等 */
  }
}

function readNativeShellMarker(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(SHELL_STORAGE_KEY) === "1") return true;
  } catch {
    /* ignore */
  }
  if (hasNativeGuestBrowse()) return true;
  if (document.documentElement.dataset.appShell === "native") return true;
  if (navigator.userAgent.includes(NATIVE_UA_MARKER)) return true;
  return false;
}

/**
 * 本番 URL を WebView 表示する Capacitor でも、ブリッジ注入前は isNativePlatform() が
 * false になり得る。UA マーカー・永続フラグ・Capacitor オブジェクトを総合判定する。
 */
export function detectNativePlatform(): boolean {
  if (typeof window === "undefined") return false;

  if (readNativeShellMarker()) return true;

  try {
    if (Capacitor.isNativePlatform()) return true;
    const p = Capacitor.getPlatform();
    if (p === "ios" || p === "android") return true;
  } catch {
    /* ignore */
  }

  const w = window as Window & {
    Capacitor?: { isNative?: boolean; getPlatform?: () => string };
  };
  if (w.Capacitor?.isNative === true) return true;
  const injected = w.Capacitor?.getPlatform?.();
  if (injected === "ios" || injected === "android") return true;

  return false;
}

export { NATIVE_GUEST_BROWSE_KEY };

export function isNativeApp(): boolean {
  return detectNativePlatform();
}

export function nativePlatform(): "ios" | "android" | "web" {
  try {
    const p = Capacitor.getPlatform();
    if (p === "ios" || p === "android") return p;
  } catch {
    /* ignore */
  }
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "web";
}