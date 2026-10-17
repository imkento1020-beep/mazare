"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  deriveLiveShopIdsFromPosts,
  fetchBrowseVibePostsBundleCached,
} from "@/lib/home/api";
import { AREA_FILTERS } from "@/lib/home/filters";
import type { VibePost } from "@/lib/home/types";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import SearchIcon from "@/components/icons/SearchIcon";
import SearchModeToggle, {
  type SearchMode,
} from "@/components/search/SearchModeToggle";
import SearchShopCard from "@/components/search/SearchShopCard";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";
import MotionPanel from "@/components/ui/MotionPanel";
import TonightSocialMoodBadge from "@/components/profile/TonightSocialMoodBadge";
import {
  TONIGHT_SOCIAL_MOODS,
  type TonightSocialMoodId,
} from "@/lib/profile/tonightSocialMood";
import {
  buildShopSearchIndexFromShops,
  filterShopSearchItems,
  type ShopSearchItem,
} from "@/lib/search/shopSearch";
import {
  attachAuthorTonightMoods,
  filterPostSearchRows,
  type PartySizeFilter,
  type PostSearchRow,
} from "@/lib/search/postSearch";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { fetchInterestCountsByPostIds } from "@/lib/interests/postInterestCounts";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import SearchFilterSheet, {
  SearchFilterChip,
  SearchFilterGroup,
} from "@/components/search/SearchFilterSheet";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [postRows, setPostRows] = useState<PostSearchRow[]>([]);
  const [shopItems, setShopItems] = useState<ShopSearchItem[]>([]);
  const [liveShopIds, setLiveShopIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<SearchMode>("shops");
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set(["すべて"]));
  const [areas, setAreas] = useState<Set<string>>(new Set(["すべて"]));
  const [minTonightPosts, setMinTonightPosts] = useState(0);
  const [authorMoods, setAuthorMoods] = useState<Set<TonightSocialMoodId>>(
    new Set(),
  );
  const [partySize, setPartySize] = useState<PartySizeFilter>("any");
  const [interestCounts, setInterestCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const countsRequestRef = useRef(0);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) setSearch(query);
    const m = searchParams.get("mode");
    if (m === "posts") setMode("posts");
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const bundleResult = await fetchBrowseVibePostsBundleCached();
      if (bundleResult.error || !bundleResult.data) {
        setLoading(false);
        return;
      }

      const { posts: list, shops } = bundleResult.data;
      setPosts(list);
      setLiveShopIds(deriveLiveShopIdsFromPosts(list));

      const [shopItemsNext, withMoods] = await Promise.all([
        Promise.resolve(buildShopSearchIndexFromShops(list, shops)),
        attachAuthorTonightMoods(list),
      ]);
      setShopItems(shopItemsNext);
      setPostRows(withMoods);
      setLoading(false);
    }

    void load();
  }, []);

  const filteredShops = useMemo(
    () =>
      filterShopSearchItems(shopItems, {
        search,
        genres,
        areas,
        minTonightPosts,
      }),
    [shopItems, search, genres, areas, minTonightPosts],
  );

  const filteredPosts = useMemo(
    () =>
      filterPostSearchRows(postRows, {
        search,
        areas,
        moods: authorMoods,
        partySize,
      }),
    [postRows, search, areas, authorMoods, partySize],
  );

  const tonightCupTotals = useMemo(
    () => buildTonightCumulativeCupTotals(filteredPosts),
    [filteredPosts],
  );

  const filteredPostIdsKey = useMemo(
    () => filteredPosts.map((p) => p.id).join(","),
    [filteredPosts],
  );

  useEffect(() => {
    if (mode !== "posts" || filteredPosts.length === 0) return;

    const requestId = ++countsRequestRef.current;
    const ids = filteredPosts.map((p) => p.id).slice(0, 48);

    void (async () => {
      const [interests, comments] = await Promise.all([
        fetchInterestCountsByPostIds(ids),
        fetchCommentCountsByPostIds(ids),
      ]);
      if (countsRequestRef.current !== requestId) return;
      setInterestCounts(interests);
      setCommentCounts(comments);
    })();
  }, [mode, filteredPostIdsKey, filteredPosts]);

  function toggleArea(id: string) {
    setAreas((prev) => {
      const next = new Set(prev);
      if (id === "すべて") return new Set(["すべて"]);
      next.delete("すべて");
      if (next.has(id)) next.delete(id);
      else next.add(id);
      if (next.size === 0) next.add("すべて");
      return next;
    });
  }

  function toggleAuthorMood(id: TonightSocialMoodId) {
    setAuthorMoods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading) return <LoadingScreen />;

  const resultCount = mode === "shops" ? filteredShops.length : filteredPosts.length;

  return (
    <GuestLayout
      mobileTitle="探す"
      search={search}
      onSearchChange={setSearch}
      genres={mode === "shops" ? genres : new Set(["すべて"])}
      moods={new Set()}
      areas={areas}
      onGenresChange={mode === "shops" ? setGenres : () => {}}
      onMoodsChange={() => {}}
      onAreasChange={setAreas}
      posts={posts}
      filteredCount={resultCount}
      showFilters={mode === "shops"}
      showRightSidebar
      hideMobileFilterButton={mode === "posts"}
    >
      <div className="mx-auto max-w-3xl space-y-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#eeeaf4]">
            探す
          </h1>
          <p className="mt-1 text-sm text-[#9994a8]">
            お店と今夜の投稿、どちらからでも
          </p>
        </div>

        <SearchModeToggle mode={mode} onChange={setMode} />

        {mode === "shops" && (
          <SearchFilterSheet title="今夜の盛り上がり">
            <SearchFilterGroup label="今夜の投稿数">
              {[
                { value: 0, label: "指定なし" },
                { value: 1, label: "1件以上" },
                { value: 3, label: "3件以上" },
              ].map((opt) => (
                <SearchFilterChip
                  key={opt.value}
                  active={minTonightPosts === opt.value}
                  onClick={() => setMinTonightPosts(opt.value)}
                >
                  {opt.label}
                </SearchFilterChip>
              ))}
            </SearchFilterGroup>
          </SearchFilterSheet>
        )}

        {mode === "posts" && (
          <SearchFilterSheet>
            <SearchFilterGroup label="今の人数">
              {(
                [
                  ["any", "指定なし"],
                  ["solo", "1人"],
                  ["small", "2〜3人"],
                  ["large", "4人以上"],
                ] as const
              ).map(([id, label]) => (
                <SearchFilterChip
                  key={id}
                  active={partySize === id}
                  accent="green"
                  onClick={() => setPartySize(id)}
                >
                  {label}
                </SearchFilterChip>
              ))}
            </SearchFilterGroup>
            <SearchFilterGroup label="投稿者の今夜の気分">
              {TONIGHT_SOCIAL_MOODS.map((m) => (
                <SearchFilterChip
                  key={m.id}
                  active={authorMoods.has(m.id)}
                  onClick={() => toggleAuthorMood(m.id)}
                >
                  {m.label}
                </SearchFilterChip>
              ))}
            </SearchFilterGroup>
            <SearchFilterGroup label="エリア">
              {AREA_FILTERS.map((a) => (
                <SearchFilterChip
                  key={a.id}
                  active={areas.has(a.id)}
                  onClick={() => toggleArea(a.id)}
                >
                  {a.label}
                </SearchFilterChip>
              ))}
            </SearchFilterGroup>
          </SearchFilterSheet>
        )}

        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[#eeeaf4]">
              {mode === "shops" ? "お店一覧" : "投稿一覧"}
            </p>
            {search.trim() && (
              <p className="mt-0.5 text-xs text-[#9994a8]">
                「{search.trim()}」で検索中
              </p>
            )}
          </div>
          {mode === "posts" && (
            <span className="rounded-full bg-[#18181f] px-3 py-1 text-xs font-bold tabular-nums text-[#ff3d00]">
              {resultCount}件
            </span>
          )}
        </div>

        <MotionPanel panelKey={mode}>
          {mode === "shops" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredShops.length === 0 ? (
                <EmptySearch />
              ) : (
                filteredShops.map((item) => (
                  <SearchShopCard
                    key={item.shop.id}
                    item={item}
                    live={liveShopIds.has(item.shop.id)}
                  />
                ))
              )}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filteredPosts.length === 0 ? (
                <EmptySearch />
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118]"
                  >
                    {post.author_tonight_social_mood && (
                      <div className="border-b border-white/[0.06] px-3 py-2">
                        <TonightSocialMoodBadge
                          mood={post.author_tonight_social_mood}
                          size="md"
                        />
                      </div>
                    )}
                    <GuestPostFeedCard
                      post={post}
                      tonightTotalCups={tonightCupTotals.get(post.id) ?? null}
                      interestCount={interestCounts.get(post.id) ?? 0}
                      commentCount={commentCounts.get(post.id) ?? 0}
                      showActions={false}
                    />
                  </article>
                ))
              )}
            </div>
          )}
        </MotionPanel>
      </div>
    </GuestLayout>
  );
}

function EmptySearch() {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-[#111118] px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#18181f]">
        <SearchIcon size={28} color="#5a5668" />
      </div>
      <p className="mt-4 text-sm font-bold text-[#eeeaf4]">
        条件に合う結果がありません
      </p>
      <p className="mt-2 text-sm text-[#9994a8]">
        キーワードやフィルターを変えてみてください
      </p>
    </div>
  );
}
