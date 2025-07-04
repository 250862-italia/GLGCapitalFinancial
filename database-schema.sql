-- GLG Dashboard Database Schema
-- Run this in Supabase SQL Editor

-- Create tables for GLG Dashboard

-- 0. USERS TABLE (NEW - for authentication)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_secret VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. CLIENTS TABLE
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  position VARCHAR(255),
  date_of_birth DATE,
  nationality VARCHAR(100),
  photo_url TEXT,
  iban VARCHAR(34),
  bic VARCHAR(11),
  account_holder VARCHAR(255),
  usdt_wallet VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  kycStatus VARCHAR(50) DEFAULT 'pending',
  registrationdate DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PACKAGES TABLE
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  daily_return DECIMAL(5,4) NOT NULL,
  duration INTEGER NOT NULL,
  min_investment DECIMAL(15,2),
  max_investment DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active',
  category VARCHAR(100),
  "expectedReturn" DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. KYC RECORDS TABLE
CREATE TABLE kyc_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  document_number VARCHAR(255),
  document_image_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PAYMENTS TABLE
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. NEWS ARTICLES TABLE
CREATE TABLE news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author VARCHAR(100),
  image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'published',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TEAM MEMBERS TABLE
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email VARCHAR(255),
  linkedin_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. PARTNERSHIPS TABLE
CREATE TABLE partnerships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url TEXT,
  website_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  agreement_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CLIENT PACKAGES (Many-to-Many relationship)
CREATE TABLE client_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  investment_amount DECIMAL(15,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'active',
  total_return DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, package_id)
);

-- NOTIFICATIONS TABLE (log invio email/notifiche)
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email VARCHAR(255),
  type VARCHAR(50),
  title VARCHAR(255),
  message TEXT,
  status VARCHAR(20) DEFAULT 'sent',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

-- INFORMATIONAL REQUESTS TABLE (log richieste modulo informativo)
CREATE TABLE IF NOT EXISTS informational_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255),
  date DATE,
  signature VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_kyc_client_id ON kyc_records(client_id);
CREATE INDEX idx_kyc_status ON kyc_records(status);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_news_published_at ON news_articles(published_at);
CREATE INDEX idx_team_status ON team_members(status);
CREATE INDEX idx_partnerships_status ON partnerships(status);
CREATE INDEX idx_client_packages_client_id ON client_packages(client_id);
CREATE INDEX idx_client_packages_status ON client_packages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - allow all for now, customize later)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on packages" ON packages FOR ALL USING (true);
CREATE POLICY "Allow all operations on kyc_records" ON kyc_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on news_articles" ON news_articles FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on partnerships" ON partnerships FOR ALL USING (true);
CREATE POLICY "Allow all operations on client_packages" ON client_packages FOR ALL USING (true);
CREATE POLICY "Allow insert for all" ON users FOR INSERT USING (true);

-- Insert default super admin user (password: SuperAdmin123!)
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) VALUES
('admin@glgcapitalgroupllc.com', '$2b$10$rQZ8K9mN2pL4vX7wY1sT3uI6oP8qR9sT2uI4oP6qR8sT1uI3oP5qR7sT9uI', 'Super', 'Admin', 'super_admin', true, true);

-- Insert sample data
INSERT INTO packages (
  name, description, price, daily_return, duration, min_investment, max_investment, currency, status, category, expectedReturn
) VALUES
('Starter Package', 'Pacchetto base per iniziare', 1000.00, 0.008, 30, 1000.00, 5000.00, 'USD', 'active', 'Conservative', 8.5),
('Growth Package', 'Balanced growth and stability', 5000.00, 0.012, 60, 5000.00, 25000.00, 'USD', 'active', 'Growth', 10.0),
('Premium Package', 'High returns for experienced investors', 10000.00, 0.015, 90, 10000.00, 100000.00, 'USD', 'active', 'Premium', 15.0),
('Elite Package', 'Maximum returns with premium features', 25000.00, 0.018, 120, 25000.00, 500000.00, 'USD', 'active', 'Elite', 18.0);https://glg-capital-financial.vercel.app/login

