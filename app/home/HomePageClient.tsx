"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  buildRecentShopFeed,
  fetchRecentVibePosts,
  type RecentShopFeedItem,
} from "@/lib/feed/recentFeed";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import { ensureFreshSession } from "@/lib/auth/session";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { fetchTonightInterests, cancelInterest } from "@/lib/mypage/api";
import type { TodayInterestRow, VibePost } from "@/lib/home/types";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { fetchInterestCountsByPostIds } from "@/lib/interests/postInterestCounts";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import RecentShopCard from "@/components/home/RecentShopCard";
import TonightInterestsSection from "@/components/home/TonightInterestsSection";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import type { User } from "@supabase/supabase-js";

type HomePageClientProps = {
  googleMapsApiKey: string;
};

export default function HomePageClient({
  googleMapsApiKey,
}: HomePageClientProps) {
  const { apiKey: resolvedMapsApiKey } = useGoogleMapsApiKey(googleMapsApiKey);
  const { user: authUser, ready: authReady } = useAnonymousAuth();
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const [feedItems, setFeedItems] = useState<RecentShopFeedItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<VibePost[]>([]);
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
  const [interestCounts, setInterestCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const { location: userLocation } = useUserLocation();

  const reloadFeed = useCallback(async (activeUser: User | null) => {
    const { data, error: feedError } = await fetchRecentVibePosts();
    if (feedError) setError(feedError);
    setRecentPosts(data);
    setFeedItems(buildRecentShopFeed(data));
    const postIds = data.map((p) => p.id);
    const [counts, commentMap] = await Promise.all([
      fetchInterestCountsByPostIds(postIds),
      fetchCommentCountsByPostIds(postIds),
    ]);
    setInterestCounts(counts);
    setCommentCounts(commentMap);

    if (activeUser) {
      const { data: myInterests } = await supabase
        .from("interests")
        .select("vibe_post_id")
        .eq("user_id", activeUser.id);
      setInterestedPostIds(
        new Set((myInterests ?? []).map((row) => row.vibe_post_id)),
      );
      const tonight = await fetchTonightInterests(activeUser.id);
      setTonightInterests(tonight.data);
    }
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!authReady) return;

    setUser(authUser);
    userRef.current = authUser;
    void reloadFeed(authUser);
  }, [authReady, authUser, reloadFeed]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await Promise.race([
          reloadFeed(userRef.current),
          new Promise<void>((resolve) => {
            setTimeout(resolve, 12_000);
          }),
        ]);
      } catch {
        if (!cancelled) {
          setError("フィードの読み込みに失敗しました。ページを再読み込みしてください。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    void ensureFreshSession().catch(() => {
      // Home must render even when token refresh fails or stalls.
    });

    const channel = supabase
      .channel("home-vibe-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vibe_posts" },
        () => {
          void reloadFeed(userRef.current);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [reloadFeed]);

  const tonightCupTotals = useMemo(
    () => buildTonightCumulativeCupTotals(recentPosts),
    [recentPosts],
  );

  const filteredFeed = useMemo(() => {
    const q = search.trim().toLowerCase();
    return feedItems.filter((item) => {
      if (q) {
        const hay = `${item.shop.name} ${item.shop.address}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [feedItems, search]);

  async function handleInterest(item: RecentShopFeedItem) {
    const post = item.latestPost;
    if (submittingId) return;
    if (!user) return;

    const interested = interestedPostIds.has(post.id);
    setSubmittingId(post.id);

    if (interested) {
      await supabase
        .from("interests")
        .delete()
        .eq("user_id", user.id)
        .eq("vibe_post_id", post.id);
      setInterestedPostIds((prev) => {
        const next = new Set(prev);
        next.delete(post.id);
        return next;
      });
    } else {
      const { data, error: insertError } = await supabase
        .from("interests")
        .insert({
          user_id: user.id,
          shop_id: item.shop.id,
          vibe_post_id: post.id,
        })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data?.id) {
        await notifyPostInterestCreated(data.id);
        setInterestedPostIds((prev) => new Set(prev).add(post.id));
      }
    }

    setSubmittingId(null);
    const tonight = await fetchTonightInterests(user.id);
    setTonightInterests(tonight.data);
  }

  async function handleCancelTonightInterest(interestId: string) {
    if (!user || cancelingTonightId) return;
    setCancelingTonightId(interestId);
    const { error: cancelError } = await cancelInterest(interestId, user.id);
    setCancelingTonightId(null);
    if (cancelError) {
      setError(cancelError);
      return;
    }
    setTonightInterests((prev) => prev.filter((item) => item.id !== interestId));
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
      posts={recentPosts}
      filteredCount={filteredFeed.length}
      googleMapsApiKey={resolvedMapsApiKey}
    >
      <TonightInterestsSection
        items={user ? tonightInterests : []}
        onCancel={handleCancelTonightInterest}
        cancelingId={cancelingTonightId}
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
          直近24時間の盛り上がり
        </p>
        <Link href="/post" className="text-xs font-bold text-[#ff3d00]">
          投稿する →
        </Link>
      </div>

      {filteredFeed.length === 0 ? (
        <div className="rounded-2xl border border-[#ffaa00]/20 bg-[#ffaa00]/10 px-4 py-8 text-center">
          <p className="text-sm font-medium text-[#ffaa00]">
            直近24時間の投稿はまだありません
          </p>
          <p className="mt-2 text-xs text-[#9994a8]">
            最初の投稿者になって、このお店を mazare に登録しましょう。
          </p>
          <Link
            href="/post"
            className="mt-4 inline-block text-xs font-semibold text-[#ff3d00]"
          >
            投稿する →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredFeed.map((item) => (
            <RecentShopCard
              key={item.shop.id}
              item={item}
              onInterest={() => void handleInterest(item)}
              interested={interestedPostIds.has(item.latestPost.id)}
              interestLoading={submittingId === item.latestPost.id}
              tonightTotalCups={
                tonightCupTotals.get(item.latestPost.id) ?? null
              }
              interestCount={interestCounts.get(item.latestPost.id) ?? 0}
              commentCount={commentCounts.get(item.latestPost.id) ?? 0}
              userLocation={userLocation}
            />
          ))}
        </div>
      )}
    </GuestLayout>
  );
}
