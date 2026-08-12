"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { countByPostId, countByShopId, fetchAllShops, fetchVibePosts } from "@/lib/home/api";
import { filterPostsPostedTonight, filterPublishedPosts } from "@/lib/home/dates";
import { filterPosts, filterShops } from "@/lib/home/filters";
import { isNewShop } from "@/lib/home/newShops";
import { sortPostsByPopularity } from "@/lib/home/sorting";
import {
  fetchActivePromotionBoosts,
  sortPostsWithPromotions,
} from "@/lib/promotions";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import { formatSupabaseError, isJwtAuthError } from "@/lib/supabase/errors";
import { ensureFreshSession, signOutAndRedirectToLogin } from "@/lib/auth/session";
import { fetchActiveCheckinUsersByShopIds } from "@/lib/checkins/api";
import type { CheckinUser } from "@/lib/checkins/api";
import { fetchTonightInterests, cancelInterest } from "@/lib/mypage/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import type { Shop, TodayInterestRow, VibePost } from "@/lib/home/types";
import VibePostCard from "@/components/home/VibePostCard";
import HomeFeedToggle from "@/components/home/HomeFeedToggle";
import ShopBrowseCard from "@/components/home/ShopBrowseCard";
import TonightInterestsSection from "@/components/home/TonightInterestsSection";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import type { User } from "@supabase/supabase-js";

type HomeViewMode = "hot" | "popular" | "shops";

type HomePageClientProps = {
  googleMapsApiKey: string;
};

