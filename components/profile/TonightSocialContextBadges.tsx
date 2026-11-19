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
  /** 合流バッジタップで詳細を開く（投稿カード用） */
  onMergePress?: () => void;
  onVibePress?: () => void;
  showMergeDetailHint?: boolean;
};

function Badge({
  label,
  style,
  size,
  onClick,
  detailHint,
}: {
  label: string;
  style: { border: string; bg: string; text: string };
  size: "sm" | "md";
  onClick?: () => void;
  detailHint?: boolean;
}) {
  const sizeClass =
    size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]";
  const className = `inline-flex max-w-full items-center gap-1 rounded-full border font-bold ${sizeClass} ${style.border} ${style.bg} ${style.text} ${
    onClick ? "cursor-pointer transition hover:brightness-110" : ""
  }`;

  const content = (
    <>
      <span className="truncate">{label}</span>
      {detailHint ? (
        <span className="shrink-0 text-[9px] font-extrabold opacity-90">詳細</span>
      ) : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <span className={className}>{content}</span>;
}

export default function TonightSocialContextBadges({
  context,
  size = "sm",
  mergeFirst = true,
  onMergePress,
  onVibePress,
  showMergeDetailHint = false,
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
        onClick={onMergePress}
        detailHint={showMergeDetailHint}
      />
    ) : null;

  const vibeBadge =
    vibeLabel && context.vibeScale ? (
      <Badge
        key="vibe"
        label={vibeLabel}
        style={VIBE_STYLE[context.vibeScale] ?? VIBE_STYLE.small}
        size={size}
        onClick={onVibePress}
        detailHint={Boolean(onVibePress)}
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
