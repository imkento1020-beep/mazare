-- Snapshot of author's tonight_social_mood at post time (optional; profile is fallback).
ALTER TABLE public.vibe_posts
  ADD COLUMN IF NOT EXISTS author_tonight_social_mood TEXT;

COMMENT ON COLUMN public.vibe_posts.author_tonight_social_mood IS
  'merge_welcome | solo | pair_ok | large_ok at time of post';
