import type { VibePost } from "@/lib/home/types";
import { parseMediaTypeField } from "@/lib/guest-post/parseMediaTypeField";

export type PostMediaMode = "none" | "video" | "image" | "mixed";

export type ResolvedPostMedia = {
  mode: PostMediaMode;
  /** @deprecated Prefer `mode === "video"` */
  isVideo: boolean;
  videoUrl: string | null;
  images: string[];
  hasMedia: boolean;
};

function isRenderableMediaUrl(src: string) {
  const trimmed = src.trim();
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  );
}

export function resolvePostMedia(
  post: Pick<VibePost, "media_type" | "video_url" | "images">,
): ResolvedPostMedia {
  const rawVideo =
    typeof post.video_url === "string" ? post.video_url.trim() : "";
  const videoUrl = rawVideo && isRenderableMediaUrl(rawVideo) ? rawVideo : null;

  const images = (post.images ?? []).filter(isRenderableMediaUrl);

  const parsedType = parseMediaTypeField(
    post.media_type,
    images,
    videoUrl,
  );

  if (parsedType === "mixed" && videoUrl && images.length > 0) {
    return {
      mode: "mixed",
      isVideo: false,
      videoUrl,
      images,
      hasMedia: true,
    };
  }

  if (parsedType === "video" && videoUrl) {
    return {
      mode: "video",
      isVideo: true,
      videoUrl,
      images: [],
      hasMedia: true,
    };
  }

  if (images.length > 0) {
    return {
      mode: "image",
      isVideo: false,
      videoUrl: null,
      images,
      hasMedia: true,
    };
  }

  return {
    mode: "none",
    isVideo: false,
    videoUrl: null,
    images: [],
    hasMedia: false,
  };
}
