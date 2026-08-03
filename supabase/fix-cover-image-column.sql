-- cover_image が TEXT[] 型のまま残っている場合の修正
-- malformed array literal エラーが出る場合に実行

ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS cover_images TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'shops'
      AND column_name = 'cover_image'
      AND udt_name = '_text'
  ) THEN
    UPDATE public.shops
    SET cover_images = cover_image
    WHERE cover_image IS NOT NULL
      AND cardinality(cover_image) > 0
      AND (cover_images IS NULL OR cover_images = '{}');

    ALTER TABLE public.shops DROP COLUMN cover_image;
    ALTER TABLE public.shops ADD COLUMN cover_image TEXT;
  END IF;
END $$;
