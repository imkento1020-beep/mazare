import { supabase } from "@/lib/supabase";
import { filterPostsPostedTonight } from "@/lib/home/dates";
import { excludeShopRegistrationPosts } from "@/lib/home/shopRegistration";
import {
  normalizeMoods,
  type Shop,
  type VibePost,
} from "@/lib/home/types";
import { fetchShopByIdFromDb } from "@/lib/home/shops";

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
      "id, shop_id, comment, moods, images, posted_at, is_guest_post, hashtags, media_type, video_url",
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
        shops: null,
      })),
    ),
  );

  return { data: posts as VibePost[], error: null };
}

export async function fetchShopInterestCount(shopId: string): Promise<number> {
  const { count } = await supabase
    .from("interests")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);

  return count ?? 0;
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
