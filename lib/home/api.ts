import { supabase } from "@/lib/supabase";
import {
  normalizeMoods,
  type Shop,
  type VibePost,
} from "@/lib/home/types";

export async function fetchVibePosts(): Promise<{
  data: VibePost[] | null;
  error: string | null;
}> {
  const [postsResult, shopsResult] = await Promise.all([
    supabase
      .from("vibe_posts")
      .select("id, shop_id, comment, moods, images, posted_at"),
    supabase.from("shops").select(
      "id, name, address, genre, open_hours, cover_image, owner_id, staff_ids",
    ),
  ]);

  if (postsResult.error) {
    return { data: null, error: `vibe_posts: ${postsResult.error.message}` };
  }

  if (shopsResult.error) {
    return { data: null, error: `shops: ${shopsResult.error.message}` };
  }

  const shopsMap = new Map(
    (shopsResult.data ?? []).map((shop) => [shop.id, shop as Shop]),
  );

  const merged = (postsResult.data ?? []).map((post) => ({
    id: post.id,
    shop_id: post.shop_id,
    comment: post.comment,
    moods: normalizeMoods(post.moods),
    images: Array.isArray(post.images) ? post.images.map(String) : [],
    posted_at: post.posted_at ?? null,
    shops: shopsMap.get(post.shop_id) ?? null,
  }));

  return { data: merged, error: null };
}

export function countByShopId(rows: { shop_id: string }[]) {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.shop_id] = (counts[row.shop_id] ?? 0) + 1;
  }
  return counts;
}

export async function fetchAllShops(): Promise<{
  data: Shop[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("shops")
    .select(
      "id, name, address, genre, open_hours, cover_image, owner_id, staff_ids",
    );

  if (error) return { data: null, error: error.message };
  return { data: (data ?? []) as Shop[], error: null };
}

export async function fetchLiveShopIds(): Promise<Set<string>> {
  const { data } = await supabase.from("vibe_posts").select("shop_id");
  return new Set((data ?? []).map((row) => row.shop_id));
}
