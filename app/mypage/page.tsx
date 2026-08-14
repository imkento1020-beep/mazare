"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { clearStoredAppMode } from "@/lib/auth/mode";
import {
  cancelInterest,
  fetchGuestProfile,
  fetchTonightInterests,
  fetchUserInterestStats,
  fetchUserInterests,
} from "@/lib/mypage/api";
import {
  fetchUserFavorites,
  removeFavoriteShop,
  type FavoriteShop,
} from "@/lib/favorites/api";
import { fetchLiveShopIds, fetchVibePosts } from "@/lib/home/api";
import { formatPostedAt } from "@/lib/home/types";
import type { InterestRow, TodayInterestRow, VibePost } from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import FavoriteShopCard from "@/components/favorites/FavoriteShopCard";
import TonightInterestCard from "@/components/interests/TonightInterestCard";
import type { GuestProfile } from "@/lib/mypage/types";
import type { User } from "@supabase/supabase-js";

export default function MyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [interests, setInterests] = useState<InterestRow[]>([]);
  const [todayInterests, setTodayInterests] = useState<TodayInterestRow[]>([]);
  const [favorites, setFavorites] = useState<FavoriteShop[]>([]);
  const [liveShopIds, setLiveShopIds] = useState<Set<string>>(new Set());
  const [sidebarPosts, setSidebarPosts] = useState<VibePost[]>([]);
  const [stats, setStats] = useState({ totalInterests: 0, visitedShops: 0 });
  const [cancelingInterestId, setCancelingInterestId] = useState<string | null>(null);
  const [removingFavoriteId, setRemovingFavoriteId] = useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

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

      const [profileResult, interestsResult, todayInterestsResult, interestStats, postsResult, favoritesResult, liveIds] =
        await Promise.all([
          fetchGuestProfile(session.user),
          fetchUserInterests(session.user.id),
          fetchTonightInterests(session.user.id),
          fetchUserInterestStats(session.user.id),
          fetchVibePosts(),
          fetchUserFavorites(session.user.id),
          fetchLiveShopIds(),
        ]);

      setProfile(profileResult.data);
      setInterests(interestsResult.data);
      setTodayInterests(todayInterestsResult.data);
      setStats(interestStats);
      setSidebarPosts(postsResult.data ?? []);
      if (favoritesResult.error) setFavoriteError(favoritesResult.error);
      setFavorites(favoritesResult.data);
      setLiveShopIds(liveIds);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleCancelTodayInterest(interestId: string) {
    if (!user || cancelingInterestId) return;

    setCancelingInterestId(interestId);

    const { error } = await cancelInterest(interestId, user.id);

    setCancelingInterestId(null);

    if (error) return;

    setTodayInterests((prev) => prev.filter((item) => item.id !== interestId));
    setInterests((prev) => prev.filter((item) => item.id !== interestId));
    setStats((prev) => ({
      ...prev,
      totalInterests: Math.max(0, prev.totalInterests - 1),
    }));
  }

  async function handleRemoveFavorite(shopId: string) {
    if (!user || removingFavoriteId) return;

    setRemovingFavoriteId(shopId);
    setFavoriteError(null);

    const { error } = await removeFavoriteShop(user.id, shopId);

    setRemovingFavoriteId(null);

    if (error) {
      setFavoriteError(error);
      return;
    }

    setFavorites((prev) => prev.filter((item) => item.shop_id !== shopId));
  }

  async function handleLogout() {
    setLoggingOut(true);
    clearStoredAppMode();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) return <LoadingScreen />;

  const displayName = profile?.display_name ?? "ゲスト";

  return (
    <GuestLayout
      mobileTitle="マイページ"
      menuOnly
      showFilters={false}
      showRightSidebar
      showMobileSearch={false}
      posts={sidebarPosts}
      filteredCount={sidebarPosts.length}
    >
      <section className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-5 text-center md:max-w-xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#18181f] text-3xl">
          {profile?.profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.profile_image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            "👤"
          )}
        </div>
        <h2 className="mt-4 text-xl font-black">{displayName}</h2>
        <p className="mt-1 text-sm text-[#9994a8]">{user?.email}</p>
        <Link
          href="/mypage/edit"
          className="mt-4 inline-block rounded-xl border border-white/12 bg-[#18181f] px-4 py-2 text-xs font-semibold text-[#9994a8] transition hover:border-[#ff3d00]/30 hover:text-[#eeeaf4]"
        >
          プロフィール編集
        </Link>
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3 md:max-w-xl">
        <div className="rounded-[14px] bg-[#111118] p-4 text-center">
          <p className="text-2xl font-black text-[#ff3d00]">
            {stats.totalInterests}
          </p>
          <p className="mt-1 text-xs text-[#5a5668]">行くかもした数</p>
        </div>
        <div className="rounded-[14px] bg-[#111118] p-4 text-center">
          <p className="text-2xl font-black text-[#ffaa00]">
            {stats.visitedShops}
          </p>
          <p className="mt-1 text-xs text-[#5a5668]">実際に行ったお店</p>
        </div>
      </section>

      <section id="favorite-shops" className="mt-8 md:max-w-3xl">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            お気に入りのお店
          </h2>
          {favorites.length > 0 && (
            <Link
              href="/favorites"
              className="text-xs font-semibold text-[#ff3d00] hover:underline"
            >
              すべて見る
            </Link>
          )}
        </div>

        {favoriteError && (
          <p className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {favoriteError}
          </p>
        )}

        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {favorites.length === 0 ? (
            <div className="col-span-full rounded-[14px] border border-white/[0.07] bg-[#111118] p-6 text-center">
              <p className="text-3xl">❤️</p>
              <p className="mt-3 text-sm font-bold text-[#eeeaf4]">
                お気に入りのお店はまだありません
              </p>
              <p className="mt-2 text-sm text-[#9994a8]">
                お店ページのハートボタンから保存できます
              </p>
              <Link
                href="/home"
                className="mt-4 inline-block text-sm font-semibold text-[#ff3d00] hover:underline"
              >
                お店を探す →
              </Link>
            </div>
          ) : (
            favorites.map((item) => (
              <FavoriteShopCard
                key={item.id}
                shop={item.shop}
                live={liveShopIds.has(item.shop_id)}
                onRemove={() => handleRemoveFavorite(item.shop_id)}
                removing={removingFavoriteId === item.shop_id}
              />
            ))
          )}
        </div>
      </section>

      <section id="today-interests" className="mt-8 scroll-mt-24 md:max-w-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            今夜の行くかもリスト
          </h2>
          <Link
            href="/tonight"
            className="text-xs font-semibold text-[#00e87a] hover:underline"
          >
            一覧を見る →
          </Link>
        </div>
        <p className="mt-1 text-xs text-[#5a5668]">17:00〜翌5:00に追加したお店</p>
        <div className="mt-3 space-y-2">
          {todayInterests.length === 0 ? (
            <p className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 text-sm text-[#9994a8]">
              今夜の行くかもはまだありません
            </p>
          ) : (
            todayInterests.map((item) => (
              <TonightInterestCard
                key={item.id}
                item={item}
                onCancel={handleCancelTodayInterest}
                canceling={cancelingInterestId === item.id}
              />
            ))
          )}
        </div>
      </section>

      <section className="mt-8 md:max-w-2xl">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          行くかも履歴
        </h2>
        <div className="mt-3 space-y-2">
          {interests.length === 0 ? (
            <p className="rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 text-sm text-[#9994a8]">
              まだ行くかもしたお店はありません
            </p>
          ) : (
            interests.map((item) => (
              <Link
                key={item.id}
                href={`/shop/${item.shop_id}`}
                className="block rounded-[14px] border border-white/[0.07] bg-[#111118] p-4 transition hover:border-[#ff3d00]/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold">
                    {item.vibe_posts?.shops?.name ?? "お店"}
                  </h3>
                  <span className="shrink-0 text-[10px] text-[#5a5668]">
                    {formatPostedAt(item.created_at)}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[#9994a8]">
                  {item.vibe_posts?.comment ?? "—"}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-8 w-full max-w-xl rounded-[13px] border border-[#ff3d00]/30 bg-transparent py-3.5 text-sm font-bold text-[#ff3d00] transition hover:bg-[#ff3d00]/10 disabled:opacity-60"
      >
        {loggingOut ? "ログアウト中..." : "ログアウト"}
      </button>
    </GuestLayout>
  );
}
