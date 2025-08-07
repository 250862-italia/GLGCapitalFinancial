-- Remove all automatic triggers that might be causing issues

-- 1. Drop all triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop all triggers on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_profile_created ON profiles;

-- 3. Drop all triggers on clients
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;

-- 4. Drop all functions that might be causing issues
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_new_profile() CASCADE;

-- 5. Keep only the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- 6. Recreate only the update triggers (no automatic creation triggers)
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Verify the setup
SELECT 'All automatic triggers removed successfully!' as status; 