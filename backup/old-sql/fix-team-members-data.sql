-- Fix team members data - use existing user IDs or create proper references
-- Run this script in Supabase SQL Editor

-- 1. First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 10;

-- 2. Clear existing team members data
DELETE FROM public.team_members;

-- 3. Insert team members with proper user_id references
-- We'll use the admin user ID or create team members without user_id for now
INSERT INTO public.team_members (user_id, first_name, last_name, email, role, department, status) 
SELECT 
    u.id,
    'John' as first_name,
    'Doe' as last_name,
    'john.doe@glgcapital.com' as email,
    'Senior Manager' as role,
    'Operations' as department,
    'active' as status
FROM auth.users u 
WHERE u.email = 'admin@glgcapital.com'
LIMIT 1;

INSERT INTO public.team_members (user_id, first_name, last_name, email, role, department, status) 
SELECT 
    u.id,
    'Jane' as first_name,
    'Smith' as last_name,
    'jane.smith@glgcapital.com' as email,
    'Analyst' as role,
    'Research' as department,
    'active' as status
FROM auth.users u 
WHERE u.email = 'admin@glgcapital.com'
LIMIT 1;

INSERT INTO public.team_members (user_id, first_name, last_name, email, role, department, status) 
SELECT 
    u.id,
    'Mike' as first_name,
    'Johnson' as last_name,
    'mike.johnson@glgcapital.com' as email,
    'Director' as role,
    'Sales' as department,
    'active' as status
FROM auth.users u 
WHERE u.email = 'admin@glgcapital.com'
LIMIT 1;

-- 4. Alternative: Create team members without user_id (if the above doesn't work)
-- First, let's modify the table to allow NULL user_id
ALTER TABLE public.team_members ALTER COLUMN user_id DROP NOT NULL;

-- Then insert team members without user_id
INSERT INTO public.team_members (first_name, last_name, email, role, department, status) VALUES
('John', 'Doe', 'john.doe@glgcapital.com', 'Senior Manager', 'Operations', 'active'),
('Jane', 'Smith', 'jane.smith@glgcapital.com', 'Analyst', 'Research', 'active'),
('Mike', 'Johnson', 'mike.johnson@glgcapital.com', 'Director', 'Sales', 'active')
ON CONFLICT (email) DO NOTHING;

-- 5. Verify the data
SELECT * FROM public.team_members;

-- 6. Show all tables status
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests', 'team_members', 'partnerships', 'content', 'analytics') 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests', 'team_members', 'partnerships', 'content', 'analytics')
ORDER BY table_name; 