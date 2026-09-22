import { supabase } from "@/lib/supabase";
import { uploadGuestPostImages, uploadGuestPostVideo } from "@/lib/guest-post/uploadMedia";

export const DEFAULT_HASHTAG_SUGGESTIONS = [
  "#激熱",
  "#音楽あり",
  "#混ざり歓迎",
  "#飲み放題",
  "#一人参加歓迎",
  "#カラオケ",
  "#DJあり",
  "#外国人多め",
  "#常連さんフレンドリー",
  "#テキーラ",
] as const;

export function normalizeHashtagInput(raw: string) {
  const trimmed = raw.trim().replace(/^#+/, "");
  if (!trimmed) return "";
  return `#${trimmed}`;
}

export async function fetchHashtagSuggestions(query: string) {
  const q = query.replace(/^#+/, "").trim();
  const { data, error } = await supabase
    .from("vibe_posts")
    .select("hashtags")
    .eq("is_guest_post", true)
    .order("posted_at", { ascending: false })
    .limit(200);

  if (error) return [] as string[];

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!Array.isArray(row.hashtags)) continue;
    for (const tag of row.hashtags) {
      const normalized = normalizeHashtagInput(String(tag));
      if (!normalized) continue;
      if (q && !normalized.toLowerCase().includes(q.toLowerCase())) continue;
      counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    }
  }

  const ranked = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  const defaults = DEFAULT_HASHTAG_SUGGESTIONS.filter(
    (tag) => !q || tag.toLowerCase().includes(q.toLowerCase()),
  );

  const merged = [...new Set([...ranked, ...defaults])];
  return merged.slice(0, 12);
}

export async function createGuestVibePost(input: {
  userId: string;
  shopId: string;
  hashtags: string[];
  imageFiles?: File[];
  videoFile?: File | null;
}): Promise<{ postId: string | null; error: string | null }> {
  const hashtags = [...new Set(input.hashtags.map(normalizeHashtagInput).filter(Boolean))];

  let mediaType: "image" | "video" | null = null;
  let images: string[] = [];
  let videoUrl: string | null = null;

  if (input.imageFiles?.length && input.videoFile) {
    return { postId: null, error: "写真と動画は同時に添付できません" };
  }

  if (input.imageFiles?.length) {
    const uploaded = await uploadGuestPostImages({
      userId: input.userId,
      files: input.imageFiles,
    });
    if (uploaded.error) return { postId: null, error: uploaded.error };
    images = uploaded.urls;
    mediaType = "image";
  }

  if (input.videoFile) {
    const uploaded = await uploadGuestPostVideo({
      userId: input.userId,
      file: input.videoFile,
    });
    if (uploaded.error) return { postId: null, error: uploaded.error };
    videoUrl = uploaded.url;
    mediaType = "video";
  }

  const { data, error } = await supabase
    .from("vibe_posts")
    .insert({
      shop_id: input.shopId,
      author_id: input.userId,
      is_guest_post: true,
      comment: "",
      moods: [],
      hashtags,
      media_type: mediaType,
      images,
      video_url: videoUrl,
      posted_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    return { postId: null, error: error.message };
  }

  return { postId: data.id, error: null };
}
