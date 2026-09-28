import { getTonightWindowJST } from "@/lib/home/dates";
import type { VibePost } from "@/lib/home/types";

export function cupsContributed(
  post: Pick<VibePost, "drink_name" | "drink_cups">,
): number {
  if (post.drink_cups != null && post.drink_cups >= 1) {
    return post.drink_cups;
  }
  if (post.drink_name) return 1;
  return 0;
}

function isTonight(iso: string | null | undefined, start: Date, end: Date) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

/** 投稿一覧から「その投稿時点での今夜の累計杯数」を算出 */
export function buildTonightCumulativeCupTotals(
  posts: VibePost[],
  now = new Date(),
): Map<string, number> {
  const { start, end } = getTonightWindowJST(now);
  const byAuthor = new Map<string, VibePost[]>();

  for (const post of posts) {
    if (!post.author_id || !isTonight(post.posted_at, start, end)) continue;
    const list = byAuthor.get(post.author_id) ?? [];
    list.push(post);
    byAuthor.set(post.author_id, list);
  }

  const totals = new Map<string, number>();

  for (const list of byAuthor.values()) {
    list.sort(
      (a, b) =>
        new Date(a.posted_at ?? 0).getTime() -
        new Date(b.posted_at ?? 0).getTime(),
    );
    let running = 0;
    for (const post of list) {
      const add = cupsContributed(post);
      if (add > 0) {
        running += add;
        totals.set(post.id, running);
      }
    }
  }

  return totals;
}

export function projectedTonightTotalCups(
  priorTonightCupSum: number,
  draft: Pick<VibePost, "drink_name" | "drink_cups">,
): number | null {
  const add = cupsContributed(draft);
  if (add === 0) return priorTonightCupSum > 0 ? priorTonightCupSum : null;
  return priorTonightCupSum + add;
}
