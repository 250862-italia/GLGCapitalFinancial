-- Fix Function Search Path Mutable
-- Execute this script in Supabase SQL Editor

-- Step 1: Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Step 2: Recreate the function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Step 3: Verify the function was created correctly
SELECT 
    proname as function_name,
    proschema as schema_name,
    proconfig as search_path
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND proschema = 'public';

-- Step 4: Test the function (optional)
-- This will show if the search_path is properly set
SELECT 
    p.proname,
    p.proconfig,
    CASE 
        WHEN p.proconfig IS NULL THEN 'No search_path set'
        WHEN array_position(p.proconfig, 'search_path=public') IS NOT NULL THEN 'search_path=public set'
        ELSE 'Other search_path configuration'
    END as search_path_status
FROM pg_proc p
WHERE p.proname = 'update_updated_at_column'; 