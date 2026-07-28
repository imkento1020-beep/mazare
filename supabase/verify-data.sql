-- データ確認用（Supabase SQL Editor で実行）
SELECT 'shops' AS table_name, COUNT(*) AS count FROM public.shops
UNION ALL
SELECT 'vibe_posts', COUNT(*) FROM public.vibe_posts
UNION ALL
SELECT 'interests', COUNT(*) FROM public.interests;

-- 中身の確認
SELECT vp.id, vp.comment, s.name AS shop_name
FROM public.vibe_posts vp
LEFT JOIN public.shops s ON s.id = vp.shop_id;
