"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { HomeReelsPost } from "@/lib/home/fetchHomeReelsFeed";
import { formatRelativePostedAt } from "@/lib/home/formatRelativePostedAt";
import { isWithinRecentPostsWindow } from "@/lib/home/recentWindow";
import { getPostCardLocationLabel, type GeoPoint } from "@/lib/geo/postCardLocation";
import { formatGuestPostBodyForDisplay } from "@/lib/guest-post/composeBody";
import {
  getTonightCupDisplay,
  getVisitOrder,
} from "@/lib/guest-post/nightOut";
import { resolvePostMedia } from "@/lib/guest-post/resolvePostMedia";
import VibePostCommentSheet from "@/components/comments/VibePostCommentSheet";
import { usePostViewTracking } from "@/lib/home/usePostViewTracking";
import ReelCaption from "@/components/home/reels/ReelCaption";
import InterestHeartBurst from "@/components/home/reels/InterestHeartBurst";
import {
  FeedCommentIcon,
  FeedGlassIcon,
  FeedPeopleIcon,
  FeedPinIcon,
  FeedShareIcon,
  PostLikeIcon,
} from "@/components/icons/FeedActionIcons";
import TonightSocialMoodBadge from "@/components/profile/TonightSocialMoodBadge";
import { isTonightSocialMoodId } from "@/lib/profile/tonightSocialMood";

type HomeReelSlideProps = {
  post: HomeReelsPost;
  tonightTotalCups: number | null;
  interestCount: number;
  commentCount: number;
  interested: boolean;
  interestLoading: boolean;
  isActive: boolean;
  userLocation: GeoPoint | null;
  onInterest: () => void;
  onCommentCountChange: (count: number) => void;
};

function authorInitial(name: string | null | undefined) {
  return (name ?? "ゲ").trim().charAt(0).toUpperCase();
}

function mediaOf(post: HomeReelsPost) {
  const resolved = resolvePostMedia(post);
  if (resolved.mode === "mixed" && resolved.videoUrl) {
    return {
      isVideo: true,
      videoUrl: resolved.videoUrl,
      images: resolved.images,
    };
  }
  return {
    isVideo: resolved.mode === "video",
    videoUrl: resolved.videoUrl,
    images: resolved.images,
  };
}

function ActionButton({
  label,
  count,
  onClick,
  disabled,
  children,
}: {
  label: string;
  count?: number;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex flex-col items-center gap-1 disabled:opacity-40"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/35 backdrop-blur-md">
        {children}
      </span>
      {count != null && count > 0 && (
        <span className="text-[10px] font-bold tabular-nums text-white/90">
          {count}
        </span>
      )}
    </button>
  );
}

