import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * `/native/*` は Capacitor の appStartPath。UA が届かない場合でも
 * ルートヘッダーでネイティブ用 SSR（スピナーのみ）へ振り分ける。
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/native")) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-mazare-native-route", "1");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  return response;
}

export const config = {
  matcher: ["/native/:path*"],
};