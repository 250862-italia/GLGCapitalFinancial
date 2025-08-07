-- Fix RLS Security Issues
-- Enable Row Level Security on all tables that have policies but RLS is disabled

-- 1. Enable RLS on analytics table
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on content table
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on email_queue table
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- 5. Enable RLS on informational_requests table
ALTER TABLE public.informational_requests ENABLE ROW LEVEL SECURITY;

-- 6. Enable RLS on investments table
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- 7. Enable RLS on kyc_requests table
ALTER TABLE public.kyc_requests ENABLE ROW LEVEL SECURITY;

-- 8. Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 9. Enable RLS on packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- 10. Enable RLS on partnerships table
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- 11. Enable RLS on payments table
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 12. Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 13. Enable RLS on team_members table
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- 14. Enable RLS on audit_logs table (no policies but should have RLS)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'analytics', 'clients', 'content', 'email_queue', 
        'informational_requests', 'investments', 'kyc_requests', 
        'notifications', 'packages', 'partnerships', 'payments', 
        'profiles', 'team_members', 'audit_logs'
    )
ORDER BY tablename;

-- Show all RLS policies
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
WHERE schemaname = 'public'
ORDER BY tablename, policyname; 