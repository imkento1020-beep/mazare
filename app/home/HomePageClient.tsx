"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeDesktopFeed from "@/app/home/HomeDesktopFeed";
import HomeMobileReelsFeed from "@/app/home/HomeMobileReelsFeed";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import { hasCompletedGuestOnboarding } from "@/lib/onboarding/guestOnboarding";

type HomePageClientProps = {
  googleMapsApiKey: string;
};

export default function HomePageClient({
  googleMapsApiKey,
}: HomePageClientProps) {
  const router = useRouter();
  const layout = useHomeLayout();

  useEffect(() => {
    if (!hasCompletedGuestOnboarding()) {
      router.replace("/onboarding");
    }
  }, [router]);

  if (layout === "desktop") {
    return <HomeDesktopFeed googleMapsApiKey={googleMapsApiKey} />;
  }

  return <HomeMobileReelsFeed />;
}
