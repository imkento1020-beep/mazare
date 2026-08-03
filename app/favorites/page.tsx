"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  fetchUserFavorites,
  removeFavoriteShop,
  type FavoriteShop,
} from "@/lib/favorites/api";
import { fetchLiveShopIds, fetchVibePosts } from "@/lib/home/api";
import type { VibePost } from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import FavoriteShopCard from "@/components/favorites/FavoriteShopCard";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteShop[]>([]);
  const [liveShopIds, setLiveShopIds] = useState<Set<string>>(new Set());
  const [sidebarPosts, setSidebarPosts] = useState<VibePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
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

      const [favoritesResult, liveIds, postsResult] = await Promise.all([
        fetchUserFavorites(session.user.id),
        fetchLiveShopIds(),
        fetchVibePosts(),
      ]);

      if (favoritesResult.error) setError(favoritesResult.error);

      setFavorites(favoritesResult.data);
      setLiveShopIds(liveIds);
      setSidebarPosts(postsResult.data ?? []);
      setLoading(false);
    }

    load();
  }, [router]);

  async function handleRemove(shopId: string) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) return;

    setRemovingId(shopId);
    setError(null);

    const { error: removeError } = await removeFavoriteShop(
      session.user.id,
      shopId,
    );

    setRemovingId(null);

    if (removeError) {
      setError(removeError);
      return;
    }

    setFavorites((prev) => prev.filter((item) => item.shop_id !== shopId));
  }

  if (loading) return <LoadingScreen />;

  return (
    <GuestLayout
      mobileTitle="お気に入り"
      menuOnly
      showFilters={false}
      showRightSidebar
      showMobileSearch={false}
      posts={sidebarPosts}
      filteredCount={sidebarPosts.length}
    >
      <div className="md:max-w-3xl">
        <h1 className="text-xl font-black">お気に入り</h1>
        <p className="mt-1 text-sm text-[#9994a8]">
          保存したお店をいつでも確認できます
        </p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {favorites.length === 0 ? (
            <div className="col-span-full rounded-[14px] border border-white/7 bg-[#111118] p-8 text-center">
              <p className="text-4xl">❤️</p>
              <p className="mt-4 text-sm font-bold text-[#eeeaf4]">
                お気に入りのお店はまだありません
              </p>
              <p className="mt-2 text-sm text-[#9994a8]">
                お店ページのハートボタンから、気になるお店を保存できます
              </p>
              <Link
                href="/home"
                className="mt-5 inline-block rounded-[13px] bg-[#ff3d00] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e63600]"
              >
                お店を探す
              </Link>
            </div>
          ) : (
            favorites.map((item) => (
              <FavoriteShopCard
                key={item.id}
                shop={item.shop}
                live={liveShopIds.has(item.shop_id)}
                onRemove={() => handleRemove(item.shop_id)}
                removing={removingId === item.shop_id}
              />
            ))
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
