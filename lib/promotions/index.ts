/**
 * 将来の投稿ブースト（広告枠）機能
 *
 * 現状: スキーマと並び替えヘルパーのみ。UI・課金・公開は未実装。
 *
 * 有効化手順（将来）:
 * 1. Supabase で supabase/promotions-future.sql を実行
 * 2. .env.local に NEXT_PUBLIC_PROMOTIONS_ENABLED=true
 * 3. ホーム等で fetchActivePromotionBoosts + sortPostsWithPromotions を適用
 * 4. promotion_plans.is_public = true にして料金を設定
 * 5. Stripe 連携で post_promotions 作成・決済
 *
 * テーブル:
 * - promotion_plans     … 料金プランカタログ
 * - post_promotions     … 投稿ごとのブーストキャンペーン
 * - shop_billing_profiles … Stripe customer 等（将来）
 */

export { PROMOTIONS_ENABLED, PROMOTION_PLAN_IDS, PLACEMENT_LABELS } from "./constants";
export type {
  PostPromotion,
  PromotionBoostMap,
  PromotionPlacement,
  PromotionPlan,
  PromotionStatus,
  PromotedPostMeta,
  ShopBillingProfile,
} from "./types";
export {
  fetchActivePromotionBoosts,
  isPromotedPost,
  sortPostsWithPromotions,
} from "./sorting";
