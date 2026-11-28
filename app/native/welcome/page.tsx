"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { ensureAnonymousSession } from "@/lib/auth/anonymous";
import { detectNativePlatform, markNativeShellPersistent } from "@/lib/native/capacitor";
import { enableNativeGuestBrowse } from "@/lib/native/guestBrowse";
import { markGuestOnboardingCompleted } from "@/lib/onboarding/guestOnboarding";
import { useNativeApp } from "@/hooks/useNativeApp";

export default function NativeWelcomePage() {
  const router = useRouter();
  const { isNative, nativeResolved } = useNativeApp();
  const [checking, setChecking] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    if (detectNativePlatform()) markNativeShellPersistent();
  }, []);

  const inAppShell = isNative;

  useEffect(() => {
    if (!nativeResolved) return;
    if (!inAppShell) {
      router.replace("/");
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (isRegisteredUser(session?.user)) {
        router.replace("/home");
        return;
      }
      setChecking(false);
    });

    return () => {
      cancelled = true;
    };
  }, [nativeResolved, inAppShell, router]);

  async function continueAsGuest() {
    setGuestLoading(true);
    enableNativeGuestBrowse();
    markGuestOnboardingCompleted();
    const { user } = await ensureAnonymousSession();
    setGuestLoading(false);
    if (user) {
      router.replace("/home");
    }
  }

  if (!nativeResolved || !inAppShell || checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))] text-[#eeeaf4]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <Image
          src="/mazare-logo.png"
          alt="mazare"
          width={255}
          height={52}
          priority
          className="h-9 w-auto"
        />
        <h1 className="mt-10 text-center text-2xl font-bold leading-snug tracking-tight">
          今夜の
          <span className="text-[#ff3d00]">いちばん熱い場所</span>
          へ
        </h1>
        <p className="mt-3 max-w-xs text-center text-sm leading-relaxed text-[#9994a8]">
          アカウントを作成するか、ログインして mazare をはじめましょう。
        </p>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <Link
            href="/signup"
            className="flex w-full items-center justify-center rounded-2xl bg-[#ff3d00] px-4 py-4 text-base font-bold text-white shadow-[0_8px_32px_rgba(255,61,0,0.35)] transition active:scale-[0.98]"
          >
            新規アカウントを作成
          </Link>
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-2xl border border-white/12 bg-[#111118] px-4 py-4 text-base font-bold text-[#eeeaf4] transition active:scale-[0.98]"
          >
            ログイン
          </Link>
          <button
            type="button"
            disabled={guestLoading}
            onClick={() => void continueAsGuest()}
            className="w-full py-3 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4] disabled:opacity-50"
          >
            {guestLoading ? "準備中…" : "あとで登録（ゲストで見る）"}
          </button>
        </div>
      </div>

      <p className="text-center text-[11px] leading-relaxed text-[#5a5668]">
        <Link href="/terms" className="underline-offset-2 hover:text-[#9994a8] hover:underline">
          利用規約
        </Link>
        {" · "}
        <Link href="/privacy" className="underline-offset-2 hover:text-[#9994a8] hover:underline">
          プライバシー
        </Link>
      </p>
    </div>
  );
}