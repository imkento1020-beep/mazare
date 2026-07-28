-- RLS 修正（カードが表示されない場合に実行）
-- Supabase Dashboard → SQL Editor

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーをすべて削除
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('shops', 'vibe_posts', 'interests')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- ログイン済みユーザーが読み書きできるポリシー
CREATE POLICY "shops_select_authenticated" ON public.shops
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vibe_posts_select_authenticated" ON public.vibe_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "interests_select_authenticated" ON public.interests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "interests_insert_authenticated" ON public.interests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 権限付与
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.shops TO authenticated;
GRANT SELECT ON public.vibe_posts TO authenticated;
GRANT SELECT, INSERT ON public.interests TO authenticated;

-- 確認
SELECT 'shops' AS table_name, COUNT(*) AS count FROM public.shops
UNION ALL
SELECT 'vibe_posts', COUNT(*) FROM public.vibe_posts;
