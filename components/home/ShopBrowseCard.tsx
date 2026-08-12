"use client";

import Link from "next/link";
import {
  formatGenre,
  getShopCoverImages,
  type Shop,
} from "@/lib/home/types";
import { heatLevel } from "@/lib/home/moods";
import type { GeoPoint } from "@/lib/geo/haversine";
import type { CheckinUser } from "@/lib/checkins/api";
import {
  HeatGauge,
  MoodTagList,
  ShopAccessLabel,
} from "@/components/home/ShopVibeInfo";
import PostImageCarousel from "./PostImageCarousel";

type ShopBrowseCardProps = {
  shop: Shop;
  live?: boolean;
  isNew?: boolean;
  moods?: string[] | null;
  postImages?: string[] | null;
  latestComment?: string | null;
  latestPostedAt?: string | null;
  interestCount?: number;
  userLocation?: GeoPoint | null;
  checkinUsers?: CheckinUser[];
};

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  if (genre.includes("カラオケ")) return "🎤";
  return "🕺";
}

export default function ShopBrowseCard({
  shop,
  live = false,
  isNew = false,
  moods = null,
  postImages = null,
  interestCount = 0,
  userLocation = null,
}: ShopBrowseCardProps) {
  const genre = formatGenre(shop.genre);
  const cover = getShopCoverImages(shop)[0];
  const displayMoods = moods ?? [];
  const heat = heatLevel(displayMoods.length > 0 ? displayMoods : null);
  const carouselImages =
    postImages && postImages.length > 0
      ? postImages.filter(Boolean)
      : cover
        ? [cover]
        : [];

  return (
    <article className="overflow-hidden rounded-2xl border border-white/7 bg-[#111118] transition hover:-translate-y-0.5 hover:border-[#ff3d00]/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="relative">
        {carouselImages.length > 0 ? (
          <PostImageCarousel
            images={carouselImages}
            fallbackEmoji={genreEmoji(genre)}
            aspectClassName="aspect-[4/5] w-full min-h-[220px] max-h-[320px]"
            overlay={
              <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                {live && (
                  <span className="rounded-lg bg-[#ff3d00] px-2.5 py-1 text-xs font-extrabold uppercase text-white shadow-lg">
                    LIVE
                  </span>
                )}
                {isNew && (
                  <span className="rounded-lg bg-[#00e87a] px-2.5 py-1 text-xs font-extrabold uppercase text-[#080810]">
                    New!
                  </span>
                )}
              </div>
            }
          />
        ) : (
          <div className="relative flex aspect-[4/5] min-h-[220px] max-h-[320px] items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-6xl">
            {genreEmoji(genre)}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5">
              {live && (
                <span className="rounded-lg bg-[#ff3d00] px-2.5 py-1 text-xs font-extrabold uppercase text-white shadow-lg">
                  LIVE
                </span>
              )}
              {isNew && (
                <span className="rounded-lg bg-[#00e87a] px-2.5 py-1 text-xs font-extrabold uppercase text-[#080810]">
                  New!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <h3 className="text-lg font-extrabold leading-tight text-[#eeeaf4]">
          {shop.name}
        </h3>

        {live && displayMoods.length > 0 ? (
          <>
            <HeatGauge heat={heat} />
            <MoodTagList moods={displayMoods} />
          </>
        ) : (
          <p className="text-sm font-medium text-[#5a5668]">
            今夜の発信はまだありません
          </p>
        )}

        <ShopAccessLabel userLocation={userLocation} shop={shop} />

        <Link
          href={`/shop/${shop.id}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#ff3d00]/30 bg-[#ff3d00]/10 px-4 py-3.5 transition hover:bg-[#ff3d00]/15"
        >
          <span className="text-sm font-semibold text-[#eeeaf4]">
            {interestCount > 0
              ? `${interestCount}人が行くかも · 詳細を見る`
              : "住所・詳細を見る"}
          </span>
          <span className="shrink-0 text-sm font-bold text-[#ff3d00]">→</span>
        </Link>
      </div>
    </article>
  );
}
