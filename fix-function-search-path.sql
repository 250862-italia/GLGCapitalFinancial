-- Fix Function Search Path Mutable Issue
-- This fixes the security warning from Supabase Database Linter

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Verify the fix
SELECT 
    proname,
    proconfig
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 