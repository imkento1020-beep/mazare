-- 投稿の表示回数（impression）カウント
-- Supabase Dashboard → SQL Editor で実行

ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_vibe_post_view(post_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.vibe_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_vibe_post_view(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_vibe_post_view(UUID) TO anon, authenticated;
