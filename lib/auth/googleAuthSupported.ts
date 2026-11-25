import { Capacitor } from "@capacitor/core";

/**
 * Google OAuth は組み込み WebView では Google 側ポリシーでブロックされることが多い。
 * ネイティブシェルではメール認証を案内し、ブラウザ（Safari/Chrome）では OAuth を許可する。
 */
export function isGoogleAuthSupported(): boolean {
  if (typeof window === "undefined") return true;
  return !Capacitor.isNativePlatform();
}