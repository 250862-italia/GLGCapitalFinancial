-- Check current database state
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if investments table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Check existing constraints on investments table
SELECT 
    constraint_name,
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'investments' 
AND tc.table_schema = 'public';

-- 3. Check if packages table exists and has data
SELECT 
    COUNT(*) as package_count,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_packages
FROM packages;

-- 4. Check if clients table exists and has data
SELECT 
    COUNT(*) as client_count
FROM clients;

-- 5. Check recent investments (if any)
SELECT 
    id,
    user_id,
    package_id,
    amount,
    status,
    expected_return,
    created_at
FROM investments 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check for any foreign key violations
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'investments'; 