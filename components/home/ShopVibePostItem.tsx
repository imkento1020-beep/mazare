"use client";

import { formatPostedAt, type VibePost } from "@/lib/home/types";
import { moodEmoji, moodTagClass } from "@/lib/home/moods";
import PostImageCarousel from "./PostImageCarousel";

type ShopVibePostItemProps = {
  post: VibePost;
  compact?: boolean;
};

export default function ShopVibePostItem({
  post,
  compact = false,
}: ShopVibePostItemProps) {
  const images = post.images?.filter(Boolean) ?? [];

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]">
      <PostImageCarousel
        images={images}
        aspectClassName={compact ? "h-[160px]" : "h-[200px]"}
        overlay={
          post.posted_at ? (
            <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
              {formatPostedAt(post.posted_at)}
            </span>
          ) : null
        }
      />

      <div className="space-y-3 p-4">
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
