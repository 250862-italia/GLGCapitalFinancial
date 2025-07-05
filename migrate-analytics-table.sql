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
        
        -- Insert sample data if table is empty
        IF NOT EXISTS (SELECT 1 FROM analytics LIMIT 1) THEN
            INSERT INTO analytics (metric, value, change_percentage, period, category, status, description, created_at) VALUES
            ('Total Users', 1250, 12.5, 'monthly', 'users', 'active', 'Total registered users', NOW()),
            ('Active Investments', 89, 8.2, 'monthly', 'investments', 'active', 'Currently active investments', NOW()),
            ('Revenue', 125000, 15.3, 'monthly', 'financial', 'active', 'Monthly revenue', NOW()),
            ('Conversion Rate', 3.2, -0.5, 'monthly', 'performance', 'active', 'User conversion rate', NOW());
            RAISE NOTICE 'Inserted sample analytics data';
        END IF;
    ELSE
        RAISE NOTICE 'Analytics table does not exist';
    END IF;
END $$;

-- Create index on category if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics(category);

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

-- Fix KYC records table column names
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kyc_records') THEN
        -- Check if createdAt column exists (camelCase) and rename to created_at (snake_case)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'kyc_records' AND column_name = 'createdAt') THEN
            ALTER TABLE kyc_records RENAME COLUMN "createdAt" TO created_at;
            RAISE NOTICE 'Renamed createdAt to created_at in kyc_records table';
        END IF;
        
        -- Check if updatedAt column exists (camelCase) and rename to updated_at (snake_case)
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'kyc_records' AND column_name = 'updatedAt') THEN
            ALTER TABLE kyc_records RENAME COLUMN "updatedAt" TO updated_at;
            RAISE NOTICE 'Renamed updatedAt to updated_at in kyc_records table';
        END IF;
        
        -- Add created_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'kyc_records' AND column_name = 'created_at') THEN
            ALTER TABLE kyc_records ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added created_at column to kyc_records table';
        END IF;
        
        -- Add updated_at column if it doesn't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'kyc_records' AND column_name = 'updated_at') THEN
            ALTER TABLE kyc_records ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            RAISE NOTICE 'Added updated_at column to kyc_records table';
        END IF;
    ELSE
        RAISE NOTICE 'KYC records table does not exist';
    END IF;
END $$;

-- Fix other potential camelCase columns in other tables
DO $$
BEGIN
    -- Fix clients table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'createdAt') THEN
            ALTER TABLE clients RENAME COLUMN "createdAt" TO created_at;
            RAISE NOTICE 'Renamed createdAt to created_at in clients table';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updatedAt') THEN
            ALTER TABLE clients RENAME COLUMN "updatedAt" TO updated_at;
            RAISE NOTICE 'Renamed updatedAt to updated_at in clients table';
        END IF;
    END IF;
    
    -- Fix investments table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'investments') THEN
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'createdAt') THEN
            ALTER TABLE investments RENAME COLUMN "createdAt" TO created_at;
            RAISE NOTICE 'Renamed createdAt to created_at in investments table';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'updatedAt') THEN
            ALTER TABLE investments RENAME COLUMN "updatedAt" TO updated_at;
            RAISE NOTICE 'Renamed updatedAt to updated_at in investments table';
        END IF;
    END IF;
END $$;

-- Verify the fixes
SELECT 'Migration completed successfully' as status; 