"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { VibePost } from "@/lib/home/types";
import { formatRelativePostedAt } from "@/lib/home/formatRelativePostedAt";
import ReelCaption from "@/components/home/reels/ReelCaption";
import { extractAreaFromAddress } from "@/lib/geo/area";
import { getDistanceLabel, type GeoPoint } from "@/lib/geo/haversine";
import { formatGuestPostBodyForDisplay } from "@/lib/guest-post/composeBody";
import {
  getTonightCupDisplay,
  getVisitOrder,
} from "@/lib/guest-post/nightOut";
import VibePostCommentSheet from "@/components/comments/VibePostCommentSheet";
import {
  FeedCommentIcon,
  FeedGlassIcon,
  FeedPeopleIcon,
  FeedPinIcon,
  FeedShareIcon,
  FeedWaveIcon,
} from "@/components/icons/FeedActionIcons";
import { fetchCommentCountsByPostIds } from "@/lib/comments/api";
import { resolvePostMedia } from "@/lib/guest-post/resolvePostMedia";
import { supabase } from "@/lib/supabase";

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

function FeedPreviewVideo({
  src,
  className = "",
}: {
  src: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!root || !video) return;
    video.muted = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [src]);

  return (
    <div ref={rootRef} className={`h-full w-full ${className}`.trim()}>
      <video
        ref={videoRef}
        src={src}
        className="pointer-events-none h-full w-full object-cover"
        muted
        playsInline
        loop
        autoPlay
        preload="auto"
      />
    </div>
  );
}

