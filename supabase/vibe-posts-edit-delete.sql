-- vibe_posts の編集・削除（オーナーのみ）
-- Supabase Dashboard → SQL Editor で実行

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

GRANT UPDATE, DELETE ON public.vibe_posts TO authenticated;
