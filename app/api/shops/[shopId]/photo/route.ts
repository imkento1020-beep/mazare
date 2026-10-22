import { NextResponse } from "next/server";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";
import { ensureShopCachedPhotoUrl } from "@/lib/shops/cachedPhoto";

const SHOP_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ shopId: string }> };

/** 店舗詳細用: Google Place Photo をサーバー経由で1枚配信（APIキーをブラウザに出さない） */
export async function GET(request: Request, context: RouteContext) {
  if (!isAllowedAppApiRequest(request)) {
    return new NextResponse(null, { status: 403 });
  }

  const { shopId } = await context.params;
  if (!shopId || !SHOP_ID_RE.test(shopId)) {
    return new NextResponse(null, { status: 400 });
  }

  const result = await ensureShopCachedPhotoUrl(shopId);
  const photoUrl = result.cached_photo_url?.trim();
  if (!photoUrl) {
    return new NextResponse(null, { status: 404 });
  }

  if (
    photoUrl.includes(".supabase.co/storage/") ||
    (!photoUrl.includes("googleapis.com") && photoUrl.startsWith("http"))
  ) {
    return NextResponse.redirect(photoUrl, 302);
  }

  try {
    const upstream = await fetch(photoUrl, { redirect: "follow" });
    if (!upstream.ok) {
      return new NextResponse(null, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
