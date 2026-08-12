"use client";

import Link from "next/link";
import { useState } from "react";
import {
  formatGenre,
  formatOpenHours,
  formatPostedAt,
  getShopCoverImages,
  type VibePost,
} from "@/lib/home/types";
import { heatLevel } from "@/lib/home/moods";
import { usePostViewTracking } from "@/lib/home/usePostViewTracking";
import type { GeoPoint } from "@/lib/geo/haversine";
import type { CheckinUser } from "@/lib/checkins/api";
import CheckinAvatarStack from "@/components/checkins/CheckinAvatarStack";
import {
  HeatGauge,
  MoodTagList,
  ShopAccessLabel,
} from "@/components/home/ShopVibeInfo";
import PostImageCarousel from "./PostImageCarousel";

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  if (genre.includes("カラオケ")) return "🎤";
  if (genre.includes("ライブ")) return "🎸";
  return "🕺";
}

type VibePostCardProps = {
  post: VibePost;
  interestCount: number;
  interested: boolean;
  isSubmitting: boolean;
  onInterest: () => void;
  userLocation?: GeoPoint | null;
  checkinUsers?: CheckinUser[];
};

export default function VibePostCard({
  post,
  interestCount,
  interested,
  isSubmitting,
  onInterest,
  userLocation = null,
  checkinUsers = [],
}: VibePostCardProps) {
  const viewRef = usePostViewTracking(post.id);
  const [expanded, setExpanded] = useState(false);
  const shop = post.shops;
  const genre = formatGenre(shop?.genre);
  const heat = heatLevel(post.moods);
  const shopHref = shop?.id ? `/shop/${shop.id}` : undefined;
  const moods = post.moods ?? [];

  const postImages = post.images?.filter(Boolean) ?? [];
  const coverImages = shop ? getShopCoverImages(shop) : [];
  const carouselImages =
    postImages.length > 0 ? postImages : coverImages.slice(0, 3);

  return (
    <article
      ref={viewRef}
      className="overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:-translate-y-0.5 hover:border-[#ff3d00]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <div className="relative">
        <PostImageCarousel
          images={carouselImages}
          fallbackEmoji={genreEmoji(genre)}
          overlay={
            <span className="absolute left-3 top-3 rounded-lg bg-[#ff3d00] px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-white shadow-lg">
              LIVE
            </span>
          }
        />
      </div>

      <div className="space-y-3 p-4">
        {shop && (
          <h3 className="text-xl font-extrabold leading-tight text-[#eeeaf4]">
            {shop.name}
          </h3>
        )}

        <HeatGauge heat={heat} />

        {moods.length > 0 && <MoodTagList moods={moods} />}

        {shop && (
          <ShopAccessLabel userLocation={userLocation} shop={shop} />
        )}

        <button
          type="button"
          onClick={onInterest}
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold transition disabled:opacity-60 ${
            interested
              ? "border-2 border-[#00e87a]/50 bg-[#00e87a]/15 text-[#00e87a]"
              : "bg-[#ff3d00] text-white shadow-[0_6px_24px_rgba(255,61,0,0.35)] hover:bg-[#e63600]"
          }`}
        >
          {isSubmitting
            ? "送信中..."
            : interested
              ? "👋 行くかも ✓"
              : "👋 行くかも"}
        </button>

        {interestCount > 0 && (
          <p className="text-center text-sm font-semibold text-[#00e87a]">
            {interestCount}人が行くかも
          </p>
        )}

        {(post.comment || shop) && (
          <>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="flex w-full items-center justify-center gap-1 py-2 text-sm font-medium text-[#9994a8] transition hover:text-[#eeeaf4]"
              aria-expanded={expanded}
            >
              {expanded ? "閉じる ▲" : "コメント・詳細 ▼"}
            </button>

            {expanded && (
              <div className="space-y-3 border-t border-white/[0.06] pt-4">
                {post.comment && (
                  <p className="text-[15px] font-medium leading-relaxed text-[#eeeaf4]">
                    {post.comment}
                  </p>
                )}

                {shop && (
                  <div className="rounded-xl border border-white/[0.07] bg-[#18181f]/60 p-3">
                    <p className="text-sm text-[#9994a8]">
                      {genreEmoji(genre)} {genre}
                      <span className="mx-2 text-[#5a5668]">·</span>
                      🕙 {formatOpenHours(shop.open_hours)}
                    </p>
                    <CheckinAvatarStack users={checkinUsers} className="mt-3" />
                    {shopHref && (
                      <Link
                        href={shopHref}
                        className="mt-3 block text-sm font-bold text-[#ff3d00] hover:underline"
                      >
                        住所・詳細を見る →
                      </Link>
                    )}
                  </div>
                )}

                {post.posted_at && (
                  <p className="text-xs text-[#5a5668]">
                    投稿 {formatPostedAt(post.posted_at)}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}
