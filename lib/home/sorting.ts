import type { VibePost } from "./types";

/** 行くかも数 → 新しい順（同数の場合） */
export function sortPostsByPopularity(
  posts: VibePost[],
  interestByPostId: Record<string, number>,
) {
  return [...posts].sort((a, b) => {
    const diff =
      (interestByPostId[b.id] ?? 0) - (interestByPostId[a.id] ?? 0);
    if (diff !== 0) return diff;

    return (
      new Date(b.posted_at ?? 0).getTime() -
      new Date(a.posted_at ?? 0).getTime()
    );
  });
}
