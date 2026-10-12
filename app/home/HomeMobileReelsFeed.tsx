"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchHomeReelsFeed,
  type HomeReelsPost,
} from "@/lib/home/fetchHomeReelsFeed";
import { notifyPostInterestCreated } from "@/lib/notifications/api";
import { ensureFreshSession } from "@/lib/auth/session";
import { useAnonymousAuth } from "@/components/auth/AnonymousAuthProvider";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";
import { buildTonightCumulativeCupTotals } from "@/lib/guest-post/tonightCups";
import { fetchInterestCountsByPostIds } from "@/lib/interests/postInterestCounts";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import HomeReelsScroller from "@/components/home/reels/HomeReelsScroller";
import BottomNav from "@/components/BottomNav";
import LoadingScreen from "@/components/layout/LoadingScreen";
import type { User } from "@supabase/supabase-js";

export default function HomeMobileReelsFeed() {
  const { openAuthPrompt } = useAuthPrompt();
  const { user: authUser, ready: authReady } = useAnonymousAuth();
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);
  const visibleChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(
    null,
  );

  const [posts, setPosts] = useState<HomeReelsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [interestedPostIds, setInterestedPostIds] = useState<Set<string>>(
    new Set(),
  );
  const [interestCounts, setInterestCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(
    new Map(),
  );
  const { location: userLocation } = useUserLocation();

  const loadCounts = useCallback(async (postIds: string[]) => {
    if (postIds.length === 0) return;
    const [interests, comments] = await Promise.all([
      fetchInterestCountsByPostIds(postIds),
      fetchCommentCountsByPostIds(postIds),
    ]);
    setInterestCounts((prev) => {
      const next = new Map(prev);
      interests.forEach((v, k) => next.set(k, v));
      return next;
    });
    setCommentCounts((prev) => {
      const next = new Map(prev);
      comments.forEach((v, k) => next.set(k, v));
      return next;
    });
  }, []);

  const reloadFeed = useCallback(
    async (activeUser: User | null) => {
      const { data, error: feedError } = await fetchHomeReelsFeed();
      if (feedError) setError(feedError);
      setPosts(data);
      await loadCounts(data.map((p) => p.id));

      if (activeUser) {
        const { data: rows } = await supabase
          .from("interests")
          .select("vibe_post_id")
          .eq("user_id", activeUser.id);
        setInterestedPostIds(
          new Set((rows ?? []).map((r) => r.vibe_post_id)),
        );
      } else {
        setInterestedPostIds(new Set());
      }
    },
    [loadCounts],
  );

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

    async function boot() {
      try {
        await Promise.race([
          reloadFeed(userRef.current),
          new Promise<void>((r) => setTimeout(r, 12_000)),
        ]);
      } catch {
        if (!cancelled) {
          setError("フィードを読み込めませんでした。再読み込みしてください。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    void ensureFreshSession().catch(() => {});

    const feedChannel = supabase
      .channel("home-reels-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vibe_posts" },
        () => void reloadFeed(userRef.current),
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(feedChannel);
      if (visibleChannelRef.current) {
        void supabase.removeChannel(visibleChannelRef.current);
      }
    };
  }, [reloadFeed]);

  const tonightCupTotals = useMemo(
    () => buildTonightCumulativeCupTotals(posts),
    [posts],
  );

  const onVisiblePostChange = useCallback(
    (postId: string) => {
      void loadCounts([postId]);

      if (visibleChannelRef.current) {
        void supabase.removeChannel(visibleChannelRef.current);
      }

      visibleChannelRef.current = supabase
        .channel(`home-reels-visible-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "interests",
            filter: `vibe_post_id=eq.${postId}`,
          },
          () => void loadCounts([postId]),
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "comments",
            filter: `vibe_post_id=eq.${postId}`,
          },
          () => void loadCounts([postId]),
        )
        .subscribe();
    },
    [loadCounts],
  );

  const onCommentCountChange = useCallback((postId: string, count: number) => {
    setCommentCounts((prev) => {
      const next = new Map(prev);
      next.set(postId, count);
      return next;
    });
  }, []);

  async function handleInterest(post: HomeReelsPost) {
    if (submittingId) return;
    const shop = post.shops;
    if (!shop) return;

    if (!user) {
      openAuthPrompt({
        title: "ログインして「行くかも」",
        description: "気になる投稿に「行くかも」を送るにはログインが必要です。",
        returnPath: "/home",
      });
      return;
    }

    const already = interestedPostIds.has(post.id);
    setSubmittingId(post.id);

    if (already) {
      const { error: deleteError } = await supabase
        .from("interests")
        .delete()
        .eq("user_id", user.id)
        .eq("vibe_post_id", post.id);
      if (deleteError) {
        setError(deleteError.message);
      } else {
        setInterestedPostIds((prev) => {
          const next = new Set(prev);
          next.delete(post.id);
          return next;
        });
        setInterestCounts((prev) => {
          const next = new Map(prev);
          next.set(post.id, Math.max(0, (next.get(post.id) ?? 0) - 1));
          return next;
        });
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("interests")
        .insert({
          user_id: user.id,
          shop_id: shop.id,
          vibe_post_id: post.id,
        })
        .select("id")
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data?.id) {
        await notifyPostInterestCreated(data.id);
        setInterestedPostIds((prev) => new Set(prev).add(post.id));
        setInterestCounts((prev) => {
          const next = new Map(prev);
          next.set(post.id, (next.get(post.id) ?? 0) + 1);
          return next;
        });
      }
    }

    setSubmittingId(null);
    void loadCounts([post.id]);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-dvh bg-[#080810] text-[#eeeaf4]">
      {error && (
        <p className="absolute inset-x-4 top-3 z-[120] rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-xs text-red-400">
          {error}
        </p>
      )}

      <HomeReelsScroller
        posts={posts}
        tonightCupTotals={tonightCupTotals}
        interestCounts={interestCounts}
        commentCounts={commentCounts}
        interestedPostIds={interestedPostIds}
        interestLoadingId={submittingId}
        userLocation={userLocation}
        onInterest={(post) => void handleInterest(post)}
        onVisiblePostChange={onVisiblePostChange}
        onCommentCountChange={onCommentCountChange}
      />

      <BottomNav />
      <div className="h-[84px]" aria-hidden />
    </div>
  );
}
