-- Fix relationships between tables
-- Run this in Supabase SQL Editor

-- Drop and recreate the foreign key constraint for kyc_records
ALTER TABLE kyc_records DROP CONSTRAINT IF EXISTS kyc_records_client_id_fkey;
ALTER TABLE kyc_records ADD CONSTRAINT kyc_records_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Drop and recreate the foreign key constraint for payments
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_client_id_fkey;
ALTER TABLE payments ADD CONSTRAINT payments_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Drop and recreate the foreign key constraint for client_packages
ALTER TABLE client_packages DROP CONSTRAINT IF EXISTS client_packages_client_id_fkey;
ALTER TABLE client_packages ADD CONSTRAINT client_packages_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;

-- Force refresh of the schema cache
SELECT pg_notify('supabase_schema_reload', 'reload');

-- Alternative: Call the reload function if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'reload_schema_cache') THEN
    PERFORM reload_schema_cache();
  END IF;
END $$;

-- Verify relationships
SELECT 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('kyc_records', 'payments', 'client_packages'); 