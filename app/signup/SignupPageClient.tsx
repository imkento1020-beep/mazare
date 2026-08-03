"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import { resolvePostAuthPath } from "@/lib/auth/routing";
import { setStoredAppMode } from "@/lib/auth/mode";
import {
  getUserRoles,
  mergeRoles,
  rolesForSignup,
  rolesToMetadata,
} from "@/lib/auth/roles";

type UserType = "guest" | "owner";

const userTypeOptions: {
  value: UserType;
  label: string;
  description: string;
}[] = [
  {
    value: "guest",
    label: "飲みに行く人",
    description: "今夜、知らない人と混ざれる場所を探す",
  },
  {
    value: "owner",
    label: "お店を運営している",
    description: "混ざれる空間としてお店を掲載する",
  },
];

export default function SignupPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState<UserType>("guest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (searchParams.get("type") === "owner") {
      setUserType("owner");
    }
  }, [searchParams]);

  function getEmailRedirectTo() {
    return `${window.location.origin}/auth/callback`;
  }

  async function handleResend() {
    if (!email) return;

    setResending(true);
    setError(null);

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

    setEmailSent(true);
    setShowResend(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setEmailSent(false);
    setShowResend(false);

    const signupRoles = rolesForSignup(userType);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          emailRedirectTo: getEmailRedirectTo(),
          data: rolesToMetadata(signupRoles),
        },
      },
    );

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (signUpData.session && signUpData.user) {
      setStoredAppMode(userType);
      router.replace(await resolvePostAuthPath(signUpData.user, userType));
      return;
    }

    if (signUpData.user?.identities?.length === 0) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(
          "このメールアドレスは既に登録されています。ログインするか、パスワードを確認してください。",
        );
        return;
      }

      if (signInData.user) {
        const currentRoles = getUserRoles(signInData.user);
        const mergedRoles = mergeRoles(currentRoles, signupRoles);

        if (mergedRoles.length > currentRoles.length) {
          await supabase.auth.updateUser({
            data: rolesToMetadata(mergedRoles),
          });

          const {
            data: { user: updatedUser },
          } = await supabase.auth.getUser();

          setStoredAppMode(userType);
          router.replace(
            await resolvePostAuthPath(updatedUser ?? signInData.user, userType),
          );
          return;
        }

        setStoredAppMode(userType);
        router.replace(await resolvePostAuthPath(signInData.user, userType));
        return;
      }

      setError("このメールアドレスは既に登録されています。ログインしてください。");
      return;
    }

    if (signUpData.user) {
      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInData.user) {
        router.replace(await resolvePostAuthPath(signInData.user));
        return;
      }

      if (signInError?.message.toLowerCase().includes("email not confirmed")) {
        setEmailSent(true);
        setShowResend(true);
        return;
      }

      setError(signInError?.message ?? "ログインに失敗しました。");
      return;
    }

    setError("アカウントの作成に失敗しました。もう一度お試しください。");
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-[#eeeaf4]">アカウント作成</h2>
      <p className="mt-2 text-sm text-[#9994a8]">
        mazareへようこそ。アカウントを作成して始めましょう。
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
                  autoComplete="new-password"
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
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

            <fieldset>
              <legend className="block text-sm font-medium text-[#eeeaf4]">
                あなたは？
              </legend>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                {userTypeOptions.map((option) => {
                  const selected = userType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setUserType(option.value)}
                      className={`rounded-xl border p-4 text-left transition ${
                        selected
                          ? "border-[#ff3d00] bg-[#ff3d00]/10 ring-1 ring-[#ff3d00]/30"
                          : "border-white/10 bg-[#111118] hover:border-white/20"
                      }`}
                    >
                      <span
                        className={`block text-sm font-semibold ${
                          selected ? "text-[#ff3d00]" : "text-[#eeeaf4]"
                        }`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-[#9994a8]">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {emailSent && (
              <div className="space-y-2 rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-3 text-sm text-[#00e87a]">
                <p>
                  確認メールを送信しました。メール内のリンクをクリックすると、自動的にログインして
                  {userType === "owner"
                    ? "お店の登録画面"
                    : "ホーム画面"}
                  へ移動します。
                </p>
                <p className="text-xs text-[#00e87a]/80">
                  届かない場合は迷惑メールフォルダもご確認ください。Supabase
                  の無料メールは1時間に2通までの制限があります。
                </p>
              </div>
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

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#ff3d00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e63600] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "作成中..." : "サインアップ"}
            </button>
          </form>

      <p className="mt-6 text-center text-sm text-[#9994a8]">
        すでにアカウントをお持ちの方は{" "}
        <Link
          href="/login"
          className="font-medium text-[#ff3d00] transition hover:text-[#e63600]"
        >
          ログイン
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-[#5a5668]">
        お困りの場合は{" "}
        <Link
          href={`/contact?type=${userType}`}
          className="text-[#9994a8] hover:text-[#eeeaf4]"
        >
          お問い合わせ
        </Link>
      </p>
    </AuthLayout>
  );
}
