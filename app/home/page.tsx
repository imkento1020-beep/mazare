"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { countByShopId, fetchVibePosts } from "@/lib/home/api";
import { filterPosts } from "@/lib/home/filters";
import type { VibePost } from "@/lib/home/types";
import VibePostCard from "@/components/home/VibePostCard";
import GuestLayout from "@/components/layout/GuestLayout";
import LoadingScreen from "@/components/layout/LoadingScreen";
import type { User } from "@supabase/supabase-js";

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
      posts={posts}
      filteredCount={filteredPosts.length}
    >
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
    </GuestLayout>
  );
}