INSERT INTO team_members (name, position, bio, photo_url, email) VALUES
('Sarah Johnson', 'Senior Financial Advisor', 'Expert in portfolio management with 15+ years experience', '/team/sarah.jpg', 'sarah@glgcapital.com'),
('Michael Chen', 'Investment Strategist', 'Specialized in emerging markets and alternative investments', '/team/michael.jpg', 'michael@glgcapital.com'),
('Emma Rodriguez', 'Risk Management Director', 'Leading risk assessment and compliance strategies', '/team/emma.jpg', 'emma@glgcapital.com');

INSERT INTO news_articles (title, content, author, status) VALUES
('Market Update: Q4 2024 Outlook', 'Comprehensive analysis of market trends and investment opportunities...', 'GLG Research Team', 'published'),
('New Investment Packages Available', 'We are excited to announce our latest investment packages...', 'GLG Capital Group', 'published'),
('Economic Recovery Signals Strong Growth', 'Recent economic indicators suggest a robust recovery...', 'Market Analysis Team', 'published');

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'packages'
ORDER BY ordinal_position;

-- Rename duration_days to duration
ALTER TABLE packages RENAME COLUMN duration TO duration_days;

-- Add expectedReturn column
ALTER TABLE packages ADD COLUMN "expectedReturn" DECIMAL(5,2);

-- Add duration_days column
ALTER TABLE packages ADD COLUMN duration_days INTEGER;
UPDATE packages SET duration_days = duration;

-- Add updated_at column
ALTER TABLE packages ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

SELECT column_name FROM information_schema.columns WHERE table_name = 'packages';

-- Rename expected_return to "expectedReturn"
ALTER TABLE packages RENAME COLUMN expected_return TO "expectedReturn";

-- Add "expectedReturn" column
ALTER TABLE packages ADD COLUMN "expectedReturn" numeric DEFAULT 0;

SELECT * FROM packages LIMIT 5;

-- Crea la tabella notes se non esiste
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserisci alcuni dati di test
INSERT INTO notes (title, content) VALUES 
  ('Test Note 1', 'This is a test note for connection testing'),
  ('Test Note 2', 'Another test note to verify Supabase connection')
ON CONFLICT DO NOTHING;

-- Abilita Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Crea una policy per permettere la lettura anonima
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Allow anonymous read access'
  ) THEN
    CREATE POLICY "Allow anonymous read access" ON notes
      FOR SELECT TO anon USING (true);
  END IF;
END $$;

SELECT * FROM packages LIMIT 1;

-- Rename max_investment to "maxInvestment"
ALTER TABLE packages RENAME COLUMN max_investment TO "maxInvestment";

-- Add "maxInvestment" column
ALTER TABLE packages ADD COLUMN "maxInvestment" DECIMAL(15,2);

-- Rename is_active to "isActive"
ALTER TABLE packages RENAME COLUMN is_active TO "isActive";

-- Rename expected_return to "expectedReturn"
ALTER TABLE packages RENAME COLUMN expected_return TO "expectedReturn";

-- Rinomina le colonne in camelCase
ALTER TABLE packages RENAME COLUMN max_investment TO "maxInvestment";
ALTER TABLE packages RENAME COLUMN min_investment TO "minInvestment";
ALTER TABLE packages RENAME COLUMN is_active TO "isActive";
ALTER TABLE packages RENAME COLUMN daily_return TO "dailyReturn";
ALTER TABLE packages RENAME COLUMN expected_return TO "expectedReturn";
-- Se hai altre colonne in snake_case, aggiungile qui!

-- Rename max_investment to "maxInvestment"
ALTER TABLE packages RENAME COLUMN max_investment TO "maxInvestment";

-- Add "maxInvestment" column
ALTER TABLE packages ADD COLUMN "maxInvestment" DECIMAL(15,2);

-- Rename is_active to "isActive"
ALTER TABLE packages RENAME COLUMN is_active TO "isActive";

-- Rename expected_return to "expectedReturn"
ALTER TABLE packages RENAME COLUMN expected_return TO "expectedReturn";

-- Rinomina le colonne in camelCase
ALTER TABLE packages RENAME COLUMN max_investment TO "maxInvestment";
ALTER TABLE packages RENAME COLUMN min_investment TO "minInvestment";
ALTER TABLE packages RENAME COLUMN is_active TO "isActive";
ALTER TABLE packages RENAME COLUMN daily_return TO "dailyReturn";
ALTER TABLE packages RENAME COLUMN expected_return TO "expectedReturn";
-- Se hai altre colonne in snake_case, aggiungile qui!

