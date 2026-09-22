"use client";

import Link from "next/link";
import type { MapShopActivity } from "@/lib/feed/recentFeed";

type MapActivitySheetProps = {
  activity: MapShopActivity | null;
  open: boolean;
  interestLoading?: boolean;
  interested?: boolean;
  onClose: () => void;
  onInterest: () => void;
};

export default function MapActivitySheet({
  activity,
  open,
  interestLoading,
  interested,
  onClose,
  onInterest,
}: MapActivitySheetProps) {
  if (!open || !activity) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-24 md:pb-6">
      <div className="mx-auto max-w-lg animate-[slideUp_0.25s_ease-out] rounded-[16px] border border-white/10 bg-[#111118] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">{activity.shop.name}</h3>
            <p className="mt-1 text-xs text-[#9994a8]">
              直近2時間 · 投稿 {activity.postCount}件 · ユニーク{" "}
              {activity.uniquePosterCount}人
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#9994a8] hover:text-[#eeeaf4]"
          >
            閉じる
          </button>
        </div>

        {activity.latestHashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activity.latestHashtags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#ff3d00]/10 px-2.5 py-1 text-[11px] font-bold text-[#ff3d00]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={interestLoading}
            onClick={onInterest}
            className="flex-1 rounded-[12px] bg-[#ff3d00] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {interested ? "行くかも済み" : "今夜行くかも"}
          </button>
          <Link
            href={`/shop/${activity.shopId}`}
            className="flex-1 rounded-[12px] border border-white/15 py-3 text-center text-sm font-bold text-[#eeeaf4]"
          >
            詳細を見る
          </Link>
        </div>
      </div>
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
