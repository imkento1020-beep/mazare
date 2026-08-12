"use client";

import Link from "next/link";
import {
  formatGenre,
  formatOpenHours,
  formatPostedAt,
  getShopCoverImages,
  type Shop,
} from "@/lib/home/types";
import { extractAreaFromAddress } from "@/lib/geo/area";
import { getDistanceLabel, type GeoPoint } from "@/lib/geo/haversine";
import type { CheckinUser } from "@/lib/checkins/api";
import CheckinAvatarStack from "@/components/checkins/CheckinAvatarStack";

type ShopBrowseCardProps = {
  shop: Shop;
  live?: boolean;
  isNew?: boolean;
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
  latestComment,
  latestPostedAt,
  interestCount = 0,
  userLocation = null,
  checkinUsers = [],
}: ShopBrowseCardProps) {
  const genre = formatGenre(shop.genre);
  const cover = getShopCoverImages(shop)[0];
  const area = extractAreaFromAddress(shop.address);
  const distance = getDistanceLabel(userLocation, shop);

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118] transition hover:border-[#ff3d00]/30">
      <Link href={`/shop/${shop.id}`} className="block">
        <div className="relative h-[140px] bg-[#18181f]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-4xl">
              {genreEmoji(genre)}
            </div>
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            {live && (
              <span className="rounded-md bg-[#ff3d00] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                LIVE NOW
              </span>
            )}
            {isNew && (
              <span className="rounded-md bg-[#00e87a] px-2 py-0.5 text-[10px] font-extrabold uppercase text-[#080810]">
                New!
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-bold leading-tight">{shop.name}</h3>
          <p className="mt-1 text-xs text-[#ff3d00]">{genre}</p>
          <p className="mt-2 line-clamp-1 text-xs text-[#9994a8]">
            📍 {area}
            {distance ? ` · ${distance}` : ""}
          </p>
          <p className="mt-1 text-xs text-[#5a5668]">
            🕙 {formatOpenHours(shop.open_hours)}
          </p>

          <CheckinAvatarStack users={checkinUsers} className="mt-3" />

          {live && latestComment ? (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-[#9994a8]">
              {latestComment}
            </p>
          ) : latestPostedAt ? (
            <p className="mt-3 text-xs text-[#5a5668]">
              前回の発信: {formatPostedAt(latestPostedAt)}
            </p>
          ) : (
            <p className="mt-3 text-xs text-[#5a5668]">今夜の発信はまだありません</p>
          )}

          {interestCount > 0 && (
            <p className="mt-2 text-xs font-semibold text-[#00e87a]">
              {interestCount} 行くかも
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
