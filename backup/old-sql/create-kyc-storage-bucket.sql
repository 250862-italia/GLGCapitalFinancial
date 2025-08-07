-- Create storage bucket for KYC documents if it doesn't exist
-- This script should be run in the Supabase SQL editor

-- Check if the bucket exists
DO $$
BEGIN
    -- Create the kyc-documents bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
    VALUES (
        'kyc-documents',
        'kyc-documents',
        true,
        ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        10485760  -- 10MB limit
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'KYC documents storage bucket created or already exists';
END $$;

-- Create RLS policies for the kyc-documents bucket
-- Allow authenticated users to upload their own KYC documents
CREATE POLICY IF NOT EXISTS "Users can upload their own KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own KYC documents
CREATE POLICY IF NOT EXISTS "Users can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own KYC documents
CREATE POLICY IF NOT EXISTS "Users can update their own KYC documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own KYC documents
CREATE POLICY IF NOT EXISTS "Users can delete their own KYC documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all KYC documents
CREATE POLICY IF NOT EXISTS "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin')
    )
);

-- Allow admins to manage all KYC documents
CREATE POLICY IF NOT EXISTS "Admins can manage all KYC documents"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin')
    )
)
WITH CHECK (
    bucket_id = 'kyc-documents' AND
    EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid() 
        AND auth.users.raw_user_meta_data->>'role' IN ('admin', 'superadmin')
    )
);

-- Ensure the kyc_documents column exists in the clients table
DO $$
BEGIN
    -- Add kyc_documents column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'clients' 
        AND column_name = 'kyc_documents'
    ) THEN
        ALTER TABLE clients ADD COLUMN kyc_documents JSONB DEFAULT '[]';
        RAISE NOTICE 'Added kyc_documents column to clients table';
    ELSE
        RAISE NOTICE 'kyc_documents column already exists in clients table';
    END IF;
END $$; 