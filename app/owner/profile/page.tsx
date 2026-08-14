"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchManagedShop, updateOwnerShop, fetchShopDashboardStats } from "@/lib/owner/api";
import StaffManagementSection from "@/components/owner/StaffManagementSection";
import { uploadShopImages } from "@/lib/owner/uploadImages";
import { GENRE_OPTIONS, MAX_IMAGES } from "@/lib/owner/constants";
import { getShopCoverImages } from "@/lib/home/types";
import { readFilesAsDataUrls } from "@/lib/files";
import OpenHoursInput from "@/components/owner/OpenHoursInput";
import OwnerLogoutButton from "@/components/owner/OwnerLogoutButton";
import OwnerLayout from "@/components/layout/OwnerLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import {
  formatOpenHoursRange,
  parseOpenHours,
  validateOpenHoursRange,
} from "@/lib/shop/openHours";
import type { Shop } from "@/lib/home/types";
import type { User } from "@supabase/supabase-js";

export default function OwnerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [stats, setStats] = useState({ views: 0, interests: 0, checkins: 0 });
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [openHoursStart, setOpenHoursStart] = useState("");
  const [openHoursEnd, setOpenHoursEnd] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: managedShop, isOwner: shopOwner } = await fetchManagedShop(user.id);
      if (!managedShop) {
        router.replace("/owner/onboarding");
        return;
      }

      const dashboardStats = await fetchShopDashboardStats(managedShop.id);

      setUser(user);
      setIsOwner(shopOwner);
      setShop(managedShop);
      setShopName(managedShop.name);
      setAddress(managedShop.address);
      const hours = parseOpenHours(managedShop.open_hours);
      setOpenHoursStart(hours.start);
      setOpenHoursEnd(hours.end);
      setGenres(new Set(Array.isArray(managedShop.genre) ? managedShop.genre : []));
      setCoverImages(getShopCoverImages(managedShop));
      setStats({
        views: dashboardStats.views,
        interests: dashboardStats.interests,
        checkins: dashboardStats.checkins,
      });
      setLoading(false);
    }

    load();
  }, [router]);

  function toggleGenre(genre: string) {
    setGenres((prev) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - coverImages.length;
    const urls = await readFilesAsDataUrls(files.slice(0, remaining));
    setCoverImages((prev) => [...prev, ...urls].slice(0, MAX_IMAGES));
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shop || submitting) return;

    if (!isOwner) {
      setError("店舗情報の編集はオーナーのみ可能です");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSaved(false);

    const hoursError = validateOpenHoursRange(openHoursStart, openHoursEnd);
    if (hoursError) {
      setSubmitting(false);
      setError(hoursError);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      setError("ログインが必要です");
      return;
    }

    let uploadedCoverImages = coverImages;
    if (coverImages.some((image) => image.startsWith("data:"))) {
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

    const { error: updateError } = await updateOwnerShop(shop.id, {
      name: shopName,
      address,
      openHours: formatOpenHoursRange(openHoursStart, openHoursEnd),
      genres: Array.from(genres),
      coverImages: uploadedCoverImages,
      staffIds: (shop.staff_ids ?? []).filter((id) =>
        /^[0-9a-f-]{36}$/i.test(id),
      ),
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
  }

  if (loading) return <LoadingScreen />;

  return (
    <OwnerLayout shop={shop} stats={stats} title="お店のプロフィール">
      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
          <div>
            <p className="text-sm font-medium">カバー画像</p>
            <label className="mt-2 block cursor-pointer overflow-hidden rounded-xl border border-dashed border-[#5a5668]">
              {coverImages[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImages[0]}
                  alt=""
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="flex h-40 items-center justify-center bg-[#111118] text-[#5a5668]">
                  タップして変更
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
              />
            </label>
          </div>

          <div>
            <label htmlFor="shopName" className="block text-sm font-medium">
              店名
            </label>
            <input
              id="shopName"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium">
              住所
            </label>
            <input
              id="address"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClassName}
            />
          </div>

          <OpenHoursInput
            start={openHoursStart}
            end={openHoursEnd}
            onStartChange={setOpenHoursStart}
            onEndChange={setOpenHoursEnd}
            idPrefix="profile-openHours"
          />

          <div>
            <p className="text-sm font-medium">ジャンル</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {GENRE_OPTIONS.map((genre) => {
                const selected = genres.has(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
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

          {shop && user && (
          <StaffManagementSection
            shop={shop}
            user={user}
            isOwner={isOwner}
            onStaffIdsChange={(staffIds) =>
              setShop((prev) => (prev ? { ...prev, staff_ids: staffIds } : prev))
            }
          />
          )}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {saved && (
            <p className="rounded-lg border border-[#00e87a]/30 bg-[#00e87a]/10 px-4 py-3 text-sm text-[#00e87a]">
              保存しました
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !isOwner}
            className={primaryButtonClassName}
          >
            {submitting ? "保存中..." : isOwner ? "保存する" : "オーナーのみ編集可能"}
          </button>
      </form>

      <div className="mt-8 max-w-xl md:hidden">
        <OwnerLogoutButton />
      </div>
    </OwnerLayout>
  );
}
