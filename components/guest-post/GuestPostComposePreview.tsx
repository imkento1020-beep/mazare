"use client";

import { useEffect, useMemo, useState } from "react";
import GuestPostFeedCard from "@/components/posts/GuestPostFeedCard";
import type { NightOutInput } from "@/lib/guest-post/nightOut";
import { normalizeNightOutInput } from "@/lib/guest-post/nightOut";
import type { Shop, VibePost } from "@/lib/home/types";

type GuestPostComposePreviewProps = {
  imageFiles: File[];
  videoFile: File | null;
  nightOut: NightOutInput;
  comment: string;
  hashtags?: string[];
  shop?: Shop | null;
  existingPost?: VibePost | null;
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
  imageFiles,
  videoFile,
  nightOut,
  comment,
  hashtags = [],
  shop = null,
  existingPost = null,
}: GuestPostComposePreviewProps) {
  const imageUrls = useObjectUrls(imageFiles);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  const normalized = normalizeNightOutInput(nightOut);
  const draftFromFiles = {
    media_type:
      videoPreviewUrl && imageUrls.length > 0
        ? ("mixed" as const)
        : videoPreviewUrl
          ? ("video" as const)
          : imageUrls.length > 0
            ? ("image" as const)
            : null,
    images: imageUrls,
    video_url: videoPreviewUrl,
  };

  const hasDraftMedia = Boolean(draftFromFiles.media_type);
  const useExisting = !hasDraftMedia && existingPost?.media_type;

  const draftPost: VibePost = {
    id: existingPost?.id ?? "preview",
    shop_id: shop?.id ?? existingPost?.shop_id ?? "",
    comment,
    moods: [],
    hashtags:
      hashtags.length > 0 ? hashtags : (existingPost?.hashtags ?? []),
    media_type: useExisting ? existingPost!.media_type : draftFromFiles.media_type,
    images: useExisting ? existingPost!.images : draftFromFiles.images,
    video_url: useExisting ? existingPost!.video_url : draftFromFiles.video_url,
    is_guest_post: true,
    author_id: existingPost?.author_id ?? null,
    author_display_name: existingPost?.author_display_name ?? "あなた",
    posted_at: existingPost?.posted_at ?? new Date().toISOString(),
    shops: shop ?? existingPost?.shops ?? null,
    ...normalized,
  };

  const mediaSummary =
    draftFromFiles.media_type === "mixed"
      ? "動画1本 · 写真あり"
      : draftFromFiles.media_type === "video"
        ? "動画1本"
        : draftFromFiles.media_type === "image"
          ? `写真${imageUrls.length}枚`
          : useExisting
            ? "既存のメディア"
            : null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a5668]">
          プレビュー
        </p>
        {mediaSummary && (
          <p className="text-[11px] font-bold text-[#9994a8]">{mediaSummary}</p>
        )}
      </div>
      {!hasDraftMedia && !useExisting ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-[#111118] px-6 py-10 text-center">
          <p className="text-sm text-[#5a5668]">
            写真または動画を選ぶと、ここに投稿カードのプレビューが表示されます
          </p>
        </div>
      ) : (
        <GuestPostFeedCard post={draftPost} showActions={false} />
      )}
    </div>
  );
}
