"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchLatestVibePostForInterest,
  fetchShopById,
  fetchShopInterestCount,
  fetchShopPosts,
  fetchUserInterestForPost,
} from "@/lib/shop/api";
import { fetchBrowseVibePostsBundleCached } from "@/lib/home/api";
import {
  addFavoriteShop,
  isShopFavorited,
  removeFavoriteShop,
} from "@/lib/favorites/api";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import {
  formatGenre,
  getShopCoverImages,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
import ShopOpenHours from "@/components/shop/ShopOpenHours";
import {
  createCheckin,
  checkout,
  fetchActiveCheckinUsersForShop,
  hasActiveCheckin,
} from "@/lib/checkins/api";
import type { CheckinUser } from "@/lib/checkins/api";
import {
  getDisplayName,
  syncGuestDisplayName,
} from "@/lib/mypage/api";
import { getPostCardLocationLabel } from "@/lib/geo/postCardLocation";
import {
  mergeShopNearestStations,
  useEnrichShopNearestStations,
} from "@/hooks/useEnrichShopNearestStations";
import { useUserLocation } from "@/hooks/useUserLocation";
import CheckinAvatarStack from "@/components/checkins/CheckinAvatarStack";
import BackButton from "@/components/layout/BackButton";
import PostAuthorBadge from "@/components/posts/PostAuthorBadge";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import ShopVibePostItem from "@/components/home/ShopVibePostItem";
import ShopInterestLabel from "@/components/posts/ShopInterestLabel";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { fetchInterestCountsByPostIds } from "@/lib/interests/postInterestCounts";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import GenreIcon from "@/components/icons/GenreIcon";
import { FeedPinIcon } from "@/components/icons/FeedActionIcons";
import { CheckIcon, CheckinIcon } from "@/components/icons/MazareIcons";

function genreFallback(genre: string) {
  return (
    <GenreIcon genre={genre} size={48} color="rgba(255,61,0,0.45)" />
  );
}

function CoverGallery({ shop, posts }: { shop: Shop; posts: VibePost[] }) {
  const [googlePhotoFailed, setGooglePhotoFailed] = useState(false);
  const extraImages = [
    ...getShopCoverImages(shop),
    ...posts.flatMap((post) => post.images ?? []),
  ].slice(0, 7);
  const googlePhotoSrc = `/api/shops/${shop.id}/photo`;
  const showGooglePhoto = !googlePhotoFailed;

  if (!showGooglePhoto && extraImages.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200]">
        {genreFallback(formatGenre(shop.genre))}
      </div>
    );
  }

  return (
    <div className="flex h-[240px] snap-x snap-mandatory overflow-x-auto">
      {showGooglePhoto ? (
        <div className="h-[240px] w-full shrink-0 snap-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={googlePhotoSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setGooglePhotoFailed(true)}
          />
        </div>
      ) : null}
      {extraImages.map((src, index) => (
        <div key={`${src}-${index}`} className="h-[240px] w-full shrink-0 snap-center">
          {src.startsWith("data:") || src.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200]">
              {genreFallback(formatGenre(shop.genre))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  const { location: userLocation } = useUserLocation();
  const { openAuthPrompt } = useAuthPrompt();
  const { user } = useAnonymousAuth();

  const [shop, setShop] = useState<Shop | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [interestPost, setInterestPost] = useState<VibePost | null>(null);
  const [sidebarPosts, setSidebarPosts] = useState<VibePost[]>([]);
  const [interestCount, setInterestCount] = useState(0);
  const [interested, setInterested] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinUsers, setCheckinUsers] = useState<CheckinUser[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const latestPost = posts[0] ?? null;
  const tonightCupTotals = useMemo(
    () => buildTonightCumulativeCupTotals(posts),
    [posts],
  );
  const stationMap = useEnrichShopNearestStations(shop ? [shop] : []);
  const enrichedShop = useMemo(
    () => mergeShopNearestStations(shop, stationMap) ?? shop,
    [shop, stationMap],
  );
  const postsForDisplay = useMemo(
    () =>
      enrichedShop
        ? posts.map((post) => ({
            ...post,
            shops: post.shops ?? enrichedShop,
          }))
        : posts,
    [posts, enrichedShop],
  );
  const [postInterestCounts, setPostInterestCounts] = useState<
    Map<string, number>
  >(new Map());
  const [postCommentCounts, setPostCommentCounts] = useState<
    Map<string, number>
  >(new Map());

  useEffect(() => {
    async function load() {
      const [shopResult, postsResult, count, browseResult] = await Promise.all([
        fetchShopById(shopId),
        fetchShopPosts(shopId),
        fetchShopInterestCount(shopId),
        fetchBrowseVibePostsBundleCached(),
      ]);

      if (shopResult.error || !shopResult.data) {
        setError(shopResult.error ?? "店舗が見つかりません");
        setLoading(false);
        return;
      }

      setShop(shopResult.data);
      const postList = (postsResult.data ?? []).map((post) => ({
        ...post,
        shops: post.shops ?? shopResult.data,
      }));
      setPosts(postList);
      setSidebarPosts(browseResult.data?.posts ?? []);
      setInterestCount(count);

      const tonightAnchor = postList[0] ?? null;
      const interestTarget =
        tonightAnchor ??
        (await fetchLatestVibePostForInterest(shopId)).data ??
        null;
      setInterestPost(interestTarget);

      const ids = postList.map((post) => post.id);
      void Promise.all([
        fetchInterestCountsByPostIds(ids),
        fetchCommentCountsByPostIds(ids),
      ]).then(([interestByPost, commentByPost]) => {
        setPostInterestCounts(interestByPost);
        setPostCommentCounts(commentByPost);
      });

      const checkinsResult = await fetchActiveCheckinUsersForShop(shopId);
      setCheckinUsers(checkinsResult.data);

      setLoading(false);
    }

    load();
  }, [shopId]);

  useEffect(() => {
    if (!user || !interestPost) {
      setInterested(false);
      return;
    }

    void fetchUserInterestForPost(user.id, interestPost.id).then(setInterested);
  }, [user, interestPost]);

  useEffect(() => {
    if (!user) {
      setFavorited(false);
      setCheckedIn(false);
      return;
    }

    void (async () => {
      const { favorited: isFav } = await isShopFavorited(user.id, shopId);
      setFavorited(isFav);
      const alreadyCheckedIn = await hasActiveCheckin(user.id, shopId);
      setCheckedIn(alreadyCheckedIn);
    })();
  }, [user, shopId]);

  async function handleInterestToggle() {
    if (!interestPost || submitting) return;
    if (!isRegisteredUser(user)) {
      openAuthPrompt({
        title: "ログインして「今夜行くかも」",
        description: "このお店に「今夜行くかも」を送るにはログインが必要です。",
        returnPath: `/shop/${shopId}`,
      });
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: mutationError } = interested
      ? await supabase
          .from("interests")
          .delete()
          .eq("user_id", user.id)
          .eq("vibe_post_id", interestPost.id)
      : await (async () => {
          const result = await supabase
            .from("interests")
            .insert({
              user_id: user.id,
              shop_id: shopId,
              vibe_post_id: interestPost.id,
            })
            .select("id")
            .single();

          if (!result.error && result.data?.id) {
            await notifyPostInterestCreated(result.data.id);
          }

          return result;
        })();

    setSubmitting(false);

    if (mutationError) {
      setError(mutationError.message);
      return;
    }

    setInterested(!interested);
    setInterestCount((prev) => Math.max(0, prev + (interested ? -1 : 1)));
  }

  async function handleCheckinToggle() {
    if (checkinLoading) return;
    if (!user) return;

    setCheckinLoading(true);
    setError(null);

    if (checkedIn) {
      const { error: checkoutError } = await checkout({
        userId: user.id,
        shopId,
      });

      setCheckinLoading(false);

      if (checkoutError) {
        setError(checkoutError);
        return;
      }

      setCheckedIn(false);
      const checkinsResult = await fetchActiveCheckinUsersForShop(shopId);
      setCheckinUsers(checkinsResult.data);
      return;
    }

    await syncGuestDisplayName(user.id, getDisplayName(user));

    const { error: checkinError } = await createCheckin({
      userId: user.id,
      shopId,
    });

    setCheckinLoading(false);

    if (checkinError) {
      setError(checkinError);
      return;
    }

    setCheckedIn(true);
    const checkinsResult = await fetchActiveCheckinUsersForShop(shopId);
    setCheckinUsers(checkinsResult.data);
  }

  async function handleFavoriteToggle() {
    if (!user || favoriteLoading) return;

    setFavoriteLoading(true);
    setError(null);

    const { error: mutationError } = favorited
      ? await removeFavoriteShop(user.id, shopId)
      : await addFavoriteShop(user.id, shopId);

    setFavoriteLoading(false);

    if (mutationError) {
      setError(mutationError);
      return;
    }

    setFavorited(!favorited);
  }

  if (loading) return <LoadingScreen />;

  if (!shop) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-[#080810] px-6 text-center">
        <p className="text-[#9994a8]">{error ?? "店舗が見つかりません"}</p>
        <Link href="/home" className="mt-4 text-sm text-[#ff3d00]">
          ホームへ戻る
        </Link>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;
  const locationLabel = getPostCardLocationLabel(userLocation, enrichedShop);

  return (
    <GuestLayout
      mobileTitle={shop.name}
      menuOnly
      showFilters={false}
      showRightSidebar
      showMobileSearch={false}
      posts={sidebarPosts}
      filteredCount={sidebarPosts.length}
    >
      <div className="mb-4 md:hidden">
        <BackButton href="/home" />
      </div>

      <CoverGallery shop={enrichedShop ?? shop} posts={posts} />

      <div className="mx-auto max-w-none pt-5 md:max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black">{shop.name}</h1>
            {latestPost && (
              <PostAuthorBadge post={latestPost} className="mt-2" />
            )}
            <p className="mt-1 text-sm text-[#ff3d00]">{formatGenre(shop.genre)}</p>
          </div>
          {user && (
            <FavoriteButton
              favorited={favorited}
              loading={favoriteLoading}
              onToggle={handleFavoriteToggle}
              compact
            />
          )}
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-sm text-[#9994a8]">
          <span className="mt-0.5 shrink-0">
            <FeedPinIcon size={14} color="#9994a8" />
          </span>
          {locationLabel !== "—" ? locationLabel : shop.address}
        </p>
        <ShopOpenHours hours={shop.open_hours} className="mt-3" />

        <CheckinAvatarStack users={checkinUsers} className="mt-4" />

        <div className="mt-5">
          <button
            type="button"
            onClick={handleInterestToggle}
            disabled={!interestPost || submitting}
            className={`w-full rounded-[13px] py-3.5 text-sm font-bold transition disabled:opacity-60 ${
              interested
                ? "border border-[#00e87a]/40 bg-[#00e87a]/12 text-[#00e87a]"
                : "bg-[#ff3d00] text-white hover:bg-[#e63600]"
            }`}
          >
            <ShopInterestLabel interested={interested} loading={submitting} />
          </button>
          <p className="mt-2 text-center text-sm text-[#9994a8]">
            {interestCount}人が行くかも
          </p>
          {!interestPost && (
            <p className="mt-1 text-center text-xs text-[#5a5668]">
              投稿がないため「行くかも」はまだ使えません
            </p>
          )}
        </div>

        <Link
          href={`/post?shopId=${shopId}`}
          className="mt-3 flex w-full items-center justify-center rounded-lg border border-[#ff3d00]/35 bg-[#ff3d00]/10 py-3 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/15"
        >
          このお店で投稿する
        </Link>

        <div className="mt-3">
          <button
            type="button"
            onClick={handleCheckinToggle}
            disabled={checkinLoading}
            className={`w-full rounded-lg border py-3 text-sm font-bold transition disabled:opacity-60 ${
              checkedIn
                ? "border-[rgba(0,232,122,0.4)] bg-[rgba(0,232,122,0.12)] text-[#00e87a]"
                : "border-white/[0.12] bg-[#18181f] text-[#eeeaf4] hover:border-white/20"
            }`}
          >
            {checkinLoading ? (
              "処理中..."
            ) : checkedIn ? (
              <span className="inline-flex items-center justify-center gap-2">
                <CheckIcon size={16} color="#00e87a" />
                チェックイン中
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <CheckinIcon size={16} color="currentColor" />
                チェックイン
              </span>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <section className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            今夜の発信
          </h2>
          <div className="mt-3 space-y-3">
            {posts.length === 0 ? (
              <p className="rounded-[14px] border border-white/7 bg-[#111118] p-4 text-sm text-[#9994a8]">
                今夜の発信はまだありません
              </p>
            ) : (
              postsForDisplay.map((post) => (
                <ShopVibePostItem
                  key={post.id}
                  post={post}
                  tonightTotalCups={tonightCupTotals.get(post.id) ?? null}
                  interestCount={postInterestCounts.get(post.id) ?? 0}
                  commentCount={postCommentCounts.get(post.id) ?? 0}
                  userLocation={userLocation}
                />
              ))
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[14px] border border-white/7 bg-[#111118] p-4">
          <h2 className="text-sm font-bold text-[#eeeaf4]">お店の基本情報</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#9994a8]">
            {shop.description ??
              `${shop.name}は${formatGenre(shop.genre)}。知らない人とも自然に混ざれる、今夜行きたい場所です。`}
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#ff3d00] hover:underline"
          >
            Googleマップで開く →
          </a>
        </section>
      </div>
    </GuestLayout>
  );
}
