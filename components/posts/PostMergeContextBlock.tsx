"use client";

import { useState } from "react";
import MazaruPostCardPanel from "@/components/posts/MazaruPostCardPanel";
import MergeContextDetailSheet from "@/components/posts/MergeContextDetailSheet";
import { MazaranaiIcon } from "@/components/icons/MazaruModeIcons";
import {
  buildMergeContextSummary,
  buildMazaruDetailRows,
  canShowMergeContextSheet,
} from "@/lib/guest-post/mergeDetailContent";
import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import { labelForMergeAttitude, type TonightSocialContext } from "@/lib/profile/tonightSocialContext";

type PostMergeContextBlockProps = {
  authorName: string;
  mazaru: Pick<PostMazaruSettings, "mode" | "details">;
  social: TonightSocialContext;
  partySize?: number | null;
  className?: string;
};

function buildInlineFeedLabel(
  mazaru: Pick<PostMazaruSettings, "mode" | "details">,
  social: TonightSocialContext,
  partySize: number | null | undefined,
): string | null {
  if (mazaru.mode === "mazaranai") {
    return "マザらない · 今夜は投稿のみ";
  }

  return buildMergeContextSummary(mazaru, social, partySize);
}

export default function PostMergeContextBlock({
  authorName,
  mazaru,
  social,
  partySize = null,
  className = "",
}: PostMergeContextBlockProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const showSheet = canShowMergeContextSheet(mazaru, social, partySize);
  const detailRows = buildMazaruDetailRows(mazaru.details);
  const inlineLabel = buildInlineFeedLabel(mazaru, social, partySize);

  const hasContent =
    Boolean(mazaru.mode) ||
    Boolean(social.mergeAttitude) ||
    detailRows.length > 0;

  if (!hasContent) return null;

  function openSheet(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!showSheet) return;
    setSheetOpen(true);
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {mazaru.mode === "mazaru" ? (
        <button
          type="button"
          onClick={openSheet}
          disabled={!showSheet}
          className={`block w-full text-left ${
            showSheet ? "cursor-pointer transition hover:brightness-110" : ""
          }`}
        >
          <MazaruPostCardPanel settings={mazaru} size="sm" />
          {showSheet ? (
            <span className="mt-1 block text-center text-[9px] font-bold text-[#00e87a]/90">
              タップで合流の詳細
            </span>
          ) : null}
        </button>
      ) : mazaru.mode === "mazaranai" ? (
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-white/12 bg-white/[0.06] px-2.5 py-2 text-left"
        >
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#c4bfd6]">
            <MazaranaiIcon size={14} className="text-[#9994a8]" />
            {inlineLabel}
          </span>
          {showSheet ? (
            <span className="shrink-0 text-[10px] font-bold text-[#9994a8]">
              詳細 ›
            </span>
          ) : null}
        </button>
      ) : inlineLabel && showSheet ? (
        <button
          type="button"
          onClick={openSheet}
          className="flex w-full flex-col items-stretch gap-1.5 rounded-lg border border-white/12 bg-[#111118]/80 px-2.5 py-2 text-left backdrop-blur-sm transition hover:border-[#00e87a]/35"
        >
          {social.mergeAttitude ? (
            <span className="text-[10px] font-bold text-[#00e87a]">
              {labelForMergeAttitude(social.mergeAttitude)}
            </span>
          ) : null}
          <span className="flex items-center justify-between gap-2">
            <span className="line-clamp-3 text-[10px] font-semibold leading-snug text-[#ddd8e8]">
              {inlineLabel}
            </span>
            <span className="shrink-0 text-[10px] font-bold text-[#00e87a]">
              詳細 ›
            </span>
          </span>
        </button>
      ) : null}

      <MergeContextDetailSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        authorName={authorName}
        mazaru={mazaru}
        social={social}
        partySize={partySize}
      />
    </div>
  );
}