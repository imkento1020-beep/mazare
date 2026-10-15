import { supabase } from "@/lib/supabase";
import { chunkPostIds } from "@/lib/interests/chunkPostIds";

export async function fetchInterestCountsByPostIds(
  postIds: string[],
): Promise<Map<string, number>> {
  const chunks = chunkPostIds(postIds);
  const map = new Map<string, number>();
  if (chunks.length === 0) return map;

  for (const chunk of chunks) {
    for (const id of chunk) {
      map.set(id, 0);
    }
  }

  const results = await Promise.all(
    chunks.map((ids) =>
      supabase.from("interests").select("vibe_post_id").in("vibe_post_id", ids),
    ),
  );

  for (const { data, error } of results) {
    if (error) continue;
    for (const row of data ?? []) {
      const id = row.vibe_post_id as string;
      map.set(id, (map.get(id) ?? 0) + 1);
    }
  }

  return map;
}