-- Rename user_id to "userId"
ALTER TABLE clients RENAME COLUMN user_id TO "userId";

-- Rename date_of_birth to "dateOfBirth"
ALTER TABLE clients RENAME COLUMN date_of_birth TO "dateOfBirth";

-- Rename photo_url to "photoUrl"
ALTER TABLE clients RENAME COLUMN photo_url TO "photoUrl";

-- Rename iban to "iban"
ALTER TABLE clients RENAME COLUMN iban TO "iban";

-- Rename bic to "bic"
ALTER TABLE clients RENAME COLUMN bic TO "bic";

-- Rename account_holder to "accountHolder"
ALTER TABLE clients RENAME COLUMN account_holder TO "accountHolder";

-- Rename usdt_wallet to "usdtWallet"
ALTER TABLE clients RENAME COLUMN usdt_wallet TO "usdtWallet";

-- Rename is_active to "isActive"
ALTER TABLE clients RENAME COLUMN is_active TO "isActive";

-- Rename email_verified to "emailVerified"
ALTER TABLE clients RENAME COLUMN email_verified TO "emailVerified";

-- Rename last_login to "lastLogin"
ALTER TABLE clients RENAME COLUMN last_login TO "lastLogin";

-- Rename login_attempts to "loginAttempts"
ALTER TABLE clients RENAME COLUMN login_attempts TO "loginAttempts";

-- Rename locked_until to "lockedUntil"
ALTER TABLE clients RENAME COLUMN locked_until TO "lockedUntil";

-- Rename two_factor_enabled to "twoFactorEnabled"
ALTER TABLE clients RENAME COLUMN two_factor_enabled TO "twoFactorEnabled";

-- Rename two_factor_secret to "twoFactorSecret"
ALTER TABLE clients RENAME COLUMN two_factor_secret TO "twoFactorSecret";

-- Rename created_at to "createdAt"
ALTER TABLE clients RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE clients RENAME COLUMN updated_at TO "updatedAt";

-- Rename password_hash to "passwordHash"
ALTER TABLE users RENAME COLUMN password_hash TO "passwordHash";

-- Rename first_name to "firstName"
ALTER TABLE users RENAME COLUMN first_name TO "firstName";

-- Rename last_name to "lastName"
ALTER TABLE users RENAME COLUMN last_name TO "lastName";

-- Rename is_active to "isActive"
ALTER TABLE users RENAME COLUMN is_active TO "isActive";

-- Rename email_verified to "emailVerified"
ALTER TABLE users RENAME COLUMN email_verified TO "emailVerified";

-- Rename last_login to "lastLogin"
ALTER TABLE users RENAME COLUMN last_login TO "lastLogin";

-- Rename login_attempts to "loginAttempts"
ALTER TABLE users RENAME COLUMN login_attempts TO "loginAttempts";

-- Rename locked_until to "lockedUntil"
ALTER TABLE users RENAME COLUMN locked_until TO "lockedUntil";

-- Rename two_factor_enabled to "twoFactorEnabled"
ALTER TABLE users RENAME COLUMN two_factor_enabled TO "twoFactorEnabled";

-- Rename two_factor_secret to "twoFactorSecret"
ALTER TABLE users RENAME COLUMN two_factor_secret TO "twoFactorSecret";

-- Rename created_at to "createdAt"
ALTER TABLE users RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE users RENAME COLUMN updated_at TO "updatedAt";

-- Rename client_id to "clientId"
ALTER TABLE kyc_records RENAME COLUMN client_id TO "clientId";

-- Rename document_type to "documentType"
ALTER TABLE kyc_records RENAME COLUMN document_type TO "documentType";

-- Rename document_number to "documentNumber"
ALTER TABLE kyc_records RENAME COLUMN document_number TO "documentNumber";

-- Rename document_image_url to "documentImageUrl"
ALTER TABLE kyc_records RENAME COLUMN document_image_url TO "documentImageUrl";

-- Rename verified_at to "verifiedAt"
ALTER TABLE kyc_records RENAME COLUMN verified_at TO "verifiedAt";

-- Rename created_at to "createdAt"
ALTER TABLE kyc_records RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE kyc_records RENAME COLUMN updated_at TO "updatedAt";

