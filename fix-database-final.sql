-- Fix finale per il database GLG Capital Financial
-- Esegui questo script nel SQL Editor di Supabase

-- 1. Abilita estensioni necessarie
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Aggiungi colonne mancanti alla tabella clients
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email VARCHAR(255);
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
ALTER TABLE clients ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- 3. Crea tabella profiles se non esiste
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

-- 4. Abilita RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- 5. Crea policy RLS per profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 6. Crea policy RLS per clients
DROP POLICY IF EXISTS "Users can view their own client data" ON clients;
DROP POLICY IF EXISTS "Users can update their own client data" ON clients;
DROP POLICY IF EXISTS "Users can insert their own client data" ON clients;
DROP POLICY IF EXISTS "Admins can view all clients" ON clients;

CREATE POLICY "Users can view their own client data" ON clients
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own client data" ON clients
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client data" ON clients
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all clients" ON clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can manage all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- 7. Crea trigger per updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Crea trigger per le tabelle
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Concedi permessi
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON clients TO authenticated;
GRANT ALL ON profiles TO service_role;
GRANT ALL ON clients TO service_role;

-- 10. Aggiorna il superadmin esistente
UPDATE profiles 
SET role = 'superadmin' 
WHERE email = 'admin@glgcapital.com';

-- 11. Crea record client per il superadmin se non esiste
INSERT INTO clients (user_id, profile_id, first_name, last_name, email, client_code, status, risk_profile)
SELECT 
    p.id,
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    'ADMIN-' || substr(p.id::text, 1, 8),
    'active',
    'admin'
FROM profiles p
WHERE p.email = 'admin@glgcapital.com'
AND NOT EXISTS (
    SELECT 1 FROM clients c WHERE c.user_id = p.id
);

-- 12. Verifica la configurazione
SELECT 'Database fix completato con successo!' as status;
SELECT 'Superadmin configurato:' as info;
SELECT id, email, role, first_name, last_name FROM profiles WHERE email = 'admin@glgcapital.com';
SELECT 'Struttura tabella clients:' as info;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'clients' ORDER BY ordinal_position; 