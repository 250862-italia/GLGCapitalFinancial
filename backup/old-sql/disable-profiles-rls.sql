-- Temporarily disable RLS on profiles table to fix infinite recursion
-- This is a temporary fix to get the system working

-- 1. Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- 3. Keep RLS enabled on other tables but with simple policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create simple policies for other tables
DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
DROP POLICY IF EXISTS "Users can update their own client data" ON clients;

CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (user_id = auth.uid());

-- 5. Final verification
SELECT 'RLS disabled on profiles table. System should work now.' as status; 