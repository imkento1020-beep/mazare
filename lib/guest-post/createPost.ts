import { supabase } from "@/lib/supabase";
import { normalizeNightOutInput, type NightOutInput } from "@/lib/guest-post/nightOut";
import {
  isTonightSocialMoodId,
  type TonightSocialMoodId,
} from "@/lib/profile/tonightSocialMood";
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
  nightOut: NightOutInput;
  tonightSocialMood?: TonightSocialMoodId | null;
  comment?: string;
  imageFiles?: File[];
  videoFile?: File | null;
}): Promise<{ postId: string | null; error: string | null }> {
  const hashtags = [...new Set(input.hashtags.map(normalizeHashtagInput).filter(Boolean))];
  const nightOut = normalizeNightOutInput(input.nightOut);
  const comment = (input.comment ?? "").trim().slice(0, 140);

  let mediaType: "image" | "video" | "mixed" | null = null;
  let images: string[] = [];
  let videoUrl: string | null = null;

  const imageFiles = input.imageFiles ?? [];
  const hasImages = imageFiles.length > 0;
  const hasVideo = Boolean(input.videoFile);

  if (!hasImages && !hasVideo) {
    return { postId: null, error: "写真または動画を追加してください" };
  }

  if (hasImages) {
    const uploaded = await uploadGuestPostImages({
      userId: input.userId,
      files: imageFiles,
    });
    if (uploaded.error) return { postId: null, error: uploaded.error };
    images = uploaded.urls;
    mediaType = "image";
  }

  if (hasVideo && input.videoFile) {
    const uploaded = await uploadGuestPostVideo({
      userId: input.userId,
      file: input.videoFile,
    });
    if (uploaded.error) return { postId: null, error: uploaded.error };
    videoUrl = uploaded.url;
    mediaType = hasImages ? "mixed" : "video";
  }

  const moodSnapshot =
    input.tonightSocialMood && isTonightSocialMoodId(input.tonightSocialMood)
      ? input.tonightSocialMood
      : null;

  const baseRow = {
    shop_id: input.shopId,
    author_id: input.userId,
    is_guest_post: true,
    comment,
    moods: [],
    hashtags,
    media_type: mediaType,
    images,
    video_url: videoUrl,
    posted_at: new Date().toISOString(),
    stop_number: nightOut.stop_number,
    visit_order: nightOut.visit_order,
    drink_name: nightOut.drink_name,
    drink_cups: nightOut.drink_cups,
    drink_count: nightOut.drink_count,
    party_size: nightOut.party_size,
  };

  let data: { id: string } | null = null;
  let error: { message: string } | null = null;

  if (moodSnapshot) {
    const attempt = await supabase
      .from("vibe_posts")
      .insert({ ...baseRow, author_tonight_social_mood: moodSnapshot })
      .select("id")
      .single();
    data = attempt.data;
    error = attempt.error;
    if (error?.message.includes("author_tonight_social_mood")) {
      const fallback = await supabase
        .from("vibe_posts")
        .insert(baseRow)
        .select("id")
        .single();
      data = fallback.data;
      error = fallback.error;
    }
  } else {
    const attempt = await supabase.from("vibe_posts").insert(baseRow).select("id").single();
    data = attempt.data;
    error = attempt.error;
  }

  if (error || !data) {
    return { postId: null, error: error?.message ?? "投稿の保存に失敗しました" };
  }

  return { postId: data.id, error: null };
}
