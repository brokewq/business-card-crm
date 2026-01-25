
-- Run this in your Supabase SQL Editor to fix the missing card images issue

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('card-images', 'card-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable RLS on objects (good practice, though usually enabled by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow Authenticated Users to Upload Images
CREATE POLICY "Users can upload card images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'card-images' AND
    auth.role() = 'authenticated'
  );

-- 4. Policy: Allow Public to View Images
CREATE POLICY "Anyone can view card images" ON storage.objects
  FOR SELECT USING (bucket_id = 'card-images');

-- 5. Policy: Users can update/delete their own images (Optional but recommended)
CREATE POLICY "Users can update own images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'card-images' AND 
    auth.uid() = owner_id
  );

CREATE POLICY "Users can delete own images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'card-images' AND 
    auth.uid() = owner_id
  );
