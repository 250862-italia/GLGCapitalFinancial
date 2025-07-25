-- Enable MFA Options
-- This script helps configure multi-factor authentication options
-- Execute this in Supabase SQL Editor

-- Step 1: Check current MFA settings
SELECT 
    name,
    value,
    description
FROM auth.config 
WHERE name LIKE '%mfa%' OR name LIKE '%totp%' OR name LIKE '%factor%';

-- Step 2: Create MFA-related functions and tables (if needed)

-- Create a function to check if user has MFA enabled
CREATE OR REPLACE FUNCTION public.user_has_mfa_enabled(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
    has_mfa boolean;
BEGIN
    -- Check if user has any MFA factors
    SELECT EXISTS(
        SELECT 1 
        FROM auth.mfa_factors 
        WHERE user_id = user_uuid 
        AND status = 'verified'
    ) INTO has_mfa;
    
    RETURN has_mfa;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a function to get MFA status for a user
CREATE OR REPLACE FUNCTION public.get_user_mfa_status(user_uuid uuid)
RETURNS json AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'user_id', user_uuid,
        'has_mfa_enabled', public.user_has_mfa_enabled(user_uuid),
        'mfa_factors', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'type', factor_type,
                    'status', status,
                    'created_at', created_at
                )
            )
            FROM auth.mfa_factors 
            WHERE user_id = user_uuid
        ),
        'recommended', true
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create a view for MFA statistics
CREATE OR REPLACE VIEW public.mfa_statistics AS
SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN public.user_has_mfa_enabled(id) THEN 1 END) as users_with_mfa,
    ROUND(
        COUNT(CASE WHEN public.user_has_mfa_enabled(id) THEN 1 END) * 100.0 / COUNT(*), 
        2
    ) as mfa_adoption_percentage
FROM auth.users;

-- Step 5: Verify the functions were created
SELECT 
    proname as function_name,
    proschema as schema_name
FROM pg_proc 
WHERE proname IN ('user_has_mfa_enabled', 'get_user_mfa_status') 
AND proschema = 'public';

-- Step 6: Test the MFA functions
SELECT public.get_user_mfa_status('00000000-0000-0000-0000-000000000000') as test_mfa_status; 