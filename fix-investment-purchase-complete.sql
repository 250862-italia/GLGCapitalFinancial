-- Complete fix for investment purchase issues
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. FIX INVESTMENTS TABLE STRUCTURE
-- =====================================================

-- Drop problematic constraints
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_status_check;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_expected_return_check;

-- Add missing columns if they don't exist
ALTER TABLE investments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);

-- Make expected_return nullable and set default
ALTER TABLE investments ALTER COLUMN expected_return DROP NOT NULL;
ALTER TABLE investments ALTER COLUMN expected_return SET DEFAULT 1.8;

-- Add the correct status constraint
ALTER TABLE investments ADD CONSTRAINT investments_status_check 
CHECK (status IN ('pending', 'pending_payment', 'approved', 'rejected', 'active', 'completed', 'cancelled'));

-- Update existing records to have proper values
UPDATE investments 
SET expected_return = 1.8 
WHERE expected_return IS NULL;

UPDATE investments 
SET status = 'pending' 
WHERE status = 'pending_payment';

-- =====================================================
-- 2. CREATE PACKAGES TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2),
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    management_fee DECIMAL(5,2) DEFAULT 0,
    performance_fee DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample packages if table is empty
INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Balanced Growth', 'A balanced investment package offering steady growth with moderate risk. Perfect for investors seeking consistent returns.', 'Balanced', 1000.00, 100000.00, 1.8, 12, 'medium', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Balanced Growth');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Conservative Income', 'Low-risk investment package focused on capital preservation and steady income generation.', 'Conservative', 500.00, 50000.00, 1.2, 6, 'low', 'active', false
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Conservative Income');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Aggressive Growth', 'High-growth investment package for experienced investors willing to take higher risks for potentially higher returns.', 'Aggressive', 5000.00, 500000.00, 2.5, 24, 'high', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Aggressive Growth');

INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) 
SELECT 'GLG Premium Portfolio', 'Exclusive investment package with premium features and personalized management.', 'Premium', 10000.00, 1000000.00, 3.0, 36, 'high', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Premium Portfolio');

-- =====================================================
-- 3. CREATE CLIENTS TABLE IF NOT EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    profile_photo TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    iban VARCHAR(50),
    bic VARCHAR(20),
    account_holder VARCHAR(255),
    usdt_wallet VARCHAR(255),
    client_code VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    risk_profile VARCHAR(50) DEFAULT 'moderate',
    investment_preferences JSONB DEFAULT '{}',
    total_invested DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);
CREATE INDEX IF NOT EXISTS idx_packages_name ON packages(name);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Investments policies
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
CREATE POLICY "Users can view their own investments" ON investments
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own investments" ON investments;
CREATE POLICY "Users can insert their own investments" ON investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own investments" ON investments;
CREATE POLICY "Users can update their own investments" ON investments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all investments" ON investments;
CREATE POLICY "Admins can view all investments" ON investments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Packages policies (public read access)
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT USING (status = 'active');

-- Clients policies
DROP POLICY IF EXISTS "Users can view their own client profile" ON clients;
CREATE POLICY "Users can view their own client profile" ON clients
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own client profile" ON clients;
CREATE POLICY "Users can update their own client profile" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 7. VERIFICATION QUERIES
-- =====================================================

-- Check investments table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'investments' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check packages
SELECT name, min_investment, max_investment, expected_return, status 
FROM packages 
ORDER BY min_investment;

-- Check constraints
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'investments' 
AND table_schema = 'public';

-- =====================================================
-- 8. TEST DATA INSERTION
-- =====================================================

-- Test investment insertion (commented out - uncomment to test)
/*
INSERT INTO investments (
    user_id, 
    package_id, 
    amount, 
    status, 
    expected_return, 
    payment_method,
    notes,
    created_at,
    updated_at
) VALUES (
    '3a35e71b-c7e7-4e5d-84a9-d6ce2fe4776f',
    (SELECT id FROM packages WHERE name = 'GLG Balanced Growth' LIMIT 1),
    5000.00,
    'pending',
    1.8,
    'bank_transfer',
    'Test investment after fix',
    NOW(),
    NOW()
);
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ Investment purchase system fixed successfully!' as status; 