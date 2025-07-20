-- Fix Client Creation Trigger
-- Run this script in Supabase SQL Editor to automatically create client records

-- 1. Create function to handle new profile creation and create client record
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate unique client code
    INSERT INTO clients (
        user_id, 
        profile_id, 
        first_name, 
        last_name, 
        email, 
        client_code, 
        status, 
        risk_profile, 
        investment_preferences, 
        total_invested,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.id,
        COALESCE(NEW.first_name, ''),
        COALESCE(NEW.last_name, ''),
        NEW.email,
        'CLI-' || substr(NEW.id::text, 1, 8) || '-' || floor(random() * 1000)::text,
        'active',
        'moderate',
        '{}',
        0.00,
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger for new profile creation
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_new_profile();

-- 3. Create client records for existing profiles that don't have client records
INSERT INTO clients (
    user_id, 
    profile_id, 
    first_name, 
    last_name, 
    email, 
    client_code, 
    status, 
    risk_profile, 
    investment_preferences, 
    total_invested,
    created_at,
    updated_at
)
SELECT 
    p.id,
    p.id,
    COALESCE(p.first_name, ''),
    COALESCE(p.last_name, ''),
    p.email,
    'CLI-' || substr(p.id::text, 1, 8) || '-' || floor(random() * 1000)::text,
    'active',
    'moderate',
    '{}',
    0.00,
    p.created_at,
    p.updated_at
FROM profiles p
LEFT JOIN clients c ON p.id = c.user_id
WHERE c.user_id IS NULL
AND p.role = 'user';

-- 4. Verify the fix
SELECT 
    'Profiles count:' as info, 
    COUNT(*) as count 
FROM profiles 
WHERE role = 'user';

SELECT 
    'Clients count:' as info, 
    COUNT(*) as count 
FROM clients;

SELECT 
    'Profiles without clients:' as info, 
    COUNT(*) as count 
FROM profiles p
LEFT JOIN clients c ON p.id = c.user_id
WHERE c.user_id IS NULL
AND p.role = 'user';

-- 5. Show success message
SELECT 'Client creation trigger fixed successfully!' as status; 