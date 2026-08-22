"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { completeAuthFlow } from "@/lib/auth/postAuth";

function getAuthErrorMessage(error: { message: string } | null) {
  if (!error) return "認証に失敗しました。もう一度お試しください。";

  const message = error.message.toLowerCase();
  if (message.includes("code verifier") || message.includes("both auth code")) {
    return "認証に失敗しました。サインアップしたのと同じブラウザでメール内のリンクを開くか、確認メールを再送してください。";
  }
  if (message.includes("expired") || message.includes("invalid")) {
    return "認証リンクの有効期限が切れているか、既に使用されています。確認メールを再送してください。";
  }

  return `認証に失敗しました: ${error.message}`;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("メールアドレスを確認しています...");
  const [verified, setVerified] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    async function redirectAuthenticatedUser(user: User) {
      setVerified(true);
      setMessage("メールアドレスが確認されました。アカウントの準備をしています...");
      window.history.replaceState({}, "", "/auth/callback");
      router.replace(await completeAuthFlow(user));
    }

    async function tryExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await redirectAuthenticatedUser(session.user);
        return true;
      }
      return false;
    }

    async function handleCallback() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );

      const errorDescription =
        searchParams.get("error_description") ??
        searchParams.get("error") ??
        hashParams.get("error_description");

      if (errorDescription) {
        setMessage(decodeURIComponent(errorDescription));
        setTimeout(() => router.replace("/signup"), 5000);
        return;
      }

      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type") as EmailOtpType | null;

      if (tokenHash && otpType) {
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType,
        });

        if (!error && data.user) {
          await redirectAuthenticatedUser(data.user);
          return;
        }

        if (await tryExistingSession()) return;

        setMessage(getAuthErrorMessage(error));
        setTimeout(() => router.replace("/signup"), 5000);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        try {
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!error && data.user) {
            await redirectAuthenticatedUser(data.user);
            return;
          }

          if (await tryExistingSession()) return;

          setMessage(getAuthErrorMessage(error));
        } catch (error) {
          if (await tryExistingSession()) return;

          setMessage(
            getAuthErrorMessage(
              error instanceof Error ? { message: error.message } : null,
            ),
          );
        }

        setTimeout(() => router.replace("/signup"), 5000);
        return;
      }

      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error && data.user) {
          await redirectAuthenticatedUser(data.user);
          return;
        }

        if (await tryExistingSession()) return;

        setMessage(getAuthErrorMessage(error));
        setTimeout(() => router.replace("/signup"), 5000);
        return;
      }

      if (await tryExistingSession()) return;

      setMessage(
        "認証情報が見つかりませんでした。確認メールのリンクをもう一度開くか、再送してください。",
      );
      setTimeout(() => router.replace("/signup"), 5000);
    }

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#080810] px-6">
      <div className="max-w-md text-center">
        {!verified ? (
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
        ) : (
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#00e87a]/15 text-xl">
            ✓
          </div>
        )}
        <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">{message}</p>
      </div>
    </div>
  );
}
