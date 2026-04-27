INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'contestants',
  'contestants',
  true,
  4194304,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public can view contestant images" ON storage.objects;
CREATE POLICY "Public can view contestant images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'contestants');
