import { NextResponse } from "next/server";
import { getServerGoogleMapsApiKey } from "@/lib/map/server-env";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = getServerGoogleMapsApiKey();

  return NextResponse.json(
    { apiKey: apiKey || null },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
