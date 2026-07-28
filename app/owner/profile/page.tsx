"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchOwnerShop, updateOwnerShop } from "@/lib/owner/api";
import { GENRE_OPTIONS, MAX_IMAGES } from "@/lib/owner/constants";
import { parseCoverImages } from "@/lib/home/types";
import { readFilesAsDataUrls } from "@/lib/files";
import BackButton from "@/components/layout/BackButton";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import type { Shop } from "@/lib/home/types";

export default function OwnerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopName, setShopName] = useState("");
  const [address, setAddress] = useState("");
  const [openHours, setOpenHours] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set());
  const [coverImages, setCoverImages] = useState<string[]>([]);
  const [staffEmail, setStaffEmail] = useState("");
  const [staffIds, setStaffIds] = useState<string[]>([]);
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

      const { data: ownerShop } = await fetchOwnerShop(user.id);
      if (!ownerShop) {
        router.replace("/owner/onboarding");
        return;
      }

      setShop(ownerShop);
      setShopName(ownerShop.name);
      setAddress(ownerShop.address);
      setOpenHours(ownerShop.open_hours ?? "");
      setGenres(new Set(Array.isArray(ownerShop.genre) ? ownerShop.genre : []));
      setCoverImages(parseCoverImages(ownerShop.cover_image));
      setStaffIds(
        (user.user_metadata?.staff_emails as string[] | undefined) ??
          ownerShop.staff_ids ??
          [],
      );
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

  function handleAddStaff() {
    const email = staffEmail.trim();
    if (!email) return;
    setStaffIds((prev) => [...prev, email]);
    setStaffEmail("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!shop || submitting) return;

    setSubmitting(true);
    setError(null);
    setSaved(false);

    const { error: updateError } = await updateOwnerShop(shop.id, {
      name: shopName,
      address,
      openHours: openHours || "—",
      genres: Array.from(genres),
      coverImages,
      staffIds: (shop.staff_ids ?? []).filter((id) =>
        /^[0-9a-f-]{36}$/i.test(id),
      ),
    });

    if (!updateError && staffIds.some((id) => id.includes("@"))) {
      await supabase.auth.updateUser({
        data: { staff_emails: staffIds.filter((id) => id.includes("@")) },
      });
    }

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
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
        <h1 className="mt-6 text-2xl font-black">お店のプロフィール</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

          <div>
            <label htmlFor="openHours" className="block text-sm font-medium">
              営業時間
            </label>
            <input
              id="openHours"
              value={openHours}
              onChange={(e) => setOpenHours(e.target.value)}
              className={inputClassName}
            />
          </div>

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

          <div>
            <p className="text-sm font-medium">スタッフ管理</p>
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="メールアドレスで追加"
                className={`${inputClassName} mt-0 flex-1`}
              />
              <button
                type="button"
                onClick={handleAddStaff}
                className="shrink-0 rounded-xl border border-white/12 bg-[#111118] px-4 py-3 text-sm font-bold text-[#9994a8]"
              >
                追加
              </button>
            </div>
            {staffIds.length > 0 && (
              <ul className="mt-2 space-y-1">
                {staffIds.map((id, index) => (
                  <li
                    key={`${id}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-[#111118] px-3 py-2 text-sm text-[#9994a8]"
                  >
                    {id}
                    <button
                      type="button"
                      onClick={() =>
                        setStaffIds((prev) => prev.filter((_, i) => i !== index))
                      }
                      className="text-[#ff3d00]"
                    >
                      削除
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

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
            disabled={submitting}
            className={primaryButtonClassName}
          >
            {submitting ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </div>
  );
}
