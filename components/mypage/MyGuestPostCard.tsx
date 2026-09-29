"use client";

import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";

type MyGuestPostCardProps = {
  post: VibePost;
  showEdit?: boolean;
  tonightTotalCups?: number | null;
};

export default function MyGuestPostCard({
  post,
  showEdit = false,
  tonightTotalCups = null,
}: MyGuestPostCardProps) {
  return (
    <div className="relative">
      <GuestPostFeedCard
        post={post}
        tonightTotalCups={tonightTotalCups}
        showActions
        shopHref={`/shop/${post.shop_id}`}
      />
      {showEdit && (
        <Link
          href={`/post/edit/${post.id}`}
          className="absolute right-3 top-12 z-[3] rounded-[10px] border border-white/20 bg-black/50 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm hover:border-[#ff3d00]/50"
        >
          編集
        </Link>
      )}
    </div>
  );
}
