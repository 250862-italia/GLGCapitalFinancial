-- Fix investments table constraints
-- Run this in Supabase SQL Editor

-- 1. Drop existing constraints that are causing issues
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_status_check;
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_expected_return_check;

-- 2. Add the correct status constraint
ALTER TABLE investments ADD CONSTRAINT investments_status_check 
CHECK (status IN ('pending', 'pending_payment', 'approved', 'rejected', 'active', 'completed', 'cancelled'));

-- 3. Make expected_return nullable or provide default value
ALTER TABLE investments ALTER COLUMN expected_return DROP NOT NULL;
ALTER TABLE investments ALTER COLUMN expected_return SET DEFAULT 1.8;

-- 4. Add payment_method column if it doesn't exist
ALTER TABLE investments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- 5. Add client_id column if it doesn't exist (make it nullable)
ALTER TABLE investments ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE CASCADE;

-- 6. Update existing records to have proper values
UPDATE investments 
SET expected_return = 1.8 
WHERE expected_return IS NULL;

UPDATE investments 
SET status = 'pending' 
WHERE status = 'pending_payment';

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- 8. Enable RLS if not already enabled
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- 9. Create or replace RLS policies
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
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 10. Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'investments' 
ORDER BY ordinal_position; 