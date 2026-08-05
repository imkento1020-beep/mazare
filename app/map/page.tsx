import MapPageClient from "./MapPageClient";
import {
  getGoogleMapsSetupHint,
  getServerGoogleMapsApiKey,
} from "@/lib/map/server-env";

export const dynamic = "force-dynamic";

export default function MapPage() {
  return (
    <MapPageClient
      googleMapsApiKey={getServerGoogleMapsApiKey()}
      setupHint={getGoogleMapsSetupHint()}
    />
  );
}
