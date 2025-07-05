-- GLG Capital Dashboard - Analytics Table Migration
-- Run this script in Supabase SQL Editor to fix missing columns

-- Check if analytics table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'category') THEN
            ALTER TABLE analytics ADD COLUMN category VARCHAR(50) DEFAULT 'general';
            RAISE NOTICE 'Added category column to analytics table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'status') THEN
            ALTER TABLE analytics ADD COLUMN status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
            RAISE NOTICE 'Added status column to analytics table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'description') THEN
            ALTER TABLE analytics ADD COLUMN description TEXT;
            RAISE NOTICE 'Added description column to analytics table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'change_percentage') THEN
            ALTER TABLE analytics ADD COLUMN change_percentage DECIMAL(5,2) DEFAULT 0;
            RAISE NOTICE 'Added change_percentage column to analytics table';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'analytics' AND column_name = 'period') THEN
            ALTER TABLE analytics ADD COLUMN period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly'));
            RAISE NOTICE 'Added period column to analytics table';
        END IF;
        
        RAISE NOTICE 'Analytics table migration completed successfully';
    ELSE
        RAISE NOTICE 'Analytics table does not exist. Please run setup-production.sql first.';
    END IF;
END $$;

-- Create index on category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics(category);

-- Insert sample data if table is empty
INSERT INTO analytics (metric, value, change_percentage, period, category, status, description) 
SELECT 
    'Total Revenue',
    1250000,
    12.5,
    'monthly',
    'financial',
    'active',
    'Monthly revenue tracking'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Total Revenue');

INSERT INTO analytics (metric, value, change_percentage, period, category, status, description) 
SELECT 
    'Active Users',
    1250,
    8.3,
    'weekly',
    'user',
    'active',
    'Weekly active user count'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Active Users');

INSERT INTO analytics (metric, value, change_percentage, period, category, status, description) 
SELECT 
    'Investment Packages',
    45,
    15.2,
    'monthly',
    'product',
    'active',
    'Available investment packages'
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'Investment Packages');

-- Verify the migration
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'analytics' 
ORDER BY ordinal_position;

-- Show sample data
SELECT * FROM analytics LIMIT 5; 