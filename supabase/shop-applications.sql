-- 店舗申請（オーナー登録・申請制）
-- Supabase Dashboard → SQL Editor で実行

CREATE TABLE IF NOT EXISTS public.shop_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram_url TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS shop_applications_user_id_idx
  ON public.shop_applications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS shop_applications_email_idx
  ON public.shop_applications (lower(email), created_at DESC);

CREATE INDEX IF NOT EXISTS shop_applications_status_idx
  ON public.shop_applications (status, created_at DESC);

ALTER TABLE public.shop_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_applications_insert" ON public.shop_applications;
CREATE POLICY "shop_applications_insert" ON public.shop_applications
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "shop_applications_select_own" ON public.shop_applications;
CREATE POLICY "shop_applications_select_own" ON public.shop_applications
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR lower(email) = lower(COALESCE(auth.jwt() ->> 'email', ''))
  );

GRANT INSERT ON public.shop_applications TO anon, authenticated;
GRANT SELECT ON public.shop_applications TO authenticated;
