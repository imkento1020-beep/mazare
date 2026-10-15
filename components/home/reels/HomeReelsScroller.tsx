"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeReelsPost } from "@/lib/home/fetchHomeReelsFeed";
import type { GeoPoint } from "@/lib/geo/haversine";
import HomeReelSlide from "@/components/home/reels/HomeReelSlide";

const SLIDE_CLASS =
  "relative h-[calc(100dvh-84px)] shrink-0 snap-start snap-always";

type HomeReelsScrollerProps = {
  posts: HomeReelsPost[];
  tonightCupTotals: Map<string, number>;
  interestCounts: Map<string, number>;
  commentCounts: Map<string, number>;
  interestedPostIds: Set<string>;
  interestLoadingId: string | null;
  userLocation: GeoPoint | null;
  onInterest: (post: HomeReelsPost) => void;
  onVisiblePostChange: (postId: string) => void;
  onCommentCountChange: (postId: string, count: number) => void;
};

export default function HomeReelsScroller({
  posts,
  tonightCupTotals,
  interestCounts,
  commentCounts,
  interestedPostIds,
  interestLoadingId,
  userLocation,
  onInterest,
  onVisiblePostChange,
  onCommentCountChange,
}: HomeReelsScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(posts[0]?.id ?? null);

  useEffect(() => {
    const first = posts[0]?.id ?? null;
    setActiveId(first);
    if (first) onVisiblePostChange(first);
  }, [posts, onVisiblePostChange]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || posts.length === 0) return;

    const nodes = root.querySelectorAll<HTMLElement>("[data-reel-id]");
    const observer = new IntersectionObserver(
      (entries) => {
        let pick: { id: string; ratio: number } | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-reel-id");
          if (!id) continue;
          if (!pick || entry.intersectionRatio > pick.ratio) {
            pick = { id, ratio: entry.intersectionRatio };
          }
        }
        if (pick && pick.ratio >= 0.6) {
          setActiveId((prev) => {
            if (prev !== pick!.id) onVisiblePostChange(pick!.id);
            return pick!.id;
          });
        }
      },
      { root, threshold: [0.6, 0.85] },
    );

    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [posts, onVisiblePostChange]);

  if (posts.length === 0) {
    return (
      <div className="flex h-[calc(100dvh-84px)] flex-col items-center justify-center bg-[#080810] px-8 text-center">
        <p className="text-lg font-bold text-[#eeeaf4]">
          今夜の様子を、最初に投稿しよう
        </p>
        <p className="mt-2 text-sm text-[#9994a8]">
          今いるお店の雰囲気をシェアして、街の夜を動かそう。
        </p>
        <Link
          href="/post"
          className="mt-8 rounded-full bg-[#ff3d00] px-10 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(255,61,0,0.45)]"
        >
          投稿する
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hidden mx-auto h-[calc(100dvh-84px)] w-full max-w-[480px] snap-y snap-mandatory scroll-smooth overflow-y-scroll bg-[#080810]"
    >
      {posts.map((post) => (
        <section key={post.id} data-reel-id={post.id} className={SLIDE_CLASS}>
          <HomeReelSlide
            post={post}
            isActive={activeId === post.id}
            tonightTotalCups={tonightCupTotals.get(post.id) ?? null}
            interestCount={interestCounts.get(post.id) ?? 0}
            commentCount={commentCounts.get(post.id) ?? 0}
            interested={interestedPostIds.has(post.id)}
            interestLoading={interestLoadingId === post.id}
            userLocation={userLocation}
            onInterest={() => onInterest(post)}
            onCommentCountChange={(n) => onCommentCountChange(post.id, n)}
          />
        </section>
      ))}
    </div>
  );
}
