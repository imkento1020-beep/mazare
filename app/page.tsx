"use client";

import Link from "next/link";
import AuthSampleCards from "@/components/auth/AuthSampleCards";

const VISUAL_BG =
  "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,61,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(120,60,200,0.15) 0%, transparent 55%), linear-gradient(160deg, #0d0d1a 0%, #080810 50%, #120810 100%)";

const features = [
  {
    emoji: "📡",
    title: "リアルタイム発信",
    body: "お店が今夜の空気をその場で発信。今まさに盛り上がっている場所がわかる。",
  },
  {
    emoji: "🤝",
    title: "新しい出会い",
    body: "「混ざり歓迎」のお店を見つけて、知らない人と自然につながれる。",
  },
  {
    emoji: "🔥",
    title: "今夜の盛り上がりがわかる",
    body: "ムードタグと行くかも人数で、今夜行くべき場所が一目でわかる。",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-full bg-[#080810] text-[#eeeaf4]">
      <header className="sticky top-0 z-40 border-b border-white/7 bg-[#080810]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-black tracking-tight">
            maz<span className="text-[#ff3d00]">a</span>re
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-[10px] px-4 py-2 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4]"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-[14px] bg-[#ff3d00] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e63600]"
            >
              サインアップ
            </Link>
          </div>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-6 pb-20 pt-16 lg:pb-28 lg:pt-24"
        style={{ background: VISUAL_BG }}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffaa00]">
              今夜、知らない人と混ざれる場所を
            </p>
            <h1 className="mt-4 text-5xl font-black leading-[1.05] tracking-tight lg:text-[56px]">
              今夜、
              <span className="text-[#ff3d00]">混ざれる。</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#9994a8] lg:text-lg">
              お店がリアルタイムで「今夜の空気」を発信。
              行くかもを押して、知らない人と肩を組める夜を見つけよう。
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-8 py-4 text-base font-bold text-white transition hover:bg-[#e63600]"
            >
              今すぐ始める
            </Link>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <AuthSampleCards />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-2xl font-black text-[#eeeaf4]">
          mazareでできること
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[14px] border border-white/7 bg-[#111118] p-6"
            >
              <span className="text-3xl">{feature.emoji}</span>
              <h3 className="mt-4 text-lg font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/7 bg-[#111118]/40 px-6 py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#ff3d00]">
              For Owners
            </p>
            <h2 className="mt-2 text-2xl font-black lg:text-3xl">
              mazareでお店を登録する
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#9994a8]">
              今夜の空気をリアルタイムで発信して、混ざりたいゲストを呼び込もう。
            </p>
          </div>
          <Link
            href="/signup"
            className="shrink-0 rounded-[14px] border border-[#ff3d00]/40 bg-[#ff3d00]/10 px-8 py-3.5 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/20"
          >
            オーナーとして登録
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/7 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-center text-xs text-[#5a5668] sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} mazare. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-[#9994a8]">
              利用規約
            </a>
            <a href="#" className="transition hover:text-[#9994a8]">
              プライバシーポリシー
            </a>
            <a href="#" className="transition hover:text-[#9994a8]">
              お問い合わせ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
