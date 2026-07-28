-- 開発用: RLS を無効化（データがあるのに0件表示される場合）
-- Supabase Dashboard → SQL Editor で実行
-- ※本番環境では適切な RLS ポリシーを設定してください

ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT SELECT ON public.vibe_posts TO anon, authenticated;
GRANT SELECT, INSERT ON public.interests TO anon, authenticated;

-- 確認（ここで 3 件表示されればデータは存在します）
SELECT 'shops' AS table_name, COUNT(*) AS count FROM public.shops
UNION ALL
SELECT 'vibe_posts', COUNT(*) FROM public.vibe_posts;
