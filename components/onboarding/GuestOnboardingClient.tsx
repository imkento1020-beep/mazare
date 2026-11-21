"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MazareLogo from "@/components/MazareLogo";
import { PostOutlineIcon } from "@/components/icons/CreateActionIcons";
import { FeedWaveIcon } from "@/components/icons/FeedActionIcons";
import { FireIcon } from "@/components/icons/MazareIcons";
import { MazaruIcon } from "@/components/icons/MazaruModeIcons";
import {
  hasCompletedGuestOnboarding,
  markGuestOnboardingCompleted,
} from "@/lib/onboarding/guestOnboarding";

const SLIDES = [
  {
    id: "discover",
    kicker: "01 · 今夜の空気",
    title: "いま盛り上がっている\nお店がわかる",
    body: "ホーム・地図・探すから、今夜の投稿やお店の Vibe をチェック。静的な店舗情報ではなく、「今この瞬間」の雰囲気で行き先を選べます。",
    accent: "#ff3d00",
    mock: (
      <div className="relative mx-auto aspect-[4/5] w-[min(72vw,280px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] shadow-[0_24px_64px_rgba(255,61,0,0.2)]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ff3d00]/20 via-transparent to-[#080810]" />
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#ff3d00]/90 px-2.5 py-1">
          <FireIcon size={14} color="#fff" />
          <span className="text-[10px] font-bold text-white">LIVE</span>
        </div>
        <div className="absolute inset-x-3 top-14 space-y-2">
          <div className="rounded-xl border border-white/10 bg-[#111118]/95 p-3">
            <p className="text-[10px] font-bold text-[#ffaa00]">渋谷 · 立ち飲み</p>
            <p className="mt-1 text-xs font-black text-[#eeeaf4]">カウンターわいわい #今夜</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#111118]/80 p-3 opacity-80">
            <p className="text-[10px] font-bold text-[#9994a8]">新宿 · バー</p>
            <p className="mt-1 text-xs font-semibold text-[#c4bfd6]">混ざり歓迎の空気…</p>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#080810] p-4 pt-12">
          <p className="text-center text-[11px] font-semibold text-[#9994a8]">
            ホーム · 地図 · 探す
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "post",
    kicker: "02 · 投稿",
    title: "今夜の一杯を、\nその場でシェア",
    body: "お店での写真や動画を投稿すると、今夜の空気が伝わります。誰と・何杯目などの飲みログも一緒に残せます。",
    accent: "#ff3d00",
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
            <PostOutlineIcon size={16} color="#fff" />
          </span>
          <span className="text-xs font-semibold text-white/90">今夜を投稿</span>
        </div>
      </div>
    ),
  },
  {
    id: "mazaru",
    kicker: "03 · マザる",
    title: "合流したい意思を\n投稿で示せる",
    body: "「マザる」を選ぶと合流ウェルカムのタグが付きます。人数や男女比などはタップで詳細表示。気になったら「連絡する」からメッセージを送れます。",
    accent: "#00e87a",
    mock: (
      <div className="relative mx-auto aspect-[4/5] w-[min(72vw,280px)] overflow-hidden rounded-2xl border border-[#00e87a]/25 bg-[#0d0d12] shadow-[0_24px_64px_rgba(0,232,122,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(0,232,122,0.15),transparent_55%)]" />
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#00e87a]/50 bg-[#00e87a]/10 text-[#00e87a]">
            <MazaruIcon size={36} />
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00e87a]/40 bg-[#00e87a]/15 px-3 py-1.5 text-[11px] font-bold text-[#00e87a]">
            合流・声かけ OK ›
          </span>
          <div className="w-full rounded-xl border border-white/10 bg-[#111118]/90 p-3 text-left">
            <p className="text-[10px] font-bold text-[#5a5668]">登録した合流の詳細</p>
            <p className="mt-2 text-[11px] text-[#9994a8]">
              いまの人数 · 合流後の人数 · どこで合流？
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tonight",
    kicker: "04 · 行くかも",
    title: "今夜行きたいお店を\nリストに残す",
    body: "気になったお店に「行くかも」を付けて、今夜の候補を整理。投稿は「いま現場」、行くかもは「これから行く」というシグナルです。",
    accent: "#ffaa00",
    mock: (
      <div className="relative mx-auto aspect-[4/5] w-[min(72vw,280px)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d12] shadow-[0_24px_64px_rgba(255,170,0,0.15)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,170,0,0.14),transparent_55%)]" />
        <div className="flex h-full flex-col justify-center gap-3 px-5">
          <p className="text-center text-[10px] font-bold uppercase tracking-wider text-[#5a5668]">
            今夜の行くかも
          </p>
          {[
            { name: "立ち飲みバー A", on: true },
            { name: "カラオケスナック B", on: false },
          ].map((row) => (
            <div
              key={row.name}
              className={`flex items-center gap-3 rounded-xl border p-3 ${
                row.on
                  ? "border-[#ffaa00]/40 bg-[#ffaa00]/10"
                  : "border-white/10 bg-[#111118]/80"
              }`}
            >
              <FeedWaveIcon size={22} color={row.on ? "#ffaa00" : "#5a5668"} />
              <span
                className={`text-xs font-bold ${row.on ? "text-[#eeeaf4]" : "text-[#9994a8]"}`}
              >
                {row.name}
              </span>
            </div>
          ))}
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