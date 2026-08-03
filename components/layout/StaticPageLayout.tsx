import type { ReactNode } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <Header />

      <main className="flex-1 px-6 py-12 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-[#9994a8] transition hover:text-[#eeeaf4]"
          >
            ← トップへ戻る
          </Link>

          <h1 className="mt-6 text-3xl font-black tracking-tight md:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-sm text-[#9994a8]">{subtitle}</p>
          )}

          <div className="mt-10">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
