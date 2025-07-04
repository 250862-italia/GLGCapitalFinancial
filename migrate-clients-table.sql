-- Migration script to add missing columns to clients table
-- Run this in Supabase SQL Editor

-- Add missing columns to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS position VARCHAR(255),
ADD COLUMN IF NOT EXISTS kycStatus VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registrationdate DATE DEFAULT CURRENT_DATE;

-- Update existing records to populate the name field from first_name and last_name
UPDATE clients 
SET name = CONCAT(first_name, ' ', last_name)
WHERE name IS NULL AND first_name IS NOT NULL AND last_name IS NOT NULL;

-- Update existing records to set registrationdate if it's null
UPDATE clients 
SET registrationdate = created_at::date
WHERE registrationdate IS NULL;

-- Create index for the new columns
CREATE INDEX IF NOT EXISTS idx_clients_company ON clients(company);
CREATE INDEX IF NOT EXISTS idx_clients_kycStatus ON clients(kycStatus);
CREATE INDEX IF NOT EXISTS idx_clients_registrationdate ON clients(registrationdate);

-- Refresh the schema cache
SELECT reload_schema_cache(); 