"use client";

import type { VibePost } from "@/lib/home/types";
import { formatGuestPostBodyForDisplay } from "@/lib/guest-post/composeBody";

type GuestPostFooterProps = {
  post: Pick<
    VibePost,
    "stop_number" | "drink_name" | "drink_cups" | "comment" | "hashtags"
  >;
  /** その投稿時点での今夜の累計杯数 */
  tonightTotalCups?: number | null;
  className?: string;
};

function MetaPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[10px] border px-3 py-2 ${
        accent
          ? "border-[#ff3d00]/35 bg-[#ff3d00]/10"
          : "border-white/10 bg-[#18181f]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#5a5668]">
        {label}
      </p>
      <p
        className={`mt-0.5 text-sm font-black leading-snug ${
          accent ? "text-[#ffcc66]" : "text-[#eeeaf4]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function GuestPostFooter({
  post,
  tonightTotalCups = null,
  className = "",
}: GuestPostFooterProps) {
  const bodyText = formatGuestPostBodyForDisplay(post.comment, post.hashtags);
  const hasStop = post.stop_number != null && post.stop_number >= 1;
  const hasDrink = Boolean(post.drink_name);
  const hasMeta =
    hasStop ||
    hasDrink ||
    (tonightTotalCups != null && tonightTotalCups > 0);

  const drinkValue = hasDrink ? post.drink_name! : null;

  if (!hasMeta && !bodyText) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {hasMeta && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {hasStop && (
            <MetaPill label="今夜" value={`${post.stop_number}軒目`} accent />
          )}
          {drinkValue && <MetaPill label="いま" value={drinkValue} />}
          {tonightTotalCups != null && tonightTotalCups > 0 && (
            <MetaPill
              label="トータル"
              value={`今夜 ${tonightTotalCups}杯目`}
              accent
            />
          )}
        </div>
      )}

      {bodyText && (
        <p className="text-[15px] font-medium leading-relaxed tracking-[0.01em] text-[#eeeaf4]">
          {bodyText}
        </p>
      )}
    </div>
  );
}
