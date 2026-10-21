import { NextResponse } from "next/server";
import { ensureShopCachedPhotoUrl } from "@/lib/shops/cachedPhoto";

type RouteContext = { params: Promise<{ shopId: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const { shopId } = await context.params;
  if (!shopId) {
    return NextResponse.json({ error: "shopId required" }, { status: 400 });
  }

  const result = await ensureShopCachedPhotoUrl(shopId);
  if (result.error && !result.cached_photo_url) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({
    cached_photo_url: result.cached_photo_url,
    error: result.error,
  });
}
