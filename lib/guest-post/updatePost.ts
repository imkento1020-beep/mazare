import { supabase } from "@/lib/supabase";
import {
  normalizeNightOutInput,
  parseNightOutFromRow,
  type NightOutInput,
} from "@/lib/guest-post/nightOut";
import { normalizeHashtagInput } from "@/lib/guest-post/createPost";
import { uploadGuestPostImages, uploadGuestPostVideo } from "@/lib/guest-post/uploadMedia";
import type { Shop, VibePost } from "@/lib/home/types";

const GUEST_POST_EDIT_SELECT = `
  id,
  shop_id,
  author_id,
  is_guest_post,
  comment,
  moods,
  images,
  video_url,
  posted_at,
  hashtags,
  media_type,
  stop_number,
  visit_order,
  drink_name,
  drink_cups,
  drink_count,
  party_size,
  shops ( id, name, address, latitude, longitude )
`;

function mapEditPostRow(row: Record<string, unknown>): VibePost {
  const shopRaw = row.shops;
  const shopEntry = Array.isArray(shopRaw) ? shopRaw[0] : shopRaw;
  const shop =
    shopEntry && typeof shopEntry === "object" ? (shopEntry as Shop) : null;

  return {
    id: String(row.id),
    shop_id: String(row.shop_id),
    comment: String(row.comment ?? ""),
    moods: Array.isArray(row.moods) ? row.moods.map(String) : [],
    images: Array.isArray(row.images) ? row.images.map(String) : [],
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    posted_at: typeof row.posted_at === "string" ? row.posted_at : null,
    hashtags: Array.isArray(row.hashtags) ? row.hashtags.map(String) : [],
    media_type:
      row.media_type === "image" || row.media_type === "video"
        ? row.media_type
        : null,
    is_guest_post: Boolean(row.is_guest_post),
    author_id: typeof row.author_id === "string" ? row.author_id : null,
    shops: shop,
    ...parseNightOutFromRow(row),
  };
}

export function nightOutInputFromPost(
  post: Pick<
    VibePost,
    "stop_number" | "drink_name" | "drink_cups" | "drink_count" | "party_size"
  >,
): NightOutInput {
  return {
    stopNumber: post.stop_number ?? null,
    drinkName: post.drink_name ?? "",
    tonightTotalCups: post.drink_cups ?? post.drink_count ?? null,
    partySize: post.party_size ?? null,
  };
}

export async function fetchGuestPostForEdit(
  postId: string,
  userId: string,
): Promise<{ data: VibePost | null; error: string | null }> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select(GUEST_POST_EDIT_SELECT)
    .eq("id", postId)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: "投稿が見つかりませんでした" };

  const post = mapEditPostRow(data as Record<string, unknown>);
  if (!post.is_guest_post || post.author_id !== userId) {
    return { data: null, error: "この投稿を編集する権限がありません" };
  }

  return { data: post, error: null };
}

export async function updateGuestVibePost(input: {
  postId: string;
  userId: string;
  hashtags: string[];
  nightOut: NightOutInput;
  comment?: string;
  imageFiles?: File[];
  videoFile?: File | null;
  replaceMedia?: boolean;
}): Promise<{ error: string | null }> {
  const existing = await fetchGuestPostForEdit(input.postId, input.userId);
  if (existing.error || !existing.data) {
    return { error: existing.error ?? "投稿を読み込めませんでした" };
  }

  const hashtags = [...new Set(input.hashtags.map(normalizeHashtagInput).filter(Boolean))];
  const nightOut = normalizeNightOutInput(input.nightOut);
  const comment = (input.comment ?? "").trim().slice(0, 140);

  let mediaType = existing.data.media_type ?? null;
  let images = existing.data.images ?? [];
  let videoUrl = existing.data.video_url ?? null;

  const wantsNewMedia =
    input.replaceMedia &&
    ((input.imageFiles?.length ?? 0) > 0 || Boolean(input.videoFile));

  if (wantsNewMedia) {
    if (input.imageFiles?.length && input.videoFile) {
      return { error: "写真と動画は同時に添付できません" };
    }

    if (input.imageFiles?.length) {
      const uploaded = await uploadGuestPostImages({
        userId: input.userId,
        files: input.imageFiles,
      });
      if (uploaded.error) return { error: uploaded.error };
      images = uploaded.urls;
      videoUrl = null;
      mediaType = "image";
    } else if (input.videoFile) {
      const uploaded = await uploadGuestPostVideo({
        userId: input.userId,
        file: input.videoFile,
      });
      if (uploaded.error) return { error: uploaded.error };
      videoUrl = uploaded.url;
      images = [];
      mediaType = "video";
    }
  }

  const { error } = await supabase
    .from("vibe_posts")
    .update({
      hashtags,
      comment,
      media_type: mediaType,
      images,
      video_url: videoUrl,
      stop_number: nightOut.stop_number,
      visit_order: nightOut.visit_order,
      drink_name: nightOut.drink_name,
      drink_cups: nightOut.drink_cups,
      drink_count: nightOut.drink_count,
      party_size: nightOut.party_size,
    })
    .eq("id", input.postId)
    .eq("author_id", input.userId)
    .eq("is_guest_post", true);

  if (error) {
    if (error.message.includes("policy") || error.code === "42501") {
      return {
        error:
          "更新が拒否されました。Supabase で guest-post-edit.sql を実行してください。",
      };
    }
    return { error: error.message };
  }

  return { error: null };
}
