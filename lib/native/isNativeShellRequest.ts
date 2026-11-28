import { headers } from "next/headers";
import { NATIVE_UA_MARKER } from "@/lib/native/constants";

/** Capacitor WebView（appendUserAgent: MazareNative）からのリクエストか */
export async function isNativeShellRequest(): Promise<boolean> {
  const ua = (await headers()).get("user-agent") ?? "";
  return ua.includes(NATIVE_UA_MARKER);
}