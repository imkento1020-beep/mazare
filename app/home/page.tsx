"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { countByShopId, fetchVibePosts } from "@/lib/home/api";
import { filterPosts } from "@/lib/home/filters";
import type { VibePost } from "@/lib/home/types";
import FilterPanel from "@/components/home/FilterPanel";
import HomeSidebarRight from "@/components/home/HomeSidebarRight";
import VibePostCard from "@/components/home/VibePostCard";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "ホーム", href: "/home", active: true },
  { label: "地図", href: "/map", active: false },
  { label: "探す", href: "/search", active: false },
  { label: "マイページ", href: "/mypage", active: false },
];

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
  const [interestedPostIds, setInterestedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set(["すべて"]));
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<Set<string>>(new Set(["すべて"]));
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      await supabase.auth.refreshSession();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      setUser(session.user);

      const [postsResult, allInterestsResult, myInterestsResult] =
        await Promise.all([
          fetchVibePosts(),
          supabase.from("interests").select("shop_id"),
          supabase
            .from("interests")
            .select("vibe_post_id")
            .eq("user_id", session.user.id),
        ]);

      const errors: string[] = [];
      if (postsResult.error) errors.push(postsResult.error);
      if (allInterestsResult.error) errors.push(allInterestsResult.error.message);
      if (myInterestsResult.error) errors.push(myInterestsResult.error.message);
      if (errors.length > 0) setError(errors.join(" / "));

      setPosts(postsResult.data ?? []);
      setInterestCounts(countByShopId(allInterestsResult.data ?? []));
      setInterestedPostIds(
        new Set(
          (myInterestsResult.data ?? []).map(
            (row: { vibe_post_id: string }) => row.vibe_post_id,
          ),
        ),
      );
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, genres, moods, areas, search),
    [posts, genres, moods, areas, search],
  );

  const activeFilterCount =
    (genres.has("すべて") ? 0 : genres.size) +
    moods.size +
    (areas.has("すべて") ? 0 : areas.size);

  async function handleInterest(post: VibePost) {
    if (!user || submittingId) return;

    const isInterested = interestedPostIds.has(post.id);

    setSubmittingId(post.id);
    setError(null);

    const { error: mutationError } = isInterested
      ? await supabase
          .from("interests")
          .delete()
          .eq("user_id", user.id)
          .eq("vibe_post_id", post.id)
      : await supabase.from("interests").insert({
          user_id: user.id,
          shop_id: post.shop_id,
          vibe_post_id: post.id,
        });

    setSubmittingId(null);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }

    setInterestedPostIds((prev) => {
      const next = new Set(prev);
      if (isInterested) next.delete(post.id);
      else next.add(post.id);
      return next;
    });
    setInterestCounts((prev) => ({
      ...prev,
      [post.shop_id]: Math.max(
        0,
        (prev[post.shop_id] ?? 0) + (isInterested ? -1 : 1),
      ),
    }));
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#080810]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ff3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#080810] text-[#eeeaf4]">
      {/* Desktop navbar */}
      <header className="fixed inset-x-0 top-0 z-40 hidden h-16 items-center gap-10 border-b border-white/7 bg-[#080810]/92 px-10 backdrop-blur-xl lg:flex">
        <Link href="/home" className="shrink-0 text-2xl font-black tracking-tight">
          maz<span className="text-[#ff3d00]">a</span>re
        </Link>
        <div className="relative max-w-[480px] flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5a5668]">
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="エリア、ジャンル、雰囲気で探す..."
            className="w-full rounded-xl border border-white/12 bg-[#111118] py-2.5 pl-10 pr-4 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668]"
          />
        </div>
        <nav className="ml-auto flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-[10px] px-4 py-2 text-[13px] font-medium transition ${
                item.active
                  ? "text-[#ff3d00]"
                  : "text-[#9994a8] hover:bg-[#18181f] hover:text-[#eeeaf4]"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/7 bg-[#111118] text-base"
            aria-label="通知"
          >
            🔔
          </button>
          <Link
            href="/mypage"
            className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/7 bg-[#111118] text-base"
          >
            👤
          </Link>
        </nav>
      </header>

      {/* Mobile header */}
      <header className="sticky top-0 z-30 border-b border-white/7 bg-[#080810]/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-[480px] items-center justify-between">
          <Link href="/home" className="text-lg font-black tracking-tight">
            maz<span className="text-[#ff3d00]">a</span>re
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="relative rounded-lg px-3 py-1.5 text-xs font-medium text-[#9994a8] transition hover:bg-[#111118] hover:text-[#eeeaf4]"
            >
              フィルター
              {activeFilterCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff3d00] text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <Link
              href="/search"
              className="rounded-lg p-2 text-[#9994a8] hover:bg-[#111118]"
              aria-label="検索"
            >
              🔍
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 text-[#9994a8] hover:bg-[#111118]"
              aria-label="通知"
            >
              🔔
            </button>
          </div>
        </div>
      </header>

      <div className="lg:pt-16">
        <div className="mx-auto flex w-full max-w-[480px] lg:max-w-[1200px]">
          {/* Desktop left sidebar */}
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[260px] shrink-0 overflow-y-auto border-r border-white/7 px-5 py-7 lg:block">
            <FilterPanel
              genres={genres}
              moods={moods}
              areas={areas}
              onGenresChange={setGenres}
              onMoodsChange={setMoods}
              onAreasChange={setAreas}
            />
          </aside>

          {/* Main feed */}
          <main className="min-w-0 flex-1 px-4 py-4 lg:px-7 lg:py-6">
            {/* Mobile search */}
            <div className="relative mb-4 lg:hidden">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5668]">
                🔍
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="エリア、ジャンル、雰囲気で探す..."
                className="w-full rounded-xl border border-white/12 bg-[#111118] py-2.5 pl-10 pr-4 text-sm text-[#eeeaf4] outline-none placeholder:text-[#5a5668]"
              />
            </div>

            <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[#ff3d00]/20 bg-gradient-to-br from-[#ff3d00]/10 to-[#ffaa00]/6 px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3d00] opacity-60" />
                  <span className="relative h-2 w-2 rounded-full bg-[#ff3d00]" />
                </span>
                <p className="text-[13px] text-[#9994a8]">
                  今夜{" "}
                  <strong className="font-bold text-[#ffaa00]">
                    {filteredPosts.length}件の場所
                  </strong>{" "}
                  が「混ざれる」状態で発信中
                </p>
              </div>
              <span className="hidden text-xs text-[#5a5668] sm:inline">
                全{posts.length}件
              </span>
            </div>

            {error && (
              <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="mb-4 flex items-center justify-between">
              <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
                🔥 今夜ホット
              </p>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setGenres(new Set(["すべて"]));
                    setMoods(new Set());
                    setAreas(new Set(["すべて"]));
                    setSearch("");
                  }}
                  className="text-xs font-semibold text-[#ff3d00]"
                >
                  フィルター解除
                </button>
              )}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-8 text-center">
                <p className="text-sm font-medium text-[#ffaa00]">
                  条件に合う発信がありません
                </p>
                <p className="mt-2 text-xs text-[#9994a8]">
                  フィルターを変更するか、条件を解除してください
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredPosts.map((post) => (
                  <VibePostCard
                    key={post.id}
                    post={post}
                    interestCount={
                      post.shops ? (interestCounts[post.shops.id] ?? 0) : 0
                    }
                    interested={interestedPostIds.has(post.id)}
                    isSubmitting={submittingId === post.id}
                    onInterest={() => handleInterest(post)}
                  />
                ))}
              </div>
            )}
          </main>

          <HomeSidebarRight
            posts={posts}
            filteredCount={filteredPosts.length}
            areas={areas}
            onAreasChange={setAreas}
          />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-white/7 bg-[#080810]/95 backdrop-blur-md lg:hidden">
        <div className="grid grid-cols-4 px-2 py-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium ${
                item.active ? "text-[#ff3d00]" : "text-[#9994a8]"
              }`}
            >
              <span className="text-base">
                {item.label === "ホーム"
                  ? "🏠"
                  : item.label === "地図"
                    ? "🗺️"
                    : item.label === "探す"
                      ? "🔍"
                      : "👤"}
              </span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="閉じる"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/7 bg-[#111118] px-4 pb-24 pt-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold">フィルター</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="rounded-lg px-3 py-1 text-sm text-[#9994a8]"
              >
                閉じる
              </button>
            </div>
            <FilterPanel
              genres={genres}
              moods={moods}
              areas={areas}
              onGenresChange={setGenres}
              onMoodsChange={setMoods}
              onAreasChange={setAreas}
              showMenu={false}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-xl bg-[#ff3d00] py-3 text-sm font-bold text-white"
            >
              {filteredPosts.length}件を表示
            </button>
          </div>
        </div>
      )}

      <div className="h-20 lg:hidden" />
    </div>
  );
}
