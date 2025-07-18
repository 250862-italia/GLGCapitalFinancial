-- Fix RLS Policies - Remove infinite recursion

-- 1. Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- 2. Create simple, non-recursive policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Create admin policy without recursion
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- 4. Fix clients policies
DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
DROP POLICY IF EXISTS "Users can update their own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert their own client data" ON clients;

CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Verify the setup
SELECT 'RLS policies fixed successfully!' as status; 