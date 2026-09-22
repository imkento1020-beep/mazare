import { NextResponse } from "next/server";
import { ensureShopsFromPlaces } from "@/lib/places/cacheShop";
import type { PlaceSummary } from "@/lib/places/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { places?: PlaceSummary[] };
    const places = body.places ?? [];

    if (places.length === 0) {
      return NextResponse.json({ places: [] });
    }

    const withShops = await ensureShopsFromPlaces(places);
    return NextResponse.json({ places: withShops });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "お店情報の保存に失敗しました",
      },
      { status: 500 },
    );
  }
}
