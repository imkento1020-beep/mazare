"use client";

import Link from "next/link";
import { CloseIcon } from "@/components/icons/MazareIcons";
import type { MapShopActivity } from "@/lib/feed/recentFeed";
import type { MapActivityMetricId } from "@/lib/map/mapActivityMetric";

type MapActivitySheetProps = {
  activity: MapShopActivity | null;
  windowLabel: string;
  metric?: MapActivityMetricId;
  locationLabel?: string | null;
  open: boolean;
  interestLoading?: boolean;
  interested?: boolean;
  interestPostResolving?: boolean;
  interestPostAvailable?: boolean;
  onClose: () => void;
  onInterest: () => void;
};

export default function MapActivitySheet({
  activity,
  windowLabel,
  metric = "posts",
  locationLabel,
  open,
  interestLoading,
  interested,
  interestPostResolving = false,
  interestPostAvailable = true,
  onClose,
  onInterest,
}: MapActivitySheetProps) {
  const interestDisabled =
    interestLoading || interestPostResolving || !interestPostAvailable;
  if (!open || !activity) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-24 md:pb-6">
      <div className="mx-auto max-w-lg animate-[slideUp_0.25s_ease-out] rounded-[16px] border border-white/10 bg-[#111118] p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">{activity.shop.name}</h3>
            <p className="mt-1 text-xs text-[#9994a8]">
              {locationLabel && locationLabel !== "—" ? (
                <>
                  {locationLabel}
                  <span className="text-[#5a5668]"> · </span>
                </>
              ) : null}
              {metric === "checkins" ? (
                <>チェックイン中 {activity.postCount}人</>
              ) : (
                <>
                  {windowLabel} · 投稿 {activity.postCount}件 · ユニーク{" "}
                  {activity.uniquePosterCount}人
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#9994a8] transition hover:border-white/20 hover:text-[#eeeaf4]"
            aria-label="閉じる"
          >
            <CloseIcon size={16} color="currentColor" />
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
            disabled={interestDisabled}
            onClick={onInterest}
            className="flex-1 rounded-[12px] bg-[#ff3d00] py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {interestPostResolving
              ? "確認中…"
              : interested
                ? "行くかも済み"
                : "今夜行くかも"}
          </button>
          <Link
            href={`/shop/${activity.shopId}`}
            className="flex-1 rounded-[12px] border border-white/15 py-3 text-center text-sm font-bold text-[#eeeaf4]"
          >
            詳細を見る
          </Link>
        </div>
        {!interestPostResolving && !interestPostAvailable ? (
          <p className="mt-2 text-center text-[11px] text-[#5a5668]">
            このお店にはまだ投稿がないため「今夜行くかも」は使えません
          </p>
        ) : null}
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
