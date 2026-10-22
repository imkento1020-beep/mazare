import { NextResponse } from "next/server";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";
import { ensureShopCachedPhotoUrl } from "@/lib/shops/cachedPhoto";

const SHOP_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RouteContext = { params: Promise<{ shopId: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!isAllowedAppApiRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shopId } = await context.params;
  if (!shopId || !SHOP_ID_RE.test(shopId)) {
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
