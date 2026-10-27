"use client";

import {
  FeedCommentIcon,
  FeedPeopleIcon,
  FeedPinIcon,
  FeedWaveIcon,
} from "@/components/icons/FeedActionIcons";
import { labelForTonightSocialMood } from "@/lib/profile/tonightSocialMood";
import type { TonightSocialMoodId } from "@/lib/profile/tonightSocialMood";

type ToolId = "comment" | "mood" | "party" | "shop";

type PostFinishToolRailProps = {
  activeSheet: ToolId | null;
  onOpen: (id: ToolId) => void;
  socialMood: TonightSocialMoodId | null;
  partySize: number | null;
  hasComment: boolean;
  showShopTool: boolean;
};

function RailButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur-md transition ${
        active
          ? "border-[#ff3d00]/60 bg-[#ff3d00]/25"
          : "border-white/15 bg-black/45 hover:bg-black/60"
      }`}
    >
      {children}
    </button>
  );
}

export default function PostFinishToolRail({
  activeSheet,
  onOpen,
  socialMood,
  partySize,
  hasComment,
  showShopTool,
}: PostFinishToolRailProps) {
  const moodShort = labelForTonightSocialMood(socialMood);

  return (
    <div className="absolute right-3 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 pb-[env(safe-area-inset-bottom,0px)]">
      <RailButton
        label="コメントとタグ"
        active={activeSheet === "comment" || hasComment}
        onClick={() => onOpen("comment")}
      >
        <FeedCommentIcon size={20} color="#ffffff" />
      </RailButton>

      <RailButton
        label="今夜の気分"
        active={activeSheet === "mood" || socialMood != null}
        onClick={() => onOpen("mood")}
      >
        {moodShort ? (
          <span className="max-w-[2.25rem] truncate text-[9px] font-black leading-tight text-white">
            {moodShort.replace("歓迎", "").trim() || moodShort.slice(0, 2)}
          </span>
        ) : (
          <FeedWaveIcon size={20} color="#ffffff" />
        )}
      </RailButton>

      <RailButton
        label="誰といる？"
        active={activeSheet === "party" || partySize != null}
        onClick={() => onOpen("party")}
      >
        {partySize != null && partySize >= 1 ? (
          <span className="text-sm font-black tabular-nums text-white">
            {partySize}
          </span>
        ) : (
          <FeedPeopleIcon size={20} color="#00e87a" />
        )}
      </RailButton>

      {showShopTool ? (
        <RailButton
          label="お店を変更"
          active={activeSheet === "shop"}
          onClick={() => onOpen("shop")}
        >
          <FeedPinIcon size={20} color="#ff3d00" />
        </RailButton>
      ) : null}
    </div>
  );
}

export type { ToolId };
