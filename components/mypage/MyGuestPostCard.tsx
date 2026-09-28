"use client";

import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import { formatPostedAt } from "@/lib/home/types";
import GuestPostCard from "@/components/posts/GuestPostCard";
import PostAuthorBadge from "@/components/posts/PostAuthorBadge";

type MyGuestPostCardProps = {
  post: VibePost;
  showEdit?: boolean;
  tonightTotalCups?: number | null;
  showAuthor?: boolean;
};

export default function MyGuestPostCard({
  post,
  showEdit = false,
  tonightTotalCups = null,
  showAuthor = false,
}: MyGuestPostCardProps) {
  const shopName = post.shops?.name ?? "お店";

  return (
    <div className="space-y-2">
      <GuestPostCard
        post={post}
        tonightTotalCups={tonightTotalCups}
        compact
        header={
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              {showAuthor && <PostAuthorBadge post={post} className="mb-1" />}
              <Link
                href={`/shop/${post.shop_id}`}
                className="block truncate text-sm font-bold text-[#eeeaf4] hover:text-[#ff3d00]"
              >
                {shopName}
              </Link>
              {post.posted_at && (
                <p className="text-[10px] text-[#5a5668]">
                  {formatPostedAt(post.posted_at)}
                </p>
              )}
            </div>
            {showEdit && (
              <Link
                href={`/post/edit/${post.id}`}
                className="shrink-0 rounded-[10px] border border-white/10 px-3 py-2 text-[11px] font-bold text-[#9994a8] transition hover:border-[#ff3d00]/40 hover:text-[#ff3d00]"
              >
                編集
              </Link>
            )}
          </div>
        }
      />
    </div>
  );
}
