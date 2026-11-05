-- Model B: merge attitude + vibe scale (replaces single tonight_social_mood over time).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS merge_attitude TEXT,
  ADD COLUMN IF NOT EXISTS vibe_scale TEXT;

COMMENT ON COLUMN public.profiles.merge_attitude IS 'open | closed';
COMMENT ON COLUMN public.profiles.vibe_scale IS 'solo | small | lively';

UPDATE public.profiles
SET merge_attitude = 'open'
WHERE merge_attitude IS NULL AND tonight_social_mood = 'merge_welcome';

UPDATE public.profiles
SET merge_attitude = 'closed', vibe_scale = 'solo'
WHERE merge_attitude IS NULL AND tonight_social_mood = 'solo';

UPDATE public.profiles
SET vibe_scale = 'small'
WHERE vibe_scale IS NULL AND tonight_social_mood = 'pair_ok';

UPDATE public.profiles
SET vibe_scale = 'lively'
WHERE vibe_scale IS NULL AND tonight_social_mood = 'large_ok';

ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS author_merge_attitude TEXT,
  ADD COLUMN IF NOT EXISTS author_vibe_scale TEXT;

COMMENT ON COLUMN public.vibe_posts.author_merge_attitude IS 'open | closed at post time';
COMMENT ON COLUMN public.vibe_posts.author_vibe_scale IS 'solo | small | lively at post time';
