-- ゲスト投稿: 今夜の回数・ドリンク（Supabase SQL Editor で実行）

ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS stop_number INTEGER CHECK (stop_number IS NULL OR (stop_number >= 1 AND stop_number <= 30)),
  ADD COLUMN IF NOT EXISTS drink_name TEXT,
  ADD COLUMN IF NOT EXISTS drink_cups INTEGER CHECK (drink_cups IS NULL OR (drink_cups >= 1 AND drink_cups <= 99));
