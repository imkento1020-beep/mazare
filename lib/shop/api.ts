import { supabase } from "@/lib/supabase";
import { filterPostsPostedTonight } from "@/lib/home/dates";
import {
  normalizeMoods,
  type Shop,
  type VibePost,
} from "@/lib/home/types";

export async function fetchShopById(id: string): Promise<{
  data: Shop | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, address, genre, open_hours, cover_image, cover_images, owner_id, staff_ids",
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: error.message };
  return { data: (data as Shop) ?? null, error: null };
}

export async function fetchShopPosts(shopId: string): Promise<{
  data: VibePost[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("vibe_posts")
    .select("id, shop_id, comment, moods, images, posted_at")
    .eq("shop_id", shopId)
    .lte("posted_at", new Date().toISOString())
    .order("posted_at", { ascending: false });

  if (error) return { data: null, error: error.message };

  const posts = filterPostsPostedTonight(
    (data ?? []).map((post) => ({
      id: post.id,
      shop_id: post.shop_id,
      comment: post.comment,
      moods: normalizeMoods(post.moods),
      images: Array.isArray(post.images) ? post.images.map(String) : [],
      posted_at: post.posted_at ?? null,
      shops: null,
    })),
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
