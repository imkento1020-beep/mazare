-- ゲスト（未ログイン）が投稿・店舗・「行くかも」件数を閲覧できるようにする
-- Supabase Dashboard → SQL Editor で実行（本番・ステージング両方）

-- shops / vibe_posts / interests: SELECT を anon に許可
DROP POLICY IF EXISTS "shops_select_all" ON public.shops;
CREATE POLICY "shops_select_all" ON public.shops
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "vibe_posts_select_all" ON public.vibe_posts;
CREATE POLICY "vibe_posts_select_all" ON public.vibe_posts
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "interests_select_all" ON public.interests;
CREATE POLICY "interests_select_all" ON public.interests
  FOR SELECT TO anon, authenticated USING (true);

GRANT SELECT ON public.interests TO anon;

-- ホームの「今ここにいる」表示（有効期限内のチェックインのみ）
DROP POLICY IF EXISTS "checkins_select_active" ON public.checkins;
CREATE POLICY "checkins_select_active" ON public.checkins
  FOR SELECT TO anon, authenticated
  USING (expires_at > NOW());

GRANT SELECT ON public.checkins TO anon;
