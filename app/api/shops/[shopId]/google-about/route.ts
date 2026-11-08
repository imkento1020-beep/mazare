import { NextResponse } from "next/server";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";
import { fetchShopByIdFromDb } from "@/lib/home/shops";
import { fetchPlaceEditorialById } from "@/lib/places/googlePlaces";

type RouteContext = {
  params: Promise<{ shopId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isAllowedAppApiRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { shopId } = await context.params;
  const { data: shop, error } = await fetchShopByIdFromDb(shopId);

  if (error || !shop) {
    return NextResponse.json(
      { description: null, error: error ?? "店舗が見つかりません" },
      { status: 404 },
    );
  }

  const ownerText =
    typeof shop.description === "string" && shop.description.trim()
      ? shop.description.trim()
      : null;

  const googlePlaceId = shop.google_place_id?.trim();
  if (!googlePlaceId) {
    return NextResponse.json({
      description: ownerText,
      source: ownerText ? "owner" : null,
    });
  }

  const googleText = await fetchPlaceEditorialById(googlePlaceId);

  return NextResponse.json({
    description: googleText ?? ownerText,
    source: googleText ? "google" : ownerText ? "owner" : null,
  });
}
