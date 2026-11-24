"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HomeDesktopFeed from "@/app/home/HomeDesktopFeed";
import HomeMobileReelsFeed from "@/app/home/HomeMobileReelsFeed";
import { useHomeLayout } from "@/hooks/useHomeLayout";
import { hasCompletedGuestOnboarding } from "@/lib/onboarding/guestOnboarding";
import { isNativeApp } from "@/lib/native/capacitor";

export default function HomePageClient() {
  const router = useRouter();
  const layout = useHomeLayout();

  useEffect(() => {
    if (isNativeApp()) return;
    if (!hasCompletedGuestOnboarding()) {
      router.replace("/onboarding");
    }
  }, [router]);

  if (layout === "desktop") {
    return <HomeDesktopFeed />;
  }

  return <HomeMobileReelsFeed />;
}
