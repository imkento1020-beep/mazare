import Link from "next/link";

const FOOTER_LINKS = [
  { label: "サービスについて", href: "/about" },
  { label: "お店の方へ", href: "/signup?type=owner" },
  { label: "よくある質問", href: "/faq" },
  { label: "お問い合わせ", href: "/contact" },
  { label: "利用規約", href: "/terms" },
  { label: "プライバシーポリシー", href: "/privacy" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-[#111118] px-10 pb-8 pt-12 text-[#5a5668]">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-4">
          <Link href="/" className="text-xl font-black tracking-tight text-[#eeeaf4]">
            maz<span className="text-[#ff3d00]">a</span>re
          </Link>
          <p className="text-sm text-[#9994a8]">今夜、混ざれる。</p>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[#9994a8] transition hover:text-[#eeeaf4]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="mt-10 text-xs">© 2026 mazare All rights reserved.</p>
      </div>
    </footer>
  );
}