-- Rename client_id to "clientId"
ALTER TABLE payments RENAME COLUMN client_id TO "clientId";

-- Rename package_id to "packageId"
ALTER TABLE payments RENAME COLUMN package_id TO "packageId";

-- Rename payment_method to "paymentMethod"
ALTER TABLE payments RENAME COLUMN payment_method TO "paymentMethod";

-- Rename transaction_id to "transactionId"
ALTER TABLE payments RENAME COLUMN transaction_id TO "transactionId";

-- Rename payment_date to "paymentDate"
ALTER TABLE payments RENAME COLUMN payment_date TO "paymentDate";

-- Rename created_at to "createdAt"
ALTER TABLE payments RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE payments RENAME COLUMN updated_at TO "updatedAt";

-- Rename image_url to "imageUrl"
ALTER TABLE news_articles RENAME COLUMN image_url TO "imageUrl";

-- Rename published_at to "publishedAt"
ALTER TABLE news_articles RENAME COLUMN published_at TO "publishedAt";

-- Rename created_at to "createdAt"
ALTER TABLE news_articles RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE news_articles RENAME COLUMN updated_at TO "updatedAt";

-- Rename photo_url to "photoUrl"
ALTER TABLE team_members RENAME COLUMN photo_url TO "photoUrl";

-- Rename linkedin_url to "linkedinUrl"
ALTER TABLE team_members RENAME COLUMN linkedin_url TO "linkedinUrl";

-- Rename created_at to "createdAt"
ALTER TABLE team_members RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE team_members RENAME COLUMN updated_at TO "updatedAt";

-- Rename logo_url to "logoUrl"
ALTER TABLE partnerships RENAME COLUMN logo_url TO "logoUrl";

-- Rename website_url to "websiteUrl"
ALTER TABLE partnerships RENAME COLUMN website_url TO "websiteUrl";

-- Rename agreement_url to "agreementUrl"
ALTER TABLE partnerships RENAME COLUMN agreement_url TO "agreementUrl";

-- Rename created_at to "createdAt"
ALTER TABLE partnerships RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE partnerships RENAME COLUMN updated_at TO "updatedAt";

-- Rename client_id to "clientId"
ALTER TABLE client_packages RENAME COLUMN client_id TO "clientId";

-- Rename package_id to "packageId"
ALTER TABLE client_packages RENAME COLUMN package_id TO "packageId";

-- Rename investment_amount to "investmentAmount"
ALTER TABLE client_packages RENAME COLUMN investment_amount TO "investmentAmount";

-- Rename start_date to "startDate"
ALTER TABLE client_packages RENAME COLUMN start_date TO "startDate";

-- Rename end_date to "endDate"
ALTER TABLE client_packages RENAME COLUMN end_date TO "endDate";

-- Rename total_return to "totalReturn"
ALTER TABLE client_packages RENAME COLUMN total_return TO "totalReturn";

-- Rename created_at to "createdAt"
ALTER TABLE client_packages RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE client_packages RENAME COLUMN updated_at TO "updatedAt";

-- Rename photo_url to "photoUrl"
ALTER TABLE team_members RENAME COLUMN photo_url TO "photoUrl";

-- Rename linkedin_url to "linkedinUrl"
ALTER TABLE team_members RENAME COLUMN linkedin_url TO "linkedinUrl";

-- Rename created_at to "createdAt"
ALTER TABLE team_members RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE team_members RENAME COLUMN updated_at TO "updatedAt";

-- Rename logo_url to "logoUrl"
ALTER TABLE partnerships RENAME COLUMN logo_url TO "logoUrl";

-- Rename website_url to "websiteUrl"
ALTER TABLE partnerships RENAME COLUMN website_url TO "websiteUrl";

-- Rename agreement_url to "agreementUrl"
ALTER TABLE partnerships RENAME COLUMN agreement_url TO "agreementUrl";

-- Rename created_at to "createdAt"
ALTER TABLE partnerships RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE partnerships RENAME COLUMN updated_at TO "updatedAt";

-- Rename client_id to "clientId"
ALTER TABLE client_packages RENAME COLUMN client_id TO "clientId";

-- Rename package_id to "packageId"
ALTER TABLE client_packages RENAME COLUMN package_id TO "packageId";