export default function HomeReelSlide({
  post,
  tonightTotalCups,
  interestCount,
  commentCount,
  interested,
  interestLoading,
  isActive,
  userLocation,
  onInterest,
  onCommentCountChange,
}: HomeReelSlideProps) {
  const viewRef = usePostViewTracking(post.id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTapRef = useRef(0);
  const [muted, setMuted] = useState(true);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liveComments, setLiveComments] = useState(commentCount);
  const [heartBurst, setHeartBurst] = useState(0);

  useEffect(() => {
    setLiveComments(commentCount);
  }, [commentCount]);

  const { isVideo, videoUrl, images } = mediaOf(post);
  const shop = post.shops;
  const visitOrder = getVisitOrder(post);
  const cups = getTonightCupDisplay(post, tonightTotalCups);
  const caption = formatGuestPostBodyForDisplay(post.comment, post.hashtags);
  const name = post.author_display_name?.trim() || "ゲスト";
  const locationLabel = getPostCardLocationLabel(userLocation, shop);
  const when = formatRelativePostedAt(post.posted_at);
  const isRecentTonight = isWithinRecentPostsWindow(post.posted_at);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (isActive) {
      v.muted = muted;
      void v.play().catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
    }
  }, [isActive, isVideo, muted]);

  async function sharePost() {
    const url =
      shop?.id && typeof window !== "undefined"
        ? `${window.location.origin}/shop/${shop.id}`
        : "";
    if (!url) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: shop?.name ?? "mazare", url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* cancelled */
    }
  }

  const waveColor = interested ? "#ff3d00" : "#ffffff";

  function handleMediaTap() {
    const now = Date.now();
    if (now - lastTapRef.current < 320) {
      lastTapRef.current = 0;
      if (!interestLoading && !interested) {
        setHeartBurst((n) => n + 1);
        onInterest();
      } else if (interested) {
        setHeartBurst((n) => n + 1);
      }
      return;
    }
    lastTapRef.current = now;
  }

  return (
    <article
      ref={viewRef}
      className="relative h-full w-full overflow-hidden bg-[#111118]"
      onClick={handleMediaTap}
    >
      <InterestHeartBurst trigger={heartBurst} />
      {isVideo && videoUrl ? (
        <button
          type="button"
          className="absolute inset-0"
          aria-label={muted ? "音声をオン" : "ミュート"}
          onClick={(e) => {
            e.stopPropagation();
            setMuted((m) => {
              const next = !m;
              if (videoRef.current) videoRef.current.muted = next;
              return next;
            });
          }}
        >
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-cover"
            muted
            playsInline
            loop
            preload="metadata"
          />
        </button>
      ) : images[0] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={images[0]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d14] via-[#111118] to-[#1a0800]">
          <div className="flex h-full items-center justify-center">
            <FeedGlassIcon size={56} color="rgba(255,61,0,0.45)" />
          </div>
        </div>
      )}

      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]"
        aria-hidden
      />

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-4 pt-[max(16px,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2.5">
          {post.author_profile_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author_profile_image}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/25"
            />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ff3d00] text-xs font-extrabold text-white ring-2 ring-white/25">
              {authorInitial(post.author_display_name)}
            </span>
          )}
          <div className="min-w-0">
            {post.author_id ? (
              <Link
                href={`/user/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto block truncate text-[13px] font-bold text-[#eeeaf4] [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]"
              >
                {name}
              </Link>
            ) : (
              <p className="truncate text-[13px] font-bold text-[#eeeaf4] [text-shadow:0_1px_6px_rgba(0,0,0,0.85)]">
                {name}
              </p>
            )}
            {when && (
              <p className="text-[10px] font-medium text-white/55">{when}</p>
            )}
          </div>
        </div>
        {isRecentTonight && (
          <span className="shrink-0 rounded-full border border-[#ff3d00]/40 bg-[#ff3d00]/15 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#ff3d00]">
            Tonight
          </span>
        )}
      </div>

      <div className="absolute bottom-[22%] right-3 z-10 flex flex-col items-center gap-3">
        <ActionButton
          label="いいね"
          count={interestCount}
          disabled={interestLoading}
          onClick={() => {
            if (!interested) setHeartBurst((n) => n + 1);
            onInterest();
          }}
        >
          <PostLikeIcon color={waveColor} filled={interested} />
        </ActionButton>
        <ActionButton
          label="コメント"
          count={liveComments}
          onClick={() => setCommentsOpen(true)}
        >
          <FeedCommentIcon />
        </ActionButton>
        <ActionButton label="シェア" onClick={() => void sharePost()}>
          <FeedShareIcon />
        </ActionButton>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#080810]/95 via-[#080810]/55 to-transparent px-4 pb-5 pt-24">
        <div className="pointer-events-auto space-y-2.5 pr-14">
          <div className="flex flex-wrap items-center gap-1.5">
            {isTonightSocialMoodId(post.author_tonight_social_mood) ? (
              <TonightSocialMoodBadge
                mood={post.author_tonight_social_mood}
                size="sm"
                prefix={false}
              />
            ) : null}
            {(cups != null || post.drink_name) && (
              <span className="inline-flex items-center rounded-full border border-[#ffaa00]/35 bg-[#ffaa00]/12 px-2.5 py-1 text-[10px] font-bold text-[#ffaa00]">
                {cups != null && `今夜${cups}杯目`}
                {cups != null && post.drink_name && " · "}
                {post.drink_name}
              </span>
            )}
            {post.party_size != null && post.party_size >= 1 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#00e87a]/35 bg-[#00e87a]/10 px-2.5 py-1 text-[10px] font-bold text-[#00e87a]">
                <FeedPeopleIcon size={13} />
                {post.party_size}人
              </span>
            )}
            {visitOrder != null && (
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/80">
                {visitOrder}軒目
              </span>
            )}
          </div>

          {shop && (
            <>
              <Link
                href={`/shop/${shop.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block text-xl font-black leading-tight text-[#eeeaf4]"
              >
                {shop.name}
              </Link>
              {locationLabel !== "—" && (
                <p className="flex items-center gap-1 text-[11px] text-[#9994a8]">
                  <FeedPinIcon />
                  {locationLabel}
                </p>
              )}
            </>
          )}

          <ReelCaption text={caption} />
        </div>
      </div>

      <VibePostCommentSheet
        vibePostId={post.id}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCountChange={(n) => {
          setLiveComments(n);
          onCommentCountChange(n);
        }}
      />
    </article>
  );
}
