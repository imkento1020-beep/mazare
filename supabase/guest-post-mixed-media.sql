-- 写真 + 動画の混合投稿（media_type = mixed）
-- Supabase SQL Editor で実行してください。

ALTER TABLE public.vibe_posts
  DROP CONSTRAINT IF EXISTS vibe_posts_media_type_check;

ALTER TABLE public.vibe_posts
  ADD CONSTRAINT vibe_posts_media_type_check
  CHECK (
    media_type IN ('image', 'video', 'mixed')
    OR media_type IS NULL
  );

COMMENT ON COLUMN public.vibe_posts.media_type IS 'image | video | mixed（写真と動画の併載）';