-- Rename investment_amount to "investmentAmount"
ALTER TABLE client_packages RENAME COLUMN investment_amount TO "investmentAmount";

-- Rename start_date to "startDate"
ALTER TABLE client_packages RENAME COLUMN start_date TO "startDate";

-- Rename end_date to "endDate"
ALTER TABLE client_packages RENAME COLUMN end_date TO "endDate";

-- Rename total_return to "totalReturn"
ALTER TABLE client_packages RENAME COLUMN total_return TO "totalReturn";

-- Rename created_at to "createdAt"
ALTER TABLE client_packages RENAME COLUMN created_at TO "createdAt";

-- Rename updated_at to "updatedAt"
ALTER TABLE client_packages RENAME COLUMN updated_at TO "updatedAt";

SELECT * FROM packages LIMIT 1;

-- Add "minInvestment" column
ALTER TABLE packages ADD COLUMN "minInvestment" DECIMAL(15,2);

-- Rename min_investment to "minInvestment"
ALTER TABLE packages RENAME COLUMN min_investment TO "minInvestment";

SELECT 
  id,
  name,
  min_investment AS "minInvestment",
  max_investment AS "maxInvestment",
  is_active AS "isActive"
FROM packages
LIMIT 5;

CREATE OR REPLACE VIEW packages_camel_case AS
SELECT
  id,
  name,
  min_investment AS "minInvestment",
  max_investment AS "maxInvestment",
  is_active AS "isActive",
  daily_return AS "dailyReturn",
  expected_return AS "expectedReturn",
  risk_level AS "riskLevel",
  description,
  price,
  duration,
  category,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
FROM packages;

SELECT * FROM packages_camel_case LIMIT 1;

CREATE OR REPLACE FUNCTION reload_schema_cache()
RETURNS void AS $$
BEGIN
  -- Non fa nulla, serve solo a forzare la cache
END;
$$ LANGUAGE plpgsql;

-- Add "riskLevel" column
ALTER TABLE packages ADD COLUMN "riskLevel" VARCHAR(20);

UPDATE packages SET "riskLevel" = 'low' WHERE name ILIKE '%starter%';
UPDATE packages SET "riskLevel" = 'medium' WHERE name ILIKE '%growth%';
UPDATE packages SET "riskLevel" = 'high' WHERE name ILIKE '%premium%';

SELECT id, name, riskLevel FROM packages;

-- =========================
-- SISTEMA TABELLA CLIENTS
-- =========================

-- Rinomina colonne in camelCase (ignora errori se già esistono)
ALTER TABLE clients RENAME COLUMN first_name TO "firstName";
ALTER TABLE clients RENAME COLUMN last_name TO "lastName";
ALTER TABLE clients RENAME COLUMN date_of_birth TO "dateOfBirth";
ALTER TABLE clients RENAME COLUMN photo_url TO "photoUrl";
ALTER TABLE clients RENAME COLUMN usdt_wallet TO "usdtWallet";
ALTER TABLE clients RENAME COLUMN account_holder TO "accountHolder";
ALTER TABLE clients RENAME COLUMN created_at TO "createdAt";
ALTER TABLE clients RENAME COLUMN updated_at TO "updatedAt";

-- Aggiungi colonne mancanti (ignora errori se già esistono)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS "preferredPaymentMethod" VARCHAR(20);

-- Abilita RLS e policy di lettura
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'Allow read'
  ) THEN
    CREATE POLICY "Allow read" ON clients FOR SELECT USING (true);
  END IF;
END $$;

-- Inserisci un client di test (sostituisci user_id con un id valido dalla tabella users)
INSERT INTO clients (id, user_id, email, "firstName", "lastName", phone, nationality, "photoUrl", iban, bic, "accountHolder", status, "createdAt", "updatedAt", "preferredPaymentMethod")
SELECT
  gen_random_uuid(),
  id,
  'test.client@glgcapital.com',
  'Test',
  'Client',
  '+390123456789',
  'Italy',
  NULL,
  'IT60X0542811101000000123456',
  'BNLIITRR',
  'Test Client',
  'active',
  NOW(),
  NOW(),
  'bank'
FROM users
LIMIT 1
ON CONFLICT DO NOTHING;

SELECT * FROM pg_policies WHERE tablename = 'packages';

CREATE POLICY "Allow read" ON packages FOR SELECT USING (true);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;