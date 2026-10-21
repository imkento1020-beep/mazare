import Link from "next/link";
import type { ShopSearchItem } from "@/lib/search/shopSearch";
import GenreIcon from "@/components/icons/GenreIcon";
import { PinMeta } from "@/components/icons/InlineMeta";

type SearchShopCardProps = {
  item: ShopSearchItem;
  live: boolean;
  distanceLabel?: string | null;
};

export default function SearchShopCard({
  item,
  live,
  distanceLabel,
}: SearchShopCardProps) {
  const { shop, tonightPostCount, genreLabel, area, latestPost } = item;
  const preview = latestPost?.comment?.trim();

  return (
    <Link
      href={`/shop/${shop.id}`}
      className="group flex overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118] transition hover:border-[#ff3d00]/35 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      <div className="relative flex w-[92px] shrink-0 flex-col items-center justify-center gap-2 border-r border-white/[0.06] bg-gradient-to-br from-[#2a1208] via-[#1a0a00] to-[#111118] px-2 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ff3d00]/25 bg-[#ff3d00]/10">
          <GenreIcon genre={genreLabel} size={28} color="rgba(255,61,0,0.85)" />
        </div>
        {live && (
          <span className="rounded-full bg-[#ff3d00] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
            LIVE
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 px-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-black leading-snug text-[#eeeaf4] group-hover:text-white">
            {shop.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums ${
              tonightPostCount > 0
                ? "bg-[#ff3d00]/15 text-[#ff3d00]"
                : "bg-white/[0.06] text-[#5a5668]"
            }`}
          >
            今夜 {tonightPostCount}
          </span>
        </div>
        <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[#ff3d00]">
          <GenreIcon genre={genreLabel} size={13} color="#ff3d00" />
          <span className="truncate">{genreLabel}</span>
        </p>
        <PinMeta className="flex items-center gap-1 text-[11px] text-[#9994a8]">
          {area}
          {distanceLabel ? ` · ${distanceLabel}` : ""}
        </PinMeta>
        {preview ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-[#9994a8]">
            {preview}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
