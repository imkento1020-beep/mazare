"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import HashtagInput from "@/components/guest-post/HashtagInput";
import { createGuestVibePost } from "@/lib/guest-post/createPost";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { countGuestPostsByUser } from "@/lib/auth/anonymous";
import type { PlaceSummary } from "@/lib/places/types";
export default function PostPageClient() {
  const { openFormalRegistrationPrompt } = useAuthPrompt();
  const { user } = useAnonymousAuth();
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successShopName, setSuccessShopName] = useState<string | null>(null);

  const selectedPlace = useMemo(
    () => places.find((place) => place.shopId === selectedShopId) ?? null,
    [places, selectedShopId],
  );

  const loadNearby = useCallback(async () => {
    setLoadingPlaces(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });

      const response = await fetch("/api/places/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      });

      const json = (await response.json()) as {
        places?: PlaceSummary[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(json.error ?? "近くのお店の取得に失敗しました");
      }

      setPlaces(json.places ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "位置情報またはお店の取得に失敗しました",
      );
    } finally {
      setLoadingPlaces(false);
    }
  }, []);

  useEffect(() => {
    void loadNearby();
  }, [loadNearby]);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    setLoadingPlaces(true);
    setError(null);
    try {
      const response = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = (await response.json()) as {
        places?: PlaceSummary[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(json.error ?? "検索に失敗しました");
      }
      setPlaces(json.places ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoadingPlaces(false);
    }
  }

  async function handleSubmit() {
    if (!selectedShopId || !selectedPlace) {
      setError("お店を選んでください");
      return;
    }
    if (!user) {
      setError("接続を準備しています。少し待ってから再度お試しください。");
      return;
    }

    setSubmitting(true);
    setError(null);

    const priorCount = await countGuestPostsByUser(user.id);

    const result = await createGuestVibePost({
      userId: user.id,
      shopId: selectedShopId,
      hashtags: tags,
      imageFiles: videoFile ? undefined : imageFiles,
      videoFile,
    });

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccessShopName(selectedPlace.name);
    setTags([]);
    setImageFiles([]);
    setVideoFile(null);

    const totalPosts = priorCount + 1;
    if (user.is_anonymous && totalPosts >= 5) {
      openFormalRegistrationPrompt({
        returnPath: "/post",
        title: "5回目の投稿ありがとうございます",
        description:
          "これ以降も投稿や履歴を残すには正式登録（Google またはメール）をお願いします。",
      });
    }
  }

  if (successShopName) {
    return (
      <div className="flex min-h-dvh flex-col bg-[#080810] text-[#eeeaf4]">
        <Header />
        <main className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-6 py-12 text-center">
          <p className="text-2xl font-black">投稿しました🔥</p>
          <p className="mt-4 text-sm leading-relaxed text-[#9994a8]">
            あなたの投稿がこのお店を mazare に登録しました。
            <br />
            <span className="font-bold text-[#eeeaf4]">{successShopName}</span>
          </p>
          <Link
            href="/home"
            className="mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-6 py-3 text-sm font-bold text-white"
          >
            ホームへ
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] pb-28 text-[#eeeaf4] md:pb-8">
      <Header />

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <h1 className="text-2xl font-black">今夜のお店をシェア</h1>
        <p className="mt-2 text-sm text-[#9994a8]">
          お店を選んで、写真・動画・タグだけで投稿できます。
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex gap-2">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="お店名・エリアで検索"
            className="flex-1 rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3 text-sm outline-none focus:border-[#ff3d00]/40"
          />
          <button
            type="submit"
            className="rounded-[12px] bg-[#111118] px-4 text-sm font-bold text-[#ff3d00]"
          >
            検索
          </button>
        </form>

        <div className="mt-4 space-y-2">
          {loadingPlaces && (
            <p className="text-xs text-[#9994a8]">お店を読み込み中…</p>
          )}
          {places.map((place) => {
            const active = place.shopId === selectedShopId;
            return (
              <button
                key={place.googlePlaceId}
                type="button"
                disabled={!place.shopId}
                onClick={() => place.shopId && setSelectedShopId(place.shopId)}
                className={`w-full rounded-[12px] border p-4 text-left transition ${
                  active
                    ? "border-[#ff3d00]/50 bg-[#ff3d00]/10"
                    : "border-white/10 bg-[#111118]"
                }`}
              >
                <p className="font-bold">{place.name}</p>
                <p className="mt-1 text-xs text-[#9994a8]">{place.address}</p>
              </button>
            );
          })}
        </div>

        {selectedShopId && (
          <section className="mt-8 space-y-6 rounded-[16px] border border-white/10 bg-[#111118] p-5">
            <h2 className="text-lg font-black">投稿内容</h2>

            <div className="space-y-3">
              <p className="text-sm font-bold">写真または動画（任意）</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={Boolean(videoFile)}
                onChange={(event) => {
                  setVideoFile(null);
                  setImageFiles(Array.from(event.target.files ?? []).slice(0, 3));
                }}
                className="block w-full text-xs text-[#9994a8]"
              />
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                disabled={imageFiles.length > 0}
                onChange={(event) => {
                  setImageFiles([]);
                  setVideoFile(event.target.files?.[0] ?? null);
                }}
                className="block w-full text-xs text-[#9994a8]"
              />
              <p className="text-[11px] text-[#5a5668]">
                写真最大3枚（jpg/png/webp）または動画1本（30秒以内・mp4/mov）
              </p>
            </div>

            <HashtagInput tags={tags} onChange={setTags} />

            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleSubmit()}
              className="w-full rounded-[14px] bg-[#ff3d00] py-4 text-base font-black text-white disabled:opacity-60"
            >
              {submitting ? "投稿中…" : "投稿する"}
            </button>
          </section>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <GoogleAttribution className="mt-8" />
      </main>

      <BottomNav />
    </div>
  );
}
