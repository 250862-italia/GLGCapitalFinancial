-- Create Admin User for GLG Capital Financial Dashboard
-- Run this script in Supabase SQL Editor

-- 1. Create admin user in auth.users (if not exists)
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    is_super_admin
) VALUES (
    gen_random_uuid(),
    'admin@glgcapital.com',
    crypt('GLGAdmin2024!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"role": "superadmin", "first_name": "Admin", "last_name": "GLG"}',
    true
) ON CONFLICT (email) DO NOTHING;

-- 2. Get the admin user ID
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@glgcapital.com';
    
    -- 3. Create admin profile in profiles table
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        status,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin@glgcapital.com',
        'Admin GLG',
        'superadmin',
        'active',
        true,
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        role = 'superadmin',
        status = 'active',
        email_verified = true,
        updated_at = NOW();
    
    -- 4. Create admin client record
    INSERT INTO public.clients (
        user_id,
        email,
        first_name,
        last_name,
        status,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'admin@glgcapital.com',
        'Admin',
        'GLG',
        'active',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        status = 'active',
        updated_at = NOW();
        
    RAISE NOTICE 'Admin user created/updated with ID: %', admin_user_id;
END $$;

-- 5. Verify admin user exists
SELECT 
    u.id,
    u.email,
    u.raw_user_meta_data->>'role' as role,
    p.role as profile_role,
    c.status as client_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.clients c ON u.id = c.user_id
WHERE u.email = 'admin@glgcapital.com'; 