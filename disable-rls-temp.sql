-- GLG Capital Financial - Disable RLS Temporarily
-- Soluzione rapida per disabilitare RLS e risolvere infinite recursion

-- Disable RLS on all tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE investments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships DISABLE ROW LEVEL SECURITY;
ALTER TABLE content DISABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE email_queue DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'profiles', 'clients', 'packages', 'investments', 
    'team_members', 'partnerships', 'content', 'payments',
    'kyc_requests', 'informational_requests', 'analytics',
    'notifications', 'email_queue'
)
ORDER BY tablename;

-- Test access
SELECT 'Testing access to profiles...' as test;
SELECT COUNT(*) as profiles_count FROM profiles;

SELECT 'Testing access to packages...' as test;
SELECT COUNT(*) as packages_count FROM packages; 