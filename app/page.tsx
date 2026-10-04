import Link from "next/link";
import { Noto_Sans_JP, Outfit } from "next/font/google";
import MazareWordmark from "@/components/landing/MazareWordmark";
import {
  CheckCircleIcon,
  PeopleGatherIcon,
  PinIcon,
  StepCameraIcon,
} from "@/components/landing/LandingStepIcons";

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

const steps = [
  {
    number: "01",
    title: "今いるお店を選ぶ",
    description: "GPS位置情報から近くのお店が自動で表示されます",
    icon: PinIcon,
  },
  {
    number: "02",
    title: "写真か動画を投稿する",
    description: "今夜の雰囲気をそのまま撮って投稿するだけ",
    icon: StepCameraIcon,
  },
  {
    number: "03",
    title: "人が集まってくる",
    description: "投稿を見た人が楽しそうと感じてお店に来る",
    icon: PeopleGatherIcon,
  },
] as const;

const ownerPoints = [
  "完全無料で始められる",
  "登録・設定は5分で完了",
  "お客さんの投稿が集客につながる",
] as const;

export default function LandingPage() {
  return (
    <div
      className={`min-h-dvh bg-[#0f0d0b] text-[#f5f0e8] ${notoSansJp.className} ${outfit.variable}`}
    >
      <header className="landing-fade-in border-b border-white/[0.07]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-5">
          <MazareWordmark href="/" />
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="#for-owners"
              className="text-sm text-[#9994a8] transition-colors hover:text-[#f5f0e8]"
            >
              お店の方へ
            </Link>
            <Link
              href="/home"
              className="rounded-[14px] bg-[#ff3d00] px-5 py-2.5 text-sm font-extrabold text-white transition-colors hover:bg-[#e63600]"
            >
              はじめる
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="landing-fade-in px-6 pb-24 pt-16 md:pb-32 md:pt-24">
          <div className="mx-auto flex max-w-[1200px] flex-col items-center text-center">
            <h1
              className={`max-w-3xl text-[40px] font-black leading-[1.15] tracking-tight md:text-[72px] ${outfit.className}`}
            >
              今夜の飲みを、投稿しよう。
            </h1>
            <p className="mt-8 max-w-lg text-base leading-[1.8] text-[#9994a8]">
              今夜飲んでいる場所の写真や動画を投稿するだけ。
              <br className="hidden sm:inline" />
              楽しそうと感じた人が、そのお店に集まってくる。
            </p>
            <Link
              href="/post"
              className={`mt-10 inline-flex rounded-[14px] bg-[#ff3d00] px-10 py-4 text-base font-extrabold text-white transition-colors hover:bg-[#e63600] ${outfit.className}`}
            >
              今夜の飲みを投稿する
            </Link>
            <p className="mt-4 text-xs text-[#9994a8]">
              アカウント登録不要・無料で使えます
            </p>
          </div>
        </section>

        <section className="landing-fade-in px-6 pb-24 md:pb-32">
          <div className="mx-auto max-w-[1200px]">
            <h2
              className={`text-center text-2xl font-bold md:text-[28px] ${outfit.className}`}
            >
              使い方はシンプル
            </h2>
            <ul className="mt-12 grid gap-6 md:grid-cols-3 md:gap-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <li
                    key={step.number}
                    className="relative rounded-2xl border border-white/[0.08] bg-[#1a1510] p-8"
                  >
                    <p
                      className={`text-[48px] font-black leading-none text-[rgba(255,61,0,0.2)] ${outfit.className}`}
                      aria-hidden
                    >
                      {step.number}
                    </p>
                    <div className="mt-4">
                      <Icon />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#f5f0e8]">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.7] text-[#9994a8]">
                      {step.description}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section
          id="for-owners"
          className="landing-fade-in bg-[#1a1510] px-6 py-20 md:py-28"
        >
          <div className="mx-auto max-w-[1200px] text-center">
            <h2
              className={`text-2xl font-bold md:text-[28px] ${outfit.className}`}
            >
              お店を運営している方へ
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-[1.8] text-[#9994a8]">
              お客さんが勝手に発信してくれる。
              <br />
              あなたは何もしなくていい。
            </p>
            <ul className="mx-auto mt-10 flex max-w-md flex-col gap-4 text-left">
              {ownerPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircleIcon />
                  <span className="text-base text-[#f5f0e8]">{point}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup?type=owner"
              className={`mt-12 inline-flex rounded-[14px] border border-[#ff3d00] px-8 py-3.5 text-base font-bold text-[#ff3d00] transition-colors hover:bg-[#ff3d00]/10 ${outfit.className}`}
            >
              お店を登録する
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.07] bg-[#0f0d0b] px-6 py-12">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-8 text-center">
          <MazareWordmark href="/" />
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#9994a8]">
            <Link href="/terms" className="hover:text-[#f5f0e8]">
              利用規約
            </Link>
            <Link href="/privacy" className="hover:text-[#f5f0e8]">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="hover:text-[#f5f0e8]">
              お問い合わせ
            </Link>
          </nav>
          <p className="text-xs text-[#9994a8]">© 2026 mazare</p>
        </div>
      </footer>
    </div>
  );
}
