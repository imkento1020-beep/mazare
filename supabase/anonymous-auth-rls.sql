-- 匿名認証（Anonymous Sign-Ins）向け RLS 更新
--
-- Supabase Dashboard → Authentication → Sign In / Up → Anonymous Sign-Ins を ON
-- 匿名ログイン後の JWT ロールは authenticated です（anon キー未使用のセッション）。
-- 未ログイン閲覧用に anon ロールの SELECT も併記します。

-- shops: 閲覧
DROP POLICY IF EXISTS "shops_select_all" ON public.shops;
CREATE POLICY "shops_select_all" ON public.shops
  FOR SELECT TO anon, authenticated USING (true);

-- vibe_posts: 閲覧
DROP POLICY IF EXISTS "vibe_posts_select_all" ON public.vibe_posts;
CREATE POLICY "vibe_posts_select_all" ON public.vibe_posts
  FOR SELECT TO anon, authenticated USING (true);

-- vibe_posts: ゲスト投稿（匿名含む authenticated）
DROP POLICY IF EXISTS "vibe_posts_insert_guest" ON public.vibe_posts;
CREATE POLICY "vibe_posts_insert_guest" ON public.vibe_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    is_guest_post = TRUE
    AND author_id = auth.uid()
  );

-- vibe_posts: オーナー投稿
DROP POLICY IF EXISTS "vibe_posts_insert_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_insert_owner" ON public.vibe_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    is_guest_post = FALSE
    AND EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );

-- interests: 閲覧 + 自分の行くかも
DROP POLICY IF EXISTS "interests_select_all" ON public.interests;
CREATE POLICY "interests_select_all" ON public.interests
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "interests_insert_own" ON public.interests;
CREATE POLICY "interests_insert_own" ON public.interests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interests_delete_own" ON public.interests;
CREATE POLICY "interests_delete_own" ON public.interests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT ON public.interests TO anon;

-- checkins: 有効なチェックイン閲覧 + 自分のチェックイン
DROP POLICY IF EXISTS "checkins_select_active" ON public.checkins;
CREATE POLICY "checkins_select_active" ON public.checkins
  FOR SELECT TO anon, authenticated
  USING (expires_at > NOW());

DROP POLICY IF EXISTS "checkins_insert_own" ON public.checkins;
CREATE POLICY "checkins_insert_own" ON public.checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "checkins_delete_own" ON public.checkins;
CREATE POLICY "checkins_delete_own" ON public.checkins
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.checkins TO anon;

-- profiles: 匿名ユーザーの初回 upsert
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

GRANT SELECT, INSERT ON public.profiles TO authenticated;

-- post-media ストレージ（匿名 authenticated が自分のフォルダに upload）
DROP POLICY IF EXISTS "post_media_insert_own" ON storage.objects;
CREATE POLICY "post_media_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
