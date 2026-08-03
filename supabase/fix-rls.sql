-- RLS ポリシー修正（shops 登録エラー等）
-- Supabase Dashboard → SQL Editor で実行

ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_shops ENABLE ROW LEVEL SECURITY;

-- shops
DROP POLICY IF EXISTS "shops_select_all" ON public.shops;
DROP POLICY IF EXISTS "shops_select_authenticated" ON public.shops;
DROP POLICY IF EXISTS "shops_insert_owner" ON public.shops;
DROP POLICY IF EXISTS "shops_update_owner" ON public.shops;

CREATE POLICY "shops_select_all" ON public.shops
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "shops_insert_owner" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "shops_update_owner" ON public.shops
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- vibe_posts
DROP POLICY IF EXISTS "vibe_posts_select_all" ON public.vibe_posts;
DROP POLICY IF EXISTS "vibe_posts_select_authenticated" ON public.vibe_posts;
DROP POLICY IF EXISTS "vibe_posts_insert_owner" ON public.vibe_posts;

CREATE POLICY "vibe_posts_select_all" ON public.vibe_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "vibe_posts_insert_owner" ON public.vibe_posts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "vibe_posts_update_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_update_owner" ON public.vibe_posts
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "vibe_posts_delete_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_delete_owner" ON public.vibe_posts
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
      AND shops.owner_id = auth.uid()
    )
  );

-- interests
DROP POLICY IF EXISTS "interests_select_all" ON public.interests;
DROP POLICY IF EXISTS "interests_select_authenticated" ON public.interests;
DROP POLICY IF EXISTS "interests_insert_own" ON public.interests;
DROP POLICY IF EXISTS "interests_insert_authenticated" ON public.interests;
DROP POLICY IF EXISTS "interests_delete_own" ON public.interests;

CREATE POLICY "interests_select_all" ON public.interests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "interests_insert_own" ON public.interests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "interests_delete_own" ON public.interests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- favorite_shops
DROP POLICY IF EXISTS "favorite_shops_select_own" ON public.favorite_shops;
DROP POLICY IF EXISTS "favorite_shops_insert_own" ON public.favorite_shops;
DROP POLICY IF EXISTS "favorite_shops_delete_own" ON public.favorite_shops;

CREATE POLICY "favorite_shops_select_own" ON public.favorite_shops
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "favorite_shops_insert_own" ON public.favorite_shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "favorite_shops_delete_own" ON public.favorite_shops
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 権限付与
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.shops TO anon, authenticated;
GRANT INSERT, UPDATE ON public.shops TO authenticated;
GRANT SELECT ON public.vibe_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.vibe_posts TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.interests TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.favorite_shops TO authenticated;
