-- =====================================================
-- Fix Supabase Security Warnings
-- =====================================================

-- 1. Fix Function Search Path Mutable Issue
-- =====================================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with explicit search_path and security attributes
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
    proconfig,
    CASE 
        WHEN proconfig IS NOT NULL AND array_position(proconfig, 'search_path=public') IS NOT NULL 
        THEN '✅ Fixed - search_path set to public'
        ELSE '❌ Not fixed - search_path not set'
    END as status
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- 2. Enable Leaked Password Protection
-- =====================================================

-- Note: This needs to be configured in Supabase Dashboard
-- Go to Authentication > Settings > Password Security
-- Enable "Leaked password protection"

-- =====================================================
-- 3. Enable MFA Options
-- =====================================================

-- Note: This needs to be configured in Supabase Dashboard
-- Go to Authentication > Settings > Multi-Factor Authentication
-- Enable the following options:
-- - TOTP (Time-based One-Time Password)
-- - SMS
-- - Email

-- =====================================================
-- 4. Additional Security Improvements
-- =====================================================

-- Enable RLS on all tables if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. Security Verification
-- =====================================================

-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'clients', 'packages', 'investments', 
    'team_members', 'partnerships', 'content', 'payments',
    'kyc_requests', 'informational_requests', 'analytics',
    'notifications', 'email_queue'
)
ORDER BY tablename;

-- Check function security
SELECT 
    proname,
    prosecdef as security_definer,
    CASE 
        WHEN prosecdef THEN '✅ SECURITY DEFINER'
        ELSE '❌ SECURITY INVOKER'
    END as security_status,
    proconfig
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- 6. Summary Report
-- =====================================================

SELECT 
    'Function Search Path' as issue,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'update_updated_at_column' 
            AND proconfig IS NOT NULL 
            AND array_position(proconfig, 'search_path=public') IS NOT NULL
        ) THEN '✅ FIXED'
        ELSE '❌ NEEDS ATTENTION'
    END as status
UNION ALL
SELECT 
    'RLS Enabled' as issue,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND rowsecurity = false
            AND tablename IN (
                'profiles', 'clients', 'packages', 'investments', 
                'team_members', 'partnerships', 'content', 'payments',
                'kyc_requests', 'informational_requests', 'analytics',
                'notifications', 'email_queue'
            )
        ) THEN '✅ ALL TABLES SECURED'
        ELSE '❌ SOME TABLES UNSECURED'
    END as status; 