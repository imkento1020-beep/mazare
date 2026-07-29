"use client";

import Link from "next/link";
import PostImageCarousel from "@/components/home/PostImageCarousel";
import { formatGenre } from "@/lib/home/types";
import type { Shop } from "@/lib/home/types";

function genreEmoji(genre: string) {
  if (genre.includes("居酒屋")) return "🎵";
  if (genre.includes("バー") || genre.includes("クラフト")) return "🍻";
  if (genre.includes("カラオケ")) return "🎤";
  if (genre.includes("ライブ")) return "🎸";
  return "🕺";
}

type ShopCoverHeroProps = {
  shop: Shop;
  coverImages: string[];
};

export default function ShopCoverHero({ shop, coverImages }: ShopCoverHeroProps) {
  const genre = formatGenre(shop.genre);
  const hasImages = coverImages.length > 0;

  return (
    <section className="overflow-hidden rounded-[14px] border border-white/7 bg-[#111118]">
      <PostImageCarousel
        images={coverImages}
        fallbackEmoji={genreEmoji(genre)}
        aspectClassName="aspect-[4/3] w-full max-h-[280px] md:aspect-[16/10] md:max-h-[320px]"
        overlay={
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080810]/90 via-[#080810]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3d00] opacity-60" />
                      <span className="relative h-2 w-2 rounded-full bg-[#ff3d00]" />
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff3d00]">
                      発信中
                    </span>
                  </div>
                  <h2 className="truncate text-xl font-black text-[#eeeaf4] md:text-2xl">
                    {shop.name}
                  </h2>
                  <p className="mt-0.5 truncate text-xs text-[#9994a8]">
                    {genre} · {shop.address}
                  </p>
                </div>
                {hasImages && coverImages.length > 1 && (
                  <span className="shrink-0 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                    スワイプで切替
                  </span>
                )}
              </div>
            </div>
          </>
        }
      />

      {!hasImages && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="text-xs text-[#9994a8]">
            カバー写真が未設定です。
            <Link href="/owner/profile" className="ml-1 font-semibold text-[#ff3d00] hover:underline">
              プロフィール編集
            </Link>
            から追加できます。
          </p>
        </div>
      )}

      {hasImages && (
        <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
          <p className="text-[11px] text-[#5a5668]">
            {coverImages.length > 1
              ? `${coverImages.length}枚の店舗写真`
              : "店舗カバー写真"}
          </p>
          <Link
            href="/owner/profile"
            className="text-[11px] font-semibold text-[#ff3d00] hover:underline"
          >
            写真を編集 →
          </Link>
        </div>
      )}
    </section>
  );
}
