"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import HashtagInput from "@/components/guest-post/HashtagInput";
import GuestPostMetaFields from "@/components/guest-post/GuestPostMetaFields";
import GuestPostComposePreview from "@/components/guest-post/GuestPostComposePreview";
import { createGuestVibePost } from "@/lib/guest-post/createPost";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { ensureAnonymousSession } from "@/lib/auth/anonymous";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { countGuestPostsByUser } from "@/lib/auth/anonymous";
import type { PlaceSummary } from "@/lib/places/types";
import {
  cachePlacesForPost,
  searchNearbyPlacesClient,
  searchPlacesByTextClient,
} from "@/lib/places/clientPlaces";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";

type PostPageClientProps = {
  googleMapsApiKey: string;
};

export default function PostPageClient({
  googleMapsApiKey,
}: PostPageClientProps) {
  const { openFormalRegistrationPrompt } = useAuthPrompt();
  const { user, ready: authReady, authError } = useAnonymousAuth();
  const { apiKey: mapsApiKey, loading: mapsKeyLoading } =
    useGoogleMapsApiKey(googleMapsApiKey);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [nightOut, setNightOut] = useState<NightOutInput>({
    stopNumber: null,
    drinkName: "",
    tonightTotalCups: null,
    partySize: null,
  });
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

  const previewShop = useMemo(() => {
    if (!selectedPlace?.shopId) return null;
    return {
      id: selectedPlace.shopId,
      name: selectedPlace.name,
      address: selectedPlace.address,
      genre: null,
      open_hours: null,
    };
  }, [selectedPlace]);

  const loadNearby = useCallback(async () => {
    if (!mapsApiKey) return;

    setLoadingPlaces(true);
    setError(null);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 12000,
        });
      });

      const found = await searchNearbyPlacesClient(mapsApiKey, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "位置情報またはお店の取得に失敗しました",
      );
    } finally {
      setLoadingPlaces(false);
    }
  }, [mapsApiKey]);

  useEffect(() => {
    if (mapsKeyLoading || !mapsApiKey) return;
    void loadNearby();
  }, [loadNearby, mapsApiKey, mapsKeyLoading]);

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    if (!mapsApiKey) {
      setError("Google Maps API キーを読み込めていません。");
      return;
    }

    setLoadingPlaces(true);
    setError(null);
    try {
      const found = await searchPlacesByTextClient(mapsApiKey, query);
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
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
    if (nightOut.stopNumber == null || nightOut.stopNumber < 1) {
      setError("今夜何軒目かを選んでください");
      return;
    }
    if (!authReady) {
      setError("接続を準備しています。少し待ってから再度お試しください。");
      return;
    }

    setSubmitting(true);
    setError(null);

    let activeUser = user;
    let sessionError = authError;
    if (!activeUser) {
      const session = await ensureAnonymousSession();
      activeUser = session.user;
      sessionError = session.error ?? sessionError;
    }

    if (!activeUser) {
      setSubmitting(false);
      setError(
        sessionError ??
          "ログインの準備に失敗しました。ページを再読み込みしてお試しください。",
      );
      return;
    }

    const priorCount = await countGuestPostsByUser(activeUser.id);

    const result = await createGuestVibePost({
      userId: activeUser.id,
      shopId: selectedShopId,
      hashtags: tags,
      nightOut,
      comment,
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
    setComment("");
    setNightOut({
      stopNumber: null,
      drinkName: "",
      tonightTotalCups: null,
      partySize: null,
    });
    setImageFiles([]);
    setVideoFile(null);

    const totalPosts = priorCount + 1;
    if (activeUser.is_anonymous && totalPosts >= 5) {
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
          <p className="mt-4 text-base font-semibold leading-relaxed text-[#eeeaf4]">
            引き続き、最高の夜を。乾杯！🍺
          </p>
          {successShopName && (
            <p className="mt-2 text-xs text-[#9994a8]">{successShopName}</p>
          )}
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
          写真か動画がメイン。近くのお店は距離が近い順に最大8件、ほかは検索で選べます。
        </p>
        {!mapsKeyLoading && !mapsApiKey && (
          <p className="mt-3 rounded-lg border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            Google Maps API キーが未設定です。Vercel の環境変数を確認してください。
          </p>
        )}
        {authReady && !user && authError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {authError}
          </p>
        )}

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
          <section className="mt-8 space-y-6">
            <div className="space-y-3 rounded-[16px] border border-[#ff3d00]/25 bg-[#111118] p-5">
              <h2 className="text-lg font-black">写真・動画</h2>
              <p className="text-[11px] text-[#9994a8]">
                任意・どちらか一方。カード上は縦 4:5 で表示されます
              </p>
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

            <GuestPostMetaFields
              userId={user?.id ?? null}
              value={nightOut}
              onChange={setNightOut}
            />

            <div className="space-y-3 rounded-[16px] border border-white/10 bg-[#111118] p-5">
              <label htmlFor="guest-post-comment" className="text-sm font-black">
                一言コメント（任意・140文字）
              </label>
              <textarea
                id="guest-post-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={140}
                rows={3}
                placeholder="今夜のひとこと…"
                className="w-full resize-none rounded-[12px] border border-white/10 bg-[#080810] px-4 py-3 text-sm leading-relaxed outline-none focus:border-[#ff3d00]/40"
              />
            </div>

            <GuestPostComposePreview
              imageFiles={imageFiles}
              videoFile={videoFile}
              nightOut={nightOut}
              comment={comment}
              shop={previewShop}
            />

            <details className="rounded-[12px] border border-white/10 bg-[#111118] px-4 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-[#5a5668]">
                ハッシュタグ（任意）
              </summary>
              <div className="mt-4">
                <HashtagInput tags={tags} onChange={setTags} />
              </div>
            </details>

            <button
              type="button"
              disabled={submitting || !authReady}
              onClick={() => void handleSubmit()}
              className="w-full rounded-[14px] bg-[#ff3d00] py-4 text-base font-black text-white disabled:opacity-60"
            >
              {!authReady
                ? "接続を準備中…"
                : submitting
                  ? "投稿中…"
                  : "投稿する"}
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
