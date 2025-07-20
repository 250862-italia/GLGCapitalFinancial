-- Fix Client Creation - Automatic Trigger
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
        phone,
        address,
        city,
        country,
        postal_code,
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
        COALESCE(NEW.phone, ''),
        COALESCE(NEW.address, ''),
        COALESCE(NEW.city, ''),
        COALESCE(NEW.country, ''),
        COALESCE(NEW.postal_code, ''),
        'CLI-' || substr(NEW.id::text, 1, 8) || '-' || floor(random() * 1000)::text,
        'active',
        'moderate',
        '{}',
        0.00,
        COALESCE(NEW.created_at, NOW()),
        COALESCE(NEW.updated_at, NOW())
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create trigger for new profile creation
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
    AFTER INSERT ON profiles
    FOR EACH ROW 
    WHEN (NEW.role = 'user')
    EXECUTE FUNCTION handle_new_profile();

-- 3. Create client records for existing profiles that don't have client records
INSERT INTO clients (
    user_id, 
    profile_id, 
    first_name, 
    last_name, 
    email, 
    phone,
    address,
    city,
    country,
    postal_code,
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
    COALESCE(p.phone, ''),
    COALESCE(p.address, ''),
    COALESCE(p.city, ''),
    COALESCE(p.country, ''),
    COALESCE(p.postal_code, ''),
    'CLI-' || substr(p.id::text, 1, 8) || '-' || floor(random() * 1000)::text,
    'active',
    'moderate',
    '{}',
    0.00,
    COALESCE(p.created_at, NOW()),
    COALESCE(p.updated_at, NOW())
FROM profiles p
LEFT JOIN clients c ON p.id = c.user_id
WHERE c.user_id IS NULL
AND p.role = 'user'
ON CONFLICT (user_id) DO NOTHING;

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

-- 5. Show recent clients
SELECT 
    'Recent clients:' as info,
    c.first_name,
    c.last_name,
    c.email,
    c.created_at
FROM clients c
ORDER BY c.created_at DESC
LIMIT 5; 