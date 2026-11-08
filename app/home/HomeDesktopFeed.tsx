"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  buildRecentShopFeed,
  fetchRecentVibePosts,
  type RecentShopFeedItem,
} from "@/lib/feed/recentFeed";
import {
  createContactRequest,
  fetchContactRequestCountsByPostIds,
  fetchUserContactedPostIds,
} from "@/lib/matching/contactRequests";
import { isPostOpenForContact } from "@/lib/profile/buildPostSocialContext";
import { resolvePostAuthorSocialContext } from "@/lib/profile/tonightSocialContext";
import { ensureFreshSession } from "@/lib/auth/session";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { fetchTonightInterests, cancelInterest } from "@/lib/mypage/api";
import type { TodayInterestRow, VibePost } from "@/lib/home/types";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import RecentShopCard from "@/components/home/RecentShopCard";
import TonightInterestsSection from "@/components/home/TonightInterestsSection";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import { useGoogleMapsApiKey } from "@/lib/map/useGoogleMapsApiKey";
import type { User } from "@supabase/supabase-js";
import { isRegisteredUser } from "@/lib/auth/anonymous";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import {
  mergeShopNearestStations,
  useEnrichShopNearestStations,
} from "@/hooks/useEnrichShopNearestStations";

export default function HomeDesktopFeed() {
  const { apiKey: resolvedMapsApiKey } = useGoogleMapsApiKey();
  const { openAuthPrompt } = useAuthPrompt();
  const { user: authUser, ready: authReady } = useAnonymousAuth();
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const [feedItems, setFeedItems] = useState<RecentShopFeedItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<VibePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<Set<string>>(new Set(["すべて"]));
  const [moods, setMoods] = useState<Set<string>>(new Set());
  const [areas, setAreas] = useState<Set<string>>(new Set(["すべて"]));
  const [newShopsOnly, setNewShopsOnly] = useState(false);
  const [tonightInterests, setTonightInterests] = useState<TodayInterestRow[]>(
    [],
  );
  const [cancelingTonightId, setCancelingTonightId] = useState<string | null>(
    null,
  );
  const [contactCounts, setContactCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [contactedPostIds, setContactedPostIds] = useState<Set<string>>(
    new Set(),
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
    const loadEngagement = async (ids: string[]) => {
      const [counts, commentMap, contacted] = await Promise.all([
        fetchContactRequestCountsByPostIds(ids),
        fetchCommentCountsByPostIds(ids),
        activeUser
          ? fetchUserContactedPostIds(activeUser.id, ids)
          : Promise.resolve(new Set<string>()),
      ]);
      setContactCounts((prev) => {
        const next = new Map(prev);
        counts.forEach((v, k) => next.set(k, v));
        return next;
      });
      if (activeUser) {
        setContactedPostIds((prev) => new Set([...prev, ...contacted]));
      }
      setCommentCounts((prev) => {
        const next = new Map(prev);
        commentMap.forEach((v, k) => next.set(k, v));
        return next;
      });
    };
    void loadEngagement(postIds.slice(0, 12));
    if (postIds.length > 12) {
      window.setTimeout(() => void loadEngagement(postIds.slice(12)), 300);
    }

    if (activeUser) {
      void fetchTonightInterests(activeUser.id).then((tonight) => {
        setTonightInterests(tonight.data);
      });
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
          setError(
            "フィードの読み込みに失敗しました。ページを再読み込みしてください。",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void init();

    void ensureFreshSession().catch(() => {});

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

  const stationMap = useEnrichShopNearestStations(
    useMemo(() => feedItems.map((item) => item.shop), [feedItems]),
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

  async function handleContact(item: RecentShopFeedItem, message: string) {
    const post = item.latestPost;
    if (submittingId || !post.author_id) return;
    if (!isPostOpenForContact(post)) {
      setError("この投稿者は今夜の連絡を受け付けていません");
      return;
    }
    if (!isRegisteredUser(user)) {
      openAuthPrompt({
        title: "ログインして連絡する",
        description: "投稿者に連絡するにはログインが必要です。",
        returnPath: "/home",
      });
      return;
    }

    setSubmittingId(post.id);
    const result = await createContactRequest({
      fromUserId: user.id,
      toUserId: post.author_id,
      vibePostId: post.id,
      shopId: item.shop.id,
      message,
    });
    setSubmittingId(null);

    if (result.error) {
      setError(result.error);
      throw new Error(result.error);
    }

    setContactedPostIds((prev) => new Set(prev).add(post.id));
    const counts = await fetchContactRequestCountsByPostIds([post.id]);
    setContactCounts((prev) => {
      const next = new Map(prev);
      counts.forEach((v, k) => next.set(k, v));
      return next;
    });
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

  if (loading) {
    return (
      <LoadingScreen
        message="フィードを読み込んでいます"
        submessage="今夜の投稿を集めています"
      />
    );
  }

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
            まだ投稿がありません。今夜の様子を、一番に投稿しよう。
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
          {filteredFeed.map((item) => {
            const shop =
              mergeShopNearestStations(item.shop, stationMap) ?? item.shop;
            return (
            <RecentShopCard
              key={item.shop.id}
              item={{ ...item, shop }}
              onContact={(message) => handleContact(item, message)}
              contacted={contactedPostIds.has(item.latestPost.id)}
              contactLoading={submittingId === item.latestPost.id}
              contactCount={contactCounts.get(item.latestPost.id) ?? 0}
              authorSocialContext={resolvePostAuthorSocialContext({
                author_merge_attitude: item.latestPost.author_merge_attitude,
                author_vibe_scale: item.latestPost.author_vibe_scale,
                author_tonight_social_mood:
                  item.latestPost.author_tonight_social_mood,
              })}
              tonightTotalCups={
                tonightCupTotals.get(item.latestPost.id) ?? null
              }
              commentCount={commentCounts.get(item.latestPost.id) ?? 0}
              userLocation={userLocation}
            />
            );
          })}
        </div>
      )}
    </GuestLayout>
  );
}
