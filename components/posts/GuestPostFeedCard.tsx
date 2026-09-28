"use client";

import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import { formatPostedAt } from "@/lib/home/types";
import { extractAreaFromAddress } from "@/lib/geo/area";
import { getDistanceLabel, type GeoPoint } from "@/lib/geo/haversine";
import { guestPostCommentText } from "@/lib/guest-post/guestComment";
import {
  getTonightCupDisplay,
  getVisitOrder,
} from "@/lib/guest-post/nightOut";

type GuestPostFeedCardProps = {
  post: VibePost;
  tonightTotalCups?: number | null;
  interestCount?: number;
  commentCount?: number;
  userLocation?: GeoPoint | null;
  onInterest?: () => void;
  interestLoading?: boolean;
  interested?: boolean;
  showActions?: boolean;
  shopHref?: string;
  className?: string;
};

function authorInitial(name: string | null | undefined) {
  const trimmed = (name ?? "ゲ").trim();
  return trimmed.charAt(0).toUpperCase();
}

function MediaLayer({ post }: { post: VibePost }) {
  const isVideo = post.media_type === "video" && post.video_url;
  const images = (post.images ?? []).filter(
    (src) => src.startsWith("http") || src.startsWith("data:"),
  );

  if (isVideo && post.video_url) {
    return (
      <video
        src={post.video_url}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }

  if (images[0]) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#120810] to-[#2d1200] text-5xl">
      🍻
    </div>
  );
}

export default function GuestPostFeedCard({
  post,
  tonightTotalCups = null,
  interestCount = 0,
  commentCount = 0,
  userLocation = null,
  onInterest,
  interestLoading = false,
  interested = false,
  showActions = true,
  shopHref,
  className = "",
}: GuestPostFeedCardProps) {
  const shop = post.shops;
  const visitOrder = getVisitOrder(post);
  const cupTotal = getTonightCupDisplay(post, tonightTotalCups);
  const comment = guestPostCommentText(post.comment);
  const displayName = post.author_display_name?.trim() || "ゲスト";
  const area = shop?.address ? extractAreaFromAddress(shop.address) : "—";
  const distance = shop ? getDistanceLabel(userLocation, shop) : null;
  const href = shopHref ?? (shop?.id ? `/shop/${shop.id}` : undefined);

  const amberPillParts: string[] = [];
  if (cupTotal != null) amberPillParts.push(`今夜${cupTotal}杯目`);
  if (post.drink_name) amberPillParts.push(`🍹 ${post.drink_name}`);
  const amberPill = amberPillParts.join(" · ");

  async function handleShare() {
    const url =
      typeof window !== "undefined" && shop?.id
        ? `${window.location.origin}/shop/${shop.id}`
        : "";
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: shop?.name ?? "mazare",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // user cancelled or denied
    }
  }

  const cardInner = (
    <>
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <MediaLayer post={post} />

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(8,8,16,0.95)] via-[rgba(8,8,16,0.35)] to-transparent"
          aria-hidden
        />

        <div className="absolute left-3 top-3 z-[2] flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ff3d00] text-[11px] font-extrabold text-white">
            {authorInitial(post.author_display_name)}
          </span>
          {post.author_id ? (
            <Link
              href={`/user/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-semibold text-[#eeeaf4] hover:underline"
            >
              {displayName}
            </Link>
          ) : (
            <span className="text-xs font-semibold text-[#eeeaf4]">
              {displayName}
            </span>
          )}
        </div>

        {showActions && (
          <div className="absolute right-3 top-1/2 z-[2] flex -translate-y-1/2 flex-col gap-2">
            <button
              type="button"
              disabled={!onInterest || interestLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onInterest?.();
              }}
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white/10 text-[10px] leading-none backdrop-blur-sm disabled:opacity-50"
              aria-label="今夜行くかも"
            >
              <span>👋</span>
              {interestCount > 0 && (
                <span className="mt-0.5 text-[8px] font-bold text-[#00e87a]">
                  {interestCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-white/10 text-[10px] leading-none backdrop-blur-sm"
              aria-label="コメント"
            >
              <span>💬</span>
              {commentCount > 0 && (
                <span className="mt-0.5 text-[8px] font-bold text-[#9994a8]">
                  {commentCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void handleShare();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm backdrop-blur-sm"
              aria-label="シェア"
            >
              ↗️
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-[2] space-y-2 p-3 pr-14">
          <div className="flex flex-wrap gap-1.5">
            {amberPill && (
              <span className="inline-flex items-center rounded-[20px] border border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.15)] px-2 py-0.5 text-[9px] font-bold leading-snug text-[#ffaa00]">
                {amberPill}
              </span>
            )}
            {post.party_size != null && post.party_size >= 1 && (
              <span className="inline-flex items-center rounded-[20px] border border-[rgba(0,232,122,0.3)] bg-[rgba(0,232,122,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#00e87a]">
                👥 {post.party_size}人
              </span>
            )}
          </div>

          {shop && (
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                {visitOrder != null && (
                  <span className="rounded bg-[rgba(255,61,0,0.9)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    {visitOrder}軒目
                  </span>
                )}
                <p className="text-[13px] font-bold text-[#eeeaf4]">{shop.name}</p>
              </div>
              <p className="text-[11px] text-[#9994a8]">
                📍 {area}
                {distance ? ` · ${distance}` : ""}
              </p>
            </div>
          )}

          {comment && (
            <div className="rounded-r-md border-l-2 border-[#ff3d00] bg-white/[0.06] px-2.5 py-1.5">
              <p className="text-xs leading-normal text-[#eeeaf4]">{comment}</p>
            </div>
          )}
        </div>

        {interested && showActions && (
          <div className="absolute right-3 top-3 z-[2] rounded-full bg-[#00e87a]/20 px-2 py-0.5 text-[9px] font-bold text-[#00e87a]">
            行くかも ✓
          </div>
        )}
      </div>

      {post.posted_at && (
        <p className="px-1 pt-1.5 text-[10px] text-[#9994a8]">
          {formatPostedAt(post.posted_at)}
        </p>
      )}
    </>
  );

  return (
    <article
      className={`overflow-hidden rounded-[12px] bg-[#080810] ${className}`}
    >
      {href ? (
        <Link href={href} className="block">
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </article>
  );
}
