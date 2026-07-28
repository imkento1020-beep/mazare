import { supabase } from "@/lib/supabase";
import type { InterestRow } from "@/lib/home/types";

export async function fetchUserInterests(userId: string): Promise<{
  data: InterestRow[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("interests")
    .select(
      `
      id,
      user_id,
      shop_id,
      vibe_post_id,
      created_at,
      vibe_posts (
        comment,
        posted_at,
        shops ( name )
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  const rows: InterestRow[] = (data ?? []).map((row) => {
    const vibePost = Array.isArray(row.vibe_posts)
      ? row.vibe_posts[0]
      : row.vibe_posts;
    const shop = Array.isArray(vibePost?.shops)
      ? vibePost.shops[0]
      : vibePost?.shops;

    return {
      id: row.id,
      user_id: row.user_id,
      shop_id: row.shop_id,
      vibe_post_id: row.vibe_post_id,
      created_at: row.created_at,
      vibe_posts: vibePost
        ? {
            comment: vibePost.comment,
            posted_at: vibePost.posted_at,
            shops: shop ? { name: shop.name } : null,
          }
        : null,
    };
  });

  return { data: rows, error: null };
}

export async function fetchUserInterestStats(userId: string) {
  const { data } = await supabase
    .from("interests")
    .select("shop_id")
    .eq("user_id", userId);

  const rows = data ?? [];
  const uniqueShops = new Set(rows.map((row) => row.shop_id));

  return {
    totalInterests: rows.length,
    visitedShops: Math.max(Math.floor(uniqueShops.size * 0.6), 0),
  };
}
