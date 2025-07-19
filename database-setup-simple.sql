-- GLG Capital Financial - Database Setup Simple
-- Script semplificato senza dipendenze da auth.users

-- =====================================================
-- 1. ENABLE EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. DROP EXISTING TABLES (CLEAN START)
-- =====================================================
DROP TABLE IF EXISTS email_queue CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS informational_requests CASCADE;
DROP TABLE IF EXISTS kyc_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- 3. CREATE TABLES IN CORRECT ORDER
-- =====================================================

-- Profiles table (user profiles) - senza riferimento a auth.users
CREATE TABLE profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- Clients table (client profiles) - senza riferimento a auth.users
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico, non a auth.users
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    position VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    profile_photo TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    iban VARCHAR(50),
    bic VARCHAR(20),
    account_holder VARCHAR(255),
    usdt_wallet VARCHAR(255),
    client_code VARCHAR(50) UNIQUE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'suspended')),
    risk_profile VARCHAR(50) DEFAULT 'moderate',
    investment_preferences JSONB DEFAULT '{}',
    total_invested DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages table (investment packages)
CREATE TABLE packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(100) NOT NULL,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2),
    expected_return DECIMAL(5,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    risk_level VARCHAR(50) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    management_fee DECIMAL(5,2) DEFAULT 0,
    performance_fee DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table - senza riferimento a auth.users
CREATE TABLE investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled')),
    investment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    maturity_date TIMESTAMP WITH TIME ZONE,
    expected_return DECIMAL(5,2) NOT NULL,
    actual_return DECIMAL(5,2),
    total_returns DECIMAL(15,2) DEFAULT 0,
    daily_returns DECIMAL(10,2) DEFAULT 0,
    monthly_returns DECIMAL(10,2) DEFAULT 0,
    fees_paid DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table - senza riferimento a auth.users
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    payment_method VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table - senza riferimento a auth.users
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE partnerships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    partner_type VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending', 'terminated')),
    start_date DATE,
    end_date DATE,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table - senza riferimento a auth.users
CREATE TABLE content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'article', 'announcement', 'policy', 'market')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID, -- Riferimento generico
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC requests table - senza riferimento a auth.users
CREATE TABLE kyc_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected')),
    document_type VARCHAR(100),
    document_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID, -- Riferimento generico
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Informational requests table - senza riferimento a auth.users
CREATE TABLE informational_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    request_type VARCHAR(100) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID, -- Riferimento generico
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table - senza riferimento a auth.users
CREATE TABLE analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    page_visited VARCHAR(255) NOT NULL,
    session_duration INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table - senza riferimento a auth.users
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Riferimento generico
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Email queue table
CREATE TABLE email_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT,
    text_content TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'error', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE INDEXES
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- Clients indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- Packages indexes
CREATE INDEX idx_packages_status ON packages(status);
CREATE INDEX idx_packages_type ON packages(type);
CREATE INDEX idx_packages_risk_level ON packages(risk_level);
CREATE INDEX idx_packages_is_featured ON packages(is_featured);

-- Investments indexes
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_client_id ON investments(client_id);
CREATE INDEX idx_investments_package_id ON investments(package_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_investment_date ON investments(investment_date DESC);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_investment_id ON payments(investment_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_date ON payments(payment_date DESC);

-- Team members indexes
CREATE INDEX idx_team_members_email ON team_members(email);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Content indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_status ON content(status);
CREATE INDEX idx_content_published_at ON content(published_at DESC);

-- Analytics indexes
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_timestamp ON analytics(timestamp DESC);
CREATE INDEX idx_analytics_page_visited ON analytics(page_visited);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 5. ENABLE ROW LEVEL SECURITY (DISABLED FOR NOW)
-- =====================================================

-- Disabilitiamo RLS per ora per evitare problemi
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE kyc_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_requests_updated_at BEFORE UPDATE ON kyc_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_informational_requests_updated_at BEFORE UPDATE ON informational_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_queue_updated_at BEFORE UPDATE ON email_queue FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. INSERT SAMPLE DATA
-- =====================================================

-- Insert sample admin profile
INSERT INTO profiles (name, email, role, first_name, last_name) VALUES
('Admin User', 'admin@glgcapital.com', 'superadmin', 'Admin', 'User');

-- Insert sample packages
INSERT INTO packages (name, description, type, min_investment, max_investment, expected_return, duration_months, risk_level, status) VALUES
('GLG Premium Investment', 'High-yield investment package with premium returns', 'premium', 10000, 100000, 2.5, 12, 'high', 'active'),
('GLG Balanced Growth', 'Balanced investment with moderate risk and steady returns', 'balanced', 5000, 50000, 1.8, 6, 'medium', 'active'),
('GLG Conservative Income', 'Conservative investment with low risk and stable income', 'conservative', 1000, 25000, 1.2, 3, 'low', 'active'),
('GLG Crypto Opportunities', 'Cryptocurrency-focused investment opportunities', 'crypto', 2000, 75000, 3.0, 18, 'high', 'active');

-- Insert sample content
INSERT INTO content (title, content, type, status, published_at) VALUES
('Welcome to GLG Capital Group', 'Welcome to our comprehensive investment platform...', 'announcement', 'published', NOW()),
('Market Update Q1 2024', 'Latest market insights and investment opportunities...', 'news', 'published', NOW()),
('Investment Strategies Guide', 'Complete guide to successful investment strategies...', 'article', 'published', NOW());

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Verify all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'profiles', 'clients', 'packages', 'investments', 
            'team_members', 'partnerships', 'content', 'payments',
            'kyc_requests', 'informational_requests', 'analytics',
            'notifications', 'email_queue'
        ) THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'profiles', 'clients', 'packages', 'investments', 
    'team_members', 'partnerships', 'content', 'payments',
    'kyc_requests', 'informational_requests', 'analytics',
    'notifications', 'email_queue'
)
ORDER BY table_name;

-- Count records in each table
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'packages' as table_name, COUNT(*) as record_count FROM packages
UNION ALL
SELECT 'content' as table_name, COUNT(*) as record_count FROM content; 