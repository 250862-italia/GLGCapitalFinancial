-- Fix clients table by adding missing columns
-- Run this in Supabase SQL Editor

-- Add missing columns to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS usdt_wallet VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS position VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS nationality VARCHAR(100);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_photo TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS iban VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS bic VARCHAR(20);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_code VARCHAR(50) UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS risk_profile VARCHAR(50) DEFAULT 'moderate';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS investment_preferences JSONB DEFAULT '{}';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_invested DECIMAL(15,2) DEFAULT 0.00;

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    date_of_birth DATE,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    kyc_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies for profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create basic RLS policies for clients
CREATE POLICY IF NOT EXISTS "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON clients TO service_role;

-- Verify the fix
SELECT 'Clients table fixed successfully!' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position; 