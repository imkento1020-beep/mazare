import { supabase } from "@/lib/supabase";
import { getTonightWindowJST } from "@/lib/home/dates";
import { cupsContributed } from "@/lib/guest-post/tonightCups";
import type { VibePost } from "@/lib/home/types";

/** 編集時など、指定投稿より前の今夜の累計杯数 */
export async function fetchTonightCupSumForUser(
  userId: string,
  options?: { excludePostId?: string },
): Promise<number> {
  const { start, end } = getTonightWindowJST();

  let query = supabase
    .from("vibe_posts")
    .select("id, posted_at, drink_name, drink_cups")
    .eq("author_id", userId)
    .eq("is_guest_post", true)
    .gte("posted_at", start.toISOString())
    .lt("posted_at", end.toISOString())
    .order("posted_at", { ascending: true });

  const { data, error } = await query;

  if (error) return 0;

  let sum = 0;
  for (const row of data ?? []) {
    if (options?.excludePostId && row.id === options.excludePostId) continue;
    sum += cupsContributed(row as Pick<VibePost, "drink_name" | "drink_cups">);
  }

  return sum;
}
