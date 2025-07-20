-- Create packages table and insert sample data
-- Run this in Supabase SQL Editor

-- 1. Create packages table
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

-- 2. Insert sample packages
INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status, is_featured) VALUES
('GLG Balanced Growth', 'A balanced investment package offering steady growth with moderate risk. Perfect for investors seeking consistent returns.', 'Balanced', 1000.00, 100000.00, 1.8, 12, 'medium', 'active', true),
('GLG Conservative Income', 'Low-risk investment package focused on capital preservation and steady income generation.', 'Conservative', 500.00, 50000.00, 1.2, 6, 'low', 'active', false),
('GLG Aggressive Growth', 'High-growth investment package for experienced investors willing to take higher risks for potentially higher returns.', 'Aggressive', 5000.00, 500000.00, 2.5, 24, 'high', 'active', true),
('GLG Premium Portfolio', 'Exclusive investment package with premium features and personalized management.', 'Premium', 10000.00, 1000000.00, 2.0, 18, 'medium', 'active', true);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages(type);
CREATE INDEX IF NOT EXISTS idx_packages_risk_level ON packages(risk_level);
CREATE INDEX IF NOT EXISTS idx_packages_is_featured ON packages(is_featured);

-- 4. Enable RLS
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies
DROP POLICY IF EXISTS "Public can view active packages" ON packages;
CREATE POLICY "Public can view active packages" ON packages
    FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Admins can manage packages" ON packages;
CREATE POLICY "Admins can manage packages" ON packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 6. Grant permissions
GRANT SELECT ON packages TO authenticated;
GRANT ALL ON packages TO service_role;

-- 7. Verify the data
SELECT * FROM packages WHERE status = 'active' ORDER BY is_featured DESC, name; 