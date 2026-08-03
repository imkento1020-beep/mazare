-- 未適用のマイグレーションをまとめて実行
-- Supabase Dashboard → SQL Editor → このファイル全体を貼り付けて Run

-- ============================================================
-- 1. お気に入り店舗 (favorite_shops)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.favorite_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, shop_id)
);

ALTER TABLE public.favorite_shops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorite_shops_select_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_select_own" ON public.favorite_shops
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorite_shops_insert_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_insert_own" ON public.favorite_shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorite_shops_delete_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_delete_own" ON public.favorite_shops
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.favorite_shops TO authenticated;

-- ============================================================
-- 2. 投稿表示回数 (view_count) ※未適用の場合のみ
-- ============================================================

ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_vibe_post_view(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.vibe_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_vibe_post_view(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_vibe_post_view(UUID) TO anon, authenticated;

-- ============================================================
-- 3. 投稿の編集・削除（オーナーのみ）
-- ============================================================

DROP POLICY IF EXISTS "vibe_posts_update_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_update_owner" ON public.vibe_posts
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "vibe_posts_delete_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_delete_owner" ON public.vibe_posts
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

GRANT UPDATE, DELETE ON public.vibe_posts TO authenticated;

-- ============================================================
-- 4. 通知 (notifications) → supabase/notifications.sql を別途実行
-- 5. 投稿ブースト（将来）→ supabase/promotions-future.sql を別途実行
-- 6. チェックイン & スタッフ招待 → supabase/checkins-staff.sql を別途実行
-- ============================================================

-- ============================================================
-- 6. 確認
-- ============================================================

SELECT
  EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'favorite_shops'
  ) AS favorite_shops_ready;
