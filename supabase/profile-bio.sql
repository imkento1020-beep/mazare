-- プロフィール自己紹介（100文字想定）
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT;

COMMENT ON COLUMN public.profiles.bio IS 'User bio, max ~100 chars recommended';
