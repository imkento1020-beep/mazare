import HomePageClient from "./HomePageClient";
import {
  getServerGoogleMapsApiKey,
} from "@/lib/map/server-env";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <HomePageClient googleMapsApiKey={getServerGoogleMapsApiKey()} />
  );
}
