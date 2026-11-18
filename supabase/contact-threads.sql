-- 連絡承諾後の1対1 DM（contact_requests が accepted のときのみ）
-- Supabase Dashboard → SQL Editor で contact-requests.sql の後に実行

CREATE TABLE IF NOT EXISTS public.contact_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_request_id UUID NOT NULL UNIQUE
    REFERENCES public.contact_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_threads_request_idx
  ON public.contact_threads (contact_request_id);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.contact_threads(id) ON DELETE CASCADE,
  sender_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (
    char_length(trim(body)) > 0 AND char_length(body) <= 2000
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS contact_messages_thread_created_idx
  ON public.contact_messages (thread_id, created_at ASC);

ALTER TABLE public.contact_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 参加者のみスレッド参照
DROP POLICY IF EXISTS "contact_threads_select_participants" ON public.contact_threads;
CREATE POLICY "contact_threads_select_participants" ON public.contact_threads
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.contact_requests cr
      WHERE cr.id = contact_request_id
        AND cr.status = 'accepted'
        AND (auth.uid() = cr.from_user_id OR auth.uid() = cr.to_user_id)
    )
  );

DROP POLICY IF EXISTS "contact_messages_select_participants" ON public.contact_messages;
CREATE POLICY "contact_messages_select_participants" ON public.contact_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.contact_threads t
      JOIN public.contact_requests cr ON cr.id = t.contact_request_id
      WHERE t.id = thread_id
        AND cr.status = 'accepted'
        AND (auth.uid() = cr.from_user_id OR auth.uid() = cr.to_user_id)
    )
  );

DROP POLICY IF EXISTS "contact_messages_insert_participant" ON public.contact_messages;
CREATE POLICY "contact_messages_insert_participant" ON public.contact_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_user_id
    AND EXISTS (
      SELECT 1
      FROM public.contact_threads t
      JOIN public.contact_requests cr ON cr.id = t.contact_request_id
      WHERE t.id = thread_id
        AND cr.status = 'accepted'
        AND (auth.uid() = cr.from_user_id OR auth.uid() = cr.to_user_id)
    )
  );

GRANT SELECT ON public.contact_threads TO authenticated;
GRANT SELECT, INSERT ON public.contact_messages TO authenticated;

COMMENT ON TABLE public.contact_threads IS 'Accepted contact request DM thread (1:1)';
COMMENT ON TABLE public.contact_messages IS 'DM messages within an accepted contact thread';

-- スレッド作成＋初回メッセージ（contact_requests.message）
CREATE OR REPLACE FUNCTION public.open_contact_thread_for_request(p_request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cr contact_requests%ROWTYPE;
  v_thread_id UUID;
BEGIN
  SELECT * INTO v_cr FROM public.contact_requests WHERE id = p_request_id;
  IF NOT FOUND OR v_cr.status <> 'accepted' THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.contact_threads (contact_request_id)
  VALUES (p_request_id)
  ON CONFLICT (contact_request_id) DO NOTHING;

  SELECT id INTO v_thread_id
  FROM public.contact_threads
  WHERE contact_request_id = p_request_id;

  IF v_thread_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.contact_messages WHERE thread_id = v_thread_id
  ) AND char_length(trim(v_cr.message)) > 0 THEN
    INSERT INTO public.contact_messages (thread_id, sender_user_id, body)
    VALUES (v_thread_id, v_cr.from_user_id, trim(v_cr.message));
  END IF;

  RETURN v_thread_id;
END;
$$;

