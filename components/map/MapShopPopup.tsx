"use client";

import { useEffect } from "react";
import Link from "next/link";
import { recordPostView } from "@/lib/home/postViews";
import {
  formatGenre,
  formatOpenHours,
  formatPostedAt,
  getShopCoverImages,
  type Shop,
} from "@/lib/home/types";
import { moodEmoji, moodTagClass } from "@/lib/home/moods";
import type { LatestVibePost } from "@/lib/home/api";

type MapShopPopupProps = {
  shop: Shop;
  live: boolean;
  latestPost?: LatestVibePost;
  onClose: () => void;
};

function popupImage(
  shop: Shop,
  latestPost?: LatestVibePost,
): string | null {
  const postImage = latestPost?.images?.find(
    (src) => src.startsWith("http") || src.startsWith("data:"),
  );
  if (postImage) return postImage;

  const cover = getShopCoverImages(shop)[0];
  return cover ?? null;
}

export default function MapShopPopup({
  shop,
  live,
  latestPost,
  onClose,
}: MapShopPopupProps) {
  const image = popupImage(shop, latestPost);

  useEffect(() => {
    if (live && latestPost?.id) {
      recordPostView(latestPost.id);
    }
  }, [live, latestPost?.id]);

  return (
    <div className="absolute bottom-[168px] left-4 z-20 w-[min(320px,calc(100%-5rem))] overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]/98 shadow-[0_8px_32px_rgba(0,0,0,0.55)] backdrop-blur-md md:bottom-[132px]">
      <div className="relative h-[120px] w-full bg-[#18181f]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-4xl">
            🍻
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-sm text-white backdrop-blur-sm"
          aria-label="閉じる"
        >
          ×
        </button>
        {live && (
          <span className="absolute left-2 top-2 rounded-md bg-[#ff3d00] px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
            LIVE NOW
          </span>
        )}
      </div>

      <div className="p-4 pt-3">
        <h3 className="text-base font-black leading-tight">{shop.name}</h3>
        <p className="mt-1 text-xs text-[#ff3d00]">{formatGenre(shop.genre)}</p>

        <div className="mt-2 space-y-1 text-[11px] text-[#9994a8]">
          <p>📍 {shop.address}</p>
          <p>🕙 {formatOpenHours(shop.open_hours)}</p>
        </div>

        {live && latestPost && (
          <div className="mt-3 rounded-[10px] border border-white/[0.06] bg-[#18181f]/80 p-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
              今夜の発信
              {latestPost.posted_at && (
                <span className="ml-2 font-normal normal-case tracking-normal">
                  {formatPostedAt(latestPost.posted_at)}
                </span>
              )}
            </p>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#eeeaf4]">
              {latestPost.comment}
            </p>
            {latestPost.moods && latestPost.moods.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {latestPost.moods.map((mood) => (
                  <span
                    key={mood}
                    className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${moodTagClass(mood)}`}
                  >
                    <span>{moodEmoji(mood)}</span>
                    {mood}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {!live && (
          <p className="mt-3 text-xs leading-relaxed text-[#9994a8]">
            今夜の発信はまだありません
          </p>
        )}

        <Link
          href={`/shop/${shop.id}`}
          className="mt-4 block rounded-[10px] bg-[#ff3d00] py-2.5 text-center text-xs font-bold text-white transition hover:bg-[#e63600]"
        >
          お店の詳細を見る
        </Link>
      </div>
    </div>
  );
}
