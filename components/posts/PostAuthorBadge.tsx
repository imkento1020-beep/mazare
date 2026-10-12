"use client";

import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import UserIcon from "@/components/icons/UserIcon";
import { LanternIcon } from "@/components/icons/MazareIcons";

type PostAuthorBadgeProps = {
  post: Pick<
    VibePost,
    "is_guest_post" | "author_id" | "author_display_name"
  >;
  className?: string;
};

export default function PostAuthorBadge({ post, className = "" }: PostAuthorBadgeProps) {
  const guest = post.is_guest_post !== false;

  if (!guest) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-[#ff3d00]/15 px-2 py-0.5 text-[10px] font-bold text-[#ff3d00] ${className}`}
      >
        <LanternIcon size={12} color="currentColor" />
        お店からの発信
      </span>
    );
  }

  if (!post.author_id) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md bg-[#111118] px-2 py-0.5 text-[10px] font-bold text-[#9994a8] ring-1 ring-white/10 ${className}`}
      >
        <UserIcon size={12} color="currentColor" />
        来店者の投稿
      </span>
    );
  }

  const label = post.author_display_name?.trim() || "ゲスト";

  return (
    <Link
      href={`/user/${post.author_id}`}
      onClick={(event) => event.stopPropagation()}
      className={`inline-flex items-center gap-1 rounded-md bg-[#111118] px-2 py-0.5 text-[10px] font-bold text-[#eeeaf4] ring-1 ring-white/10 transition hover:bg-[#18181f] hover:ring-[#ff3d00]/40 ${className}`}
    >
      <UserIcon size={12} color="currentColor" />
      {label}
    </Link>
  );
}
