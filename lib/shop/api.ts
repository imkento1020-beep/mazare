import { supabase } from "@/lib/supabase";
import { filterPostsPostedTonight } from "@/lib/home/dates";
import { excludeShopRegistrationPosts } from "@/lib/home/shopRegistration";
import {
  normalizeMoods,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
import { fetchShopByIdFromDb } from "@/lib/home/shops";
import { attachAuthorDisplayNames } from "@/lib/profile/publicProfile";
import { parseNightOutFromRow } from "@/lib/guest-post/nightOut";

export async function fetchShopById(id: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  return fetchShopByIdFromDb(id);
}

export async function fetchShopPosts(shopId: string): Promise<{
  data: VibePost[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select(
      "id, shop_id, comment, moods, images, posted_at, is_guest_post, hashtags, media_type, video_url, author_id, stop_number, visit_order, drink_name, drink_cups, drink_count, party_size",
    )
    .eq("shop_id", shopId)
    .lte("posted_at", new Date().toISOString())
    .order("posted_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const posts = filterPostsPostedTonight(
    excludeShopRegistrationPosts(
      (data ?? []).map((post) => ({
        id: post.id,
        shop_id: post.shop_id,
        comment: post.comment,
        moods: normalizeMoods(post.moods),
        images: Array.isArray(post.images) ? post.images.map(String) : [],
        posted_at: post.posted_at ?? null,
        is_guest_post: post.is_guest_post ?? true,
        hashtags: Array.isArray(post.hashtags) ? post.hashtags.map(String) : [],
        media_type:
          post.media_type === "image" || post.media_type === "video"
            ? post.media_type
            : null,
        video_url: typeof post.video_url === "string" ? post.video_url : null,
        author_id: typeof post.author_id === "string" ? post.author_id : null,
        shops: null,
        ...parseNightOutFromRow(post as Record<string, unknown>),
      })),
    ),
  );

  const withAuthors = await attachAuthorDisplayNames(posts as VibePost[]);
  return { data: withAuthors, error: null };
}

export async function fetchShopInterestCount(shopId: string): Promise<number> {
  const { count } = await supabase
    .from("interests")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);

  return count ?? 0;
}

/** 「行くかも」紐づけ用: 今夜以外も含む最新のゲスト投稿 */
export async function fetchLatestVibePostForInterest(shopId: string): Promise<{
  data: VibePost | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select(
      "id, shop_id, comment, moods, images, posted_at, is_guest_post, hashtags, media_type, video_url, author_id, stop_number, visit_order, drink_name, drink_cups, drink_count, party_size",
    )
    .eq("shop_id", shopId)
    .eq("is_guest_post", true)
    .lte("posted_at", new Date().toISOString())
    .order("posted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  if (!data) return { data: null, error: null };

  const post: VibePost = {
    id: data.id,
    shop_id: data.shop_id,
    comment: data.comment,
    moods: normalizeMoods(data.moods),
    images: Array.isArray(data.images) ? data.images.map(String) : [],
    posted_at: data.posted_at ?? null,
    is_guest_post: data.is_guest_post ?? true,
    hashtags: Array.isArray(data.hashtags) ? data.hashtags.map(String) : [],
    media_type:
      data.media_type === "image" || data.media_type === "video"
        ? data.media_type
        : null,
    video_url: typeof data.video_url === "string" ? data.video_url : null,
    author_id: typeof data.author_id === "string" ? data.author_id : null,
    shops: null,
    ...parseNightOutFromRow(data as Record<string, unknown>),
  };

  const [withAuthor] = await attachAuthorDisplayNames([post]);
  return { data: withAuthor ?? post, error: null };
}

export async function fetchUserInterestForPost(
  userId: string,
  vibePostId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("interests")
    .select("id")
    .eq("user_id", userId)
    .eq("vibe_post_id", vibePostId)
    .maybeSingle();

  return Boolean(data);
}
