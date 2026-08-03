"use client";

import Link from "next/link";
import {
  formatGenre,
  formatOpenHours,
  formatPostedAt,
  getShopCoverImages,
  type VibePost,
} from "@/lib/home/types";
import { heatLevel, moodEmoji, moodTagClass } from "@/lib/home/moods";
import { usePostViewTracking } from "@/lib/home/usePostViewTracking";
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
};

export default function VibePostCard({
  post,
  interestCount,
  interested,
  isSubmitting,
  onInterest,
}: VibePostCardProps) {
  const viewRef = usePostViewTracking(post.id);
  const shop = post.shops;
  const genre = formatGenre(shop?.genre);
  const heat = heatLevel(post.moods);
  const shopHref = shop?.id ? `/shop/${shop.id}` : undefined;

  const postImages = post.images?.filter(Boolean) ?? [];
  const coverImages = shop ? getShopCoverImages(shop) : [];
  const carouselImages =
    postImages.length > 0 ? postImages : coverImages.slice(0, 3);

  return (
    <article
      ref={viewRef}
      className="overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:-translate-y-0.5 hover:border-[#ff3d00]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      <PostImageCarousel
        images={carouselImages}
        fallbackEmoji={genreEmoji(genre)}
        overlay={
          <>
            <span className="absolute left-3 top-3 rounded-md bg-[#ff3d00] px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-lg">
              LIVE NOW
            </span>
            <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/12 bg-[#080810]/80 px-2.5 py-1 backdrop-blur-sm">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`h-1 w-1 rounded-full ${
                      i <= heat.filled
                        ? i === 5 && heat.filled === 5
                          ? "bg-[#ffaa00]"
                          : "bg-[#ff3d00]"
                        : "bg-white/12"
                    }`}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-bold ${heat.color}`}>
                {heat.label}
              </span>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#111118] to-transparent" />
          </>
        }
      />

      <div className="space-y-3 p-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#5a5668]">
            今夜の発信
            {post.posted_at && (
              <span className="ml-2 font-normal normal-case tracking-normal text-[#5a5668]/80">
                {formatPostedAt(post.posted_at)}
              </span>
            )}
          </p>
          <p className="mt-1.5 text-[15px] font-semibold leading-relaxed text-[#eeeaf4]">
            {post.comment}
          </p>
        </div>

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

        {shop && (
          <div className="rounded-xl border border-white/[0.07] bg-[#18181f]/60 p-3">
            {shopHref ? (
              <Link href={shopHref} className="group block">
                <ShopMeta shop={shop} genre={genre} />
              </Link>
            ) : (
              <ShopMeta shop={shop} genre={genre} />
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#00e87a]">
              {interestCount}人が行くかも
            </p>
            <p className="text-[10px] text-[#5a5668]">
              タップして今夜行く候補に追加
            </p>
          </div>
          <button
            type="button"
            onClick={onInterest}
            disabled={isSubmitting}
            className={`shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-bold transition disabled:opacity-60 ${
              interested
                ? "border border-[#00e87a]/40 bg-[#00e87a]/12 text-[#00e87a]"
                : "bg-[#ff3d00] text-white shadow-[0_4px_16px_rgba(255,61,0,0.25)] hover:bg-[#e63600]"
            }`}
          >
            {isSubmitting
              ? "送信中..."
              : interested
                ? "👋 行くかも ✓"
                : "👋 行くかも"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ShopMeta({
  shop,
  genre,
}: {
  shop: NonNullable<VibePost["shops"]>;
  genre: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[15px] font-extrabold leading-tight text-[#eeeaf4] group-hover:text-[#ff3d00]">
          {shop.name}
        </h3>
        <span className="shrink-0 rounded-md bg-[#ff3d00]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ff3d00]">
          {genre}
        </span>
      </div>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9994a8]">
        <span>📍 {shop.address}</span>
        <span>🕙 {formatOpenHours(shop.open_hours)}</span>
      </p>
      <p className="mt-2 text-[11px] font-semibold text-[#ff3d00]/80 group-hover:text-[#ff3d00]">
        お店の詳細を見る →
      </p>
    </>
  );
}
