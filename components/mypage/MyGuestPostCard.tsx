"use client";

import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import { formatPostedAt } from "@/lib/home/types";

function mediaPreview(post: VibePost) {
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
    <div className="flex h-full items-center justify-center bg-[#18181f] text-2xl">
      🍻
    </div>
  );
}

type MyGuestPostCardProps = {
  post: VibePost;
};

export default function MyGuestPostCard({ post }: MyGuestPostCardProps) {
  const shopName = post.shops?.name ?? "お店";
  const tags = post.hashtags ?? [];

  return (
    <Link
      href={`/shop/${post.shop_id}`}
      className="flex gap-3 overflow-hidden rounded-[14px] border border-white/[0.07] bg-[#111118] p-3 transition hover:border-[#ff3d00]/30"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[#18181f]">
        {mediaPreview(post)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-bold text-[#eeeaf4]">{shopName}</p>
          <span className="shrink-0 text-[10px] text-[#5a5668]">
            {formatPostedAt(post.posted_at)}
          </span>
        </div>
        {post.comment ? (
          <p className="mt-1 line-clamp-2 text-sm text-[#9994a8]">{post.comment}</p>
        ) : tags.length > 0 ? (
          <p className="mt-1 line-clamp-2 text-sm text-[#9994a8]">
            {tags.join(" ")}
          </p>
        ) : (
          <p className="mt-1 text-sm text-[#5a5668]">写真・動画投稿</p>
        )}
        {tags.length > 0 && post.comment && (
          <p className="mt-1 line-clamp-1 text-xs text-[#ff3d00]/80">
            {tags.join(" ")}
          </p>
        )}
      </div>
    </Link>
  );
}
