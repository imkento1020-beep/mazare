"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import StaticPageLayout from "@/components/layout/StaticPageLayout";
import { submitContactInquiry } from "@/lib/contact/api";
import {
  CONTACT_CATEGORY_OPTIONS,
  INQUIRER_TYPE_OPTIONS,
  type ContactCategory,
  type InquirerType,
} from "@/lib/contact/types";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import { supabase } from "@/lib/supabase";

function parseInquirerType(value: string | null): InquirerType | null {
  if (value === "guest" || value === "owner" || value === "visitor") {
    return value;
  }
  return null;
}

function parseCategory(value: string | null): ContactCategory | null {
  const allowed: ContactCategory[] = [
    "general",
    "account",
    "shop",
    "report",
    "privacy",
    "other",
  ];
  return allowed.includes(value as ContactCategory)
    ? (value as ContactCategory)
    : null;
}

export default function ContactPageClient() {
  const searchParams = useSearchParams();
  const typeParam = parseInquirerType(searchParams.get("type"));
  const categoryParam = parseCategory(searchParams.get("category"));

  const [inquirerType, setInquirerType] = useState<InquirerType>(
    typeParam ?? "visitor",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<ContactCategory>(
    categoryParam ?? "general",
  );
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      setUserId(session.user.id);
      if (session.user.email) setEmail(session.user.email);

      const metaType = session.user.user_metadata?.user_type;
      if (!typeParam) {
        setInquirerType(metaType === "owner" ? "owner" : "guest");
      }

      const displayName = session.user.user_metadata?.display_name;
      if (typeof displayName === "string" && displayName.trim()) {
        setName(displayName.trim());
      }
    }

    loadSession();
  }, [typeParam]);

  useEffect(() => {
    if (typeParam) setInquirerType(typeParam);
  }, [typeParam]);

  useEffect(() => {
    if (categoryParam) setCategory(categoryParam);
  }, [categoryParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: submitError } = await submitContactInquiry({
      inquirerType,
      userId,
      name,
      email,
      category,
      message,
    });

    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <StaticPageLayout
        title="お問い合わせ"
        subtitle="送信が完了しました"
      >
        <div className="rounded-[14px] border border-[#00e87a]/30 bg-[#00e87a]/10 p-8 text-center">
          <p className="text-4xl">✉️</p>
          <p className="mt-4 text-lg font-bold text-[#eeeaf4]">
            お問い合わせを受け付けました
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
            内容を確認のうえ、ご登録のメールアドレスへご返信いたします。
            <br />
            通常2〜3営業日以内を目安にお待ちください。
          </p>
        </div>
      </StaticPageLayout>
    );
  }

  return (
    <StaticPageLayout
      title="お問い合わせ"
      subtitle="ご質問・ご要望・不具合報告などお気軽にどうぞ"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="text-sm font-medium text-[#eeeaf4]">
            お問い合わせ元 <span className="text-[#ff3d00]">*</span>
          </legend>
          <p className="mt-1 text-xs text-[#5a5668]">
            ゲスト側・店舗側のどちらからのお問い合わせかを選択してください
          </p>
          <div className="mt-3 space-y-2">
            {INQUIRER_TYPE_OPTIONS.map((option) => {
              const selected = inquirerType === option.value;
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${
                    selected
                      ? "border-[#ff3d00]/40 bg-[#ff3d00]/10"
                      : "border-white/[0.12] bg-[#111118] hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="inquirerType"
                    value={option.value}
                    checked={selected}
                    onChange={() => setInquirerType(option.value)}
                    className="mt-1 accent-[#ff3d00]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#eeeaf4]">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-[#9994a8]">
                      {option.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label htmlFor="contact-name" className="block text-sm font-medium">
            お名前 <span className="text-[#ff3d00]">*</span>
          </label>
          <input
            id="contact-name"
            required
            maxLength={64}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="山田 太郎"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="contact-email" className="block text-sm font-medium">
            メールアドレス <span className="text-[#ff3d00]">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="contact-category" className="block text-sm font-medium">
            お問い合わせ種別 <span className="text-[#ff3d00]">*</span>
          </label>
          <select
            id="contact-category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as ContactCategory)}
            className={inputClassName}
          >
            {CONTACT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contact-message" className="block text-sm font-medium">
            お問い合わせ内容 <span className="text-[#ff3d00]">*</span>
          </label>
          <textarea
            id="contact-message"
            required
            rows={6}
            maxLength={2000}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="お問い合わせ内容をご記入ください"
            className={`${inputClassName} min-h-[140px] resize-y`}
          />
          <p className="mt-1 text-right text-xs text-[#5a5668]">
            {message.length} / 2000
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={primaryButtonClassName}
        >
          {submitting ? "送信中..." : "送信する"}
        </button>

        <p className="text-xs leading-relaxed text-[#5a5668]">
          送信いただいた内容は、
          <Link href="/privacy" className="text-[#9994a8] underline hover:text-[#eeeaf4]">
            プライバシーポリシー
          </Link>
          に基づき適切に管理します。
        </p>
      </form>
    </StaticPageLayout>
  );
}
