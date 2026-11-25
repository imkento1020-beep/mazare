"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppScreenHeader from "@/components/layout/AppScreenHeader";
import { useNativeApp } from "@/hooks/useNativeApp";
import { nativeStackNavForPath } from "@/lib/navigation/stackNav";
import { usePathname } from "next/navigation";

type StaticPageLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function StaticPageLayout({
  title,
  subtitle,
  children,
}: StaticPageLayoutProps) {
  const pathname = usePathname();
  const { isNative } = useNativeApp();
  const stackNav = isNative ? nativeStackNavForPath(pathname) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      {stackNav ? (
        <AppScreenHeader title={title} fallbackHref={stackNav.fallbackHref} />
      ) : (
        <Header />
      )}

      <main className="flex-1 px-6 py-8 md:py-16">
        <div className="mx-auto max-w-3xl">
          {!isNative ? (
            <Link
              href="/home"
              className="text-sm text-[#9994a8] transition hover:text-[#eeeaf4]"
            >
              ← ホームへ戻る
            </Link>
          ) : null}

          {!stackNav ? (
            <h1 className="mt-6 text-3xl font-black tracking-tight md:mt-6 md:text-4xl">
              {title}
            </h1>
          ) : (
            <h1 className="text-2xl font-black tracking-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="mt-3 text-sm text-[#9994a8]">{subtitle}</p>
          )}

          <div className={stackNav ? "mt-6" : "mt-10"}>{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}