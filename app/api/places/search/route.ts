import { NextResponse } from "next/server";
import { ensureShopsFromPlaces } from "@/lib/places/cacheShop";
import { searchPlacesByText } from "@/lib/places/googlePlaces";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json(
        { error: "2文字以上で検索してください" },
        { status: 400 },
      );
    }

    const places = await searchPlacesByText(query);
    const withShops = await ensureShopsFromPlaces(places);

    return NextResponse.json({ places: withShops });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "お店の検索に失敗しました",
      },
      { status: 500 },
    );
  }
}
