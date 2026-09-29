"use client";

import { formatPostedAt, type VibePost } from "@/lib/home/types";
import { moodEmoji, moodTagClass } from "@/lib/home/moods";
import { usePostViewTracking } from "@/lib/home/usePostViewTracking";
import PostImageCarousel from "./PostImageCarousel";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";
import type { GeoPoint } from "@/lib/geo/haversine";
import Link from "next/link";

type ShopVibePostItemProps = {
  post: VibePost;
  compact?: boolean;
  tonightTotalCups?: number | null;
  interestCount?: number;
  commentCount?: number;
  userLocation?: GeoPoint | null;
};

export default function ShopVibePostItem({
  post,
  compact = false,
  tonightTotalCups = null,
  interestCount = 0,
  commentCount = 0,
  userLocation = null,
}: ShopVibePostItemProps) {
  const viewRef = usePostViewTracking(post.id);
  const isGuest = post.is_guest_post !== false;

  if (isGuest) {
    return (
      <div ref={viewRef as React.Ref<HTMLDivElement>}>
        <GuestPostFeedCard
          post={post}
          tonightTotalCups={tonightTotalCups}
          interestCount={interestCount}
          commentCount={commentCount}
          userLocation={userLocation}
          showActions
          shopHref={`/shop/${post.shop_id}`}
        />
      </div>
    );
  }

  const images = post.images?.filter(Boolean) ?? [];

  return (
    <article
      ref={viewRef}
      className="overflow-hidden rounded-[12px] border border-white/7 bg-[#080810]"
    >
      <PostImageCarousel
        images={images}
        aspectClassName={compact ? "aspect-[4/5] max-h-[360px]" : "aspect-[4/5]"}
        overlay={
          post.posted_at ? (
            <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {formatPostedAt(post.posted_at)}
            </span>
          ) : null
        }
      />

      <div className="space-y-3 p-4">
        {post.shops?.id && (
          <Link
            href={`/shop/${post.shops.id}`}
            className="text-xs font-bold text-[#5a5668] hover:text-[#ff3d00]"
          >
            お店からの投稿
          </Link>
        )}
        <p className="text-sm leading-relaxed text-[#eeeaf4]">{post.comment}</p>

        {post.moods && post.moods.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.moods.map((mood) => (
              <span
                key={mood}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium ${moodTagClass(mood)}`}
              >
                <span>{moodEmoji(mood)}</span>
                {mood}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
