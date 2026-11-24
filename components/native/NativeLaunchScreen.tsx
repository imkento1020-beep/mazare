"use client";

import Image from "next/image";
import { LoadingSpinner } from "@/components/layout/LoadingScreen";

export default function NativeLaunchScreen() {
  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[#080810] px-8"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="mazare を読み込んでいます"
    >
      <div className="relative mb-8 flex items-center justify-center">
        <span className="absolute h-28 w-28 animate-pulse rounded-full bg-[#ff3d00]/12" />
        <Image
          src="/mazare-logo.png"
          alt="mazare"
          width={255}
          height={52}
          priority
          className="relative h-8 w-auto"
        />
      </div>
      <LoadingSpinner size="md" />
      <p className="mt-4 text-sm font-medium text-[#9994a8]">読み込み中…</p>
    </div>
  );
}