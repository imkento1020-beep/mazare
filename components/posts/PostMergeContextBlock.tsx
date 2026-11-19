"use client";

import { useState } from "react";
import MergeContextDetailSheet from "@/components/posts/MergeContextDetailSheet";
import { MazaranaiIcon, MazaruIcon } from "@/components/icons/MazaruModeIcons";
import {
  buildMazaruDetailRows,
  canShowMergeContextSheet,
  feedMergeIntentLabel,
  feedMergeIntentTone,
} from "@/lib/guest-post/mergeDetailContent";
import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import type { TonightSocialContext } from "@/lib/profile/tonightSocialContext";

type PostMergeContextBlockProps = {
  authorName: string;
  mazaru: Pick<PostMazaruSettings, "mode" | "details">;
  social: TonightSocialContext;
  partySize?: number | null;
  className?: string;
};

const TONE_STYLES = {
  open: {
    wrap: "border-[#00e87a]/35 bg-[#00e87a]/10 hover:border-[#00e87a]/55",
    text: "text-[#00e87a]",
    chevron: "text-[#00e87a]/80",
  },
  closed: {
    wrap: "border-white/15 bg-white/[0.06] hover:border-white/25",
    text: "text-[#c4bfd6]",
    chevron: "text-[#9994a8]",
  },
  neutral: {
    wrap: "border-white/12 bg-[#111118]/80 hover:border-white/20",
    text: "text-[#ddd8e8]",
    chevron: "text-[#9994a8]",
  },
} as const;

export default function PostMergeContextBlock({
  authorName,
  mazaru,
  social,
  partySize = null,
  className = "",
}: PostMergeContextBlockProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  if (mazaru.mode === "mazaranai") return null;

  const showSheet = canShowMergeContextSheet(mazaru, social, partySize);
  const detailRows = buildMazaruDetailRows(mazaru.details);
  const intentLabel = feedMergeIntentLabel(mazaru, social);
  const tone = feedMergeIntentTone(mazaru, social);
  const styles = TONE_STYLES[tone];

  const hasContent =
    mazaru.mode === "mazaru" ||
    Boolean(social.mergeAttitude) ||
    detailRows.length > 0;

  if (!hasContent) return null;

  function openSheet(e: React.MouseEvent) {
    e.stopPropagation();
    if (!showSheet) return;
    setSheetOpen(true);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openSheet}
        disabled={!showSheet}
        aria-label={
          showSheet
            ? `${intentLabel}の詳細を見る`
            : intentLabel
        }
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left transition ${
          styles.wrap
        } ${showSheet ? "cursor-pointer active:scale-[0.98]" : "cursor-default"}`}
      >
        {tone === "open" ? (
          <MazaruIcon size={14} className="shrink-0 text-[#00e87a]" />
        ) : tone === "closed" ? (
          <MazaranaiIcon size={14} className="shrink-0 text-[#9994a8]" />
        ) : null}
        <span
          className={`text-[10px] font-bold leading-snug ${styles.text}`}
        >
          {intentLabel}
        </span>
        {showSheet ? (
          <span
            className={`shrink-0 text-[10px] font-bold ${styles.chevron}`}
            aria-hidden
          >
            ›
          </span>
        ) : null}
      </button>

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