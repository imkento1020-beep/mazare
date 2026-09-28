import { getJSTParts, getTonightWindowJST } from "@/lib/home/dates";
import type { VibePost } from "@/lib/home/types";
import { extractAreaFromAddress } from "@/lib/geo/area";
import { formatNightOutSummary } from "@/lib/guest-post/nightOut";

export type GuestPostAllTimeInsights = {
  totalPosts: number;
  totalShops: number;
  topDrinks: string[];
  topAreas: string[];
};

export type GuestPostNightGroup = {
  nightStartIso: string;
  label: string;
  posts: VibePost[];
  shopCount: number;
};

export type GuestPostInsights = {
  tonightPostCount: number;
  tonightShopCount: number;
  maxStopTonight: number | null;
  topDrinks: string[];
  topAreas: string[];
  latestSummary: string | null;
  tonightTimeline: {
    post: VibePost;
    summary: string | null;
  }[];
};

function isInWindow(
  iso: string | null | undefined,
  start: Date,
  end: Date,
): boolean {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t < end.getTime();
}

function rankCounts(counts: Map<string, number>, limit: number): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => name);
}

function accumulatePostStats(posts: VibePost[]) {
  const shopIds = new Set<string>();
  const drinkCounts = new Map<string, number>();
  const areaCounts = new Map<string, number>();

  for (const post of posts) {
    shopIds.add(post.shop_id);

    if (post.drink_name) {
      drinkCounts.set(
        post.drink_name,
        (drinkCounts.get(post.drink_name) ?? 0) + 1,
      );
    }

    const area = extractAreaFromAddress(post.shops?.address);
    if (area !== "—" && area !== "その他") {
      areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
    }
  }

  return { shopIds, drinkCounts, areaCounts };
}

export function computeGuestPostAllTimeInsights(
  posts: VibePost[],
): GuestPostAllTimeInsights {
  const { shopIds, drinkCounts, areaCounts } = accumulatePostStats(posts);

  return {
    totalPosts: posts.length,
    totalShops: shopIds.size,
    topDrinks: rankCounts(drinkCounts, 3),
    topAreas: rankCounts(areaCounts, 3),
  };
}

function formatNightGroupLabel(start: Date): string {
  const parts = getJSTParts(start);
  return `${parts.year}年${parts.month}月${parts.day}日の夜`;
}

export function groupGuestPostsByNight(posts: VibePost[]): GuestPostNightGroup[] {
  const groups = new Map<
    string,
    { label: string; startMs: number; posts: VibePost[]; shopIds: Set<string> }
  >();

  for (const post of posts) {
    if (!post.posted_at) continue;

    const { start } = getTonightWindowJST(new Date(post.posted_at));
    const key = start.toISOString();
    let group = groups.get(key);
    if (!group) {
      group = {
        label: formatNightGroupLabel(start),
        startMs: start.getTime(),
        posts: [],
        shopIds: new Set(),
      };
      groups.set(key, group);
    }
    group.posts.push(post);
    group.shopIds.add(post.shop_id);
  }

  return [...groups.values()]
    .sort((a, b) => b.startMs - a.startMs)
    .map((group) => ({
      nightStartIso: new Date(group.startMs).toISOString(),
      label: group.label,
      posts: group.posts.sort(
        (a, b) =>
          new Date(b.posted_at ?? 0).getTime() -
          new Date(a.posted_at ?? 0).getTime(),
      ),
      shopCount: group.shopIds.size,
    }));
}

export function computeGuestPostInsights(
  posts: VibePost[],
  now = new Date(),
): GuestPostInsights {
  const { start, end } = getTonightWindowJST(now);
  const tonightPosts = posts
    .filter((post) => isInWindow(post.posted_at, start, end))
    .sort(
      (a, b) =>
        new Date(b.posted_at ?? 0).getTime() -
        new Date(a.posted_at ?? 0).getTime(),
    );

  const { shopIds, drinkCounts, areaCounts } = accumulatePostStats(tonightPosts);
  let maxStop: number | null = null;

  for (const post of tonightPosts) {
    if (post.stop_number != null) {
      maxStop =
        maxStop == null ? post.stop_number : Math.max(maxStop, post.stop_number);
    }
  }

  const latest = tonightPosts[0] ?? null;
  const latestSummary = latest ? formatNightOutSummary(latest) : null;

  const timeline = [...tonightPosts]
    .sort(
      (a, b) =>
        new Date(a.posted_at ?? 0).getTime() -
        new Date(b.posted_at ?? 0).getTime(),
    )
    .map((post) => ({
      post,
      summary: formatNightOutSummary(post),
    }));

  return {
    tonightPostCount: tonightPosts.length,
    tonightShopCount: shopIds.size,
    maxStopTonight: maxStop,
    topDrinks: rankCounts(drinkCounts, 3),
    topAreas: rankCounts(areaCounts, 3),
    latestSummary,
    tonightTimeline: timeline,
  };
}
