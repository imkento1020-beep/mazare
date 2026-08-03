import type { PromotionPlacement } from "./types";

/** 機能公開フラグ。ローンチ前は false のまま */
export const PROMOTIONS_ENABLED =
  process.env.NEXT_PUBLIC_PROMOTIONS_ENABLED === "true";

export const PROMOTION_PLAN_IDS = {
  standard: "boost_standard",
  premium: "boost_premium",
} as const;

export const PLACEMENT_LABELS: Record<PromotionPlacement, string> = {
  home_feed: "ホームフィード",
  map: "地図",
  search: "検索",
};
