"use client";

import {
  FeedCommentIcon,
  FeedPeopleIcon,
} from "@/components/icons/FeedActionIcons";
import { hasMazaruSelection, type PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import { MazaruIcon } from "@/components/icons/MazaruModeIcons";

type ToolId = "comment" | "mood" | "party";

type PostFinishToolRailProps = {
  activeSheet: ToolId | null;
  onOpen: (id: ToolId) => void;
  mazaruSettings: PostMazaruSettings;
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
  mazaruSettings,
  partySize,
  hasComment,
}: PostFinishToolRailProps) {
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
        label="マザる？"
        active={activeSheet === "mood" || hasMazaruSelection(mazaruSettings)}
        onClick={() => onOpen("mood")}
      >
        {mazaruSettings.mode === "mazaru" ? (
          <span className="text-[#00e87a]">
            <MazaruIcon size={22} />
          </span>
        ) : mazaruSettings.mode === "mazaranai" ? (
          <span className="text-[9px] font-black text-white/80">—</span>
        ) : (
          <span className="text-[10px] font-black text-white">?</span>
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
