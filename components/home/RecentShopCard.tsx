"use client";

import Link from "next/link";
import type { RecentShopFeedItem } from "@/lib/feed/recentFeed";
import {
  formatShopGenreLabels,
  genreDisplayEmoji,
} from "@/lib/home/genreDisplay";
import PostAuthorBadge from "@/components/posts/PostAuthorBadge";
import GuestPostMedia from "@/components/posts/GuestPostMedia";
import GuestPostFooter from "@/components/posts/GuestPostFooter";

type RecentShopCardProps = {
  item: RecentShopFeedItem;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
  tonightTotalCups?: number | null;
};

export default function RecentShopCard({
  item,
  onInterest,
  interestLoading,
  interested,
  tonightTotalCups = null,
}: RecentShopCardProps) {
  const post = item.latestPost;
  const genreLabels = formatShopGenreLabels(item.shop.genre, 2);
  const displayGenres = genreLabels.length > 0 ? genreLabels : ["飲食店"];

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]">
      <Link href={`/shop/${item.shop.id}`} className="block">
        <div className="relative">
          <GuestPostMedia
            mediaType={post.media_type}
            images={post.images}
            videoUrl={post.video_url}
            compact
          />
          <div className="pointer-events-none absolute left-3 top-3">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <span className="tabular-nums">{item.postCount}</span>
              件
            </span>
          </div>
        </div>
        <div className="space-y-3 px-3 py-3">
          <PostAuthorBadge post={post} />
          <h3 className="text-lg font-black leading-tight">{item.shop.name}</h3>
          <GuestPostFooter post={post} tonightTotalCups={tonightTotalCups} />
          <div className="flex flex-wrap gap-1.5">
            {displayGenres.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-[#ffaa00]/30 bg-[#ffaa00]/10 px-2.5 py-1 text-[11px] font-bold text-[#ffcc66]"
              >
                <span aria-hidden>{genreDisplayEmoji(label)}</span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </Link>
      {onInterest && (
        <div className="border-t border-white/5 px-4 py-3">
          <button
            type="button"
            disabled={interestLoading}
            onClick={onInterest}
            className="w-full rounded-[12px] bg-[#ff3d00]/15 py-2.5 text-sm font-bold text-[#ff3d00] disabled:opacity-60"
          >
            {interested ? "行くかも済み ✓" : "今夜行くかも"}
          </button>
        </div>
      )}
    </article>
  );
}
