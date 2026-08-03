-- お問い合わせ
-- Supabase Dashboard → SQL Editor で実行

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquirer_type TEXT NOT NULL
    CHECK (inquirer_type IN ('guest', 'owner', 'visitor')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  category TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_inquiries_created_idx
  ON public.contact_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS contact_inquiries_type_idx
  ON public.contact_inquiries (inquirer_type, created_at DESC);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_inquiries_insert_all" ON public.contact_inquiries;
CREATE POLICY "contact_inquiries_insert_all" ON public.contact_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.contact_inquiries TO anon, authenticated;
