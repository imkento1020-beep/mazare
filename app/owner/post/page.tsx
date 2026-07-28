"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createVibePost, fetchOwnerShop } from "@/lib/owner/api";
import { MOOD_OPTIONS, MAX_IMAGES } from "@/lib/owner/constants";
import { readFilesAsDataUrls } from "@/lib/files";
import BackButton from "@/components/layout/BackButton";
import { primaryButtonClassName } from "@/lib/ui/styles";

export default function OwnerPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: shop } = await fetchOwnerShop(user.id);
      if (!shop) {
        router.replace("/owner/onboarding");
        return;
      }

      setShopId(shop.id);
      setLoading(false);
    }

    load();
  }, [router]);

  function toggleMood(id: string) {
    setMoods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    const urls = await readFilesAsDataUrls(files.slice(0, remaining));
    setImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shopId || submitting) return;

    if (!comment.trim()) {
      setError("今夜の様子を入力してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: postError } = await createVibePost({
      shopId,
      moods: Array.from(moods),
      comment: comment.trim(),
      images,
    });

    setSubmitting(false);

    if (postError) {
      setError(postError.message);
      return;
    }

    router.replace("/owner/dashboard");
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#080810] pb-10 text-[#eeeaf4]">
      <div className="mx-auto max-w-[480px] px-4 pt-4">
        <BackButton href="/owner/dashboard" label="ダッシュボード" />

        <h1 className="mt-6 text-2xl font-black">今夜の空気を発信する</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <p className="text-sm font-medium">ムード（複数選択可）</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((mood) => {
                const selected = moods.has(mood.id);
                return (
                  <button
                    key={mood.id}
                    type="button"
                    onClick={() => toggleMood(mood.id)}
                    className={`rounded-xl border px-2 py-3 text-center text-xs font-medium transition ${
                      selected
                        ? "border-[#ff3d00]/40 bg-[#ff3d00]/12 text-[#ff3d00]"
                        : "border-white/7 bg-[#111118] text-[#9994a8]"
                    }`}
                  >
                    <span className="block text-lg">{mood.emoji}</span>
                    {mood.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium">
              今夜の様子を一言で
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="例: カラオケ開放中！知らない人たちと大合唱になってます🎤"
              className="mt-2 min-h-[80px] w-full resize-none rounded-xl border border-white/[0.12] bg-[#18181f] px-4 py-3 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668] focus:border-[#ff3d00]/50"
            />
          </div>

          <div>
            <p className="text-sm font-medium">画像（最大{MAX_IMAGES}枚）</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((src, index) => (
                <div key={index} className="relative h-16 w-16">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setImages((prev) => prev.filter((_, i) => i !== index))
                    }
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#5a5668] text-xl text-[#5a5668] transition hover:border-[#ff3d00]/40">
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`${primaryButtonClassName} shadow-[0_6px_24px_rgba(255,61,0,0.25)]`}
          >
            {submitting ? "発信中..." : "発信する"}
          </button>
        </form>
      </div>
    </div>
  );
}
