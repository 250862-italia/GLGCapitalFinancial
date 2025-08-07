-- Check what triggers and policies still exist
-- This will help us identify what's causing the infinite recursion

-- 1. Check all triggers on profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles';

-- 2. Check all policies on profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 3. Check if RLS is enabled on profiles
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Check all functions that might be related
SELECT 
    proname,
    prosrc
FROM pg_proc 
WHERE proname LIKE '%profile%' OR proname LIKE '%user%';

-- 5. Check for any remaining triggers on auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' AND event_object_schema = 'auth'; 