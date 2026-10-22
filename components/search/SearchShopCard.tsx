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
      className="group block overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111118] px-4 py-4 transition hover:border-[#ff3d00]/35 hover:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          {live && (
            <span className="mt-0.5 shrink-0 rounded-full bg-[#ff3d00] px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-white">
              LIVE
            </span>
          )}
          <h3 className="line-clamp-2 min-w-0 text-[15px] font-black leading-snug text-[#eeeaf4] group-hover:text-white">
            {shop.name}
          </h3>
        </div>
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
      <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[#ff3d00]">
        <GenreIcon genre={genreLabel} size={13} color="#ff3d00" />
        <span className="truncate">{genreLabel}</span>
      </p>
      <PinMeta className="mt-1 flex items-center gap-1 text-[11px] text-[#9994a8]">
        {area}
        {distanceLabel ? ` · ${distanceLabel}` : ""}
      </PinMeta>
      {preview ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-[#9994a8]">
          {preview}
        </p>
      ) : null}
    </Link>
  );
}
