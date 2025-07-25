-- Fix Profiles Table Structure
-- Execute this script in Supabase SQL Editor

-- Step 1: Add user_id column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE profiles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added user_id column to profiles table';
    ELSE
        RAISE NOTICE 'user_id column already exists in profiles table';
    END IF;
END $$;

-- Step 2: Update existing profiles to set user_id = id
UPDATE profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Step 3: Make user_id NOT NULL after setting values
ALTER TABLE profiles ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Step 5: Verify the structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 6: Show sample data
SELECT id, user_id, name, email, role 
FROM profiles 
LIMIT 5; 