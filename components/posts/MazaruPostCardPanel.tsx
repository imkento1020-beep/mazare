"use client";

import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";
import { labelForMergeAttitude } from "@/lib/profile/tonightSocialContext";

type MazaruPostCardPanelProps = {
  settings: Pick<PostMazaruSettings, "mode" | "details">;
  size?: "sm" | "md";
  className?: string;
};

/** 合流の意思だけのコンパクト表示（詳細はシート側） */
export default function MazaruPostCardPanel({
  settings,
  size = "sm",
  className = "",
}: MazaruPostCardPanelProps) {
  const { mode } = settings;
  if (!mode) return null;

  const compact = size === "sm";

  if (mode === "mazaranai") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 ${className}`}
      >
        <MazaranaiIcon size={compact ? 14 : 18} className="text-[#9994a8]" />
        <span className="text-[10px] font-bold text-[#c4bfd6]">マザらない</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-[#00e87a]/35 bg-[#00e87a]/10 px-2.5 py-1 ${className}`}
    >
      <MazaruIcon size={compact ? 14 : 18} className="text-[#00e87a]" />
      <span
        className={`font-bold text-[#00e87a] ${
          compact ? "text-[10px]" : "text-xs"
        }`}
      >
        {labelForMergeAttitude("open") ?? "合流・声かけ OK"}
      </span>
    </span>
  );
}