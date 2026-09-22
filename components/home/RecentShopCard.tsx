"use client";

import Link from "next/link";
import type { RecentShopFeedItem } from "@/lib/feed/recentFeed";
import { formatGenre } from "@/lib/home/types";
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
  const genre = formatGenre(item.shop.genre);

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]">
      <Link href={`/shop/${item.shop.id}`} className="block">
        <div className="relative aspect-[16/10] bg-[#18181f]">{mediaPreview(item)}</div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <PostSourceBadge post={item.latestPost} className="mb-2" />
              <h3 className="text-lg font-black">{item.shop.name}</h3>
              <p className="mt-1 text-xs text-[#ff3d00]">{genre}</p>
            </div>
            <span className="rounded-md bg-[#ff3d00]/15 px-2 py-1 text-[11px] font-bold text-[#ff3d00]">
              {item.postCount}投稿
            </span>
          </div>
          <p className="mt-2 text-xs text-[#9994a8]">
            {item.uniquePosterCount}人が今夜シェア
          </p>
          {item.latestHashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.latestHashtags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-[#9994a8]"
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
