-- mazare テストデータ
-- Supabase Dashboard → SQL Editor で実行してください

-- ============================================================
-- テーブル作成（未作成の場合）
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type TEXT NOT NULL DEFAULT 'guest',
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  genre TEXT[] NOT NULL DEFAULT '{}',
  open_hours TEXT NOT NULL,
  cover_image TEXT,
  cover_images TEXT[] NOT NULL DEFAULT '{}',
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  staff_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.vibe_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  moods TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  view_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  vibe_post_id UUID NOT NULL REFERENCES public.vibe_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, vibe_post_id)
);

CREATE TABLE IF NOT EXISTS public.favorite_shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, shop_id)
);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vibe_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_shops ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- shops（全員閲覧可）
DROP POLICY IF EXISTS "shops_select_all" ON public.shops;
CREATE POLICY "shops_select_all" ON public.shops
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "shops_insert_owner" ON public.shops;
CREATE POLICY "shops_insert_owner" ON public.shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "shops_update_owner" ON public.shops;
CREATE POLICY "shops_update_owner" ON public.shops
  FOR UPDATE TO authenticated USING (auth.uid() = owner_id);

-- vibe_posts（全員閲覧可）
DROP POLICY IF EXISTS "vibe_posts_select_all" ON public.vibe_posts;
CREATE POLICY "vibe_posts_select_all" ON public.vibe_posts
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vibe_posts_insert_owner" ON public.vibe_posts;
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
CREATE POLICY "interests_select_all" ON public.interests
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "interests_insert_own" ON public.interests;
CREATE POLICY "interests_insert_own" ON public.interests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "interests_delete_own" ON public.interests;
CREATE POLICY "interests_delete_own" ON public.interests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- favorite_shops
DROP POLICY IF EXISTS "favorite_shops_select_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_select_own" ON public.favorite_shops
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorite_shops_insert_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_insert_own" ON public.favorite_shops
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "favorite_shops_delete_own" ON public.favorite_shops;
CREATE POLICY "favorite_shops_delete_own" ON public.favorite_shops
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- テストデータ（固定UUID）
-- ============================================================

INSERT INTO public.shops (id, name, address, genre, open_hours, cover_image, owner_id)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001',
    '島唄酒場 ゆんたく',
    '渋谷',
    ARRAY['居酒屋'],
    '17:00–24:00',
    NULL,
    NULL
  ),
  (
    'a1000000-0000-4000-8000-000000000002',
    'クラフトビール ROOTS',
    '恵比寿',
    ARRAY['バー'],
    '18:00–02:00',
    NULL,
    NULL
  ),
  (
    'a1000000-0000-4000-8000-000000000003',
    'Bar MINGLE',
    '新宿',
    ARRAY['バー'],
    '19:00–01:00',
    NULL,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  genre = EXCLUDED.genre,
  open_hours = EXCLUDED.open_hours;

INSERT INTO public.vibe_posts (id, shop_id, moods, comment, images, posted_at)
SELECT
  'b2000000-0000-4000-8000-000000000001',
  s.id,
  ARRAY['激熱', '音楽あり', '混ざり歓迎']::TEXT[],
  'カラオケ開放中！知らない人たちと大合唱になってます🎤',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = '島唄酒場 ゆんたく'
ON CONFLICT (id) DO UPDATE SET
  shop_id = EXCLUDED.shop_id,
  moods = EXCLUDED.moods,
  comment = EXCLUDED.comment,
  posted_at = EXCLUDED.posted_at;

INSERT INTO public.vibe_posts (id, shop_id, moods, comment, images, posted_at)
SELECT
  'b2000000-0000-4000-8000-000000000002',
  s.id,
  ARRAY['音楽あり', '混ざり歓迎']::TEXT[],
  'DJセット始まりました。一人でも歓迎！',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = 'クラフトビール ROOTS'
ON CONFLICT (id) DO UPDATE SET
  shop_id = EXCLUDED.shop_id,
  moods = EXCLUDED.moods,
  comment = EXCLUDED.comment,
  posted_at = EXCLUDED.posted_at;

INSERT INTO public.vibe_posts (id, shop_id, moods, comment, images, posted_at)
SELECT
  'b2000000-0000-4000-8000-000000000003',
  s.id,
  ARRAY['混ざり歓迎']::TEXT[],
  '今夜はゲーム大会あり。一人参加大歓迎！',
  '{}'::TEXT[],
  NOW()
FROM public.shops s
WHERE s.name = 'Bar MINGLE'
ON CONFLICT (id) DO UPDATE SET
  shop_id = EXCLUDED.shop_id,
  moods = EXCLUDED.moods,
  comment = EXCLUDED.comment,
  posted_at = EXCLUDED.posted_at;
