import { NextResponse } from "next/server";
import { ensureShopsFromPlaces } from "@/lib/places/cacheShop";
import { searchNearbyPlaces } from "@/lib/places/googlePlaces";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      latitude?: number;
      longitude?: number;
      radiusMeters?: number;
    };

    if (body.latitude == null || body.longitude == null) {
      return NextResponse.json(
        { error: "latitude と longitude が必要です" },
        { status: 400 },
      );
    }

    const places = await searchNearbyPlaces({
      latitude: body.latitude,
      longitude: body.longitude,
      radiusMeters: body.radiusMeters,
    });

    const withShops = await ensureShopsFromPlaces(places);

    return NextResponse.json({ places: withShops });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "近くのお店の取得に失敗しました",
      },
      { status: 500 },
    );
  }
}
