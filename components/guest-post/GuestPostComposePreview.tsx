"use client";

import { useEffect, useMemo, useState } from "react";
import GuestPostMedia, {
  GUEST_POST_IMAGE_ASPECT,
  GUEST_POST_VIDEO_ASPECT,
} from "@/components/posts/GuestPostMedia";
import GuestPostFooter from "@/components/posts/GuestPostFooter";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import { fetchTonightCupSumForUser } from "@/lib/guest-post/fetchTonightCupSum";
import { projectedTonightTotalCups } from "@/lib/guest-post/tonightCups";
import type { VibePost } from "@/lib/home/types";

type GuestPostComposePreviewProps = {
  userId: string | null;
  excludePostId?: string;
  imageFiles: File[];
  videoFile: File | null;
  nightOut: NightOutInput;
  comment: string;
  hashtags: string[];
  /** 編集時：新しいファイル未選択なら既存メディアを表示 */
  existingPost?: Pick<
    VibePost,
    "media_type" | "images" | "video_url"
  > | null;
};

function useObjectUrls(files: File[]) {
  const urls = useMemo(
    () => files.map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, [urls]);

  return urls;
}

export default function GuestPostComposePreview({
  userId,
  excludePostId,
  imageFiles,
  videoFile,
  nightOut,
  comment,
  hashtags,
  existingPost = null,
}: GuestPostComposePreviewProps) {
  const imageUrls = useObjectUrls(imageFiles);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [priorTonightCups, setPriorTonightCups] = useState(0);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!userId) {
      setPriorTonightCups(0);
      return;
    }
    let cancelled = false;
    void fetchTonightCupSumForUser(userId, { excludePostId }).then((sum) => {
      if (!cancelled) setPriorTonightCups(sum);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, excludePostId]);

  const draftFromFiles = {
    media_type: videoPreviewUrl ? ("video" as const) : imageUrls.length > 0 ? ("image" as const) : null,
    images: imageUrls,
    video_url: videoPreviewUrl,
  };

  const useExistingMedia =
    !draftFromFiles.media_type && existingPost?.media_type;

  const draftPost: Pick<
    VibePost,
    | "stop_number"
    | "drink_name"
    | "drink_cups"
    | "comment"
    | "hashtags"
    | "media_type"
    | "images"
    | "video_url"
  > = {
    stop_number: nightOut.stopNumber,
    drink_name: nightOut.drinkName.trim() || null,
    drink_cups: nightOut.drinkCups,
    comment,
    hashtags,
    media_type: useExistingMedia
      ? existingPost!.media_type
      : draftFromFiles.media_type,
    images: useExistingMedia ? existingPost!.images : draftFromFiles.images,
    video_url: useExistingMedia
      ? existingPost!.video_url
      : draftFromFiles.video_url,
  };

  const tonightTotal = projectedTonightTotalCups(priorTonightCups, draftPost);
  const hasMedia =
    Boolean(draftPost.media_type) ||
    (draftPost.images?.length ?? 0) > 0 ||
    Boolean(draftPost.video_url);
  const aspectHint = videoPreviewUrl ? GUEST_POST_VIDEO_ASPECT : GUEST_POST_IMAGE_ASPECT;

  return (
    <div className="overflow-hidden rounded-[16px] border border-white/10 bg-[#0a0a12]">
      <p className="border-b border-white/[0.06] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a5668]">
        プレビュー
        <span className="ml-2 font-normal normal-case tracking-normal text-[#5a5668]/80">
          {videoPreviewUrl ? "動画 9:16" : "写真 4:5"}
        </span>
      </p>

      {hasMedia ? (
        <GuestPostMedia
          mediaType={draftPost.media_type}
          images={draftPost.images}
          videoUrl={draftPost.video_url}
        />
      ) : (
        <div
          className={`flex flex-col items-center justify-center gap-2 bg-[#111118] px-6 py-16 ${aspectHint} max-h-[320px]`}
        >
          <span className="text-4xl">📷</span>
          <p className="text-center text-sm font-semibold text-[#9994a8]">
            写真または動画を選ぶと
            <br />
            ここに表示されます
          </p>
        </div>
      )}

      <div className="border-t border-white/[0.06] px-4 py-4">
        <GuestPostFooter post={draftPost} tonightTotalCups={tonightTotal} />
      </div>
    </div>
  );
}
