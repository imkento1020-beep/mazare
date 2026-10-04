import Link from "next/link";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import MazareLogo from "@/components/MazareLogo";
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

const ownerPoints = [
  "完全無料で始められる",
  "登録・設定は5分で完了",
  "お客さんの投稿が集客につながる",
] as const;

export const revalidate = 60;

export default async function LandingPage() {
  const feedPosts = await fetchLandingFeedPosts();

  return (
    <div
      className={`min-h-dvh bg-[#080810] text-[#eeeaf4] ${notoSansJp.className} ${outfit.variable}`}
    >
      <header className="fixed left-0 right-0 top-0 z-[100] h-16 border-b border-white/[0.07] bg-[rgba(8,8,16,0.92)] backdrop-blur-[20px]">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6">
          <MazareLogo href="/home" size="md" />
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/login" className="text-sm text-[#9994a8]">
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-[#ff3d00] px-5 py-2 text-sm font-bold text-white"
            >
              はじめる
            </Link>
            <Link
              href="/owner/apply"
              className="rounded-lg border border-white/[0.15] bg-transparent px-4 py-2 text-[13px] text-[#9994a8]"
            >
              お店を登録する
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-24 sm:px-6">
        <section className="text-center">
          <h1
            className={`text-[36px] font-black leading-tight text-[#eeeaf4] md:text-[56px] ${outfit.className}`}
          >
            今夜の飲みを、投稿しよう。
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-[15px] leading-[1.8] text-[#9994a8]">
            今夜飲んでいる場所の写真や動画を投稿するだけ。
            <br className="hidden sm:inline" />
            楽しそうと感じた人が、そのお店に集まってくる。
          </p>
          <Link
            href="/post"
            className={`mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-10 py-4 text-base font-extrabold text-white ${outfit.className}`}
          >
            今夜の飲みを投稿する
          </Link>
          <p className="mt-3 text-xs text-[#5a5668]">
            アカウント登録不要・無料で使えます
          </p>
        </section>

        {feedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-center text-[13px] tracking-[0.1em] text-[#5a5668]">
              今夜のmazare
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
              {feedPosts.map((post) => (
                <LandingPostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12 px-5 py-12 text-center md:mt-12">
          <p className={`text-xl font-bold text-[#eeeaf4] ${outfit.className}`}>
            あなたも今夜の様子を投稿しよう。
          </p>
          <Link
            href="/signup"
            className={`mt-6 inline-flex rounded-[14px] bg-[#ff3d00] px-10 py-3.5 text-base font-extrabold text-white ${outfit.className}`}
          >
            はじめる
          </Link>
        </section>

        <section className="mt-16 bg-[#111118] px-5 py-16 text-center">
          <h2
            className={`text-[28px] font-extrabold text-[#eeeaf4] ${outfit.className}`}
          >
            新しい口コミのかたち。
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.8] text-[#9994a8]">
            来てくれたお客さんが、次のお客さんを呼んでくれる。
            <br />
            お客さんのリアルな投稿が、今夜の集客につながる。
          </p>
          <ul className="mx-auto mt-10 flex max-w-3xl flex-col gap-6 md:flex-row md:justify-center md:gap-10">
            {ownerPoints.map((point) => (
              <li
                key={point}
                className="flex items-center justify-center gap-2 md:flex-col md:gap-3"
              >
                <CheckCircleIcon size={24} />
                <span className="text-sm text-[#eeeaf4]">{point}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/owner/apply"
            className={`mt-8 inline-flex rounded-[14px] border border-[#ff3d00] px-8 py-3.5 text-base font-bold text-[#ff3d00] ${outfit.className}`}
          >
            お店を登録する
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] px-5 py-8">
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
