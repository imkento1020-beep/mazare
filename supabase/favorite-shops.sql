-- お気に入り店舗
-- Supabase Dashboard → SQL Editor で実行

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
