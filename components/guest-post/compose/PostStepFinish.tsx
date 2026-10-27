"use client";

import GuestPostComposePreview from "@/components/guest-post/GuestPostComposePreview";
import GuestPostBodyHashtagSuggestions from "@/components/guest-post/GuestPostBodyHashtagSuggestions";
import GuestPostFinishMeta from "@/components/guest-post/compose/GuestPostFinishMeta";
import { GUEST_POST_BODY_MAX_LENGTH } from "@/lib/guest-post/composeBody";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import type { Shop } from "@/lib/home/types";

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
  return (
    <div className="relative -mx-4 flex min-h-[calc(100dvh-8rem)] flex-col md:mx-0">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-none md:rounded-2xl">
        <div className="h-full scale-[1.02] opacity-90">
          <GuestPostComposePreview
            imageFiles={imageFiles}
            videoFile={videoFile}
            nightOut={nightOut}
            comment={comment}
            hashtags={hashtags}
            shop={shop}
            fillHeight
          />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/75 to-[#080810]/20"
          aria-hidden
        />
      </div>

      <div className="relative mt-auto space-y-3 px-4 pb-24 pt-32">
        <div className="flex items-center gap-2">
          <span className="truncate rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-[#eeeaf4] backdrop-blur-sm">
            {shop.name}
          </span>
          {!shopLocked && onChangeShop ? (
            <button
              type="button"
              onClick={onChangeShop}
              className="shrink-0 text-[11px] font-bold text-[#ff3d00]"
            >
              変更
            </button>
          ) : null}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111118]/95 p-4 backdrop-blur-md">
          <label htmlFor="finish-comment" className="text-xs font-black text-[#9994a8]">
            コメント（任意）
          </label>
          <textarea
            id="finish-comment"
            value={bodyText}
            onChange={(event) => onBodyTextChange(event.target.value)}
            maxLength={GUEST_POST_BODY_MAX_LENGTH}
            rows={3}
            placeholder="今夜のひとこと… #タグもこの欄に"
            className="mt-2 w-full resize-none rounded-[12px] border border-white/10 bg-[#080810] px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-[#ff3d00]/40"
          />
          <GuestPostBodyHashtagSuggestions
            bodyText={bodyText}
            onBodyTextChange={onBodyTextChange}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#111118]/95 p-4 backdrop-blur-md">
          <GuestPostFinishMeta
            userId={userId}
            value={nightOut}
            onChange={onNightOutChange}
          />
        </div>
      </div>
    </div>
  );
}
