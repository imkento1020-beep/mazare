-- 将来の投稿ブースト（広告枠）用スキーマ
-- ローンチ前の準備用。機能は未公開（is_public = false のプランのみ）
-- Supabase Dashboard → SQL Editor で実行

-- ============================================================
-- 1. ブーストプラン（料金ティアのカタログ）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.promotion_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price_yen INTEGER,
  priority_boost INTEGER NOT NULL DEFAULT 100,
  duration_hours INTEGER NOT NULL DEFAULT 24,
  max_impressions INTEGER,
  is_public BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. 投稿ブースト（キャンペーン単位）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.post_promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  vibe_post_id UUID NOT NULL REFERENCES public.vibe_posts(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL REFERENCES public.promotion_plans(id),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'ended', 'cancelled')),
  placement TEXT[] NOT NULL DEFAULT ARRAY['home_feed']::TEXT[]
    CHECK (
      placement <@ ARRAY['home_feed', 'map', 'search']::TEXT[]
      AND cardinality(placement) > 0
    ),
  priority_boost INTEGER NOT NULL DEFAULT 0,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  impression_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  amount_yen INTEGER,
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (ends_at > starts_at)
);

CREATE INDEX IF NOT EXISTS post_promotions_active_feed_idx
  ON public.post_promotions (starts_at DESC, priority_boost DESC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS post_promotions_shop_idx
  ON public.post_promotions (shop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS post_promotions_post_idx
  ON public.post_promotions (vibe_post_id);

-- ============================================================
-- 3. 店舗の課金プロフィール（将来の Stripe 連携用）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_billing_profiles (
  shop_id UUID PRIMARY KEY REFERENCES public.shops(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  billing_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. updated_at 自動更新
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS post_promotions_set_updated_at ON public.post_promotions;
CREATE TRIGGER post_promotions_set_updated_at
  BEFORE UPDATE ON public.post_promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS shop_billing_profiles_set_updated_at ON public.shop_billing_profiles;
CREATE TRIGGER shop_billing_profiles_set_updated_at
  BEFORE UPDATE ON public.shop_billing_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- 5. RLS
-- ============================================================

ALTER TABLE public.promotion_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_billing_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promotion_plans_select_authenticated" ON public.promotion_plans;
CREATE POLICY "promotion_plans_select_authenticated" ON public.promotion_plans
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "post_promotions_select_active" ON public.post_promotions;
CREATE POLICY "post_promotions_select_active" ON public.post_promotions
  FOR SELECT TO authenticated
  USING (
    status = 'active'
    AND starts_at <= NOW()
    AND ends_at > NOW()
  );

DROP POLICY IF EXISTS "post_promotions_manage_own_shop" ON public.post_promotions;
CREATE POLICY "post_promotions_manage_own_shop" ON public.post_promotions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = post_promotions.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = post_promotions.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "shop_billing_profiles_manage_own" ON public.shop_billing_profiles;
CREATE POLICY "shop_billing_profiles_manage_own" ON public.shop_billing_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_billing_profiles.shop_id
      AND shops.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_billing_profiles.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

GRANT SELECT ON public.promotion_plans TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_promotions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.shop_billing_profiles TO authenticated;

-- ============================================================
-- 6. 将来用プラン（非公開・料金は NULL）
-- ============================================================

INSERT INTO public.promotion_plans (
  id, name, description, price_yen, priority_boost, duration_hours, is_public, sort_order
)
VALUES
  (
    'boost_standard',
    'スタンダードブースト',
    'ホームフィードで24時間、通常より上位に表示',
    NULL,
    100,
    24,
    false,
    1
  ),
  (
    'boost_premium',
    'プレミアムブースト',
    'ホーム・地図・検索で48時間、最上位付近に表示',
    NULL,
    300,
    48,
    false,
    2
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  priority_boost = EXCLUDED.priority_boost,
  duration_hours = EXCLUDED.duration_hours;
