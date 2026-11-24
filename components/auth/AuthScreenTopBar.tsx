"use client";

import { useRouter } from "next/navigation";
import { useNativeApp } from "@/hooks/useNativeApp";

type AuthScreenTopBarProps = {
  title?: string;
};

export default function AuthScreenTopBar({ title }: AuthScreenTopBarProps) {
  const router = useRouter();
  const { isNative } = useNativeApp();

  if (!isNative) return null;

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace("/native/welcome");
  }

  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={handleBack}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#111118] text-[#eeeaf4] transition active:scale-95"
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
      {title ? (
        <h1 className="text-lg font-semibold text-[#eeeaf4]">{title}</h1>
      ) : null}
    </div>
  );
}