-- ゲストが自分の投稿を編集・削除できる RLS
-- anonymous-auth-rls.sql 実行後に Supabase SQL Editor で実行してください。

DROP POLICY IF EXISTS "vibe_posts_update_own_guest" ON public.vibe_posts;
CREATE POLICY "vibe_posts_update_own_guest" ON public.vibe_posts
  FOR UPDATE TO authenticated
  USING (
    is_guest_post = TRUE
    AND author_id = auth.uid()
  )
  WITH CHECK (
    is_guest_post = TRUE
    AND author_id = auth.uid()
  );

DROP POLICY IF EXISTS "vibe_posts_delete_own_guest" ON public.vibe_posts;
CREATE POLICY "vibe_posts_delete_own_guest" ON public.vibe_posts
  FOR DELETE TO authenticated
  USING (
    is_guest_post = TRUE
    AND author_id = auth.uid()
  );

GRANT UPDATE, DELETE ON public.vibe_posts TO authenticated;
