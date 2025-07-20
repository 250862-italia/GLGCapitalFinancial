-- QUICK FIX for investment purchase issues
-- Run this in Supabase SQL Editor

-- 1. Drop problematic constraints
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_status_check;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_expected_return_check;

-- 2. Make expected_return nullable and set default
ALTER TABLE investments ALTER COLUMN expected_return DROP NOT NULL;
ALTER TABLE investments ALTER COLUMN expected_return SET DEFAULT 1.8;

-- 3. Add the correct status constraint
ALTER TABLE investments ADD CONSTRAINT investments_status_check 
CHECK (status IN ('pending', 'pending_payment', 'approved', 'rejected', 'active', 'completed', 'cancelled'));

-- 4. Add missing columns if they don't exist
ALTER TABLE investments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE investments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE investments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);

-- 5. Update existing records to have proper values
UPDATE investments 
SET expected_return = 1.8 
WHERE expected_return IS NULL;

UPDATE investments 
SET status = 'pending' 
WHERE status = 'pending_payment';

-- 6. Create packages table if it doesn't exist
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

-- 7. Insert sample packages if they don't exist
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
SELECT 'GLG Premium Portfolio', 'Exclusive investment package with premium features and personalized management.', 'Premium', 10000.00, 1000000.00, 2.0, 18, 'medium', 'active', true
WHERE NOT EXISTS (SELECT 1 FROM packages WHERE name = 'GLG Premium Portfolio');

-- 8. Enable RLS and create policies
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own investments" ON investments;
DROP POLICY IF EXISTS "Users can insert their own investments" ON investments;
DROP POLICY IF EXISTS "Public can view active packages" ON packages;

-- Create new policies
CREATE POLICY "Users can view their own investments" ON investments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own investments" ON investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT USING (status = 'active');

-- 9. Success message
SELECT '✅ Investment purchase system fixed successfully!' as status; 