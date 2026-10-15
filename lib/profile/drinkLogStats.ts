import { extractAreaFromAddress } from "@/lib/geo/area";
import { getJSTParts } from "@/lib/home/dates";
import type { VibePost } from "@/lib/home/types";

export type DrinkLogMonthStats = {
  postCount: number;
  totalDrinks: number;
  uniqueShopCount: number;
  topArea: string | null;
  topDrink: string | null;
  activeDays: number;
};

export type PostsByDayKey = string;

function monthRangeJST(now = new Date()) {
  const { year, month } = getJSTParts(now);
  const start = new Date(Date.UTC(year, month - 1, 1, -9, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, -9, 0, 0));
  return { start, end, year, month };
}

function isInCurrentMonthJST(iso: string | null | undefined, now = new Date()) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  const { start, end } = monthRangeJST(now);
  return t >= start.getTime() && t < end.getTime();
}

function dayKeyJST(iso: string) {
  const { year, month, day } = getJSTParts(new Date(iso));
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function drinkUnits(post: VibePost): number {
  const cups = post.drink_cups ?? post.drink_count;
  if (typeof cups === "number" && cups > 0) return cups;
  return post.drink_name?.trim() ? 1 : 0;
}

export function computeDrinkLogMonthStats(
  posts: VibePost[],
  now = new Date(),
): DrinkLogMonthStats {
  const monthPosts = posts.filter((p) => isInCurrentMonthJST(p.posted_at, now));

  const shopIds = new Set<string>();
  const dayKeys = new Set<string>();
  const areaCounts = new Map<string, number>();
  const drinkCounts = new Map<string, number>();
  let totalDrinks = 0;

  for (const post of monthPosts) {
    if (post.shop_id) shopIds.add(post.shop_id);
    if (post.posted_at) dayKeys.add(dayKeyJST(post.posted_at));
    totalDrinks += drinkUnits(post);

    const area = extractAreaFromAddress(post.shops?.address ?? "");
    if (area) {
      areaCounts.set(area, (areaCounts.get(area) ?? 0) + 1);
    }

    const drink = post.drink_name?.trim();
    if (drink) {
      drinkCounts.set(drink, (drinkCounts.get(drink) ?? 0) + 1);
    }
  }

  const topEntry = (map: Map<string, number>) => {
    let best: string | null = null;
    let max = 0;
    for (const [key, count] of map) {
      if (count > max) {
        max = count;
        best = key;
      }
    }
    return best;
  };

  return {
    postCount: monthPosts.length,
    totalDrinks,
    uniqueShopCount: shopIds.size,
    topArea: topEntry(areaCounts),
    topDrink: topEntry(drinkCounts),
    activeDays: dayKeys.size,
  };
}

export function groupPostsByDayJST(
  posts: VibePost[],
): Map<PostsByDayKey, VibePost[]> {
  const map = new Map<PostsByDayKey, VibePost[]>();
  for (const post of posts) {
    if (!post.posted_at) continue;
    const key = dayKeyJST(post.posted_at);
    const list = map.get(key) ?? [];
    list.push(post);
    map.set(key, list);
  }
  return map;
}

function weekdayJST(year: number, month: number, day: number) {
  const utc = new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T12:00:00+09:00`);
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    weekday: "short",
  }).format(utc);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[wd] ?? 0;
}

export function calendarMonthMeta(now = new Date()) {
  const { year, month } = getJSTParts(now);
  const daysInMonth = new Date(year, month, 0).getDate();
  const startWeekday = weekdayJST(year, month, 1);
  return { year, month, startWeekday, daysInMonth };
}
