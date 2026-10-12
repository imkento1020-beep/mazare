import { formatNightOutSummary } from "@/lib/guest-post/nightOut";
import type { VibePost } from "@/lib/home/types";
import { FeedGlassIcon } from "@/components/icons/FeedActionIcons";

type NightOutBadgeProps = {
  post: Pick<VibePost, "stop_number" | "drink_name" | "drink_cups">;
  variant?: "overlay" | "inline";
  className?: string;
};

export default function NightOutBadge({
  post,
  variant = "inline",
  className = "",
}: NightOutBadgeProps) {
  const summary = formatNightOutSummary(post);
  if (!summary) return null;

  if (variant === "overlay") {
    return (
      <span
        className={`inline-flex max-w-full items-center gap-1.5 rounded-lg bg-[#ff3d00]/90 px-3 py-1.5 text-[11px] font-bold leading-snug text-white shadow-lg backdrop-blur-sm ${className}`}
      >
        <FeedGlassIcon size={14} color="#ffffff" />
        <span className="truncate">{summary}</span>
      </span>
    );
  }

  return (
    <p
      className={`flex items-center gap-1 text-sm font-bold leading-snug text-[#ffcc66] ${className}`}
    >
      <FeedGlassIcon size={16} color="#ffcc66" />
      {summary}
    </p>
  );
}
