"use client";

import Link from "next/link";
import type { RecentShopFeedItem } from "@/lib/feed/recentFeed";
import {
  formatShopGenreLabels,
  genreDisplayEmoji,
} from "@/lib/home/genreDisplay";
import PostSourceBadge from "@/components/posts/PostSourceBadge";

function mediaPreview(item: RecentShopFeedItem) {
  const post = item.latestPost;
  if (post.media_type === "video" && post.video_url) {
    return (
      <video
        src={post.video_url}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  const image = post.images?.[0];
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" className="h-full w-full object-cover" />
    );
  }
  return (
    <div className="flex h-full items-center justify-center bg-[#18181f] text-3xl">
      🍻
    </div>
  );
}

type RecentShopCardProps = {
  item: RecentShopFeedItem;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
};

export default function RecentShopCard({
  item,
  onInterest,
  interestLoading,
  interested,
}: RecentShopCardProps) {
  const genreLabels = formatShopGenreLabels(item.shop.genre, 2);
  const displayGenres = genreLabels.length > 0 ? genreLabels : ["飲食店"];

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]">
      <Link href={`/shop/${item.shop.id}`} className="block">
        <div className="relative aspect-[16/10] bg-[#18181f]">
          {mediaPreview(item)}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3 py-1.5 backdrop-blur-sm">
              <span className="text-sm leading-none" aria-hidden>
                📝
              </span>
              <span className="text-sm font-black tabular-nums text-white">
                {item.postCount}
              </span>
              <span className="text-[11px] font-semibold text-white/90">件の投稿</span>
            </span>
          </div>
        </div>
        <div className="p-4">
          <PostSourceBadge post={item.latestPost} className="mb-2" />
          <h3 className="text-lg font-black leading-tight">{item.shop.name}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
          {item.latestHashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.latestHashtags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-[#18181f] px-2.5 py-0.5 text-[10px] font-medium text-[#9994a8]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
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
