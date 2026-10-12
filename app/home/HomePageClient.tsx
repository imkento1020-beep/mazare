"use client";

import HomeDesktopFeed from "@/app/home/HomeDesktopFeed";
import HomeMobileReelsFeed from "@/app/home/HomeMobileReelsFeed";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useHomeLayout } from "@/hooks/useHomeLayout";

type HomePageClientProps = {
  googleMapsApiKey: string;
};

export default function HomePageClient({
  googleMapsApiKey,
}: HomePageClientProps) {
  const layout = useHomeLayout();

  if (layout === null) {
    return <LoadingScreen />;
  }

  if (layout === "desktop") {
    return <HomeDesktopFeed googleMapsApiKey={googleMapsApiKey} />;
  }

  return <HomeMobileReelsFeed />;
}
