import MapPageClient from "./MapPageClient";
import { getGoogleMapsSetupHint } from "@/lib/map/server-env";

export const dynamic = "force-dynamic";

export default function MapPage() {
  return <MapPageClient setupHint={getGoogleMapsSetupHint()} />;
}
