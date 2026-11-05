"use client";

import {
  FeedCommentIcon,
  FeedPeopleIcon,
  FeedWaveIcon,
} from "@/components/icons/FeedActionIcons";
import {
  hasAnySocialContext,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

type ToolId = "comment" | "mood" | "party";

type PostFinishToolRailProps = {
  activeSheet: ToolId | null;
  onOpen: (id: ToolId) => void;
  socialContext: TonightSocialContext;
  partySize: number | null;
  hasComment: boolean;
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
  socialContext,
  partySize,
  hasComment,
}: PostFinishToolRailProps) {
  const mergeShort =
    socialContext.mergeAttitude === "open"
      ? "OK"
      : socialContext.mergeAttitude === "closed"
        ? "—"
        : null;

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
        label="合流・席の人数感"
        active={activeSheet === "mood" || hasAnySocialContext(socialContext)}
        onClick={() => onOpen("mood")}
      >
        {mergeShort ? (
          <span className="text-[10px] font-black text-white">{mergeShort}</span>
        ) : socialContext.vibeScale === "solo" ? (
          <span className="text-[10px] font-black text-white">1</span>
        ) : socialContext.vibeScale === "small" ? (
          <span className="text-[10px] font-black text-white">2</span>
        ) : socialContext.vibeScale === "lively" ? (
          <span className="text-[10px] font-black text-white">+</span>
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
    </div>
  );
}

export type { ToolId };
