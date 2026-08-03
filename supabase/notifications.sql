-- 通知機能
-- Supabase Dashboard → SQL Editor で実行

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON public.notifications (user_id)
  WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- 新規投稿 → お気に入り登録者・過去に行くかもしたゲストへ
CREATE OR REPLACE FUNCTION public.notify_shop_post_created(p_post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_shop_id UUID;
  v_comment TEXT;
  v_shop_name TEXT;
  v_owner_id UUID;
BEGIN
  SELECT vp.shop_id, vp.comment, s.name, s.owner_id
  INTO v_shop_id, v_comment, v_shop_name, v_owner_id
  FROM public.vibe_posts vp
  JOIN public.shops s ON s.id = vp.shop_id
  WHERE vp.id = p_post_id;

  IF v_shop_id IS NULL THEN
    RETURN;
  END IF;

  IF v_owner_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
  SELECT
    fs.user_id,
    'favorite_shop_posted',
    v_shop_name || 'が今夜の空気を発信',
    LEFT(v_comment, 120),
    '/shop/' || v_shop_id,
    jsonb_build_object('shop_id', v_shop_id, 'post_id', p_post_id)
  FROM public.favorite_shops fs
  WHERE fs.shop_id = v_shop_id
    AND fs.user_id IS DISTINCT FROM v_owner_id;

  INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
  SELECT
    guest.user_id,
    'shop_reposted',
    '行くかもしたお店が新しい発信をしました',
    v_shop_name || ' — ' || LEFT(v_comment, 80),
    '/shop/' || v_shop_id,
    jsonb_build_object('shop_id', v_shop_id, 'post_id', p_post_id)
  FROM (
    SELECT DISTINCT i.user_id
    FROM public.interests i
    WHERE i.shop_id = v_shop_id
      AND i.user_id IS DISTINCT FROM v_owner_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.favorite_shops fs
        WHERE fs.shop_id = v_shop_id
          AND fs.user_id = i.user_id
      )
  ) guest;
END;
$$;

-- 行くかも → 店舗オーナーへ
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
  v_shop_name TEXT;
BEGIN
  SELECT i.user_id, i.shop_id, i.vibe_post_id, s.owner_id, s.name
  INTO v_user_id, v_shop_id, v_post_id, v_owner_id, v_shop_name
  FROM public.interests i
  JOIN public.shops s ON s.id = i.shop_id
  WHERE i.id = p_interest_id;

  IF v_user_id IS NULL OR v_owner_id IS NULL THEN
    RETURN;
  END IF;

  IF v_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF v_owner_id = v_user_id THEN
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

-- お気に入り登録 → 店舗オーナーへ
CREATE OR REPLACE FUNCTION public.notify_shop_favorited_created(p_favorite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_shop_id UUID;
  v_owner_id UUID;
  v_shop_name TEXT;
BEGIN
  SELECT fs.user_id, fs.shop_id, s.owner_id, s.name
  INTO v_user_id, v_shop_id, v_owner_id, v_shop_name
  FROM public.favorite_shops fs
  JOIN public.shops s ON s.id = fs.shop_id
  WHERE fs.id = p_favorite_id;

  IF v_user_id IS NULL OR v_owner_id IS NULL THEN
    RETURN;
  END IF;

  IF v_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  IF v_owner_id = v_user_id THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
  VALUES (
    v_owner_id,
    'shop_favorited',
    'お気に入りに追加されました',
    v_shop_name || 'がお気に入り登録されました',
    '/owner/dashboard',
    jsonb_build_object('shop_id', v_shop_id, 'favorite_id', p_favorite_id)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_shop_post_created(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_post_interest_created(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.notify_shop_favorited_created(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.notify_shop_post_created(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_post_interest_created(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.notify_shop_favorited_created(UUID) TO authenticated;
