-- スタッフ招待のサイト内通知
-- Supabase Dashboard → SQL Editor で実行
-- 前提: notifications.sql / checkins-staff.sql 済み

-- 招待メールと JWT メールの trim を揃える
DROP POLICY IF EXISTS "shop_staff_invites_select_invitee" ON public.shop_staff_invites;
CREATE POLICY "shop_staff_invites_select_invitee" ON public.shop_staff_invites
  FOR SELECT TO authenticated
  USING (
    lower(trim(email)) = lower(trim(coalesce(auth.jwt()->>'email', '')))
  );

-- 招待作成時: 既にアカウントがある相手へ通知
CREATE OR REPLACE FUNCTION public.notify_staff_invite_created(p_invite_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite public.shop_staff_invites%ROWTYPE;
  v_shop_name TEXT;
  v_invitee_id UUID;
BEGIN
  SELECT * INTO v_invite
  FROM public.shop_staff_invites
  WHERE id = p_invite_id;

  IF v_invite.id IS NULL OR v_invite.status <> 'pending' THEN
    RETURN;
  END IF;

  IF v_invite.invited_by IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  SELECT name INTO v_shop_name
  FROM public.shops
  WHERE id = v_invite.shop_id;

  SELECT id INTO v_invitee_id
  FROM auth.users
  WHERE lower(trim(email)) = lower(trim(v_invite.email))
  LIMIT 1;

  IF v_invitee_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.notifications
    WHERE user_id = v_invitee_id
      AND type = 'staff_invite'
      AND metadata->>'invite_id' = p_invite_id::text
  ) THEN
    RETURN;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
  VALUES (
    v_invitee_id,
    'staff_invite',
    'スタッフとして招待されました',
    coalesce(v_shop_name, 'お店') || 'からの招待を確認してください',
    '/mypage#staff-invites',
    jsonb_build_object(
      'invite_id', p_invite_id,
      'shop_id', v_invite.shop_id
    )
  );
END;
$$;

-- ログイン後など: 未承認招待を通知に同期（アカウント作成後の招待にも対応）
CREATE OR REPLACE FUNCTION public.sync_pending_staff_invite_notifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT;
  v_count integer := 0;
  r RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN 0;
  END IF;

  v_email := lower(trim(coalesce(auth.jwt()->>'email', '')));
  IF v_email = '' THEN
    RETURN 0;
  END IF;

  FOR r IN
    SELECT i.id, i.shop_id, s.name AS shop_name
    FROM public.shop_staff_invites i
    LEFT JOIN public.shops s ON s.id = i.shop_id
    WHERE i.status = 'pending'
      AND lower(trim(i.email)) = v_email
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.notifications n
      WHERE n.user_id = auth.uid()
        AND n.type = 'staff_invite'
        AND n.metadata->>'invite_id' = r.id::text
    ) THEN
      CONTINUE;
    END IF;

    INSERT INTO public.notifications (user_id, type, title, body, href, metadata)
    VALUES (
      auth.uid(),
      'staff_invite',
      'スタッフとして招待されました',
      coalesce(r.shop_name, 'お店') || 'からの招待を確認してください',
      '/mypage#staff-invites',
      jsonb_build_object(
        'invite_id', r.id,
        'shop_id', r.shop_id
      )
    );
    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- 承認時のメール照合も trim 付きに揃え、関連通知を既読にする
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

  UPDATE public.notifications
  SET read_at = coalesce(read_at, NOW())
  WHERE user_id = auth.uid()
    AND type = 'staff_invite'
    AND metadata->>'invite_id' = p_invite_id::text
    AND read_at IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_staff_invite_created(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_pending_staff_invite_notifications() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_staff_invite(UUID) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.notify_staff_invite_created(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_pending_staff_invite_notifications() TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_staff_invite(UUID) TO authenticated;
