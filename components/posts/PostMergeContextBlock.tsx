"use client";

import { useState } from "react";
import TonightSocialContextBadges from "@/components/profile/TonightSocialContextBadges";
import MazaruPostCardPanel from "@/components/posts/MazaruPostCardPanel";
import MergeContextDetailSheet from "@/components/posts/MergeContextDetailSheet";
import { FeedPeopleIcon } from "@/components/icons/FeedActionIcons";
import {
  buildMergeContextSummary,
  canShowMergeContextSheet,
} from "@/lib/guest-post/mergeDetailContent";
import type { PostMazaruSettings } from "@/lib/guest-post/mazaruSettings";
import {
  hasAnySocialContext,
  type TonightSocialContext,
} from "@/lib/profile/tonightSocialContext";

type PostMergeContextBlockProps = {
  authorName: string;
  mazaru: Pick<PostMazaruSettings, "mode" | "details">;
  social: TonightSocialContext;
  partySize?: number | null;
  className?: string;
};

export default function PostMergeContextBlock({
  authorName,
  mazaru,
  social,
  partySize = null,
  className = "",
}: PostMergeContextBlockProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const showSheet = canShowMergeContextSheet(mazaru, social, partySize);
  const summary = buildMergeContextSummary(mazaru, social, partySize);
  const showBadges = hasAnySocialContext(social);
  const showParty =
    partySize != null && partySize >= 1 && social.mergeAttitude !== "closed";

  if (!showSheet && !mazaru.mode) return null;

  function openSheet(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!showSheet) return;
    setSheetOpen(true);
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="flex flex-wrap items-center gap-1.5">
        {showBadges ? (
          <TonightSocialContextBadges
            context={social}
            size="sm"
            mergeFirst
            onMergePress={
              social.mergeAttitude && showSheet
                ? () => setSheetOpen(true)
                : undefined
            }
            onVibePress={
              social.vibeScale && showSheet ? () => setSheetOpen(true) : undefined
            }
            showMergeDetailHint={Boolean(social.mergeAttitude && showSheet)}
          />
        ) : null}
        {showParty ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-[#00e87a]/35 bg-[#00e87a]/10 px-2.5 py-1 text-[10px] font-bold text-[#00e87a]">
            <FeedPeopleIcon size={13} />
            {partySize}人
          </span>
        ) : null}
      </div>

      {summary && showSheet ? (
        <button
          type="button"
          onClick={openSheet}
          className="mt-1.5 flex w-full items-center justify-between gap-2 rounded-lg border border-[#00e87a]/25 bg-[#00e87a]/[0.08] px-2.5 py-2 text-left transition hover:border-[#00e87a]/45"
        >
          <span className="line-clamp-2 text-[10px] font-semibold leading-snug text-[#c8ffe0]">
            {summary}
          </span>
          <span className="shrink-0 text-[10px] font-bold text-[#00e87a]">
            詳細 ›
          </span>
        </button>
      ) : null}

      {mazaru.mode ? (
        <button
          type="button"
          onClick={openSheet}
          className={`mt-1.5 block w-full text-left ${
            showSheet ? "cursor-pointer transition hover:brightness-110" : ""
          }`}
        >
          <MazaruPostCardPanel settings={mazaru} size="sm" />
          {showSheet ? (
            <span className="mt-1 block text-center text-[9px] font-bold text-[#00e87a]/90">
              タップして合流の詳細を見る
            </span>
          ) : null}
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