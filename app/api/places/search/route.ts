import { NextResponse } from "next/server";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";
import { ensureShopsFromPlaces } from "@/lib/places/cacheShop";
import { placesSearchFromAreaFilters } from "@/lib/geo/tokyoDrinkingAreas";
import { searchPlacesByText } from "@/lib/places/googlePlaces";

export async function POST(request: Request) {
  if (!isAllowedAppApiRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as {
      query?: string;
      areaIds?: string[];
    };
    const areas = new Set(
      (body.areaIds ?? []).filter(
        (id) => id && id !== "すべて" && id !== "その他",
      ),
    );
    const { textQuery, locationBias } = placesSearchFromAreaFilters(
      body.query?.trim() ?? "",
      areas,
    );

    if (textQuery.length < 2) {
      return NextResponse.json(
        { error: "2文字以上で検索してください" },
        { status: 400 },
      );
    }

    const places = await searchPlacesByText(textQuery, {
      locationBias,
    });
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
