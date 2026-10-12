import Link from "next/link";
import type { ShopSearchItem } from "@/lib/search/shopSearch";
import GenreIcon from "@/components/icons/GenreIcon";
import { PinMeta } from "@/components/icons/InlineMeta";

type SearchShopCardProps = {
  item: ShopSearchItem;
  live: boolean;
};

export default function SearchShopCard({ item, live }: SearchShopCardProps) {
  const { shop, tonightPostCount, genreLabel, area, thumbnailUrl } = item;

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118] transition hover:border-[#ff3d00]/35 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      <div className="relative aspect-[16/10] bg-[#18181f]">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#1a1520] to-[#111118]">
            <GenreIcon genre={genreLabel} size={40} color="rgba(255,61,0,0.45)" />
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
          aria-hidden
        />
        {live && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-[#ff3d00] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            LIVE
          </span>
        )}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-black leading-snug text-white drop-shadow-sm">
            {shop.name}
          </h3>
          <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
            今夜 {tonightPostCount}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[#ff3d00]">
          <GenreIcon genre={genreLabel} size={14} color="#ff3d00" />
          <span className="truncate">{genreLabel}</span>
        </p>
        <PinMeta className="flex shrink-0 items-center gap-1 text-[11px] text-[#9994a8]">
          {area}
        </PinMeta>
      </div>
    </Link>
  );
}
