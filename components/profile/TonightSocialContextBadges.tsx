"use client";

import {
  labelForMergeAttitude,
  labelForVibeScale,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

const MERGE_STYLE: Record<string, { border: string; bg: string; text: string }> =
  {
    open: {
      border: "border-[#00e87a]/40",
      bg: "bg-[#00e87a]/12",
      text: "text-[#00e87a]",
    },
    closed: {
      border: "border-[#7c9cff]/40",
      bg: "bg-[#7c9cff]/12",
      text: "text-[#a8b8ff]",
    },
  };

const VIBE_STYLE: Record<string, { border: string; bg: string; text: string }> = {
  solo: {
    border: "border-white/20",
    bg: "bg-white/8",
    text: "text-white/85",
  },
  small: {
    border: "border-[#ffaa00]/40",
    bg: "bg-[#ffaa00]/12",
    text: "text-[#ffcc66]",
  },
  lively: {
    border: "border-[#ff3d00]/40",
    bg: "bg-[#ff3d00]/12",
    text: "text-[#ff3d00]",
  },
};

type TonightSocialContextBadgesProps = {
  context: TonightSocialContext;
  size?: "sm" | "md";
  /** 合流バッジだけ強調 */
  mergeFirst?: boolean;
};

function Badge({
  label,
  style,
  size,
}: {
  label: string;
  style: { border: string; bg: string; text: string };
  size: "sm" | "md";
}) {
  const sizeClass =
    size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border font-bold ${sizeClass} ${style.border} ${style.bg} ${style.text}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default function TonightSocialContextBadges({
  context,
  size = "sm",
  mergeFirst = true,
}: TonightSocialContextBadgesProps) {
  const mergeLabel = labelForMergeAttitude(context.mergeAttitude);
  const vibeLabel = labelForVibeScale(context.vibeScale);

  const mergeBadge =
    mergeLabel && context.mergeAttitude ? (
      <Badge
        key="merge"
        label={mergeLabel}
        style={MERGE_STYLE[context.mergeAttitude] ?? MERGE_STYLE.open}
        size={size}
      />
    ) : null;

  const vibeBadge =
    vibeLabel && context.vibeScale ? (
      <Badge
        key="vibe"
        label={vibeLabel}
        style={VIBE_STYLE[context.vibeScale] ?? VIBE_STYLE.small}
        size={size}
      />
    ) : null;

  if (!mergeBadge && !vibeBadge) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {mergeFirst ? (
        <>
          {mergeBadge}
          {vibeBadge}
        </>
      ) : (
        <>
          {vibeBadge}
          {mergeBadge}
        </>
      )}
    </span>
  );
}
