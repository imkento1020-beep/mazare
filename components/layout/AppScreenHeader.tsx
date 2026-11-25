"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useNativeApp } from "@/hooks/useNativeApp";

type AppScreenHeaderProps = {
  title: string;
  fallbackHref?: string;
  rightSlot?: ReactNode;
  /** ネイティブ以外でも表示（規約ページなど） */
  forceShow?: boolean;
};

export default function AppScreenHeader({
  title,
  fallbackHref = "/home",
  rightSlot,
  forceShow = false,
}: AppScreenHeaderProps) {
  const router = useRouter();
  const { isNative } = useNativeApp();

  if (!isNative && !forceShow) return null;

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <header className="sticky top-0 z-[110] border-b border-white/[0.07] bg-[rgba(8,8,16,0.94)] backdrop-blur-[20px]">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center gap-2 px-3 pt-[env(safe-area-inset-top,0px)] md:px-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#111118] text-[#eeeaf4] transition active:scale-95"
          aria-label="戻る"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-5 w-5"
            aria-hidden
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="min-w-0 flex-1 truncate text-base font-bold text-[#eeeaf4]">
          {title}
        </h1>
        {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}