import Link from "next/link";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import MazareLogo from "@/components/MazareLogo";
import {
  BookmarkFeatureIcon,
  MapFeatureIcon,
  PostFeatureIcon,
  SparkFeatureIcon,
} from "@/components/landing/LandingFeatureIcons";
import LandingPostCard from "@/components/landing/LandingPostCard";
import { CheckCircleIcon } from "@/components/landing/LandingStepIcons";
import { fetchLandingFeedPosts } from "@/lib/landing/fetchLandingPosts";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-outfit",
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
});

const features = [
  {
    icon: PostFeatureIcon,
    title: "その場で投稿",
    body: "今いるお店の写真・動画をすぐシェア",
  },
  {
    icon: MapFeatureIcon,
    title: "地図で発見",
    body: "今夜盛り上がっているお店が一目でわかる",
  },
  {
    icon: BookmarkFeatureIcon,
    title: "行くかも",
    body: "気になるお店を今夜のリストにストック",
  },
  {
    icon: SparkFeatureIcon,
    title: "登録不要",
    body: "アカウントなしですぐ投稿できる",
  },
] as const;

const ownerBenefits = [
  "来てくれたお客さんが、次のお客さんを呼んでくれる",
  "完全無料で始められる",
  "お客さんの投稿が、今夜の集客につながる",
] as const;

export const revalidate = 60;

export default async function LandingPage() {
  const feedPosts = await fetchLandingFeedPosts();

  return (
    <div
      className={`min-h-dvh bg-[#080810] text-[#eeeaf4] ${notoSansJp.className} ${outfit.variable}`}
    >
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-white/[0.07] bg-[rgba(8,8,16,0.92)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-2 px-4 sm:px-6">
          <MazareLogo href="/home" size="md" />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-1 text-[13px] text-[#9994a8] sm:text-sm"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#ff3d00] px-4 py-2 text-[13px] font-bold text-white sm:px-5 sm:text-sm"
            >
              はじめる
            </Link>
            <Link
              href="/owner/apply"
              className="hidden rounded-lg border border-white/[0.15] px-3 py-2 text-xs text-[#9994a8] sm:inline-block sm:px-4 sm:text-[13px]"
            >
              お店を登録する
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-[1200px] px-4 pb-10 pt-24 sm:px-6 lg:pb-16 lg:pt-28">
          <div className="lg:grid lg:grid-cols-[1fr_minmax(0,420px)] lg:items-center lg:gap-14">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#111118] px-3 py-1 text-[11px] font-semibold tracking-wide text-[#9994a8]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#ffaa00]" aria-hidden />
                渋谷・新宿・恵比寿・新橋 — 今夜の飲み場
              </p>

              <h1
                className={`mt-6 text-[34px] font-black leading-[1.12] tracking-tight text-[#eeeaf4] sm:text-[44px] lg:text-[52px] ${outfit.className}`}
              >
                今夜の飲みを、
                <br className="sm:hidden" />
                投稿しよう。
              </h1>

              <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.85] text-[#9994a8] lg:mx-0">
                今夜飲んでいる場所の写真や動画を投稿するだけ。
                楽しそうと感じた人が、そのお店に集まってくる。
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:items-start">
                <Link
                  href="/post"
                  className={`inline-flex w-full max-w-xs items-center justify-center rounded-[14px] bg-[#ff3d00] px-8 py-4 text-base font-extrabold text-white sm:w-auto ${outfit.className}`}
                >
                  今夜の飲みを投稿する
                </Link>
                <Link
                  href="/home"
                  className="inline-flex w-full max-w-xs items-center justify-center rounded-[14px] border border-white/[0.12] bg-[#111118] px-8 py-4 text-sm font-bold text-[#eeeaf4] sm:w-auto"
                >
                  今夜のフィードを見る
                </Link>
              </div>

              <p className="mt-3 text-xs text-[#5a5668]">
                アカウント登録不要・無料で使えます
              </p>
            </div>

            {feedPosts.length > 0 && (
              <div className="mt-12 hidden gap-3 lg:mt-0 lg:grid lg:grid-cols-2">
                {feedPosts.slice(0, 2).map((post) => (
                  <LandingPostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>

          <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:mt-14">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="rounded-2xl border border-white/[0.06] bg-[#111118] p-4"
                >
                  <Icon />
                  <p className="mt-3 text-sm font-bold text-[#eeeaf4]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#9994a8]">
                    {item.body}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {feedPosts.length > 0 && (
          <section className="border-t border-white/[0.06] bg-[#0a0910] py-12 sm:py-16">
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff3d00]">
                    Tonight
                  </p>
                  <h2
                    className={`mt-1 text-2xl font-black text-[#eeeaf4] ${outfit.className}`}
                  >
                    今夜のmazare
                  </h2>
                </div>
                <Link
                  href="/home"
                  className="shrink-0 text-sm font-semibold text-[#9994a8] hover:text-[#eeeaf4]"
                >
                  もっと見る →
                </Link>
              </div>

              <div className="scrollbar-hidden -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 snap-x snap-mandatory sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-4">
                {feedPosts.map((post) => (
                  <LandingPostCard
                    key={post.id}
                    post={post}
                    className="w-[44vw] shrink-0 snap-start sm:w-auto"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1200px] px-4 py-16 text-center sm:px-6">
          <p className={`text-xl font-bold text-[#eeeaf4] sm:text-2xl ${outfit.className}`}>
            盛り上がりが、盛り上がりを呼ぶ。
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#9994a8]">
            投稿を見た人が来店し、また新しい投稿が生まれる。
            mazareは、その正のスパイラルを今夜の街で回していきます。
          </p>
          <Link
            href="/signup"
            className={`mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-10 py-3.5 text-base font-extrabold text-white ${outfit.className}`}
          >
            はじめる
          </Link>
        </section>

        <section className="border-t border-white/[0.06] bg-[#111118]">
          <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ffaa00]">
                For shops
              </p>
              <h2
                className={`mt-2 text-[28px] font-black leading-tight text-[#eeeaf4] sm:text-[32px] ${outfit.className}`}
              >
                新しい口コミのかたち。
              </h2>
              <p className="mt-4 text-[15px] leading-[1.85] text-[#9994a8]">
                来てくれたお客さんが、次のお客さんを呼んでくれる。
                お客さんのリアルな投稿が、今夜の集客につながる。
              </p>
              <Link
                href="/owner/apply"
                className={`mt-8 inline-flex rounded-[14px] border border-[#ff3d00] px-8 py-3.5 text-base font-bold text-[#ff3d00] ${outfit.className}`}
              >
                お店を登録する
              </Link>
            </div>

            <ul className="space-y-4 rounded-2xl border border-white/[0.06] bg-[#080810] p-6">
              {ownerBenefits.map((point) => (
                <li key={point} className="flex gap-3">
                  <CheckCircleIcon size={22} />
                  <span className="text-sm leading-relaxed text-[#eeeaf4]">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="border-t border-white/[0.06] px-4 py-3 text-center sm:hidden">
          <Link
            href="/owner/apply"
            className="text-xs font-semibold text-[#9994a8]"
          >
            お店を運営している方はこちら →
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/[0.07] px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <MazareLogo href="/home" size="sm" />
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#5a5668]">
            <Link href="/terms" className="hover:text-[#9994a8]">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-[#9994a8]">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:text-[#9994a8]">
              お問い合わせ
            </Link>
          </nav>
        </div>
        <p className="mt-6 text-center text-xs text-[#5a5668]">© 2026 mazare</p>
      </footer>
    </div>
  );
}
