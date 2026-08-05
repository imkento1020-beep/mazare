-- 店舗座標 (latitude / longitude)
-- Supabase Dashboard → SQL Editor で実行

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS latitude NUMERIC,
  ADD COLUMN IF NOT EXISTS longitude NUMERIC;

CREATE INDEX IF NOT EXISTS shops_coordinates_idx
  ON public.shops (latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
