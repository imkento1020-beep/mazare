"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthLayout from "@/components/auth/AuthLayout";
import { getPasswordResetUrl } from "@/lib/auth/redirect";
import { getAuthErrorMessage } from "@/lib/auth/errors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSent(false);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: getPasswordResetUrl(),
      },
    );

    setLoading(false);

    if (resetError) {
      setError(getAuthErrorMessage(resetError, "reset"));
      return;
    }

    setSent(true);
  }

  return (
    <AuthLayout>
      <h2 className="text-2xl font-semibold text-[#eeeaf4]">
        パスワードを再発行
      </h2>
      <p className="mt-2 text-sm text-[#9994a8]">
        登録済みのメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
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
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-white/10 bg-[#111118] px-4 py-3 text-[#eeeaf4] placeholder:text-[#9994a8]/60 outline-none transition focus:border-[#ff3d00]/50 focus:ring-2 focus:ring-[#ff3d00]/20"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        {sent && (
          <p className="rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-3 text-sm text-[#00e87a]">
            パスワード再設定用のメールを送信しました。メール内のリンクから新しいパスワードを設定してください。
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#ff3d00] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e63600] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "送信中..." : "再設定メールを送信"}
        </button>
      </form>

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
