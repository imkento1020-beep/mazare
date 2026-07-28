-- まとめてセットアップ（カードが表示されない場合）
-- Supabase Dashboard → SQL Editor でこのファイル全体を実行

-- 1. vibe_posts 投入
DELETE FROM public.interests;
DELETE FROM public.vibe_posts;

INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT s.id, ARRAY['激熱', '音楽あり', '混ざり歓迎']::TEXT[], 'カラオケ開放中！知らない人たちと大合唱になってます🎤', '{}'::TEXT[], NOW()
FROM public.shops s WHERE s.name = '島唄酒場 ゆんたく';

INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT s.id, ARRAY['音楽あり', '混ざり歓迎']::TEXT[], 'DJセット始まりました。一人でも歓迎！', '{}'::TEXT[], NOW()
FROM public.shops s WHERE s.name = 'クラフトビール ROOTS';

INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT s.id, ARRAY['混ざり歓迎']::TEXT[], '今夜はゲーム大会あり。一人参加大歓迎！', '{}'::TEXT[], NOW()
FROM public.shops s WHERE s.name = 'Bar MINGLE';

-- 2. RLS を無効化（開発用）
ALTER TABLE public.shops DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests DISABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT SELECT ON public.vibe_posts TO anon, authenticated;
GRANT SELECT, INSERT ON public.interests TO anon, authenticated;

-- 3. 確認
SELECT 'shops' AS table_name, COUNT(*) AS count FROM public.shops
UNION ALL SELECT 'vibe_posts', COUNT(*) FROM public.vibe_posts;
