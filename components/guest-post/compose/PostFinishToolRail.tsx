"use client";

import {
  FeedCommentIcon,
  FeedGlassIcon,
  FeedPinIcon,
} from "@/components/icons/FeedActionIcons";

type ToolId = "comment" | "stop" | "details" | "shop";

type PostFinishToolRailProps = {
  activeSheet: ToolId | null;
  onOpen: (id: ToolId) => void;
  stopNumber: number | null;
  hasComment: boolean;
  hasDetails: boolean;
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
  stopNumber,
  hasComment,
  hasDetails,
  showShopTool,
}: PostFinishToolRailProps) {
  return (
    <div className="absolute right-3 top-[42%] z-20 flex -translate-y-1/2 flex-col items-center gap-3">
      <RailButton
        label="コメントとタグ"
        active={activeSheet === "comment" || hasComment}
        onClick={() => onOpen("comment")}
      >
        <FeedCommentIcon size={20} color="#ffffff" />
      </RailButton>

      <RailButton
        label="今夜何軒目"
        active={activeSheet === "stop" || stopNumber != null}
        onClick={() => onOpen("stop")}
      >
        <span className="text-sm font-black tabular-nums text-white">
          {stopNumber ?? "?"}
        </span>
      </RailButton>

      <RailButton
        label="今夜の詳細"
        active={activeSheet === "details" || hasDetails}
        onClick={() => onOpen("details")}
      >
        <FeedGlassIcon size={22} color="#ffcc66" />
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
