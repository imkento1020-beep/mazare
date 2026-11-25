"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Shop } from "@/lib/home/types";
import Header from "@/components/Header";
import AppScreenHeader from "@/components/layout/AppScreenHeader";
import BottomNav from "@/components/BottomNav";
import OwnerSidebar from "./OwnerSidebar";
import { useNativeApp } from "@/hooks/useNativeApp";
import { nativeStackNavForPath } from "@/lib/navigation/stackNav";

type OwnerLayoutProps = {
  children: ReactNode;
  shop?: Shop | null;
  stats?: { views: number; interests: number; checkins: number };
  isOnboarding?: boolean;
  title?: string;
};

export default function OwnerLayout({
  children,
  shop,
  stats,
  isOnboarding = false,
  title,
}: OwnerLayoutProps) {
  const pathname = usePathname();
  const { isNative } = useNativeApp();
  const stackNav = isNative ? nativeStackNavForPath(pathname) : null;
  const stackTitle = title ?? stackNav?.title ?? "お店";

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      {stackNav ? (
        <AppScreenHeader title={stackTitle} fallbackHref={stackNav.fallbackHref} />
      ) : (
        <Header />
      )}

      <div className="mx-auto flex w-full flex-1 max-w-[480px] md:max-w-[1200px]">
        <OwnerSidebar shop={shop} stats={stats} isOnboarding={isOnboarding} />

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {title && (
            <h1 className="mb-6 text-xl font-black md:text-2xl">{title}</h1>
          )}
          <div className="md:max-w-none">{children}</div>
        </main>
      </div>

      {!isOnboarding && <BottomNav />}
      {!isOnboarding && <div className="h-[84px] md:hidden" />}
    </div>
  );
}
