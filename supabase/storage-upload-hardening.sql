-- Storage: MIME とサイズ上限（API 直叩き対策の第二防御）
UPDATE storage.buckets
SET
  file_size_limit = 83886080,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime'
  ]::text[]
WHERE id = 'post-media';

UPDATE storage.buckets
SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp'
  ]::text[]
WHERE id = 'shop-images';
