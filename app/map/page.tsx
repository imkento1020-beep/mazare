import MapPageClient from "./MapPageClient";

export const dynamic = "force-dynamic";

export default function MapPage() {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  return <MapPageClient googleMapsApiKey={googleMapsApiKey} />;
}
