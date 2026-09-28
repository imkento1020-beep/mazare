-- ゲストプロフィールの公開閲覧（表示名・アイコン用）
-- Supabase Dashboard → SQL Editor で実行

DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT TO anon, authenticated
  USING (true);

GRANT SELECT ON public.profiles TO anon;