export default function HomePageClient({
  googleMapsApiKey,
}: HomePageClientProps) {
  const router = useRouter();
  const { apiKey: resolvedMapsApiKey } = useGoogleMapsApiKey(googleMapsApiKey);
  const { location: userLocation } = useUserLocation();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<VibePost[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [viewMode, setViewMode] = useState<HomeViewMode>("popular");
  const [interestCounts, setInterestCounts] = useState<Record<string, number>>({});
  const [postInterestCounts, setPostInterestCounts] = useState<
    Record<string, number>
  >({});
  const [interestedPostIds, setInterestedPostIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set(["すべて"]));
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<Set<string>>(new Set(["すべて"]));
  const [newShopsOnly, setNewShopsOnly] = useState(false);
  const [tonightInterests, setTonightInterests] = useState<TodayInterestRow[]>([]);
  const [cancelingTonightId, setCancelingTonightId] = useState<string | null>(null);
  const [checkinUsersByShop, setCheckinUsersByShop] = useState<
    Map<string, CheckinUser[]>
  >(new Map());

  useEffect(() => {
    async function fetchData() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      await ensureFreshSession();

      const {
        data: { session: activeSession },
      } = await supabase.auth.getSession();

      if (!activeSession?.user) {
        setLoading(false);
        router.replace("/login");
        return;
      }

      setUser(activeSession.user);

      const [postsResult, shopsResult, allInterestsResult, myInterestsResult, todayInterestsResult] =
        await Promise.all([
          fetchVibePosts(),
          fetchAllShops(),
          supabase.from("interests").select("shop_id, vibe_post_id"),
          supabase
            .from("interests")
            .select("vibe_post_id")
            .eq("user_id", activeSession.user.id),
          fetchTonightInterests(activeSession.user.id),
        ]);

      const rawErrors: string[] = [];
      if (postsResult.error) rawErrors.push(postsResult.error);
      if (shopsResult.error) rawErrors.push(shopsResult.error);
      if (allInterestsResult.error) {
        rawErrors.push(allInterestsResult.error.message);
      }
      if (myInterestsResult.error) {
        rawErrors.push(myInterestsResult.error.message);
      }
      if (rawErrors.some(isJwtAuthError)) {
        await signOutAndRedirectToLogin();
        return;
      }
      if (rawErrors.length > 0) {
        setError(rawErrors.map(formatSupabaseError).join(" / "));
      }

      const boosts = await fetchActivePromotionBoosts("home_feed");
      setPosts(
        sortPostsWithPromotions(postsResult.data ?? [], boosts),
      );
      setShops(shopsResult.data ?? []);
      setInterestCounts(countByShopId(allInterestsResult.data ?? []));
      setPostInterestCounts(countByPostId(allInterestsResult.data ?? []));
      setInterestedPostIds(
        new Set(
          (myInterestsResult.data ?? []).map(
            (row: { vibe_post_id: string }) => row.vibe_post_id,
          ),
        ),
      );
      setTonightInterests(todayInterestsResult.data);

      const shopIds = [
        ...new Set([
          ...(shopsResult.data ?? []).map((shop) => shop.id),
          ...(postsResult.data ?? []).map((post) => post.shop_id),
        ]),
      ];
      const checkinsMap = await fetchActiveCheckinUsersByShopIds(shopIds);
      setCheckinUsersByShop(checkinsMap);
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const filteredPosts = useMemo(
    () => filterPosts(posts, genres, moods, areas, search),
    [posts, genres, moods, areas, search],
  );

  const publishedPosts = useMemo(
    () => filterPublishedPosts(filteredPosts),
    [filteredPosts],
  );

  const hotPosts = useMemo(
    () =>
      sortPostsByPopularity(
        filterPostsPostedTonight(publishedPosts),
        postInterestCounts,
      ),
    [publishedPosts, postInterestCounts],
  );

  const popularPosts = useMemo(
    () => sortPostsByPopularity(publishedPosts, postInterestCounts),
    [publishedPosts, postInterestCounts],
  );

  const latestPostsByShop = useMemo(() => {
    const map = new Map<
      string,
      {
        comment: string;
        moods: string[] | null;
        images: string[] | null;
        posted_at: string | null;
      }
    >();
    for (const post of posts) {
      if (!map.has(post.shop_id)) {
        map.set(post.shop_id, {
          comment: post.comment,
          moods: post.moods,
          images: post.images ?? null,
          posted_at: post.posted_at ?? null,
        });
      }
    }
    return map;
  }, [posts]);

  const liveTonightShopIds = useMemo(() => {
    return new Set(hotPosts.map((post) => post.shop_id));
  }, [hotPosts]);

  const filteredShops = useMemo(() => {
    const rows = filterShops(
      shops,
      latestPostsByShop,
      genres,
      moods,
      areas,
      search,
      newShopsOnly,
    );

    return [...rows].sort((a, b) => {
      const aNew = isNewShop(a) ? 1 : 0;
      const bNew = isNewShop(b) ? 1 : 0;
      if (bNew !== aNew) return bNew - aNew;

      const interestDiff =
        (interestCounts[b.id] ?? 0) - (interestCounts[a.id] ?? 0);
      if (interestDiff !== 0) return interestDiff;

      const aLive = liveTonightShopIds.has(a.id) ? 1 : 0;
      const bLive = liveTonightShopIds.has(b.id) ? 1 : 0;
      if (bLive !== aLive) return bLive - aLive;

      return a.name.localeCompare(b.name, "ja");
    });
  }, [
    shops,
    latestPostsByShop,
    genres,
    moods,
    areas,
    search,
    newShopsOnly,
    interestCounts,
    liveTonightShopIds,
  ]);

  const activeFilterCount =
    (genres.has("すべて") ? 0 : genres.size) +
    moods.size +
    (areas.has("すべて") ? 0 : areas.size) +
    (newShopsOnly ? 1 : 0);

  async function handleInterest(post: VibePost) {
    if (!user || submittingId) return;

    const isInterested = interestedPostIds.has(post.id);

    setSubmittingId(post.id);
    setError(null);

    const { data: interestRow, error: mutationError } = isInterested
      ? await supabase
          .from("interests")
          .delete()
          .eq("user_id", user.id)
          .eq("vibe_post_id", post.id)
          .select("id")
          .maybeSingle()
      : await supabase
          .from("interests")
          .insert({
            user_id: user.id,
            shop_id: post.shop_id,
            vibe_post_id: post.id,
          })
          .select("id")
          .single();

    setSubmittingId(null);
    if (mutationError) {
      setError(mutationError.message);
      return;
    }

    if (!isInterested && interestRow?.id) {
      await notifyPostInterestCreated(interestRow.id);
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
    setPostInterestCounts((prev) => ({
      ...prev,
      [post.id]: Math.max(0, (prev[post.id] ?? 0) + (isInterested ? -1 : 1)),
    }));

    if (user) {
      const tonightResult = await fetchTonightInterests(user.id);
      setTonightInterests(tonightResult.data);
    }
  }

  async function handleCancelTonightInterest(interestId: string) {
    if (!user || cancelingTonightId) return;

    setCancelingTonightId(interestId);
    setError(null);

    const { error: cancelError } = await cancelInterest(interestId, user.id);

    setCancelingTonightId(null);

    if (cancelError) {
      setError(cancelError);
      return;
    }

    setTonightInterests((prev) => prev.filter((item) => item.id !== interestId));

    const canceled = tonightInterests.find((item) => item.id === interestId);
    if (canceled) {
      setInterestedPostIds((prev) => {
        const next = new Set(prev);
        next.delete(canceled.vibe_post_id);
        return next;
      });
      setPostInterestCounts((prev) => ({
        ...prev,
        [canceled.vibe_post_id]: Math.max(
          0,
          (prev[canceled.vibe_post_id] ?? 0) - 1,
        ),
      }));
      setInterestCounts((prev) => ({
        ...prev,
        [canceled.shop_id]: Math.max(0, (prev[canceled.shop_id] ?? 0) - 1),
      }));
    }
  }

  if (loading) return <LoadingScreen />;

  return (
    <GuestLayout
      search={search}
      onSearchChange={setSearch}
      genres={genres}
      moods={moods}
      areas={areas}
      onGenresChange={setGenres}
      onMoodsChange={setMoods}
      onAreasChange={setAreas}
      newShopsOnly={newShopsOnly}
      onNewShopsOnlyChange={setNewShopsOnly}
      posts={posts}
      filteredCount={filteredPosts.length}
      googleMapsApiKey={resolvedMapsApiKey}
    >
      <TonightInterestsSection
        items={tonightInterests}
        onCancel={handleCancelTonightInterest}
        cancelingId={cancelingTonightId}
      />

      <div className="mb-6 flex items-center justify-between rounded-[14px] border border-[#ff3d00]/20 bg-gradient-to-br from-[#ff3d00]/10 to-[#ffaa00]/6 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3d00] opacity-60" />
            <span className="relative h-2 w-2 rounded-full bg-[#ff3d00]" />
          </span>
          <p className="text-[13px] text-[#9994a8]">
            {viewMode === "shops" ? (
              <>
                <strong className="font-bold text-[#ffaa00]">
                  {filteredShops.length}件のお店
                </strong>
                が見つかりました
              </>
            ) : (
              <>
                今夜{" "}
                <strong className="font-bold text-[#ffaa00]">
                  {hotPosts.length}件の場所
                </strong>{" "}
                が「混ざれる」状態で発信中
              </>
            )}
          </p>
        </div>
        <span className="hidden text-xs text-[#5a5668] sm:inline">
          {viewMode === "shops"
            ? `今夜発信中 ${liveTonightShopIds.size}店`
            : viewMode === "hot"
              ? `今夜 ${hotPosts.length}件`
              : `全${publishedPosts.length}件`}
        </span>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <HomeFeedToggle
        mode={viewMode}
        onChange={setViewMode}
        hotCount={hotPosts.length}
        popularCount={popularPosts.length}
        shopsCount={filteredShops.length}
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          {viewMode === "hot"
            ? "🔥 今夜ホット"
            : viewMode === "popular"
              ? "✨ 人気の投稿"
              : "🏪 お店一覧"}
        </p>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => {
              setGenres(new Set(["すべて"]));
              setMoods(new Set());
              setAreas(new Set(["すべて"]));
              setNewShopsOnly(false);
              setSearch("");
            }}
            className="text-xs font-semibold text-[#ff3d00]"
          >
            フィルター解除
          </button>
        )}
      </div>

      {viewMode === "hot" ? (
        hotPosts.length === 0 ? (
          <div className="rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#ffaa00]">
              今夜の発信はまだありません
            </p>
            <p className="mt-2 text-xs text-[#9994a8]">
              17:00以降に店舗からの発信が増えてきます。「人気の投稿」や「お店一覧」もご覧ください
            </p>
            <button
              type="button"
              onClick={() => setViewMode("popular")}
              className="mt-4 text-xs font-semibold text-[#ff3d00] hover:underline"
            >
              人気の投稿を見る →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {hotPosts.map((post) => (
              <VibePostCard
                key={post.id}
                post={post}
                interestCount={postInterestCounts[post.id] ?? 0}
                interested={interestedPostIds.has(post.id)}
                isSubmitting={submittingId === post.id}
                onInterest={() => handleInterest(post)}
                userLocation={userLocation}
                checkinUsers={checkinUsersByShop.get(post.shop_id) ?? []}
              />
            ))}
          </div>
        )
      ) : viewMode === "popular" ? (
        popularPosts.length === 0 ? (
          <div className="rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#ffaa00]">
              条件に合う投稿がありません
            </p>
            <p className="mt-2 text-xs text-[#9994a8]">
              フィルターを変更するか、「お店一覧」タブで登録店舗を探してみてください
            </p>
            <button
              type="button"
              onClick={() => setViewMode("shops")}
              className="mt-4 text-xs font-semibold text-[#ff3d00] hover:underline"
            >
              お店一覧を見る →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {popularPosts.map((post) => (
              <VibePostCard
                key={post.id}
                post={post}
                interestCount={postInterestCounts[post.id] ?? 0}
                interested={interestedPostIds.has(post.id)}
                isSubmitting={submittingId === post.id}
                onInterest={() => handleInterest(post)}
                userLocation={userLocation}
                checkinUsers={checkinUsersByShop.get(post.shop_id) ?? []}
              />
            ))}
          </div>
        )
      ) : filteredShops.length === 0 ? (
        <div className="rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#ffaa00]">
            条件に合うお店がありません
          </p>
          <p className="mt-2 text-xs text-[#9994a8]">
            フィルターを変更するか、条件を解除してください
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredShops.map((shop) => {
            const latest = latestPostsByShop.get(shop.id);
            const live = liveTonightShopIds.has(shop.id);
            return (
              <ShopBrowseCard
                key={shop.id}
                shop={shop}
                live={live}
                isNew={isNewShop(shop)}
                moods={live ? latest?.moods : null}
                postImages={live ? latest?.images : null}
                latestComment={live ? latest?.comment : null}
                latestPostedAt={latest?.posted_at}
                interestCount={interestCounts[shop.id] ?? 0}
                userLocation={userLocation}
                checkinUsers={checkinUsersByShop.get(shop.id) ?? []}
              />
            );
          })}
        </div>
      )}
    </GuestLayout>
  );
}
