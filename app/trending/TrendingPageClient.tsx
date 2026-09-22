"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import RecentShopCard from "@/components/home/RecentShopCard";
import {
  buildRecentShopFeed,
  fetchPostsByHashtag,
  fetchTonightTrendingTags,
  fetchRecentVibePosts,
  type TrendingTag,
} from "@/lib/feed/recentFeed";

export default function TrendingPageClient() {
  const searchParams = useSearchParams();
  const initialTag = searchParams.get("tag");
  const [tags, setTags] = useState<TrendingTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tagPosts, setTagPosts] = useState(
    buildRecentShopFeed([]),
  );

  const reload = useCallback(async () => {
    const tagResult = await fetchTonightTrendingTags(30);
    if (tagResult.error) setError(tagResult.error);
    setTags(tagResult.data);

    if (selectedTag) {
      const postsResult = await fetchPostsByHashtag(selectedTag);
      if (postsResult.error) setError(postsResult.error);
      setTagPosts(buildRecentShopFeed(postsResult.data));
    } else {
      setTagPosts([]);
    }

    setLoading(false);
  }, [selectedTag]);

  useEffect(() => {
    void reload();

    const channel = supabase
      .channel("trending-vibe-posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vibe_posts" },
        () => {
          void reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload]);

  useEffect(() => {
    setSelectedTag(initialTag);
  }, [initialTag]);

  const feedItems = useMemo(() => tagPosts, [tagPosts]);

  return (
    <div className="flex min-h-dvh flex-col bg-[#080810] pb-28 text-[#eeeaf4] md:pb-8">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <h1 className="text-2xl font-black">今夜のトレンドタグ</h1>
        <p className="mt-2 text-sm text-[#9994a8]">
          17:00〜翌5:00に使われたハッシュタグ（リアルタイム更新）
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-[#9994a8]">読み込み中…</p>
        ) : (
          <>
            <ol className="mt-6 space-y-2">
              {tags.map((item, index) => {
                const active = selectedTag === item.tag;
                return (
                  <li key={item.tag}>
                    <button
                      type="button"
                      onClick={() => setSelectedTag(item.tag)}
                      className={`flex w-full items-center justify-between rounded-[12px] border px-4 py-3 text-left ${
                        active
                          ? "border-[#ff3d00]/40 bg-[#ff3d00]/10"
                          : "border-white/10 bg-[#111118]"
                      }`}
                    >
                      <span className="font-bold">
                        <span className="mr-3 text-[#5a5668]">{index + 1}</span>
                        {item.tag}
                      </span>
                      <span className="text-sm text-[#9994a8]">{item.count}件</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            {selectedTag && (
              <section className="mt-10">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">{selectedTag} の投稿</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedTag(null)}
                    className="text-xs text-[#9994a8]"
                  >
                    クリア
                  </button>
                </div>
                <div className="grid gap-4">
                  {feedItems.map((item) => (
                    <RecentShopCard key={item.shop.id} item={item} />
                  ))}
                  {feedItems.length === 0 && (
                    <p className="text-sm text-[#9994a8]">該当する投稿がありません</p>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </p>
        )}

        <Link href="/home" className="mt-8 inline-block text-sm text-[#ff3d00]">
          ← ホームへ
        </Link>
      </main>

      <BottomNav />
    </div>
  );
}
