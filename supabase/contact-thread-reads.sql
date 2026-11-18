-- 既読・未読バッジ（contact-threads.sql 未再実行の場合のみ）
-- contact-threads.sql 末尾と同じ内容です。

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