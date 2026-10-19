"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MazareLogo from "@/components/MazareLogo";
import {
  CheckinOutlineIcon,
  PostOutlineIcon,
} from "@/components/icons/CreateActionIcons";
import {
  hasCompletedGuestOnboarding,
  markGuestOnboardingCompleted,
} from "@/lib/onboarding/guestOnboarding";

const SLIDES = [
  {
    id: "post",
    kicker: "01 · 投稿",
    title: "今夜の一杯を、\nその場でシェア",
    body: "お店の写真や動画を投稿すると、「楽しそう」と感じた人が自然と集まってきます。",
    accent: "#ff3d00",
    Icon: PostOutlineIcon,
    mock: (
      <div className="relative mx-auto aspect-[4/5] w-[min(72vw,280px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] shadow-[0_24px_64px_rgba(255,61,0,0.2)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff3d00]/25 via-transparent to-[#080810]" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080810] via-[#080810]/80 to-transparent p-4 pt-16">
          <p className="text-xs font-bold text-[#ffaa00]">今夜3杯目 · ハイボール</p>
          <p className="mt-1 text-sm font-black text-[#eeeaf4]">渋谷 · 立ち飲みバー</p>
          <p className="mt-2 line-clamp-2 text-[11px] text-[#9994a8]">
            カウンター空いてて雰囲気最高 #渋谷 #今夜
          </p>
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff3d00] text-xs font-bold text-white">
            K
          </span>
          <span className="text-xs font-semibold text-white/90">kento</span>
        </div>
      </div>
    ),
  },
  {
    id: "checkin",
    kicker: "02 · チェックイン",
    title: "写真がなくても、\n今夜の記録は残る",
    body: "チェックインだけでも飲みログに残り、マップに「今夜ここにいる」が反映されます。",
    accent: "#ffaa00",
    Icon: CheckinOutlineIcon,
    mock: (
      <div className="relative mx-auto aspect-[4/5] w-[min(72vw,280px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] shadow-[0_24px_64px_rgba(255,170,0,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,170,0,0.18),transparent_55%)]" />
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#ffaa00]/50 bg-[#ffaa00]/10">
            <CheckinOutlineIcon size={32} color="#ffaa00" />
          </span>
          <p className="text-center text-sm font-black text-[#eeeaf4]">
            今ここにチェックイン
          </p>
          <div className="w-full rounded-xl border border-white/10 bg-[#111118]/90 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#5a5668]">
              今夜のマップ
            </p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={`h-2 flex-1 rounded-full ${n === 2 ? "bg-[#ffaa00]" : "bg-[#ff3d00]/40"}`}
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#9994a8]">
              お店の盛り上がりと一緒に表示
            </p>
          </div>
        </div>
      </div>
    ),
  },
] as const;

export default function GuestOnboardingClient() {
  const router = useRouter();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (hasCompletedGuestOnboarding()) {
      router.replace("/home");
    }
  }, [router]);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  function finish() {
    markGuestOnboardingCompleted();
    router.replace("/home");
  }

  function handleNext() {
    if (isLast) finish();
    else setIndex((i) => i + 1);
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
      <header className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <MazareLogo href="/home" size="sm" />
        <button
          type="button"
          onClick={finish}
          className="rounded-lg px-3 py-2 text-sm font-semibold text-[#9994a8]"
        >
          スキップ
        </button>
      </header>

      <div className="flex flex-1 flex-col px-5 pb-8 pt-4">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color: slide.accent }}
        >
          {slide.kicker}
        </p>
        <h1 className="mt-3 whitespace-pre-line text-2xl font-black leading-tight tracking-tight">
          {slide.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">{slide.body}</p>

        <div className="mt-8 flex flex-1 flex-col justify-center">{slide.mock}</div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {SLIDES.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-[#ff3d00]" : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="mt-6 w-full rounded-2xl bg-[#ff3d00] py-4 text-base font-black text-white shadow-[0_8px_32px_rgba(255,61,0,0.35)]"
        >
          {isLast ? "mazareをはじめる" : "次へ"}
        </button>
      </div>
    </div>
  );
}
