-- 投稿者への連絡（マザる / マッチング申請）
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vibe_post_id UUID NOT NULL REFERENCES public.vibe_posts(id) ON DELETE CASCADE,
  shop_id UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '' CHECK (char_length(message) <= 280),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE (from_user_id, vibe_post_id)
);

CREATE INDEX IF NOT EXISTS contact_requests_to_user_idx
  ON public.contact_requests (to_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_requests_post_idx
  ON public.contact_requests (vibe_post_id);

ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_requests_select_participants" ON public.contact_requests;
CREATE POLICY "contact_requests_select_participants" ON public.contact_requests
  FOR SELECT TO authenticated
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "contact_requests_insert_own" ON public.contact_requests;
CREATE POLICY "contact_requests_insert_own" ON public.contact_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = from_user_id AND from_user_id <> to_user_id);

DROP POLICY IF EXISTS "contact_requests_update_recipient" ON public.contact_requests;
CREATE POLICY "contact_requests_update_recipient" ON public.contact_requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = to_user_id)
  WITH CHECK (auth.uid() = to_user_id);

GRANT SELECT, INSERT, UPDATE ON public.contact_requests TO authenticated;

COMMENT ON TABLE public.contact_requests IS 'Guest post author contact / matching requests';

CREATE OR REPLACE FUNCTION public.notify_contact_request_created(p_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row contact_requests%ROWTYPE;
  v_from_name TEXT;
  v_shop_name TEXT;
BEGIN
  SELECT * INTO v_row FROM public.contact_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT COALESCE(NULLIF(trim(p.display_name), ''), 'ゲスト')
  INTO v_from_name
  FROM public.profiles p WHERE p.id = v_row.from_user_id;

  SELECT COALESCE(s.name, 'お店') INTO v_shop_name
  FROM public.shops s WHERE s.id = v_row.shop_id;

  INSERT INTO public.notifications (
    user_id, type, title, body, href, metadata
  ) VALUES (
    v_row.to_user_id,
    'contact_request',
  v_from_name || 'さんから連絡',
    LEFT(v_row.message, 120),
    '/mypage#contacts',
    jsonb_build_object(
      'contact_request_id', p_request_id,
      'post_id', v_row.vibe_post_id,
      'shop_id', v_row.shop_id,
      'from_user_id', v_row.from_user_id
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_contact_request_created(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_contact_request_created(UUID) TO authenticated;
