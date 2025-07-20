-- 🔒 ENABLE RLS ON ALL TABLES - SECURITY FIX
-- This script fixes the critical security issue where tables have RLS policies but RLS is disabled

-- ===========================================
-- STEP 1: ENABLE RLS ON ALL AFFECTED TABLES
-- ===========================================

-- Enable RLS on analytics table
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- Enable RLS on clients table  
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Enable RLS on content table
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- Enable RLS on email_queue table
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Enable RLS on informational_requests table
ALTER TABLE public.informational_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on investments table
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on kyc_requests table
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Enable RLS on packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Enable RLS on partnerships table
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit_logs table
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 2: VERIFY RLS IS ENABLED
-- ===========================================

-- Check RLS status on all tables
SELECT 
    'RLS Status Check' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled - SECURITY ISSUE'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
    )
ORDER BY tablename;

-- ===========================================
-- STEP 3: VERIFY POLICIES ARE IN PLACE
-- ===========================================

-- Show all RLS policies by table
SELECT 
    'Policy Check' as check_type,
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
    )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ===========================================
-- STEP 4: SECURITY SUMMARY
-- ===========================================

-- Show final security status
SELECT 
    'Security Summary' as check_type,
    COUNT(*) as total_tables,
    COUNT(CASE WHEN rowsecurity THEN 1 END) as tables_with_rls,
    COUNT(CASE WHEN NOT rowsecurity THEN 1 END) as tables_without_rls,
    CASE 
        WHEN COUNT(CASE WHEN NOT rowsecurity THEN 1 END) = 0 
        THEN '✅ ALL TABLES SECURE'
        ELSE '❌ SECURITY ISSUES FOUND'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
    );

-- ===========================================
-- STEP 5: DETAILED POLICY INFORMATION
-- ===========================================

-- Show detailed policy information
SELECT 
    'Policy Details' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
    )
ORDER BY tablename, policyname; 