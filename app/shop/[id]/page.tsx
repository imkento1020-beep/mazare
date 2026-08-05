"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchShopById,
  fetchShopInterestCount,
  fetchShopPosts,
  fetchUserInterestForPost,
} from "@/lib/shop/api";
import { fetchVibePosts } from "@/lib/home/api";
import {
  addFavoriteShop,
  isShopFavorited,
  removeFavoriteShop,
} from "@/lib/favorites/api";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import {
  formatGenre,
  formatOpenHours,
  getShopCoverImages,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
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
import { getDistanceLabel } from "@/lib/geo/haversine";
import { useUserLocation } from "@/hooks/useUserLocation";
import CheckinAvatarStack from "@/components/checkins/CheckinAvatarStack";
import BackButton from "@/components/layout/BackButton";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import ShopVibePostItem from "@/components/home/ShopVibePostItem";
import type { User } from "@supabase/supabase-js";

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  return "🕺";
}

function CoverGallery({ shop, posts }: { shop: Shop; posts: VibePost[] }) {
  const images = [
    ...getShopCoverImages(shop),
    ...posts.flatMap((post) => post.images ?? []),
  ].slice(0, 8);

  if (images.length === 0) {
    return (
      <div className="flex h-[240px] items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-6xl">
        {genreEmoji(formatGenre(shop.genre))}
      </div>
    );
  }

  return (
    <div className="flex h-[240px] snap-x snap-mandatory overflow-x-auto">
      {images.map((src, index) => (
        <div key={`${src}-${index}`} className="h-[240px] w-full shrink-0 snap-center">
          {src.startsWith("data:") || src.startsWith("http") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-5xl">
              {genreEmoji(formatGenre(shop.genre))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ShopDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const { location: userLocation } = useUserLocation();

  const [user, setUser] = useState<User | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
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

      const [shopResult, postsResult, count, allPostsResult] = await Promise.all([
        fetchShopById(shopId),
        fetchShopPosts(shopId),
        fetchShopInterestCount(shopId),
        fetchVibePosts(),
      ]);

      if (shopResult.error || !shopResult.data) {
        setError(shopResult.error ?? "店舗が見つかりません");
        setLoading(false);
        return;
      }

      setShop(shopResult.data);
      setPosts(postsResult.data ?? []);
      setSidebarPosts(allPostsResult.data ?? []);
      setInterestCount(count);

      const firstPost = postsResult.data?.[0];
      if (firstPost) {
        const hasInterest = await fetchUserInterestForPost(
          session.user.id,
          firstPost.id,
        );
        setInterested(hasInterest);
      }

      const { favorited: isFav } = await isShopFavorited(
        session.user.id,
        shopId,
      );
      setFavorited(isFav);

      const alreadyCheckedIn = await hasActiveCheckin(
        session.user.id,
        shopId,
      );
      setCheckedIn(alreadyCheckedIn);

      const checkinsResult = await fetchActiveCheckinUsersForShop(shopId);
      setCheckinUsers(checkinsResult.data);

      setLoading(false);
    }

    load();
  }, [shopId, router]);

  async function handleInterestToggle() {
    if (!user || !latestPost || submitting) return;

    setSubmitting(true);
    setError(null);

    const { error: mutationError } = interested
      ? await supabase
          .from("interests")
          .delete()
          .eq("user_id", user.id)
          .eq("vibe_post_id", latestPost.id)
      : await (async () => {
          const result = await supabase
            .from("interests")
            .insert({
              user_id: user.id,
              shop_id: shopId,
              vibe_post_id: latestPost.id,
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
    if (!user || checkinLoading) return;

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
  const distance = getDistanceLabel(userLocation, shop);

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

      <CoverGallery shop={shop} posts={posts} />

      <div className="mx-auto max-w-none pt-5 md:max-w-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-black">{shop.name}</h1>
            <p className="mt-1 text-sm text-[#ff3d00]">{formatGenre(shop.genre)}</p>
          </div>
          <FavoriteButton
            favorited={favorited}
            loading={favoriteLoading}
            onToggle={handleFavoriteToggle}
            compact
          />
        </div>
        <p className="mt-2 text-sm text-[#9994a8]">
          📍 {shop.address}
          {distance ? ` · ${distance}` : ""}
        </p>
        <p className="mt-1 text-sm text-[#9994a8]">
          🕙 {formatOpenHours(shop.open_hours)}
        </p>

        <CheckinAvatarStack users={checkinUsers} className="mt-4" />

        <div className="mt-5">
          <button
            type="button"
            onClick={handleInterestToggle}
            disabled={!latestPost || submitting}
            className={`w-full rounded-[13px] py-3.5 text-sm font-bold transition disabled:opacity-60 ${
              interested
                ? "border border-[#00e87a]/40 bg-[#00e87a]/12 text-[#00e87a]"
                : "bg-[#ff3d00] text-white hover:bg-[#e63600]"
            }`}
          >
            {submitting
              ? "送信中..."
              : interested
                ? "👋 行くかも ✓"
                : "👋 行くかも"}
          </button>
          <p className="mt-2 text-center text-sm text-[#9994a8]">
            {interestCount}人が行くかも
          </p>
        </div>

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
            {checkinLoading
              ? "処理中..."
              : checkedIn
                ? "✓ チェックイン中"
                : "📍 チェックイン"}
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
              posts.map((post) => <ShopVibePostItem key={post.id} post={post} />)
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
