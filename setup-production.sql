-- GLG Capital Group Dashboard - Production Database Setup
-- Run this script in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table is handled by Supabase Auth (auth.users)

-- Clients table (client profiles)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    nationality VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    profile_photo VARCHAR(500),
    banking_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investment Packages table
CREATE TABLE IF NOT EXISTS packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    min_investment DECIMAL(15,2) NOT NULL,
    max_investment DECIMAL(15,2) NOT NULL,
    duration INTEGER NOT NULL, -- in days
    expected_return DECIMAL(5,2) NOT NULL, -- percentage
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold_out')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    total_returns DECIMAL(15,2) DEFAULT 0,
    daily_returns DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric VARCHAR(100) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    change_percentage DECIMAL(5,2) DEFAULT 0,
    period VARCHAR(20) DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
    category VARCHAR(50) DEFAULT 'general',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Informational Requests table
CREATE TABLE IF NOT EXISTS informational_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name VARCHAR(200) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    document_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    department VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'market', 'partnership', 'announcement')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES auth.users(id),
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    start_date DATE,
    end_date DATE,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_package_id ON investments(package_id);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics(category);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status);

-- Row Level Security (RLS) Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Clients can view own profile" ON clients
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Clients can update own profile" ON clients
    FOR UPDATE USING (user_id = auth.uid());

-- Anyone can view active packages
CREATE POLICY "Anyone can view active packages" ON packages
    FOR SELECT USING (status = 'active');

-- Users can view their own investments
CREATE POLICY "Users can view own investments" ON investments
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own investments
CREATE POLICY "Users can insert own investments" ON investments
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all data
CREATE POLICY "Admins can view all clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can manage all packages" ON packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can view all investments" ON investments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can view all analytics" ON analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'superadmin')
        )
    );

CREATE POLICY "Admins can view all requests" ON informational_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() AND raw_user_meta_data->>'role' IN ('admin', 'superadmin')
        )
    );

-- Insert sample investment packages
INSERT INTO packages (name, description, min_investment, max_investment, duration, expected_return, status) VALUES
('Pacchetto Starter', 'Perfetto per iniziare il tuo percorso di investimento. Ideale per principianti che vogliono approcciarsi al mondo degli investimenti con un capitale contenuto.', 1000.00, 5000.00, 90, 8.50, 'active'),
('Pacchetto Growth', 'Il nostro pacchetto più popolare. Offre un equilibrio perfetto tra rischio e rendimento, adatto a investitori con esperienza.', 5000.00, 25000.00, 180, 12.00, 'active'),
('Pacchetto Premium', 'Per investitori esperti che cercano rendimenti elevati. Include strategie avanzate e gestione personalizzata del portafoglio.', 25000.00, 100000.00, 365, 18.00, 'active'),
('Pacchetto Elite', 'Il nostro pacchetto di punta per investitori istituzionali e high-net-worth individuals. Massima personalizzazione e rendimenti premium.', 100000.00, 1000000.00, 730, 25.00, 'active')
ON CONFLICT (id) DO NOTHING;

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('email_config', '{"smtp_host": "smtp.gmail.com", "smtp_port": 587}', 'Email configuration'),
('app_config', '{"maintenance_mode": false, "registration_enabled": true}', 'Application configuration'),
('security_config', '{"password_min_length": 8, "session_timeout": 3600}', 'Security settings')
ON CONFLICT (key) DO NOTHING;

-- Insert sample analytics data
INSERT INTO analytics (metric, value, change_percentage, period, category, description) VALUES
('Total Revenue', 1250000, 12.5, 'monthly', 'financial', 'Monthly revenue tracking'),
('Active Users', 1250, 8.3, 'weekly', 'user', 'Weekly active user count'),
('Investment Packages', 45, 15.2, 'monthly', 'product', 'Available investment packages')
ON CONFLICT DO NOTHING;

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('profile-photos', 'profile-photos', true),
('partnership-docs', 'partnership-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (simplified system)

CREATE POLICY "Admins can view all documents" ON storage.objects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'superadmin')
        )
    );

-- Permetti agli utenti autenticati di vedere solo le proprie righe
CREATE POLICY "Users can view their own clients"
  ON public.clients
  FOR SELECT
  USING (auth.uid() = user_id);

-- Permetti agli utenti autenticati di inserire righe dove user_id = auth.uid()
CREATE POLICY "Users can insert their own clients"
  ON public.clients
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Permetti agli utenti autenticati di aggiornare solo le proprie righe
CREATE POLICY "Users can update their own clients"
  ON public.clients
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Permetti agli utenti autenticati di cancellare solo le proprie righe
CREATE POLICY "Users can delete their own clients"
  ON public.clients
  FOR DELETE
  USING (auth.uid() = user_id);

-- Success message
SELECT 'Database setup completed successfully!' as status; 