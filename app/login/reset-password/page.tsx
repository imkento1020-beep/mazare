"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import { getAuthErrorMessage } from "@/lib/auth/errors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepareRecoverySession() {
      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, ""),
      );
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      if (accessToken && refreshToken && type === "recovery") {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!cancelled) {
          if (sessionError) {
            setError(
              "リンクの有効期限が切れているか、既に使用されています。もう一度再発行してください。",
            );
          } else {
            setReady(true);
            window.history.replaceState({}, "", "/login/reset-password");
          }
          setChecking(false);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        if (session) {
          setReady(true);
        } else {
          setError(
            "パスワード再設定リンクからアクセスしてください。リンクの有効期限が切れている場合は、再発行をお試しください。",
          );
        }
        setChecking(false);
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setChecking(false);
        setError(null);
      }
    });

    prepareRecoverySession();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    if (password !== confirmPassword) {
      setError("パスワードが一致しません。");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (updateError) {
      setError(getAuthErrorMessage(updateError, "reset"));
      return;
    }

    await supabase.auth.signOut();
    setSuccess(true);
    window.setTimeout(() => router.replace("/login"), 2500);
  }

  if (checking) {
    return (
      <AuthLayout>
        <div className="py-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
          <p className="mt-4 text-sm text-[#9994a8]">確認中...</p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-[#eeeaf4]">
        新しいパスワードを設定
      </h2>
      <p className="mt-2 text-sm text-[#9994a8]">
        新しいパスワードを入力してください。
      </p>

      {!ready && error ? (
        <div className="mt-8 space-y-4">
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
          <Link
            href="/login/forgot-password"
            className="block text-center text-sm font-medium text-[#ff3d00] hover:text-[#e63600]"
          >
            パスワード再発行メールを送る →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#eeeaf4]"
            >
              新しいパスワード
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="6文字以上"
                className="w-full rounded-lg border border-white/10 bg-[#111118] py-3 pl-4 pr-12 text-[#eeeaf4] placeholder:text-[#9994a8]/60 outline-none transition focus:border-[#ff3d00]/50 focus:ring-2 focus:ring-[#ff3d00]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[#9994a8] transition hover:text-[#eeeaf4]"
                aria-label={showPassword ? "パスワードを隠す" : "パスワードを表示"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-[#eeeaf4]"
            >
              新しいパスワード（確認）
            </label>
            <input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="もう一度入力"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#111118] px-4 py-3 text-[#eeeaf4] placeholder:text-[#9994a8]/60 outline-none transition focus:border-[#ff3d00]/50 focus:ring-2 focus:ring-[#ff3d00]/20"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-3 text-sm text-[#00e87a]">
              パスワードを更新しました。ログイン画面に移動します...
            </p>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-lg bg-[#ff3d00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e63600] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "更新中..." : "パスワードを更新"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-[#9994a8]">
        <Link
          href="/login"
          className="font-medium text-[#ff3d00] transition hover:text-[#e63600]"
        >
          ログインに戻る
        </Link>
      </p>
    </AuthLayout>
  );
}
