-- 投稿カード / ゲスト投稿フォーム用カラム
-- 既存の guest-post-night-out.sql 実行後に Supabase SQL Editor で実行してください。
--
-- アプリとの対応:
--   visit_order  ⇔ stop_number（何軒目）
--   drink_count  ⇔ drink_cups（今夜トータル杯数）
--   drink_name, is_guest_post, media_type は既存

ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS party_size INTEGER
    CHECK (party_size IS NULL OR (party_size >= 1 AND party_size <= 10));

-- 仕様名のエイリアス列（新規環境用・既存は stop_number / drink_cups を継続利用可）
ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS visit_order INTEGER
    CHECK (visit_order IS NULL OR (visit_order >= 1 AND visit_order <= 10)),
  ADD COLUMN IF NOT EXISTS drink_count INTEGER
    CHECK (drink_count IS NULL OR (drink_count >= 1 AND drink_count <= 99));

UPDATE public.vibe_posts
SET visit_order = stop_number
WHERE visit_order IS NULL AND stop_number IS NOT NULL;

UPDATE public.vibe_posts
SET drink_count = drink_cups
WHERE drink_count IS NULL AND drink_cups IS NOT NULL;

COMMENT ON COLUMN public.vibe_posts.stop_number IS 'visit_order: 今夜何軒目か';
COMMENT ON COLUMN public.vibe_posts.drink_cups IS 'drink_count: 今夜トータル杯数';
COMMENT ON COLUMN public.vibe_posts.party_size IS '一緒に飲んでいる人数';
