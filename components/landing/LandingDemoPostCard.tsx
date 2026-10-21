import Link from "next/link";
import type { LandingDemoPost } from "@/lib/landing/demoPosts";
import {
  FeedCommentIcon,
  FeedPeopleIcon,
  FeedPinIcon,
  PostLikeIcon,
} from "@/components/icons/FeedActionIcons";

type LandingDemoPostCardProps = {
  post: LandingDemoPost;
  className?: string;
  priorityImage?: boolean;
};

function authorInitial(name: string) {
  const trimmed = name.trim();
  return (trimmed.charAt(0) || "ゲ").toUpperCase();
}

export default function LandingDemoPostCard({
  post,
  className = "",
  priorityImage = false,
}: LandingDemoPostCardProps) {
  const amberPillParts: string[] = [`今夜${post.tonightCups}杯目`];
  if (post.drinkName) {
    amberPillParts.push(post.drinkName);
  }
  const amberPill = amberPillParts.join(" · ");

  return (
    <Link
      href="/post"
      className={`block shrink-0 overflow-hidden rounded-[12px] bg-[#080810] ${className}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          loading={priorityImage ? "eager" : "lazy"}
          fetchPriority={priorityImage ? "high" : undefined}
        />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.95)] via-[rgba(8,8,16,0.35)] to-transparent"
          aria-hidden
        />

        <div className="absolute left-3 top-3 z-[1] flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ff3d00] text-[11px] font-extrabold text-white">
            {authorInitial(post.authorDisplayName)}
          </span>
          <span className="text-xs font-semibold text-[#eeeaf4]">
            {post.authorDisplayName}
          </span>
        </div>

        <div className="absolute bottom-4 right-3 z-[1] flex flex-col gap-2 opacity-90">
          <span className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/35 text-[10px] leading-none backdrop-blur-sm">
            <PostLikeIcon size={20} />
            <span className="mt-0.5 text-[8px] font-bold text-white">
              {post.interestCount}
            </span>
          </span>
          <span className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/35 text-[10px] leading-none backdrop-blur-sm">
            <FeedCommentIcon size={20} />
            <span className="mt-0.5 text-[8px] font-bold text-white">
              {post.commentCount}
            </span>
          </span>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] space-y-2 p-3 pr-14">
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center rounded-[20px] border border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.15)] px-2 py-0.5 text-[9px] font-bold leading-snug text-[#ffaa00]">
              {amberPill}
            </span>
            <span className="inline-flex items-center gap-1 rounded-[20px] border border-[rgba(0,232,122,0.3)] bg-[rgba(0,232,122,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#00e87a]">
              <FeedPeopleIcon size={12} />
              {post.partySize}人
            </span>
          </div>

          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-[rgba(255,61,0,0.9)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                {post.visitOrder}軒目
              </span>
              <p className="text-[13px] font-bold text-[#eeeaf4]">{post.shopName}</p>
            </div>
            <p className="flex items-center gap-1 text-[11px] text-[#9994a8]">
              <FeedPinIcon size={12} color="#9994a8" />
              {post.area}
            </p>
          </div>

          <div className="rounded-r-md border-l-2 border-[#ff3d00] bg-white/[0.06] px-2.5 py-1.5">
            <p className="line-clamp-3 text-xs leading-normal text-[#eeeaf4]">
              {post.comment}
            </p>
          </div>
        </div>
      </div>

      <p className="px-1 pt-1.5 text-[10px] text-[#9994a8]">
        今日 {post.postedAtLabel}
      </p>
    </Link>
  );
}
