-- GLG Dashboard Database Schema
-- Run this in Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create tables for GLG Dashboard

-- 1. CLIENTS TABLE
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  nationality VARCHAR(100),
  photo_url TEXT,
  iban VARCHAR(34),
  bic VARCHAR(11),
  account_holder VARCHAR(255),
  usdt_wallet VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
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
  duration_days INTEGER NOT NULL,
  min_investment DECIMAL(15,2),
  max_investment DECIMAL(15,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active',
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

-- Create indexes for better performance
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
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - allow all for now, customize later)
CREATE POLICY "Allow all operations on clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations on packages" ON packages FOR ALL USING (true);
CREATE POLICY "Allow all operations on kyc_records" ON kyc_records FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all operations on news_articles" ON news_articles FOR ALL USING (true);
CREATE POLICY "Allow all operations on team_members" ON team_members FOR ALL USING (true);
CREATE POLICY "Allow all operations on partnerships" ON partnerships FOR ALL USING (true);
CREATE POLICY "Allow all operations on client_packages" ON client_packages FOR ALL USING (true);

-- Insert sample data
INSERT INTO packages (name, description, price, daily_return, duration_days, min_investment, max_investment, currency) VALUES
('Starter Package', 'Perfect for beginners', 1000.00, 0.008, 30, 1000.00, 5000.00, 'USD'),
('Growth Package', 'Balanced growth and stability', 5000.00, 0.012, 60, 5000.00, 25000.00, 'USD'),
('Premium Package', 'High returns for experienced investors', 10000.00, 0.015, 90, 10000.00, 100000.00, 'USD'),
('Elite Package', 'Maximum returns with premium features', 25000.00, 0.018, 120, 25000.00, 500000.00, 'USD');

INSERT INTO team_members (name, position, bio, photo_url, email) VALUES
('Sarah Johnson', 'Senior Financial Advisor', 'Expert in portfolio management with 15+ years experience', '/team/sarah.jpg', 'sarah@glgcapital.com'),
('Michael Chen', 'Investment Strategist', 'Specialized in emerging markets and alternative investments', '/team/michael.jpg', 'michael@glgcapital.com'),
('Emma Rodriguez', 'Risk Management Director', 'Leading risk assessment and compliance strategies', '/team/emma.jpg', 'emma@glgcapital.com');

INSERT INTO news_articles (title, content, author, status) VALUES
('Market Update: Q4 2024 Outlook', 'Comprehensive analysis of market trends and investment opportunities...', 'GLG Research Team', 'published'),
('New Investment Packages Available', 'We are excited to announce our latest investment packages...', 'GLG Capital Group', 'published'),
('Economic Recovery Signals Strong Growth', 'Recent economic indicators suggest a robust recovery...', 'Market Analysis Team', 'published'); 