export type GuestPostMediaType = "image" | "video" | "mixed" | null;

export function parseMediaTypeField(
  raw: unknown,
  images: string[] | null | undefined,
  videoUrl: string | null | undefined,
): GuestPostMediaType {
  const imageCount = (images ?? []).filter(Boolean).length;
  const hasVideo = Boolean(
    typeof videoUrl === "string" && videoUrl.trim().length > 0,
  );

  if (hasVideo && imageCount > 0) return "mixed";
  if (raw === "mixed") return "mixed";
  if (raw === "image" || raw === "video") return raw;
  if (hasVideo) return "video";
  if (imageCount > 0) return "image";
  return null;
}
