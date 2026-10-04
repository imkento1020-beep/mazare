"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const fieldClassName =
  "w-full rounded-[12px] border border-white/[0.12] bg-[#111118] px-4 py-3 text-[#eeeaf4] placeholder:text-[#5a5668] outline-none focus:border-[#ff3d00]/50";

const labelClassName = "mb-1.5 block text-[13px] text-[#9994a8]";

export default function OwnerApplyPageClient() {
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (session?.access_token) {
      headers.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch("/api/owner/apply", {
      method: "POST",
      headers,
      body: JSON.stringify({
        shopName,
        address,
        phone,
        contactName,
        email,
        instagramUrl,
        message,
      }),
    });

    const data = (await response.json()) as { message?: string };

    setSubmitting(false);

    if (!response.ok) {
      setError(data.message ?? "申請の送信に失敗しました。");
      if (response.status === 502) {
        setCompleted(true);
      }
      return;
    }

    setCompleted(true);
  }

  if (completed) {
    return (
      <div className="mx-auto flex w-full max-w-[480px] flex-col items-center px-6 py-16 text-center">
        <h1 className="text-2xl font-black text-[#eeeaf4]">申請を受け付けました。</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">
          通常1〜2営業日以内に審査結果をご連絡します。
        </p>
        <Link
          href="/home"
          className="mt-10 inline-flex w-full max-w-[320px] items-center justify-center rounded-[14px] bg-[#ff3d00] px-10 py-4 text-base font-extrabold text-white"
        >
          ホームに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[480px] px-6 py-10">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="shopName" className={labelClassName}>
            店舗名
          </label>
          <input
            id="shopName"
            required
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="例：島唄酒場 ゆんたく"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="address" className={labelClassName}>
            住所
          </label>
          <input
            id="address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="例：東京都渋谷区道玄坂1-1-1"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClassName}>
            電話番号
          </label>
          <input
            id="phone"
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="例：03-1234-5678"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="contactName" className={labelClassName}>
            担当者名
          </label>
          <input
            id="contactName"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="例：渡辺 健人"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            メールアドレス
          </label>
          <input
            id="email"
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="例：info@example.com"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="instagramUrl" className={labelClassName}>
            InstagramアカウントURL（任意）
          </label>
          <input
            id="instagramUrl"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="例：https://instagram.com/yourshop"
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor="message" className={labelClassName}>
            mazareを使いたい理由（任意）
          </label>
          <textarea
            id="message"
            rows={4}
            maxLength={200}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例：当日の集客に困っていたので使ってみたいと思いました"
            className={`${fieldClassName} resize-none`}
          />
          <p className="mt-1 text-right text-xs text-[#5a5668]">
            {message.length}/200
          </p>
        </div>

        {error && (
          <p className="rounded-[12px] border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-[14px] bg-[#ff3d00] px-4 py-4 text-base font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "送信中..." : "申請する"}
        </button>
      </form>
    </div>
  );
}
