"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { invalidateCachedPrefix } from "@/lib/cache/clientCache";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import GoogleAttribution from "@/components/places/GoogleAttribution";
import { parseGuestPostBody } from "@/lib/guest-post/composeBody";
import { createGuestVibePost } from "@/lib/guest-post/createPost";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { FeedGlassIcon } from "@/components/icons/FeedActionIcons";
import { FireIcon } from "@/components/icons/MazareIcons";
import {
  countGuestPostsByUser,
  ensureAnonymousSession,
} from "@/lib/auth/anonymous";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import type { PlaceSummary } from "@/lib/places/types";
import {
  cachePlacesForPost,
  searchPlacesByTextForPostPage,
} from "@/lib/places/clientPlaces";
import { loadNearbyFromUserGesture } from "@/lib/places/loadNearbyFromUserGesture";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import { fetchShopById } from "@/lib/shop/api";
import { supabase } from "@/lib/supabase";
import type { Shop } from "@/lib/home/types";
import PostComposeProgress from "@/components/guest-post/compose/PostComposeProgress";
import PostStepShop from "@/components/guest-post/compose/PostStepShop";
import PostStepMedia from "@/components/guest-post/compose/PostStepMedia";
import PostStepFinish from "@/components/guest-post/compose/PostStepFinish";
import {
  LoadingBlock,
  LoadingOverlay,
} from "@/components/layout/LoadingScreen";
import {
  type PostComposeStep,
  postComposeStepOrder,
  type SelectedPostShop,
} from "@/lib/guest-post/postComposeSteps";
export default function PostPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openFormalRegistrationPrompt } = useAuthPrompt();
  const { user, ready: authReady, authError } = useAnonymousAuth();
  const { apiKey: mapsApiKey, loading: mapsKeyLoading } = useGoogleMapsApiKey();

  const urlShopId = searchParams.get("shopId")?.trim() || null;

  const [step, setStep] = useState<PostComposeStep>(
    urlShopId ? "media" : "shop",
  );
  const [lockedShop, setLockedShop] = useState<SelectedPostShop | null>(null);
  const [places, setPlaces] = useState<PlaceSummary[]>([]);
  const [userCoords, setUserCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(
    urlShopId,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [bodyText, setBodyText] = useState("");
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
  const [locationDenied, setLocationDenied] = useState(false);
  const [successShopName, setSuccessShopName] = useState<string | null>(null);
  const [checkinShop, setCheckinShop] = useState<{
    shopId: string;
    name: string;
  } | null>(null);
  const [loadingPresetShop, setLoadingPresetShop] = useState(Boolean(urlShopId));

  const shopPreselected = Boolean(lockedShop);
  const parsedBody = useMemo(() => parseGuestPostBody(bodyText), [bodyText]);

  const selectedShop = useMemo((): SelectedPostShop | null => {
    if (lockedShop) return lockedShop;
    const place = places.find((p) => p.shopId === selectedShopId);
    if (!place?.shopId) return null;
    return {
      id: place.shopId,
      name: place.name,
      address: place.address,
    };
  }, [lockedShop, places, selectedShopId]);

  const previewShop = useMemo((): Shop | null => {
    if (!selectedShop) return null;
    return {
      id: selectedShop.id,
      name: selectedShop.name,
      address: selectedShop.address,
      genre: null,
      open_hours: null,
    };
  }, [selectedShop]);

  const goBack = useCallback(() => {
    const order = postComposeStepOrder(shopPreselected);
    const index = order.indexOf(step);
    if (index > 0) setStep(order[index - 1]!);
  }, [shopPreselected, step]);

  const goNext = useCallback(() => {
    const order = postComposeStepOrder(shopPreselected);
    const index = order.indexOf(step);
    if (index >= 0 && index < order.length - 1) {
      setStep(order[index + 1]!);
    }
  }, [shopPreselected, step]);

  useEffect(() => {
    if (!urlShopId) return;

    let cancelled = false;
    void fetchShopById(urlShopId).then((result) => {
      if (cancelled) return;
      setLoadingPresetShop(false);
      if (!result.data) {
        setError(result.error ?? "店舗が見つかりません");
        setStep("shop");
        return;
      }
      setLockedShop({
        id: result.data.id,
        name: result.data.name,
        address: result.data.address,
      });
      setSelectedShopId(result.data.id);
      setStep("media");
    });

    return () => {
      cancelled = true;
    };
  }, [urlShopId]);

  useEffect(() => {
    if (!user?.id) {
      setCheckinShop(null);
      return;
    }

    let cancelled = false;

    void (async () => {
      const { data, error: checkinError } = await supabase
        .from("checkins")
        .select("shop_id, shops(name)")
        .eq("user_id", user.id)
        .gt("expires_at", new Date().toISOString())
        .order("checked_in_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled || checkinError || !data?.shop_id) return;

      const shopRow = data.shops as { name?: string } | null;
      setCheckinShop({
        shopId: String(data.shop_id),
        name: shopRow?.name?.trim() || "チェックイン中のお店",
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  function handleLoadNearbyClick() {
    if (!mapsApiKey) return;

    setLoadingPlaces(true);
    setError(null);
    setLocationDenied(false);

    void loadNearbyFromUserGesture(mapsApiKey).then((result) => {
      if (result.ok) {
        setUserCoords(result.coords);
        setPlaces(result.places);
      } else if (result.kind === "denied") {
        setLocationDenied(true);
      } else {
        setError(result.message);
      }
      setLoadingPlaces(false);
    });
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) return;

    setLoadingPlaces(true);
    setError(null);
    try {
      const found = await searchPlacesByTextForPostPage(query, {
        apiKey: mapsApiKey,
        origin: userCoords ?? undefined,
      });
      setPlaces(found);
      if (found.length === 0) {
        setError(
          "該当するお店が見つかりませんでした。店名や住所でもう一度試してください。",
        );
        return;
      }
      setLoadingPlaces(false);
      const cached = await cachePlacesForPost(found);
      setPlaces(cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    } finally {
      setLoadingPlaces(false);
    }
  }

  const hasMedia = imageFiles.length > 0 || Boolean(videoFile);

  function handleUseCheckinShop() {
    if (!checkinShop) return;
    setSelectedShopId(checkinShop.shopId);
    setPlaces((prev) => {
      if (prev.some((p) => p.shopId === checkinShop.shopId)) return prev;
      return [
        {
          googlePlaceId: `checkin-${checkinShop.shopId}`,
          name: checkinShop.name,
          address: "",
          latitude: 0,
          longitude: 0,
          types: [],
          openHoursText: null,
          photoUrl: null,
          shopId: checkinShop.shopId,
        },
        ...prev,
      ];
    });
  }

  async function handleSubmit() {
    if (!selectedShop) {
      setError("お店を選んでください");
      return;
    }
    if (!hasMedia) {
      setError("写真または動画を追加してください");
      setStep("media");
      return;
    }
    if (nightOut.stopNumber == null || nightOut.stopNumber < 1) {
      setError("今夜何軒目かを選んでください");
      setStep("finish");
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
    const { comment, hashtags } = parseGuestPostBody(bodyText);

    const result = await createGuestVibePost({
      userId: activeUser.id,
      shopId: selectedShop.id,
      hashtags,
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

    invalidateCachedPrefix("browse-vibe-posts");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("mazare_feed_refresh", "1");
    }
    setSuccessShopName(selectedShop.name);

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
          <p className="flex items-center justify-center gap-2 text-2xl font-black">
            <FireIcon size={28} color="#ff3d00" />
            投稿しました
          </p>
          <p className="mt-4 flex items-center justify-center gap-2 text-base font-semibold leading-relaxed text-[#eeeaf4]">
            <FeedGlassIcon size={20} color="#ffcc66" />
            引き続き、最高の夜を。乾杯！
          </p>
          <p className="mt-2 text-xs text-[#9994a8]">{successShopName}</p>
          <button
            type="button"
            onClick={() => router.push("/home?posted=1")}
            className="mt-8 inline-flex rounded-[14px] bg-[#ff3d00] px-6 py-3 text-sm font-bold text-white"
          >
            ホームへ
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  const showBack = postComposeStepOrder(shopPreselected).indexOf(step) > 0;
  const isFinish = step === "finish";

  return (
    <div
      className={`flex flex-col bg-[#080810] text-[#eeeaf4] ${
        isFinish
          ? "h-dvh max-h-dvh overflow-hidden"
          : "min-h-dvh max-h-dvh overflow-hidden"
      }`}
    >
      <Header />

      <div className="sticky top-16 z-20 border-b border-white/[0.06] bg-[#080810]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-2">
          {showBack ? (
            <button
              type="button"
              onClick={goBack}
              className="text-sm font-bold text-[#9994a8] hover:text-[#eeeaf4]"
            >
              戻る
            </button>
          ) : (
            <span className="w-10" />
          )}
          <p className="text-sm font-black">今夜のお店をシェア</p>
          {isFinish ? (
            <button
              type="button"
              disabled={submitting || !authReady}
              onClick={() => void handleSubmit()}
              className="text-sm font-black text-[#ff3d00] disabled:opacity-50"
            >
              {submitting ? "…" : "投稿"}
            </button>
          ) : (
            <span className="w-10" />
          )}
        </div>
        <div className="mx-auto max-w-lg px-4 pb-2">
          <PostComposeProgress current={step} shopPreselected={shopPreselected} />
        </div>
      </div>

      <main
        className={`mx-auto flex w-full max-w-lg min-h-0 flex-1 flex-col overflow-y-auto ${
          step === "finish"
            ? "overflow-hidden px-0 py-0 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0"
            : "px-4 py-4 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-28"
        }`}
      >
        {!mapsKeyLoading && !mapsApiKey && step === "shop" ? (
          <p className="mb-3 rounded-lg border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-4 py-3 text-xs text-[#ffaa00]">
            近くのお店の表示には Google Maps API キーが必要です。検索はサーバー経由で利用できます。
          </p>
        ) : null}
        {authReady && !user && authError ? (
          <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {authError}
          </p>
        ) : null}

        {step === "shop" ? (
          <PostStepShop
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            onLoadNearby={handleLoadNearbyClick}
            loadingPlaces={loadingPlaces}
            mapsKeyReady={Boolean(mapsApiKey) && !mapsKeyLoading}
            locationDenied={locationDenied}
            places={places}
            selectedShopId={selectedShopId}
            onSelectShop={setSelectedShopId}
            checkinShop={checkinShop}
            onUseCheckinShop={handleUseCheckinShop}
          />
        ) : null}

        {step === "media" && !selectedShop && loadingPresetShop ? (
          <LoadingBlock
            message="お店を読み込んでいます"
            submessage="投稿先の店舗情報を確認しています"
          />
        ) : null}

        {step === "media" && selectedShop ? (
          <PostStepMedia
            shopName={selectedShop.name}
            imageFiles={imageFiles}
            videoFile={videoFile}
            onChange={(images, video) => {
              setImageFiles(images);
              setVideoFile(video);
            }}
          />
        ) : null}

        {step === "finish" && previewShop ? (
          <PostStepFinish
            shop={previewShop}
            imageFiles={imageFiles}
            videoFile={videoFile}
            nightOut={nightOut}
            onNightOutChange={setNightOut}
            bodyText={bodyText}
            onBodyTextChange={setBodyText}
            comment={parsedBody.comment}
            hashtags={parsedBody.hashtags}
            userId={user?.id ?? null}
            shopLocked={shopPreselected}
            onChangeShop={
              shopPreselected
                ? undefined
                : () => {
                    setStep("shop");
                  }
            }
          />
        ) : null}

        {error ? (
          <p
            className={`mt-4 rounded-lg border border-red-500/30 bg-red-500/10 py-3 text-sm text-red-400 ${
              step === "finish" ? "mx-4 px-4" : "px-4"
            }`}
          >
            {error}
          </p>
        ) : null}

        {step !== "finish" ? (
          <GoogleAttribution className="mt-8" />
        ) : null}
      </main>

      {step !== "finish" ? (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-[110] border-t border-white/[0.06] bg-[#080810]/98 px-4 py-3 backdrop-blur-md md:bottom-0">
          <div className="mx-auto flex max-w-lg">
            <button
              type="button"
              disabled={
                (step === "shop" && !selectedShopId) ||
                (step === "media" && (!selectedShop || !hasMedia))
              }
              onClick={goNext}
              className="w-full rounded-[14px] bg-[#ff3d00] py-3.5 text-sm font-black text-white disabled:opacity-50"
            >
              次へ
            </button>
          </div>
        </div>
      ) : null}

      {submitting ? (
        <LoadingOverlay
          message="投稿しています"
          submessage="写真や動画がある場合は少し時間がかかります"
        />
      ) : null}

      <BottomNav />
    </div>
  );
}
