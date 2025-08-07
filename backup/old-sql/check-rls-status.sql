-- Check RLS Status for All Tables
-- This script shows which tables have RLS enabled and which have policies

-- Check RLS status on all public tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs', 'notes'
    )
ORDER BY tablename;

-- Check which tables have RLS policies
SELECT 
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
        'profiles', 'team_members', 'audit_logs', 'notes'
    )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Show tables that have policies but RLS is disabled (SECURITY ISSUE)
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count,
    STRING_AGG(p.policyname, ', ') as policies
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public' 
    AND t.tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs', 'notes'
    )
    AND t.rowsecurity = false
    AND p.policyname IS NOT NULL
GROUP BY t.schemaname, t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- Show tables that have RLS enabled but no policies (might need policies)
SELECT 
    t.schemaname,
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.schemaname = p.schemaname AND t.tablename = p.tablename
WHERE t.schemaname = 'public' 
    AND t.tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs', 'notes'
    )
    AND t.rowsecurity = true
GROUP BY t.schemaname, t.tablename, t.rowsecurity
HAVING COUNT(p.policyname) = 0
ORDER BY t.tablename; 