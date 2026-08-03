"use client";

import {
  formatGenre,
  formatOpenHours,
  getShopCoverImages,
  type Shop,
} from "@/lib/home/types";
import type { LatestVibePost } from "@/lib/home/api";

type MapShopCarouselProps = {
  shops: Shop[];
  liveIds: Set<string>;
  selectedId: string | null;
  latestPosts: Map<string, LatestVibePost>;
  onSelectShop: (shopId: string) => void;
};

function shopThumbnail(
  shop: Shop,
  latestPosts: Map<string, LatestVibePost>,
): string | null {
  const post = latestPosts.get(shop.id);
  const postImage = post?.images?.find(
    (src) => src.startsWith("http") || src.startsWith("data:"),
  );
  if (postImage) return postImage;

  const cover = getShopCoverImages(shop)[0];
  return cover ?? null;
}

export default function MapShopCarousel({
  shops,
  liveIds,
  selectedId,
  latestPosts,
  onSelectShop,
}: MapShopCarouselProps) {
  const sortedShops = [...shops].sort((a, b) => {
    const aLive = liveIds.has(a.id) ? 0 : 1;
    const bLive = liveIds.has(b.id) ? 0 : 1;
    if (aLive !== bLive) return aLive - bLive;
    return a.name.localeCompare(b.name, "ja");
  });

  const liveCount = sortedShops.filter((shop) => liveIds.has(shop.id)).length;

  return (
    <div className="absolute inset-x-0 bottom-[72px] z-10 md:bottom-0">
      <div className="border-t border-white/7 bg-gradient-to-t from-[#080810] via-[#080810]/98 to-[#080810]/70 pt-3">
        <div className="flex items-center justify-between px-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#5a5668]">
            お店一覧
          </p>
          <p className="text-[10px] text-[#5a5668]">
            {shops.length}件
            {liveCount > 0 && (
              <span className="ml-1.5 text-[#ff3d00]">· 発信中 {liveCount}</span>
            )}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sortedShops.length === 0 ? (
            <p className="px-1 py-2 text-xs text-[#9994a8]">
              登録されているお店がありません
            </p>
          ) : (
            sortedShops.map((shop) => {
            const live = liveIds.has(shop.id);
            const selected = selectedId === shop.id;
            const thumb = shopThumbnail(shop, latestPosts);

            return (
              <button
                key={shop.id}
                type="button"
                onClick={() => onSelectShop(shop.id)}
                className={`w-[112px] shrink-0 overflow-hidden rounded-[12px] border text-left backdrop-blur-md transition md:w-[120px] ${
                  selected
                    ? "border-[#ff3d00]/50 ring-1 ring-[#ff3d00]/30"
                    : "border-white/7"
                } bg-[#111118]/95`}
              >
                <div className="relative h-[72px] w-full bg-[#18181f]">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a0a00] to-[#2d1200] text-2xl">
                      🍻
                    </div>
                  )}
                  {live && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-[#ff3d00] px-1 py-0.5 text-[8px] font-extrabold uppercase text-white">
                      LIVE
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-1 text-[11px] font-bold leading-tight">
                    {shop.name}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[9px] text-[#5a5668]">
                    {formatGenre(shop.genre)}
                  </p>
                </div>
              </button>
            );
          })
          )}
        </div>
      </div>
    </div>
  );
}
