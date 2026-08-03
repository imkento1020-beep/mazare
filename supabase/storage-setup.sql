-- Supabase Storage: 店舗カバー画像用バケット
-- Dashboard → SQL Editor で実行

INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "shop_images_public_read" ON storage.objects;
CREATE POLICY "shop_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'shop-images');

DROP POLICY IF EXISTS "shop_images_owner_upload" ON storage.objects;
CREATE POLICY "shop_images_owner_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'shop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "shop_images_owner_update" ON storage.objects;
CREATE POLICY "shop_images_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'shop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "shop_images_owner_delete" ON storage.objects;
CREATE POLICY "shop_images_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'shop-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- shops テーブル: 複数カバー画像用カラム
ALTER TABLE public.shops
  ADD COLUMN IF NOT EXISTS cover_images TEXT[] NOT NULL DEFAULT '{}';

-- cover_image が TEXT[] 型になっている場合の修正（malformed array literal の原因）
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
