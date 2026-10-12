import {
  findTonightSocialMood,
  labelForTonightSocialMood,
} from "@/lib/profile/tonightSocialMood";

const MOOD_STYLES: Record<
  string,
  { border: string; bg: string; text: string }
> = {
  merge_welcome: {
    border: "border-[#00e87a]/40",
    bg: "bg-[#00e87a]/12",
    text: "text-[#00e87a]",
  },
  solo: {
    border: "border-[#7c9cff]/40",
    bg: "bg-[#7c9cff]/12",
    text: "text-[#a8b8ff]",
  },
  pair_ok: {
    border: "border-[#ffaa00]/40",
    bg: "bg-[#ffaa00]/12",
    text: "text-[#ffcc66]",
  },
  large_ok: {
    border: "border-[#ff3d00]/40",
    bg: "bg-[#ff3d00]/12",
    text: "text-[#ff3d00]",
  },
};

type TonightSocialMoodBadgeProps = {
  mood: string | null | undefined;
  size?: "sm" | "md";
  /** show "今夜:" prefix */
  prefix?: boolean;
};

export default function TonightSocialMoodBadge({
  mood,
  size = "sm",
  prefix = true,
}: TonightSocialMoodBadgeProps) {
  const label = labelForTonightSocialMood(mood);
  if (!label) return null;

  const meta = findTonightSocialMood(mood);
  const style = MOOD_STYLES[meta?.id ?? ""] ?? MOOD_STYLES.merge_welcome;

  const sizeClass =
    size === "md"
      ? "px-3 py-1 text-xs"
      : "px-2.5 py-0.5 text-[10px]";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full border font-bold ${sizeClass} ${style.border} ${style.bg} ${style.text}`}
    >
      <span className="truncate">
        {prefix ? `今夜 · ${label}` : label}
      </span>
    </span>
  );
}
