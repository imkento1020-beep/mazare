"use client";

import Link from "next/link";
import { extractCompactAreaFromAddress } from "@/lib/geo/area";
import { formatOpenHours, type TodayInterestRow } from "@/lib/home/types";

type TonightInterestCardProps = {
  item: TodayInterestRow;
  onCancel?: (interestId: string) => void;
  canceling?: boolean;
  compact?: boolean;
};

export default function TonightInterestCard({
  item,
  onCancel,
  canceling = false,
  compact = false,
}: TonightInterestCardProps) {
  const shop = item.vibe_posts?.shops;
  const area = extractCompactAreaFromAddress(shop?.address);

  return (
    <div
      className={`rounded-2xl border border-white/[0.07] bg-[#111118] ${
        compact ? "p-3" : "p-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/shop/${item.shop_id}`}
            className={`font-extrabold text-[#eeeaf4] hover:text-[#ff3d00] ${
              compact ? "text-base" : "text-lg"
            }`}
          >
            {shop?.name ?? "お店"}
          </Link>
          <p className="mt-1 text-sm text-[#9994a8]">
            📍 {area}
            {shop?.open_hours
              ? ` · 🕙 ${formatOpenHours(shop.open_hours)}`
              : ""}
          </p>
          {!compact && item.vibe_posts?.comment && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#9994a8]">
              {item.vibe_posts.comment}
            </p>
          )}
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={() => onCancel(item.id)}
            disabled={canceling}
            className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[#ff3d00] disabled:opacity-60"
          >
            {canceling ? "取消中..." : "取り消す"}
          </button>
        )}
      </div>
    </div>
  );
}
