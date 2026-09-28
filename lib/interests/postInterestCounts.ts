import { supabase } from "@/lib/supabase";

export async function fetchInterestCountsByPostIds(
  postIds: string[],
): Promise<Map<string, number>> {
  const ids = [...new Set(postIds.filter(Boolean))];
  const map = new Map<string, number>();
  if (ids.length === 0) return map;

  const { data, error } = await supabase
    .from("interests")
    .select("vibe_post_id")
    .in("vibe_post_id", ids);

  if (error) return map;

  for (const row of data ?? []) {
    const id = row.vibe_post_id as string;
    map.set(id, (map.get(id) ?? 0) + 1);
  }

  return map;
}
