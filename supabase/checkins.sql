-- チェックイン (checkins)
-- Supabase Dashboard → SQL Editor で実行

CREATE TABLE IF NOT EXISTS public.checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '8 hours')
);

CREATE INDEX IF NOT EXISTS checkins_shop_id_expires_at_idx
  ON public.checkins (shop_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS checkins_user_id_shop_id_idx
  ON public.checkins (user_id, shop_id);

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "checkins_select_active" ON public.checkins;
CREATE POLICY "checkins_select_active" ON public.checkins
  FOR SELECT TO authenticated
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "checkins_select_own" ON public.checkins;
CREATE POLICY "checkins_select_own" ON public.checkins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "checkins_select_shop_owner" ON public.checkins;
CREATE POLICY "checkins_select_shop_owner" ON public.checkins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = checkins.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );

DROP POLICY IF EXISTS "checkins_insert_own" ON public.checkins;
CREATE POLICY "checkins_insert_own" ON public.checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "checkins_delete_own" ON public.checkins;
CREATE POLICY "checkins_delete_own" ON public.checkins
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, DELETE ON public.checkins TO authenticated;
