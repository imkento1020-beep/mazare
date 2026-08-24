import Link from "next/link";
import AuthSampleCards from "./AuthSampleCards";
import MazareLogo from "@/components/MazareLogo";

const VISUAL_BG =
  "radial-gradient(ellipse 80% 60% at 20% 80%, rgba(255,61,0,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 20%, rgba(120,60,200,0.15) 0%, transparent 55%), linear-gradient(160deg, #0d0d1a 0%, #080810 50%, #120810 100%)";

const GRID_BG =
  "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')";

function AuthVisualPanel() {
  return (
    <div className="relative hidden min-h-[280px] shrink-0 flex-col overflow-hidden px-8 py-10 md:sticky md:top-0 md:flex md:min-h-screen md:w-[55%] md:items-center md:py-16 md:pl-24 md:pr-16 lg:pl-32 lg:pr-20">
      <div
        className="absolute inset-0 bg-[#080810]"
        style={{ background: VISUAL_BG }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: GRID_BG }}
      />

      <div className="relative z-10 flex w-full max-w-xl flex-1 flex-col md:flex-none">
        <MazareLogo href="/" size="lg" />

        <div className="mt-8 md:mt-10">
          <h1 className="max-w-lg text-2xl font-semibold leading-snug tracking-tight text-[#eeeaf4] md:text-4xl md:leading-tight">
            今夜、
            <span className="text-[#ff3d00]">盛り上がれる場所へ</span>
            <br />
            今いちばん熱い夜を見つける。
          </h1>

          <AuthSampleCards />
        </div>
      </div>

      <div className="relative z-10 mt-8 hidden w-full max-w-xl md:block">
        <div className="flex gap-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-[#ff3d00]"
              style={{
                width: i === 0 ? "2rem" : "0.5rem",
                opacity: 1 - i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function AuthFooter() {
  return (
    <footer className="shrink-0 border-t border-white/10 bg-[#080810] px-6 py-6 md:px-14">
      <div className="mx-auto w-full max-w-md md:max-w-none">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-[#9994a8]">
          <Link href="/terms" className="transition hover:text-[#eeeaf4]">
            利用規約
          </Link>
          <Link href="/privacy" className="transition hover:text-[#eeeaf4]">
            プライバシーポリシー
          </Link>
          <Link href="/contact" className="transition hover:text-[#eeeaf4]">
            お問い合わせ
          </Link>
        </div>
        <p className="mt-3 text-center text-xs text-[#9994a8]/70">
          © {new Date().getFullYear()} mazare. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#080810] md:flex">
      <AuthVisualPanel />
      <div className="flex min-h-screen flex-1 flex-col bg-[#080810] md:w-[45%]">
        <div className="flex flex-1 flex-col justify-center px-6 py-10 md:px-14 md:py-16">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
        <AuthFooter />
      </div>
    </div>
  );
}
