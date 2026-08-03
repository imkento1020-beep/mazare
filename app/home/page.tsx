import HomePageClient from "./HomePageClient";

export default function HomePage() {
  const googleMapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? "";

  return <HomePageClient googleMapsApiKey={googleMapsApiKey} />;
}
