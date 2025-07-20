-- Fix Clients Table Structure - Complete Version
-- Execute this in Supabase SQL Editor

-- 1. Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS position TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS iban TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bic TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_holder TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS usdt_wallet TEXT;

-- 2. Update status constraint if needed
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_status_check;
ALTER TABLE clients ADD CONSTRAINT clients_status_check 
  CHECK (status IN ('active', 'inactive', 'pending'));

-- 3. Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies
DROP POLICY IF EXISTS "Users can view own client data" ON clients;
DROP POLICY IF EXISTS "Users can update own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;

-- 5. Create RLS policies
CREATE POLICY "Users can view own client data" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own client data" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client data" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- 7. Create trigger for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant permissions
GRANT ALL ON clients TO authenticated;
GRANT ALL ON clients TO service_role;

-- 9. Verify the structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 10. Show current data
SELECT COUNT(*) as total_clients FROM clients; 