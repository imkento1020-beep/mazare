import NearbyPageClient from "./NearbyPageClient";
import {
  getGoogleMapsSetupHint,
  getServerGoogleMapsApiKey,
} from "@/lib/map/server-env";

export const metadata = {
  title: "近くのお店 | mazare",
  description: "現在地の近くにある飲食店を距離順で表示",
};

export default function NearbyPage() {
  return (
    <NearbyPageClient
      googleMapsApiKey={getServerGoogleMapsApiKey()}
      setupHint={getGoogleMapsSetupHint()}
    />
  );
}
