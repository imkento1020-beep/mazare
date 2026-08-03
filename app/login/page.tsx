"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import { resolvePostAuthPath } from "@/lib/auth/routing";

function getEmailRedirectTo() {
  return `${window.location.origin}/auth/callback`;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  async function handleResend() {
    if (!email) return;

    setResending(true);
    setError(null);
    setResendSuccess(false);

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getEmailRedirectTo(),
      },
    });

    setResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResendSuccess(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowResend(false);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      if (signInError.message.toLowerCase().includes("email not confirmed")) {
        setError(
          "メールアドレスが確認されていません。確認メール内のリンクをクリックするか、下のボタンから再送してください。",
        );
        setShowResend(true);
        return;
      }
      setError(signInError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      router.replace(await resolvePostAuthPath(user));
      return;
    }

    router.replace("/home");
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-[#eeeaf4]">ログイン</h2>
      <p className="mt-2 text-sm text-[#9994a8]">
        アカウントにログインして、今夜の場所を探しましょう。
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#eeeaf4]"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#111118] px-4 py-3 text-[#eeeaf4] placeholder:text-[#9994a8]/60 outline-none transition focus:border-[#ff3d00]/50 focus:ring-2 focus:ring-[#ff3d00]/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#eeeaf4]"
              >
                パスワード
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full rounded-lg border border-white/10 bg-[#111118] py-3 pl-4 pr-12 text-[#eeeaf4] placeholder:text-[#9994a8]/60 outline-none transition focus:border-[#ff3d00]/50 focus:ring-2 focus:ring-[#ff3d00]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9994a8] transition hover:text-[#eeeaf4]"
                  aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        d="M3 3l18 18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A10.94 10.94 0 0112 5c7 0 10 7 10 7a14.5 14.5 0 01-3.54 4.36M6.61 6.61A14.5 14.5 0 003 12s3 7 10 7a10.94 10.94 0 004.12-.76"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <path
                        d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            {resendSuccess && (
              <p className="rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-3 text-sm text-[#00e87a]">
                確認メールを再送しました。メール内のリンクをクリックしてください。
              </p>
            )}

            {showResend && (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || loading}
                className="w-full rounded-lg border border-white/10 bg-[#111118] px-4 py-3 text-sm font-medium text-[#eeeaf4] transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? "再送中..." : "確認メールを再送"}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#ff3d00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e63600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

      <p className="mt-6 text-center text-sm text-[#9994a8]">
        アカウントをお持ちでない方は{" "}
        <Link
          href="/signup"
          className="font-medium text-[#ff3d00] transition hover:text-[#e63600]"
        >
          サインアップ
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-[#5a5668]">
        お困りの場合は{" "}
        <Link href="/contact?type=guest" className="text-[#9994a8] hover:text-[#eeeaf4]">
          お問い合わせ
        </Link>
      </p>
    </AuthLayout>
  );
}