function MediaLayer({ post }: { post: VibePost }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { mode, videoUrl, images } = resolvePostMedia(post);

  const slideCount =
    mode === "mixed"
      ? (videoUrl ? 1 : 0) + images.length
      : mode === "video"
        ? 1
        : images.length;

  function handleScroll() {
    const el = scrollRef.current;
    if (!el || slideCount <= 1) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(index, slideCount - 1));
  }

  if (mode === "mixed" && videoUrl) {
    return (
      <div className="absolute inset-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="relative h-full w-full shrink-0 snap-center">
            <FeedPreviewVideo src={videoUrl} />
          </div>
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                className="pointer-events-none h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        {slideCount > 1 && (
          <>
            <div className="pointer-events-none absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-1.5">
              {Array.from({ length: slideCount }).map((_, index) => (
                <span
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="pointer-events-none absolute right-3 top-12 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {activeIndex + 1}/{slideCount}
            </div>
          </>
        )}
      </div>
    );
  }

  if (mode === "video" && videoUrl) {
    return (
      <div className="absolute inset-0">
        <FeedPreviewVideo src={videoUrl} />
      </div>
    );
  }

  if (images.length > 1) {
    return (
      <div className="absolute inset-0">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative h-full w-full shrink-0 snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading={index === 0 ? "lazy" : "lazy"}
                decoding="async"
                className="pointer-events-none h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (images[0]) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt=""
        loading="lazy"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a0a00] via-[#120810] to-[#2d1200]">
      <FeedGlassIcon size={56} color="rgba(255,61,0,0.45)" />
    </div>
  );
}

function MediaExpandOverlay({
  post,
  onClose,
}: {
  post: VibePost;
  onClose: () => void;
}) {
  const { mode, videoUrl, images } = resolvePostMedia(post);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const slides: { kind: "video" | "image"; url: string }[] = [];
  if (mode === "mixed" && videoUrl) {
    slides.push({ kind: "video", url: videoUrl });
    for (const url of images) slides.push({ kind: "image", url });
  } else if (mode === "video" && videoUrl) {
    slides.push({ kind: "video", url: videoUrl });
  } else {
    for (const url of images) slides.push({ kind: "image", url });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="メディア拡大表示"
    >
      <div className="flex h-full w-full max-h-[100dvh] max-w-[100vw] snap-x snap-mandatory items-center overflow-x-auto">
        {slides.map((slide, index) => (
          <div
            key={`${slide.url}-${index}`}
            className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4"
          >
            {slide.kind === "video" ? (
              <video
                src={slide.url}
                className="max-h-full max-w-full object-contain"
                controls
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.url}
                alt=""
                className="max-h-full max-w-full object-contain"
                style={{ touchAction: "pinch-zoom" }}
              />
            )}
          </div>
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-8 left-0 right-0 text-center text-xs text-white/50">
        タップして戻る
      </p>
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [liveCommentCount, setLiveCommentCount] = useState(commentCount);

  useEffect(() => {
    setLiveCommentCount(commentCount);
  }, [commentCount]);

  useEffect(() => {
    const channel = supabase
      .channel(`post-comment-count-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `vibe_post_id=eq.${post.id}`,
        },
        () => {
          void fetchCommentCountsByPostIds([post.id]).then((map) => {
            setLiveCommentCount(map.get(post.id) ?? 0);
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [post.id]);
  const shop = post.shops;
  const visitOrder = getVisitOrder(post);
  const cupTotal = getTonightCupDisplay(post, tonightTotalCups);
  const comment = formatGuestPostBodyForDisplay(post.comment, post.hashtags);
  const displayName = post.author_display_name?.trim() || "ゲスト";
  const area = shop?.address ? extractAreaFromAddress(shop.address) : "—";
  const distance = shop ? getDistanceLabel(userLocation, shop) : null;
  const shopLink = shopHref ?? (shop?.id ? `/shop/${shop.id}` : undefined);
  const { hasMedia } = resolvePostMedia(post);
  const waveIconColor = interested ? "#ff3d00" : "#ffffff";

  const amberPillParts: string[] = [];
  if (cupTotal != null) {
    amberPillParts.push(`今夜${cupTotal}杯目`);
  }
  if (post.drink_name) amberPillParts.push(post.drink_name);
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

  return (
    <article
      className={`overflow-hidden rounded-[12px] bg-[#080810] ${className}`}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <MediaLayer post={post} />

        {hasMedia && (
          <button
            type="button"
            className="absolute inset-0 z-[1] cursor-zoom-in bg-transparent"
            aria-label="写真または動画を拡大表示"
            onClick={() => setIsExpanded(true)}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[rgba(8,8,16,0.95)] via-[rgba(8,8,16,0.35)] to-transparent"
          aria-hidden
        />

        <div className="absolute left-3 top-3 z-[3] flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ff3d00] text-[11px] font-extrabold text-white">
            {authorInitial(post.author_display_name)}
          </span>
          {post.author_id ? (
            <Link
              href={`/user/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto text-xs font-semibold text-[#eeeaf4] hover:underline"
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
          <div className="absolute bottom-4 right-3 z-[3] flex flex-col gap-2">
            <button
              type="button"
              disabled={!onInterest || interestLoading}
              onClick={(e) => {
                e.stopPropagation();
                onInterest?.();
              }}
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/35 text-[10px] leading-none backdrop-blur-sm disabled:opacity-50"
              aria-label="今夜行くかも"
            >
              <FeedWaveIcon size={20} color={waveIconColor} />
              {interestCount > 0 && (
                <span className="mt-0.5 text-[8px] font-bold text-white">
                  {interestCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCommentsOpen(true);
              }}
              className="flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/35 text-[10px] leading-none backdrop-blur-sm"
              aria-label="コメント"
            >
              <FeedCommentIcon size={20} />
              {liveCommentCount > 0 && (
                <span className="mt-0.5 text-[8px] font-bold text-white">
                  {liveCommentCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void handleShare();
              }}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm"
              aria-label="シェア"
            >
              <FeedShareIcon size={20} />
            </button>
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] space-y-2 p-3 pr-14">
          <div className="flex flex-wrap gap-1.5">
            {amberPill && (
              <span className="inline-flex items-center rounded-[20px] border border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.15)] px-2 py-0.5 text-[9px] font-bold leading-snug text-[#ffaa00]">
                {amberPill}
              </span>
            )}
            {post.party_size != null && post.party_size >= 1 && (
              <span className="inline-flex items-center gap-1 rounded-[20px] border border-[rgba(0,232,122,0.3)] bg-[rgba(0,232,122,0.1)] px-2 py-0.5 text-[9px] font-bold text-[#00e87a]">
                <FeedPeopleIcon size={12} />
                {post.party_size}人
              </span>
            )}
          </div>

          {shop && (
            <div className="pointer-events-auto space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                {visitOrder != null && (
                  <span className="rounded bg-[rgba(255,61,0,0.9)] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                    {visitOrder}軒目
                  </span>
                )}
                {shopLink ? (
                  <Link
                    href={shopLink}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer border-b border-white/30 text-base font-black text-[#eeeaf4] transition hover:border-[#ff3d00]/60 hover:text-[#ff3d00]"
                  >
                    {shop.name}
                  </Link>
                ) : (
                  <p className="text-base font-black text-[#eeeaf4]">
                    {shop.name}
                  </p>
                )}
              </div>
              <p className="flex items-center gap-1 text-[11px] text-[#9994a8]">
                <FeedPinIcon size={12} color="#9994a8" />
                {area}
                {distance ? ` · ${distance}` : ""}
              </p>
            </div>
          )}

          {comment && (
            <div className="pointer-events-auto rounded-r-md border-l-2 border-[#ff3d00] bg-white/[0.06] px-2.5 py-1.5">
              <ReelCaption text={comment} />
            </div>
          )}
        </div>

        {interested && showActions && (
          <div className="pointer-events-none absolute right-3 top-3 z-[3] rounded-full bg-[#00e87a]/20 px-2 py-0.5 text-[9px] font-bold text-[#00e87a]">
            行くかも ✓
          </div>
        )}
      </div>

      {post.posted_at && (
        <p className="px-1 pt-1.5 text-[10px] text-[#9994a8]">
          {formatRelativePostedAt(post.posted_at)}
        </p>
      )}

      {isExpanded && (
        <MediaExpandOverlay post={post} onClose={() => setIsExpanded(false)} />
      )}

      <VibePostCommentSheet
        vibePostId={post.id}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCountChange={setLiveCommentCount}
      />
    </article>
  );
}
