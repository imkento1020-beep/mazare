"use client";

import { useMemo, useState } from "react";
import GuestPostComposePreview from "@/components/guest-post/GuestPostComposePreview";
import GuestPostBodyHashtagSuggestions from "@/components/guest-post/GuestPostBodyHashtagSuggestions";
import { GUEST_POST_BODY_MAX_LENGTH } from "@/lib/guest-post/composeBody";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import type { Shop } from "@/lib/home/types";
import PostComposeSheet from "@/components/guest-post/compose/PostComposeSheet";
import PostFinishToolRail, {
  type ToolId,
} from "@/components/guest-post/compose/PostFinishToolRail";
import GuestPostFinishMeta from "@/components/guest-post/compose/GuestPostFinishMeta";

type PostStepFinishProps = {
  shop: Shop;
  imageFiles: File[];
  videoFile: File | null;
  nightOut: NightOutInput;
  onNightOutChange: React.Dispatch<React.SetStateAction<NightOutInput>>;
  bodyText: string;
  onBodyTextChange: (value: string) => void;
  comment: string;
  hashtags: string[];
  userId: string | null;
  onChangeShop?: () => void;
  shopLocked: boolean;
};

export default function PostStepFinish({
  shop,
  imageFiles,
  videoFile,
  nightOut,
  onNightOutChange,
  bodyText,
  onBodyTextChange,
  comment,
  hashtags,
  userId,
  onChangeShop,
  shopLocked,
}: PostStepFinishProps) {
  const [sheet, setSheet] = useState<ToolId | null>(null);

  const hasDetails = useMemo(
    () =>
      Boolean(
        nightOut.drinkName?.trim() ||
          nightOut.tonightTotalCups != null ||
          nightOut.partySize != null,
      ),
    [nightOut],
  );

  function openSheet(id: ToolId) {
    if (id === "shop") {
      onChangeShop?.();
      return;
    }
    setSheet(id);
  }

  return (
    <div className="relative h-full min-h-0 flex-1 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden bg-[#080810]">
        <GuestPostComposePreview
          imageFiles={imageFiles}
          videoFile={videoFile}
          nightOut={nightOut}
          comment={comment}
          hashtags={hashtags}
          shop={shop}
          fillHeight
          hideChrome
          immersive
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080810]/90 to-transparent"
          aria-hidden
        />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 p-3">
        <div className="pointer-events-auto inline-flex max-w-[calc(100%-4rem)] items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 backdrop-blur-md">
          <span className="truncate text-xs font-bold text-[#eeeaf4]">
            {shop.name}
          </span>
        </div>
      </div>

      <PostFinishToolRail
        activeSheet={sheet}
        onOpen={openSheet}
        stopNumber={nightOut.stopNumber}
        hasComment={bodyText.trim().length > 0}
        hasDetails={hasDetails}
        showShopTool={!shopLocked && Boolean(onChangeShop)}
      />

      <PostComposeSheet
        open={sheet === "comment"}
        title="コメント・タグ"
        onClose={() => setSheet(null)}
      >
        <label htmlFor="finish-comment" className="text-xs font-bold text-[#9994a8]">
          今夜のひとこと（任意）
        </label>
        <textarea
          id="finish-comment"
          value={bodyText}
          onChange={(event) => onBodyTextChange(event.target.value)}
          maxLength={GUEST_POST_BODY_MAX_LENGTH}
          rows={4}
          placeholder="今夜のひとこと… #タグもこの欄に"
          className="mt-2 w-full resize-none rounded-[12px] border border-white/10 bg-[#080810] px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#ff3d00]/40"
        />
        <GuestPostBodyHashtagSuggestions
          bodyText={bodyText}
          onBodyTextChange={onBodyTextChange}
        />
      </PostComposeSheet>

      <PostComposeSheet
        open={sheet === "stop"}
        title="今夜何軒目？"
        onClose={() => setSheet(null)}
      >
        <GuestPostFinishMeta
          userId={userId}
          value={nightOut}
          onChange={onNightOutChange}
          mode="stopOnly"
        />
      </PostComposeSheet>

      <PostComposeSheet
        open={sheet === "details"}
        title="今夜の詳細（任意）"
        onClose={() => setSheet(null)}
      >
        <GuestPostFinishMeta
          userId={userId}
          value={nightOut}
          onChange={onNightOutChange}
          mode="detailsOnly"
        />
      </PostComposeSheet>
    </div>
  );
}
