import { headers } from "next/headers";
import { NATIVE_UA_MARKER } from "@/lib/native/constants";

/**
 * ネイティブアプリ用 SSR（React ハイドレーション回避）を有効にするか。
 * - UA に MazareNative（Capacitor appendUserAgent）
 * - または middleware が付与する `/native/*` ルートフラグ
 */
export async function isNativeShellRequest(): Promise<boolean> {
  const h = await headers();
  const ua = h.get("user-agent") ?? "";
  if (ua.includes(NATIVE_UA_MARKER)) return true;
  return h.get("x-mazare-native-route") === "1";
}