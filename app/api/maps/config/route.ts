import { NextResponse } from "next/server";
import {
  getBrowserGoogleMapsApiKey,
  getBrowserGoogleMapsSetupHint,
} from "@/lib/map/browser-api-key";
import { isAllowedAppApiRequest } from "@/lib/map/maps-config-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isAllowedAppApiRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apiKey = getBrowserGoogleMapsApiKey();

  return NextResponse.json(
    {
      apiKey: apiKey || null,
      setupHint: apiKey ? null : getBrowserGoogleMapsSetupHint(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
