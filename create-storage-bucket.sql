-- Create storage bucket for profile photos if it doesn't exist
-- This script should be run in the Supabase SQL editor

-- Check if the bucket exists
DO $$
BEGIN
    -- Create the profile-photos bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
    VALUES (
        'profile-photos',
        'profile-photos',
        true,
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        5242880  -- 5MB limit
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Profile photos storage bucket created or already exists';
END $$;

-- Create RLS policies for the profile-photos bucket
-- Allow authenticated users to upload their own photos
CREATE POLICY IF NOT EXISTS "Users can upload their own profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own photos
CREATE POLICY IF NOT EXISTS "Users can view their own profile photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own photos
CREATE POLICY IF NOT EXISTS "Users can update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photos
CREATE POLICY IF NOT EXISTS "Users can delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public access to view profile photos (for display purposes)
CREATE POLICY IF NOT EXISTS "Public can view profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

RAISE NOTICE 'Storage bucket and policies created successfully'; 