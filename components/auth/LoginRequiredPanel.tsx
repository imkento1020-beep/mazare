"use client";

import Link from "next/link";
import {
  getFormalSignupPathWithReturn,
  getLoginPathWithReturn,
} from "@/lib/auth/authPaths";
import { FeedPeopleIcon } from "@/components/icons/FeedActionIcons";

export type LoginRequiredPanelProps = {
  title?: string;
  description?: string;
  returnPath?: string;
  className?: string;
  compact?: boolean;
};

export default function LoginRequiredPanel({
  title = "ログインして続ける",
  description = "マイページや「行くかも」、コメントなどの機能を使うにはアカウントが必要です。",
  returnPath,
  className = "",
  compact = false,
}: LoginRequiredPanelProps) {
  const loginHref = getLoginPathWithReturn(returnPath);
  const signupHref = getFormalSignupPathWithReturn(returnPath);

  return (
    <div
      className={`rounded-2xl border border-white/[0.08] bg-[#111118] text-center ${
        compact ? "px-4 py-6" : "px-6 py-10"
      } ${className}`}
    >
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff3d00]/15 text-[#ff3d00]">
        <FeedPeopleIcon size={28} color="#ff3d00" />
      </span>
      <h2 className="mt-4 text-lg font-black text-[#eeeaf4]">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#9994a8]">
        {description}
      </p>
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
        <Link
          href={loginHref}
          className="rounded-xl bg-[#ff3d00] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(255,61,0,0.35)] transition hover:bg-[#e63600]"
        >
          ログイン
        </Link>
        <Link
          href={signupHref}
          className="rounded-xl border border-white/12 bg-[#18181f] px-5 py-3 text-sm font-bold text-[#eeeaf4] transition hover:border-[#ff3d00]/35"
        >
          新規登録
        </Link>
      </div>
    </div>
  );
}
