/** 将来の広告枠（投稿ブースト）用の型定義 */

export const PROMOTION_PLACEMENTS = [
  "home_feed",
  "map",
  "search",
] as const;

export type PromotionPlacement = (typeof PROMOTION_PLACEMENTS)[number];

export const PROMOTION_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "paused",
  "ended",
  "cancelled",
] as const;

export type PromotionStatus = (typeof PROMOTION_STATUSES)[number];

export type PromotionPlan = {
  id: string;
  name: string;
  description: string;
  price_yen: number | null;
  priority_boost: number;
  duration_hours: number;
  max_impressions: number | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
};

export type PostPromotion = {
  id: string;
  shop_id: string;
  vibe_post_id: string;
  plan_id: string;
  status: PromotionStatus;
  placement: PromotionPlacement[];
  priority_boost: number;
  starts_at: string;
  ends_at: string;
  impression_count: number;
  click_count: number;
  amount_yen: number | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ShopBillingProfile = {
  shop_id: string;
  stripe_customer_id: string | null;
  billing_email: string | null;
  created_at: string;
  updated_at: string;
};

/** フィード並び替え用: post_id → ブースト加算値 */
export type PromotionBoostMap = Map<string, number>;

export type PromotedPostMeta = {
  postId: string;
  promotionId: string;
  priorityBoost: number;
  placement: PromotionPlacement[];
  endsAt: string;
};
