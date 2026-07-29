"use client";

import Link from "next/link";
import AuthSampleCards from "@/components/auth/AuthSampleCards";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const VISUAL_BG =
  "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,61,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(120,60,200,0.15) 0%, transparent 55%), linear-gradient(160deg, #0d0d1a 0%, #080810 50%, #120810 100%)";

const guestFeatures = [
  {
    emoji: "🔥",
    title: "今夜の盛り上がりがわかる",
    body: "ムードタグと行くかも人数で、今まさに混ざれる場所が一目でわかる。",
  },
  {
    emoji: "🤝",
    title: "新しい出会い",
    body: "「混ざり歓迎」のお店を見つけて、知らない人と自然につながれる。",
  },
  {
    emoji: "🗺️",
    title: "地図・フィルターで探せる",
    body: "エリアやジャンル、雰囲気から、今夜行きたい飲食店をすぐに見つけられる。",
  },
];

const ownerFeatures = [
  {
    emoji: "📡",
    title: "リアルタイム発信",
    body: "今夜の空気をその場で発信。今の盛り上がりをゲストに届けられる。",
  },
  {
    emoji: "👋",
    title: "行くかもで集客",
    body: "関心を示したゲストの人数がわかり、来店の見込みをリアルタイムで把握。",
  },
  {
    emoji: "📊",
    title: "ダッシュボードで状況確認",
    body: "閲覧数・行くかも数・来店者をひと目で確認。今夜の店舗運営をサポート。",
  },
];

function FeatureGrid({
  items,
}: {
  items: typeof guestFeatures;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((feature) => (
        <div
          key={feature.title}
          className="rounded-[14px] border border-white/7 bg-[#111118] p-5"
        >
          <span className="text-2xl">{feature.emoji}</span>
          <h4 className="mt-3 text-base font-bold">{feature.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-[#9994a8]">
            {feature.body}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#080810] text-[#eeeaf4]">
      <Header />

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
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[#9994a8]">
          今夜混ざりたいゲストも、集客したいお店も、mazareひとつで。
        </p>

        <div className="mt-14 space-y-16">
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#00e87a]">
                  For Guests
                </p>
                <h3 className="mt-1 text-xl font-black lg:text-2xl">
                  飲食店を探すゲストの方へ
                </h3>
                <p className="mt-2 text-sm text-[#9994a8]">
                  今夜、知らない人と混ざれる場所を見つけよう。
                </p>
              </div>
              <Link
                href="/signup"
                className="shrink-0 rounded-[13px] bg-[#ff3d00] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#e63600]"
              >
                ゲストとして始める
              </Link>
            </div>
            <FeatureGrid items={guestFeatures} />
          </div>

          <div className="rounded-[20px] border border-[#ff3d00]/15 bg-[#ff3d00]/[0.03] p-6 lg:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#ff3d00]">
                  For Owners
                </p>
                <h3 className="mt-1 text-xl font-black lg:text-2xl">
                  集客したいお店の方へ
                </h3>
                <p className="mt-2 text-sm text-[#9994a8]">
                  今夜の空気を発信して、混ざりたい客を呼び込もう。
                </p>
              </div>
              <Link
                href="/signup"
                className="shrink-0 rounded-[13px] border border-[#ff3d00]/40 bg-[#ff3d00]/10 px-6 py-2.5 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/20"
              >
                オーナーとして登録
              </Link>
            </div>
            <FeatureGrid items={ownerFeatures} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
