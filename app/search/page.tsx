"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { fetchLiveShopIds, fetchVibePosts } from "@/lib/home/api";
import { filterPosts } from "@/lib/home/filters";
import {
  formatGenre,
  getShopCoverImages,
  type VibePost,
} from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";

function ShopResultCard({
  post,
  live,
}: {
  post: VibePost;
  live: boolean;
}) {
  const shop = post.shops;
  if (!shop) return null;

  const genre = formatGenre(shop.genre);
  const cover =
    post.images?.find((src) => src.startsWith("http") || src.startsWith("data:")) ??
    getShopCoverImages(shop)[0];

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="block overflow-hidden rounded-[14px] border border-white/7 bg-[#111118] transition hover:border-[#ff3d00]/30"
    >
      <div className="relative h-[120px] bg-[#18181f]">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">🍻</div>
        )}
        {live && (
          <span className="absolute left-3 top-3 rounded-md bg-[#ff3d00] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
            LIVE
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold">{shop.name}</h3>
        <p className="mt-1 text-xs text-[#ff3d00]">{genre}</p>
        <p className="mt-2 line-clamp-2 text-sm text-[#9994a8]">{post.comment}</p>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [liveShopIds, setLiveShopIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set(["すべて"]));
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<Set<string>>(new Set(["すべて"]));

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/login");
        return;
      }

      const [postsResult, liveIds] = await Promise.all([
        fetchVibePosts(),
        fetchLiveShopIds(),
      ]);

      setPosts(postsResult.data ?? []);
      setLiveShopIds(liveIds);
      setLoading(false);
    }

    load();
  }, [router]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, genres, moods, areas, search),
    [posts, genres, moods, areas, search],
  );

  if (loading) return <LoadingScreen />;

  return (
    <GuestLayout
      mobileTitle="探す"
      search={search}
      onSearchChange={setSearch}
      genres={genres}
      moods={moods}
      areas={areas}
      onGenresChange={setGenres}
      onMoodsChange={setMoods}
      onAreasChange={setAreas}
      posts={posts}
      filteredCount={filteredPosts.length}
      showFilters
      showRightSidebar
    >
      <div>
        <h1 className="text-xl font-black">お店を探す</h1>
        <p className="mt-1 text-sm text-[#9994a8]">
          {filteredPosts.length}件の発信が見つかりました
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full rounded-[14px] border border-white/7 bg-[#111118] p-8 text-center">
              <p className="text-4xl">🔍</p>
              <p className="mt-4 text-sm font-bold text-[#eeeaf4]">
                条件に合うお店が見つかりません
              </p>
              <p className="mt-2 text-sm text-[#9994a8]">
                キーワードやフィルターを変えてみてください
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <ShopResultCard
                key={post.id}
                post={post}
                live={liveShopIds.has(post.shop_id)}
              />
            ))
          )}
        </div>
      </div>
    </GuestLayout>
  );
}
