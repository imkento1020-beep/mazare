import Link from "next/link";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import MazareWordmark from "@/components/landing/MazareWordmark";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["800", "900"],
});

const notoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function LandingPage() {
  return (
    <div className={`flex min-h-dvh flex-col bg-[#0f0d0b] ${notoSansJp.className}`}>
      <header className="fixed left-0 right-0 top-0 z-[100] bg-transparent">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
          <MazareWordmark href="/" height={36} />
          <Link
            href="/signup?type=owner"
            className="text-sm text-[#9994a8]"
          >
            お店の方へ
          </Link>
        </div>
      </header>

      <main className="flex min-h-dvh flex-1 flex-col items-center justify-center px-6 py-[20vh] text-center">
        <MazareWordmark href={null} height={48} />

        <h1
          className={`mt-8 text-[36px] font-black leading-[1.15] text-[#f5f0e8] md:text-[64px] ${outfit.className}`}
        >
          今夜の飲みを、投稿しよう。
        </h1>

        <p className="mt-4 max-w-[480px] text-[15px] leading-[1.8] text-[#9994a8]">
          今夜飲んでいる場所の写真や動画を投稿するだけ。
          楽しそうと感じた人が、そのお店に集まってくる。
        </p>

        <div className="mt-10 flex w-full max-w-[320px] flex-col items-center gap-3">
          <Link
            href="/post"
            className={`flex w-full items-center justify-center rounded-[14px] bg-[#ff3d00] px-10 py-4 text-base font-extrabold text-white ${outfit.className}`}
          >
            今夜の飲みを投稿する
          </Link>
          <Link
            href="/signup?type=owner"
            className="flex w-full items-center justify-center rounded-[14px] border border-white/20 bg-transparent px-10 py-3.5 text-sm text-[#9994a8]"
          >
            お店を登録する
          </Link>
        </div>

        <p className="mt-4 text-xs text-[#5a5668]">
          アカウント登録不要・無料で使えます
        </p>
      </main>

      <footer className="p-6 text-center text-xs text-[#5a5668]">
        © 2026 mazare
      </footer>
    </div>
  );
}