REVOKE ALL ON FUNCTION public.open_contact_thread_for_request(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.open_contact_thread_for_request(UUID) TO authenticated;

-- 承諾時にスレッドを開く（クライアント／バックフィル用）
CREATE OR REPLACE FUNCTION public.ensure_contact_thread(p_request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cr contact_requests%ROWTYPE;
BEGIN
  SELECT * INTO v_cr FROM public.contact_requests WHERE id = p_request_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  IF auth.uid() IS NULL THEN RETURN NULL; END IF;
  IF auth.uid() <> v_cr.from_user_id AND auth.uid() <> v_cr.to_user_id THEN
    RETURN NULL;
  END IF;
  IF v_cr.status <> 'accepted' THEN RETURN NULL; END IF;
  RETURN public.open_contact_thread_for_request(p_request_id);
END;
$$;

REVOKE ALL ON FUNCTION public.ensure_contact_thread(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ensure_contact_thread(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_contact_request_accepted(p_request_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_cr contact_requests%ROWTYPE;
  v_to_name TEXT;
  v_shop_name TEXT;
  v_thread_id UUID;
BEGIN
  SELECT * INTO v_cr FROM public.contact_requests WHERE id = p_request_id;
  IF NOT FOUND OR v_cr.status <> 'accepted' THEN RETURN; END IF;

  v_thread_id := public.open_contact_thread_for_request(p_request_id);

  SELECT COALESCE(NULLIF(trim(p.display_name), ''), 'ゲスト')
  INTO v_to_name
  FROM public.profiles p WHERE p.id = v_cr.to_user_id;

  SELECT COALESCE(s.name, 'お店') INTO v_shop_name
  FROM public.shops s WHERE s.id = v_cr.shop_id;

  INSERT INTO public.notifications (
    user_id, type, title, body, href, metadata
  ) VALUES (
    v_cr.from_user_id,
    'contact_request_accepted',
    v_to_name || 'さんが連絡を承諾しました',
    v_shop_name || ' · メッセージでやり取りできます',
    CASE
      WHEN v_thread_id IS NOT NULL THEN '/messages/' || v_thread_id::text
      ELSE '/messages'
    END,
    jsonb_build_object(
      'contact_request_id', p_request_id,
      'thread_id', v_thread_id,
      'shop_id', v_cr.shop_id
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_contact_request_accepted(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_contact_request_accepted(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_contact_message_created(p_message_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_msg contact_messages%ROWTYPE;
  v_cr contact_requests%ROWTYPE;
  v_recipient UUID;
  v_from_name TEXT;
BEGIN
  SELECT * INTO v_msg FROM public.contact_messages WHERE id = p_message_id;
  IF NOT FOUND THEN RETURN; END IF;

  SELECT cr.* INTO v_cr
  FROM public.contact_threads t
  JOIN public.contact_requests cr ON cr.id = t.contact_request_id
  WHERE t.id = v_msg.thread_id;

  IF NOT FOUND OR v_cr.status <> 'accepted' THEN RETURN; END IF;

  IF v_msg.sender_user_id = v_cr.from_user_id THEN
    v_recipient := v_cr.to_user_id;
  ELSE
    v_recipient := v_cr.from_user_id;
  END IF;

  IF v_recipient IS NULL OR v_recipient = v_msg.sender_user_id THEN RETURN; END IF;

  SELECT COALESCE(NULLIF(trim(p.display_name), ''), 'ゲスト')
  INTO v_from_name
  FROM public.profiles p WHERE p.id = v_msg.sender_user_id;

  INSERT INTO public.notifications (
    user_id, type, title, body, href, metadata
  ) VALUES (
    v_recipient,
    'contact_message',
    v_from_name || 'さんからメッセージ',
    LEFT(v_msg.body, 120),
    '/messages/' || v_msg.thread_id::text,
    jsonb_build_object(
      'thread_id', v_msg.thread_id,
      'message_id', p_message_id,
      'from_user_id', v_msg.sender_user_id
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_contact_message_created(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_contact_message_created(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.on_contact_request_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS DISTINCT FROM 'accepted') THEN
    PERFORM public.notify_contact_request_accepted(NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_request_status_change_trg ON public.contact_requests;
CREATE TRIGGER contact_request_status_change_trg
  AFTER UPDATE OF status ON public.contact_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.on_contact_request_status_change();

CREATE OR REPLACE FUNCTION public.on_contact_message_insert_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.notify_contact_message_created(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_message_insert_notify_trg ON public.contact_messages;
CREATE TRIGGER contact_message_insert_notify_trg
  AFTER INSERT ON public.contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.on_contact_message_insert_notify();

-- 既読管理（未読バッジ用）
CREATE TABLE IF NOT EXISTS public.contact_thread_reads (
  thread_id UUID NOT NULL REFERENCES public.contact_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

ALTER TABLE public.contact_thread_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contact_thread_reads_select_own" ON public.contact_thread_reads;
CREATE POLICY "contact_thread_reads_select_own" ON public.contact_thread_reads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_thread_reads_insert_own" ON public.contact_thread_reads;
CREATE POLICY "contact_thread_reads_insert_own" ON public.contact_thread_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "contact_thread_reads_update_own" ON public.contact_thread_reads;
CREATE POLICY "contact_thread_reads_update_own" ON public.contact_thread_reads
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.contact_thread_reads TO authenticated;

CREATE OR REPLACE FUNCTION public.fetch_unread_contact_message_count()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(COUNT(*)::int, 0)
  FROM public.contact_messages m
  INNER JOIN public.contact_threads t ON t.id = m.thread_id
  INNER JOIN public.contact_requests cr ON cr.id = t.contact_request_id
  LEFT JOIN public.contact_thread_reads r
    ON r.thread_id = t.id AND r.user_id = auth.uid()
  WHERE auth.uid() IS NOT NULL
    AND cr.status = 'accepted'
    AND (cr.from_user_id = auth.uid() OR cr.to_user_id = auth.uid())
    AND m.sender_user_id <> auth.uid()
    AND m.created_at > COALESCE(r.last_read_at, TIMESTAMPTZ '1970-01-01');
$$;

REVOKE ALL ON FUNCTION public.fetch_unread_contact_message_count() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fetch_unread_contact_message_count() TO authenticated;