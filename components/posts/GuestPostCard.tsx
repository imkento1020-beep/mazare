"use client";

import type { ReactNode, Ref } from "react";
import type { VibePost } from "@/lib/home/types";
import GuestPostMedia from "@/components/posts/GuestPostMedia";
import GuestPostFooter from "@/components/posts/GuestPostFooter";

type GuestPostCardProps = {
  post: VibePost;
  tonightTotalCups?: number | null;
  compact?: boolean;
  header?: ReactNode;
  footerActions?: ReactNode;
  className?: string;
  trackRef?: Ref<HTMLElement>;
};

export default function GuestPostCard({
  post,
  tonightTotalCups = null,
  compact = false,
  header,
  footerActions,
  className = "",
  trackRef,
}: GuestPostCardProps) {
  return (
    <article
      ref={trackRef}
      className={`overflow-hidden rounded-[14px] border border-white/[0.07] bg-[#111118] ${className}`}
    >
      {header && <div className="border-b border-white/[0.06] px-3 py-2.5">{header}</div>}

      <GuestPostMedia
        mediaType={post.media_type}
        images={post.images}
        videoUrl={post.video_url}
        compact={compact}
      />

      <div className="space-y-3 px-3 py-3.5 sm:px-4">
        <GuestPostFooter post={post} tonightTotalCups={tonightTotalCups} />
        {footerActions}
      </div>
    </article>
  );
}
