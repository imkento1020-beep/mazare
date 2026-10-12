"use client";

import Link from "next/link";
import {
  formatGenre,
  formatOpenHours,
  getShopCoverImages,
  type Shop,
} from "@/lib/home/types";
import GenreIcon from "@/components/icons/GenreIcon";
import { FeedPinIcon } from "@/components/icons/FeedActionIcons";
import { ClockIcon } from "@/components/icons/MazareIcons";

type FavoriteShopCardProps = {
  shop: Shop;
  live?: boolean;
  onRemove?: () => void;
  removing?: boolean;
};

export default function FavoriteShopCard({
  shop,
  live = false,
  onRemove,
  removing = false,
}: FavoriteShopCardProps) {
  const genre = formatGenre(shop.genre);
  const cover = getShopCoverImages(shop)[0];

  return (
    <article className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118] transition hover:border-[#ff3d00]/30">
      <Link href={`/shop/${shop.id}`} className="block">
        <div className="relative h-[140px] bg-[#18181f]">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200]">
              <GenreIcon genre={genre} size={40} color="rgba(255,61,0,0.45)" />
            </div>
          )}
          {live && (
            <span className="absolute left-3 top-3 rounded-md bg-[#ff3d00] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
              LIVE NOW
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold leading-tight">{shop.name}</h3>
          <p className="mt-1 text-xs text-[#ff3d00]">{genre}</p>
          <p className="mt-2 line-clamp-1 flex items-center gap-1 text-xs text-[#9994a8]">
            <FeedPinIcon size={12} color="#9994a8" />
            {shop.address}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-[#5a5668]">
            <ClockIcon size={12} color="#5a5668" />
            {formatOpenHours(shop.open_hours)}
          </p>
        </div>
      </Link>

      {onRemove && (
        <div className="border-t border-white/7 px-4 py-3">
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className="text-xs font-semibold text-[#9994a8] transition hover:text-[#ff3d00] disabled:opacity-60"
          >
            {removing ? "削除中..." : "お気に入りから外す"}
          </button>
        </div>
      )}
    </article>
  );
}
