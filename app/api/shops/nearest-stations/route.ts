import { NextResponse } from "next/server";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ensureNearestStationsForShops } from "@/lib/shops/ensureNearestStation";

export async function POST(request: Request) {
  if (!isAllowedAppApiRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { shopIds?: unknown };
  try {
    body = (await request.json()) as { shopIds?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shopIds = Array.isArray(body.shopIds)
    ? body.shopIds.map(String).filter(Boolean).slice(0, 40)
    : [];

  if (shopIds.length === 0) {
    return NextResponse.json({ stations: {} });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("shops")
      .select("id, latitude, longitude, nearest_station")
      .in("id", shopIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const stations = await ensureNearestStationsForShops(data ?? []);
    return NextResponse.json({ stations });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
