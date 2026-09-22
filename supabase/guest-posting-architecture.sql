-- ゲスト投稿モデル + Google Places キャッシュ
-- Supabase Dashboard → SQL Editor で実行

-- shops: Places キャッシュ
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS google_place_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC,
  ADD COLUMN IF NOT EXISTS cached_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS shops_google_place_id_idx
  ON public.shops (google_place_id)
  WHERE google_place_id IS NOT NULL;

-- vibe_posts: ゲスト投稿
ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS hashtags TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS media_type TEXT CHECK (media_type IN ('image', 'video') OR media_type IS NULL),
  ADD COLUMN IF NOT EXISTS is_guest_post BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS video_url TEXT;

UPDATE public.vibe_posts
SET is_guest_post = FALSE
WHERE author_id IS NULL;

ALTER TABLE public.vibe_posts
  ALTER COLUMN comment SET DEFAULT '';

CREATE INDEX IF NOT EXISTS vibe_posts_posted_at_idx
  ON public.vibe_posts (posted_at DESC);

CREATE INDEX IF NOT EXISTS vibe_posts_author_idx
  ON public.vibe_posts (author_id)
  WHERE author_id IS NOT NULL;

-- ゲスト投稿 INSERT（認証ユーザー本人）
DROP POLICY IF EXISTS "vibe_posts_insert_guest" ON public.vibe_posts;
CREATE POLICY "vibe_posts_insert_guest" ON public.vibe_posts
  FOR INSERT TO authenticated
  WITH CHECK (
    is_guest_post = TRUE
    AND author_id = auth.uid()
  );

-- Places 由来の店舗キャッシュ（オーナー未設定）
DROP POLICY IF EXISTS "shops_insert_from_places" ON public.shops;
CREATE POLICY "shops_insert_from_places" ON public.shops
  FOR INSERT TO authenticated
  WITH CHECK (
    google_place_id IS NOT NULL
    AND owner_id IS NULL
  );

DROP POLICY IF EXISTS "shops_update_place_cache" ON public.shops;
CREATE POLICY "shops_update_place_cache" ON public.shops
  FOR UPDATE TO authenticated
  USING (google_place_id IS NOT NULL)
  WITH CHECK (google_place_id IS NOT NULL);

-- 投稿メディア用ストレージ
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-media', 'post-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "post_media_public_read" ON storage.objects;
CREATE POLICY "post_media_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'post-media');

DROP POLICY IF EXISTS "post_media_insert_own" ON storage.objects;
CREATE POLICY "post_media_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "post_media_delete_own" ON storage.objects;
CREATE POLICY "post_media_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'post-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 行くかも → ゲスト投稿者へ（集計件数付き）
CREATE OR REPLACE FUNCTION public.notify_post_interest_created(p_interest_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_shop_id UUID;
  v_post_id UUID;
  v_owner_id UUID;
  v_author_id UUID;
  v_is_guest BOOLEAN;
  v_shop_name TEXT;
  v_interest_count INT;
BEGIN
  SELECT i.user_id, i.shop_id, i.vibe_post_id, s.owner_id, s.name,
         vp.author_id, COALESCE(vp.is_guest_post, FALSE)
  INTO v_user_id, v_shop_id, v_post_id, v_owner_id, v_shop_name,
       v_author_id, v_is_guest
  FROM public.interests i
  JOIN public.shops s ON s.id = i.shop_id
  JOIN public.vibe_posts vp ON vp.id = i.vibe_post_id
  WHERE i.id = p_interest_id;

  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  IF v_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT COUNT(*)::INT INTO v_interest_count
  FROM public.interests i
  WHERE i.vibe_post_id = v_post_id;

  IF v_is_guest AND v_author_id IS NOT NULL AND v_author_id IS DISTINCT FROM v_user_id THEN
    INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
    VALUES (
      v_author_id,
      'guest_post_interest',
      '今夜行くかもが届きました',
      'あなたの投稿で' || v_interest_count || '人が今夜行くかもしました',
      '/shop/' || v_shop_id,
      jsonb_build_object(
        'shop_id', v_shop_id,
        'post_id', v_post_id,
        'interest_id', p_interest_id,
        'interest_count', v_interest_count
      )
    );
    RETURN;
  END IF;

  IF v_owner_id IS NULL OR v_owner_id = v_user_id THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
  VALUES (
    v_owner_id,
    'post_interest',
    '行くかもが届きました',
    v_shop_name || 'への関心が1件追加されました',
    '/owner/dashboard',
    jsonb_build_object('shop_id', v_shop_id, 'post_id', v_post_id, 'interest_id', p_interest_id)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_post_interest_created(UUID) TO authenticated;

-- Realtime（vibe_posts の変更をクライアントで購読）
ALTER PUBLICATION supabase_realtime ADD TABLE public.vibe_posts;
