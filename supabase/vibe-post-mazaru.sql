-- 投稿の「マザる / マザらない」設定
ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS mazaru_mode TEXT,
  ADD COLUMN IF NOT EXISTS mazaru_details JSONB;

COMMENT ON COLUMN public.vibe_posts.mazaru_mode IS 'mazaru | mazaranai';
COMMENT ON COLUMN public.vibe_posts.mazaru_details IS '合流希望時の詳細（人数・男女比・雰囲気など）';
