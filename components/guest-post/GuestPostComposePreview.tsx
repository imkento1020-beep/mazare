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
    media_type: videoPreviewUrl
      ? ("video" as const)
      : imageUrls.length > 0
        ? ("image" as const)
        : null,
    images: imageUrls,
    video_url: videoPreviewUrl,
  };

  const useExisting =
    !draftFromFiles.media_type && existingPost?.media_type;

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

  return (
    <div>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5a5668]">
        カードプレビュー（4:5）
      </p>
      <GuestPostFeedCard post={draftPost} showActions={false} />
    </div>
  );
}
