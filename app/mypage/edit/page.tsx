"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchGuestProfile,
  updateGuestProfile,
} from "@/lib/mypage/api";
import { uploadProfileImage } from "@/lib/mypage/uploadProfileImage";
import { readFileAsDataUrl } from "@/lib/files";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { inputClassName, primaryButtonClassName } from "@/lib/ui/styles";
import type { User } from "@supabase/supabase-js";

export default function MyPageEditPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      setUser(session.user);

      const { data: profile } = await fetchGuestProfile(session.user);
      setDisplayName(profile.display_name);
      setProfileImage(profile.profile_image);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const dataUrl = await readFileAsDataUrl(file);
    setProfileImage(dataUrl);
    e.target.value = "";
  }

  function handleRemoveImage() {
    setProfileImage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || submitting) return;

    setSubmitting(true);
    setError(null);

    let uploadedImage = profileImage;
    if (profileImage?.startsWith("data:")) {
      const { url, error: uploadError } = await uploadProfileImage(
        user.id,
        profileImage,
      );
      if (uploadError) {
        setSubmitting(false);
        setError(uploadError);
        return;
      }
      uploadedImage = url;
    }

    const { error: updateError } = await updateGuestProfile({
      userId: user.id,
      displayName,
      profileImage: uploadedImage,
    });

    setSubmitting(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    setProfileImage(uploadedImage);
    router.push("/mypage");
  }

  if (loading) return <LoadingScreen />;

  return (
    <GuestLayout
      mobileTitle="プロフィール編集"
      menuOnly
      showFilters={false}
      showRightSidebar={false}
      showMobileSearch={false}
    >
      <div className="md:max-w-xl">
        <Link
          href="/mypage"
          className="inline-flex items-center gap-1 text-sm text-[#9994a8] transition hover:text-[#eeeaf4]"
        >
          ← マイページに戻る
        </Link>

        <h1 className="mt-4 text-xl font-black">プロフィール編集</h1>
        <p className="mt-1 text-sm text-[#9994a8]">
          表示名とプロフィール画像を変更できます
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="text-center">
            <p className="text-sm font-medium">プロフィール画像</p>
            <label className="relative mx-auto mt-3 block h-24 w-24 cursor-pointer overflow-hidden rounded-full border border-dashed border-[#5a5668] bg-[#111118]">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl text-[#5a5668]">
                  👤
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {profileImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 text-xs font-semibold text-[#ff3d00]"
              >
                画像を削除
              </button>
            )}
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              表示名
            </label>
            <input
              id="displayName"
              required
              maxLength={32}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ゲスト"
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              readOnly
              value={user?.email ?? ""}
              className={`${inputClassName} cursor-not-allowed opacity-60`}
            />
            <p className="mt-1 text-xs text-[#5a5668]">
              メールアドレスはここでは変更できません
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
            {submitting ? "保存中..." : "保存する"}
          </button>
        </form>
      </div>
    </GuestLayout>
  );
}
