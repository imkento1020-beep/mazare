-- ユーザーの「今夜の気分」（合流可否など）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS tonight_social_mood TEXT;

COMMENT ON COLUMN public.profiles.tonight_social_mood IS
  'merge_welcome | solo | pair_ok | large_ok';
