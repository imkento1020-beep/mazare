import { supabase } from "@/lib/supabase";
import { PROMOTIONS_ENABLED } from "./constants";
import type { PromotionBoostMap, PromotionPlacement } from "./types";

export async function fetchActivePromotionBoosts(
  placement: PromotionPlacement = "home_feed",
): Promise<PromotionBoostMap> {
  if (!PROMOTIONS_ENABLED) return new Map();

  const { data, error } = await supabase
    .from("post_promotions")
    .select("vibe_post_id, priority_boost, plan_id, promotion_plans(priority_boost)")
    .eq("status", "active")
    .contains("placement", [placement])
    .lte("starts_at", new Date().toISOString())
    .gt("ends_at", new Date().toISOString());

  if (error) {
    if (
      error.message.includes("schema cache") ||
      error.message.includes("does not exist")
    ) {
      return new Map();
    }
    return new Map();
  }

  const boosts: PromotionBoostMap = new Map();

  for (const row of data) {
    const plan = Array.isArray(row.promotion_plans)
      ? row.promotion_plans[0]
      : row.promotion_plans;
    const planBoost =
      plan && typeof plan === "object" && "priority_boost" in plan
        ? Number(plan.priority_boost) || 0
        : 0;
    const totalBoost = (row.priority_boost ?? 0) + planBoost;
    const current = boosts.get(row.vibe_post_id) ?? 0;
    boosts.set(row.vibe_post_id, Math.max(current, totalBoost));
  }

  return boosts;
}

/** ブーストを考慮した並び替え（未公開時は posted_at 降順のみ） */
export function sortPostsWithPromotions<T extends { id: string; posted_at?: string | null }>(
  posts: T[],
  boosts: PromotionBoostMap,
): T[] {
  if (boosts.size === 0) {
    return [...posts].sort(
      (a, b) =>
        new Date(b.posted_at ?? 0).getTime() -
        new Date(a.posted_at ?? 0).getTime(),
    );
  }

  return [...posts].sort((a, b) => {
    const boostDiff = (boosts.get(b.id) ?? 0) - (boosts.get(a.id) ?? 0);
    if (boostDiff !== 0) return boostDiff;

    return (
      new Date(b.posted_at ?? 0).getTime() -
      new Date(a.posted_at ?? 0).getTime()
    );
  });
}

export function isPromotedPost(postId: string, boosts: PromotionBoostMap) {
  return PROMOTIONS_ENABLED && (boosts.get(postId) ?? 0) > 0;
}
