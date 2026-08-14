-- チェックイン & スタッフ招待
-- Supabase Dashboard → SQL Editor で実行

-- ============================================================
-- 1. チェックイン (shop_checkins)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  vibe_post_id UUID REFERENCES public.vibe_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shop_checkins_shop_id_created_at_idx
  ON public.shop_checkins (shop_id, created_at DESC);

CREATE INDEX IF NOT EXISTS shop_checkins_user_id_created_at_idx
  ON public.shop_checkins (user_id, created_at DESC);

ALTER TABLE public.shop_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_checkins_select_own" ON public.shop_checkins;
CREATE POLICY "shop_checkins_select_own" ON public.shop_checkins
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "shop_checkins_select_shop_owner" ON public.shop_checkins;
CREATE POLICY "shop_checkins_select_shop_owner" ON public.shop_checkins
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_checkins.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );

DROP POLICY IF EXISTS "shop_checkins_insert_own" ON public.shop_checkins;
CREATE POLICY "shop_checkins_insert_own" ON public.shop_checkins
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT ON public.shop_checkins TO authenticated;

-- profiles に表示名（チェックイン来店者表示用）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT;

DROP POLICY IF EXISTS "profiles_select_shop_checkin_guests" ON public.profiles;
CREATE POLICY "profiles_select_shop_checkin_guests" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.shop_checkins sc
      JOIN public.shops s ON s.id = sc.shop_id
      WHERE sc.user_id = profiles.id
        AND (
          s.owner_id = auth.uid()
          OR auth.uid() = ANY (s.staff_ids)
        )
    )
  );

-- ============================================================
-- 2. スタッフ招待 (shop_staff_invites)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.shop_staff_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'revoked')),
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE (shop_id, email)
);

CREATE INDEX IF NOT EXISTS shop_staff_invites_email_status_idx
  ON public.shop_staff_invites (lower(email), status);

ALTER TABLE public.shop_staff_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shop_staff_invites_select_owner" ON public.shop_staff_invites;
CREATE POLICY "shop_staff_invites_select_owner" ON public.shop_staff_invites
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_staff_invites.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "shop_staff_invites_select_invitee" ON public.shop_staff_invites;
CREATE POLICY "shop_staff_invites_select_invitee" ON public.shop_staff_invites
  FOR SELECT TO authenticated
  USING (
    lower(trim(email)) = lower(trim(coalesce(auth.jwt()->>'email', '')))
  );

DROP POLICY IF EXISTS "shop_staff_invites_insert_owner" ON public.shop_staff_invites;
CREATE POLICY "shop_staff_invites_insert_owner" ON public.shop_staff_invites
  FOR INSERT TO authenticated
  WITH CHECK (
    invited_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_staff_invites.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "shop_staff_invites_update_owner" ON public.shop_staff_invites;
CREATE POLICY "shop_staff_invites_update_owner" ON public.shop_staff_invites
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = shop_staff_invites.shop_id
        AND shops.owner_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE ON public.shop_staff_invites TO authenticated;

-- ============================================================
-- 3. スタッフ招待の承認（RPC）
-- ============================================================

CREATE OR REPLACE FUNCTION public.accept_staff_invite(p_invite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.shop_staff_invites%ROWTYPE;
  v_email TEXT;
BEGIN
  v_email := lower(trim(coalesce(auth.jwt()->>'email', '')));
  IF v_email = '' THEN
    RAISE EXCEPTION 'メールアドレスが確認できません';
  END IF;

  SELECT * INTO v_invite
  FROM public.shop_staff_invites
  WHERE id = p_invite_id
    AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION '招待が見つからないか、既に処理済みです';
  END IF;

  IF lower(trim(v_invite.email)) <> v_email THEN
    RAISE EXCEPTION 'この招待は別のメールアドレス向けです';
  END IF;

  UPDATE public.shops
  SET staff_ids = (
    SELECT ARRAY(
      SELECT DISTINCT unnest(staff_ids || ARRAY[auth.uid()])
    )
  )
  WHERE id = v_invite.shop_id;

  UPDATE public.shop_staff_invites
  SET
    status = 'accepted',
    accepted_by = auth.uid(),
    accepted_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

REVOKE ALL ON FUNCTION public.accept_staff_invite(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(UUID) TO authenticated;

-- ============================================================
-- 4. スタッフも投稿できるよう RLS を拡張
-- ============================================================

DROP POLICY IF EXISTS "vibe_posts_insert_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_insert_owner" ON public.vibe_posts
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );

DROP POLICY IF EXISTS "vibe_posts_update_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_update_owner" ON public.vibe_posts
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );

DROP POLICY IF EXISTS "vibe_posts_delete_owner" ON public.vibe_posts;
CREATE POLICY "vibe_posts_delete_owner" ON public.vibe_posts
  FOR DELETE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.shops
      WHERE shops.id = vibe_posts.shop_id
        AND (
          shops.owner_id = auth.uid()
          OR auth.uid() = ANY (shops.staff_ids)
        )
    )
  );
