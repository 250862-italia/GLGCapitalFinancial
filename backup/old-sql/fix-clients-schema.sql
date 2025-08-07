-- Fix Clients Table Schema - Add Missing Columns
-- Run this script in Supabase SQL Editor

-- 1. Add missing columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS account_holder TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT,
ADD COLUMN IF NOT EXISTS id_number TEXT,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS occupation TEXT,
ADD COLUMN IF NOT EXISTS employer TEXT,
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS source_of_funds TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS investment_experience TEXT DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Update existing records with default values
UPDATE public.clients 
SET 
  address = COALESCE(address, 'Not provided'),
  account_holder = COALESCE(account_holder, CONCAT(first_name, ' ', last_name)),
  phone = COALESCE(phone, 'Not provided'),
  nationality = COALESCE(nationality, 'Not specified'),
  occupation = COALESCE(occupation, 'Not specified'),
  source_of_funds = COALESCE(source_of_funds, 'Employment'),
  terms_accepted = COALESCE(terms_accepted, true),
  terms_accepted_at = COALESCE(terms_accepted_at, NOW()),
  is_active = COALESCE(is_active, true)
WHERE address IS NULL OR account_holder IS NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_kyc_status ON public.clients(kyc_status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON public.clients(created_at);

-- 4. Update RLS policies for clients table
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON public.clients;

CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Clients can update own data" ON public.clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON public.clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'superadmin')
    )
  );

-- 5. Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Test query to ensure everything works
SELECT 
  id,
  user_id,
  email,
  first_name,
  last_name,
  account_holder,
  address,
  status,
  kyc_status,
  created_at
FROM public.clients 
LIMIT 5; 