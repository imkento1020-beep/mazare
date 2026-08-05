"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  createOwnerShop,
  fetchManagedShop,
} from "@/lib/owner/api";
import { uploadShopImages } from "@/lib/owner/uploadImages";
import { GENRE_OPTIONS, MAX_IMAGES } from "@/lib/owner/constants";
import { readFilesAsDataUrls } from "@/lib/files";
import StepIndicator from "@/components/owner/StepIndicator";
import OpenHoursInput from "@/components/owner/OpenHoursInput";
import OwnerLogoutButton from "@/components/owner/OwnerLogoutButton";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import {
  formatOpenHoursRange,
  validateOpenHoursRange,
} from "@/lib/shop/openHours";
import { rolesToMetadata } from "@/lib/auth/roles";
import type { User } from "@supabase/supabase-js";

export default function OwnerOnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [openHoursStart, setOpenHoursStart] = useState("");
  const [openHoursEnd, setOpenHoursEnd] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [coverImages, setCoverImages] = useState<string[]>([]);

  useEffect(() => {
    async function init() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        router.replace("/signup");
        return;
      }

      const { data: existingShop } = await fetchManagedShop(currentUser.id);
      if (existingShop || currentUser.user_metadata?.onboarding_completed) {
        router.replace("/owner/dashboard");
        return;
      }

      setUser(currentUser);
      setLoading(false);
    }

    init();
  }, [router]);

  function toggleGenre(genre: string) {
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - coverImages.length;
    const selected = files.slice(0, remaining);
    const urls = await readFilesAsDataUrls(selected);
    setCoverImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  async function handleSubmit() {
    if (!user) return;

    setSubmitting(true);
    setError(null);

    let uploadedCoverImages: string[] = [];
    if (coverImages.length > 0) {
      const { urls, error: uploadError } = await uploadShopImages(
        user.id,
        coverImages,
      );
      if (uploadError) {
        setSubmitting(false);
        setError(uploadError);
        return;
      }
      uploadedCoverImages = urls;
    }

    const { data: shop, error: shopError } = await createOwnerShop({
      ownerId: user.id,
      name: shopName,
      address,
      openHours: formatOpenHoursRange(openHoursStart, openHoursEnd),
      genres: Array.from(genres),
      coverImages: uploadedCoverImages,
    });

    if (shopError) {
      setSubmitting(false);
      setError(shopError.message);
      return;
    }

    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        shop_id: shop?.id,
        ...rolesToMetadata(["guest", "owner"]),
      },
    });

    router.replace("/owner/dashboard");
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!shopName.trim() || !address.trim()) {
        setError("店名と住所は必須です");
        return;
      }
      const hoursError = validateOpenHoursRange(openHoursStart, openHoursEnd);
      if (hoursError) {
        setError(hoursError);
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (genres.size === 0) {
        setError("ジャンルを1つ以上選択してください");
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      handleSubmit();
      return;
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <OwnerLayout isOnboarding title="お店を登録しましょう">
      <div className="max-w-xl">
        <StepIndicator step={step} total={3} />

        <form onSubmit={handleNext} className="mt-8 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium">
                  店名 <span className="text-[#ff3d00]">*</span>
                </label>
                <input
                  id="shopName"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="例: BAR MIX"
                  className={inputClassName}
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium">
                  住所 <span className="text-[#ff3d00]">*</span>
                </label>
                <input
                  id="address"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="例: 東京都渋谷区..."
                  className={inputClassName}
                />
              </div>
              <OpenHoursInput
                start={openHoursStart}
                end={openHoursEnd}
                onStartChange={setOpenHoursStart}
                onEndChange={setOpenHoursEnd}
                idPrefix="onboarding-openHours"
              />
            </>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-medium">ジャンル（複数選択可）</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {GENRE_OPTIONS.map((genre) => {
                  const selected = genres.has(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        selected
                          ? "border-[#ff3d00] bg-[#ff3d00]/10 text-[#ff3d00]"
                          : "border-white/[0.12] bg-[#111118] text-[#9994a8]"
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-sm font-medium">
                カバー画像（最大{MAX_IMAGES}枚・任意）
              </p>
              <p className="mt-1 text-xs text-[#9994a8]">
                登録後、ダッシュボードから今夜の雰囲気を発信できます
              </p>
              <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#5a5668] bg-[#111118]/50 px-4 py-10 text-center transition hover:border-[#ff3d00]/40">
                <span className="text-2xl">📷</span>
                <span className="mt-2 text-sm text-[#9994a8]">
                  タップして画像をアップロード
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={coverImages.length >= MAX_IMAGES}
                />
              </label>
              {coverImages.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {coverImages.map((src, index) => (
                    <div key={index} className="relative h-16 w-16 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt=""
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCoverImages((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 rounded-[13px] border border-white/12 bg-[#111118] py-3.5 text-sm font-bold text-[#9994a8]"
              >
                戻る
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className={`${primaryButtonClassName} ${step > 1 ? "flex-1" : ""}`}
            >
              {submitting
                ? "登録中..."
                : step === 3
                  ? "登録する"
                  : "次へ"}
            </button>
          </div>
        </form>

        <div className="mt-8 md:hidden">
          <OwnerLogoutButton />
        </div>
      </div>
    </OwnerLayout>
  );
}
