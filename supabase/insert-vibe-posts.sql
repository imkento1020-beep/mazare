-- vibe_posts テストデータ投入
-- shops にデータがあるのに vibe_posts が 0 件の場合に実行してください
-- Supabase Dashboard → SQL Editor

-- まず shops の確認
SELECT id, name FROM public.shops ORDER BY name;

-- 既存の vibe_posts を削除（再投入用）
DELETE FROM public.interests;
DELETE FROM public.vibe_posts;

-- 店名から shop_id を参照して投入（UUID が異なっていても動作します）
INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT
  s.id,
  ARRAY['激熱', '音楽あり', '混ざり歓迎']::TEXT[],
  'カラオケ開放中！知らない人たちと大合唱になってます🎤',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = '島唄酒場 ゆんたく';

INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT
  s.id,
  ARRAY['音楽あり', '混ざり歓迎']::TEXT[],
  'DJセット始まりました。一人でも歓迎！',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = 'クラフトビール ROOTS';

INSERT INTO public.vibe_posts (shop_id, moods, comment, images, posted_at)
SELECT
  s.id,
  ARRAY['混ざり歓迎']::TEXT[],
  '今夜はゲーム大会あり。一人参加大歓迎！',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = 'Bar MINGLE';

-- 投入結果の確認
SELECT
  vp.id,
  s.name AS shop_name,
  vp.comment,
  vp.moods
FROM public.vibe_posts vp
JOIN public.shops s ON s.id = vp.shop_id;
