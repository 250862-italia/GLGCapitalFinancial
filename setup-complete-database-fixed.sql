-- Complete Database Setup for GLG Dashboard (FIXED VERSION)
-- Run this script in your Supabase SQL Editor

-- Drop existing tables if they exist
DROP TABLE IF EXISTS team_activity_logs CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS team_roles CASCADE;
DROP TABLE IF EXISTS team_departments CASCADE;
DROP TABLE IF EXISTS partnership_activities CASCADE;
DROP TABLE IF EXISTS partnerships CASCADE;
DROP TABLE IF EXISTS partnership_statuses CASCADE;
DROP TABLE IF EXISTS partnership_types CASCADE;
DROP TABLE IF EXISTS content_article_tags CASCADE;
DROP TABLE IF EXISTS content_articles CASCADE;
DROP TABLE IF EXISTS content_tags CASCADE;
DROP TABLE IF EXISTS content_categories CASCADE;
DROP TABLE IF EXISTS informational_requests CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS analytics CASCADE;

-- 1. Create analytics table
CREATE TABLE IF NOT EXISTS analytics (
    id SERIAL PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    period VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create content tables
CREATE TABLE IF NOT EXISTS content_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category_id INTEGER REFERENCES content_categories(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_article_tags (
    article_id INTEGER REFERENCES content_articles(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 3. Create team management tables (FIXED)
CREATE TABLE IF NOT EXISTS team_departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    department_id INTEGER REFERENCES team_departments(id),
    role_id INTEGER REFERENCES team_roles(id),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_activity_logs (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES team_members(id) ON DELETE CASCADE, -- FIXED: now references team_members.id (integer)
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create partnerships tables
CREATE TABLE IF NOT EXISTS partnership_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partnership_statuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partnerships (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type_id INTEGER REFERENCES partnership_types(id),
    status_id INTEGER REFERENCES partnership_statuses(id),
    start_date DATE,
    end_date DATE,
    value DECIMAL(15,2),
    contact_person VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS partnership_activities (
    id SERIAL PRIMARY KEY,
    partnership_id INTEGER REFERENCES partnerships(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    transaction_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create informational requests table
CREATE TABLE IF NOT EXISTS informational_requests (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'completed')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Insert default data
INSERT INTO analytics (metric_name, metric_value, period, status) VALUES
('Total Users', 1250, 'monthly', 'active'),
('Active Investments', 89, 'monthly', 'active'),
('Revenue', 125000.00, 'monthly', 'active'),
('New Registrations', 45, 'weekly', 'active'),
('KYC Approvals', 23, 'weekly', 'active'),
('Pending KYC', 12, 'weekly', 'active'),
('Investment Packages', 8, 'monthly', 'active'),
('Partnerships', 15, 'monthly', 'active'),
('Support Tickets', 34, 'weekly', 'active'),
('Email Requests', 67, 'weekly', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO content_categories (name, description) VALUES
('Investment News', 'Latest news about investments and markets'),
('Company Updates', 'Updates about GLG Capital Group'),
('Market Analysis', 'Detailed market analysis and insights'),
('Educational Content', 'Educational materials for investors')
ON CONFLICT DO NOTHING;

INSERT INTO content_tags (name, color) VALUES
('Investment', '#10B981'),
('Market', '#3B82F6'),
('News', '#F59E0B'),
('Analysis', '#8B5CF6'),
('Education', '#EF4444')
ON CONFLICT DO NOTHING;

INSERT INTO team_departments (name, description) VALUES
('Management', 'Executive management team'),
('Sales', 'Sales and business development'),
('Support', 'Customer support and service'),
('IT', 'Information technology and development'),
('Finance', 'Financial operations and accounting')
ON CONFLICT DO NOTHING;

INSERT INTO team_roles (name, description, permissions) VALUES
('Super Admin', 'Full system access', '{"all": true}'),
('Admin', 'Administrative access', '{"users": true, "content": true, "analytics": true}'),
('Manager', 'Team management access', '{"team": true, "reports": true}'),
('Support', 'Customer support access', '{"support": true, "users": "read"}')
ON CONFLICT DO NOTHING;

INSERT INTO partnership_types (name, description) VALUES
('Strategic Partnership', 'Long-term strategic business partnership'),
('Investment Partnership', 'Partnership for investment opportunities'),
('Technology Partnership', 'Technology and platform partnership'),
('Marketing Partnership', 'Marketing and promotional partnership')
ON CONFLICT DO NOTHING;

INSERT INTO partnership_statuses (name, color) VALUES
('Active', '#10B981'),
('Pending', '#F59E0B'),
('Expired', '#EF4444'),
('Under Review', '#3B82F6'),
('Terminated', '#6B7280')
ON CONFLICT DO NOTHING;

INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'GLG Capital Group LLC', 'string', 'Website name'),
('contact_email', 'info@glgcapitalgroup.com', 'string', 'Contact email'),
('support_email', 'support@glgcapitalgroup.com', 'string', 'Support email'),
('maintenance_mode', 'false', 'boolean', 'Maintenance mode status'),
('max_file_size', '10485760', 'number', 'Maximum file upload size in bytes'),
('allowed_file_types', '["jpg","jpeg","png","pdf","doc","docx"]', 'json', 'Allowed file types for uploads')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_metric_name ON analytics(metric_name);
CREATE INDEX IF NOT EXISTS idx_analytics_period ON analytics(period);
CREATE INDEX IF NOT EXISTS idx_content_articles_status ON content_articles(status);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON partnerships(status_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_informational_requests_status ON informational_requests(status);

-- 10. Enable Row Level Security (RLS)
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE informational_requests ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies for admin access
CREATE POLICY "Admin can view all analytics" ON analytics FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all content" ON content_articles FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all team members" ON team_members FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all partnerships" ON partnerships FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all settings" ON settings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all payments" ON payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admin can view all informational requests" ON informational_requests FOR SELECT USING (auth.role() = 'authenticated');

-- 12. Create RLS policies for user access
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own informational requests" ON informational_requests FOR SELECT USING (auth.uid() = user_id);

-- 13. Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. Create triggers for automatic timestamps
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_articles_updated_at BEFORE UPDATE ON content_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON partnerships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_informational_requests_updated_at BEFORE UPDATE ON informational_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES
('kyc-documents', 'kyc-documents', false),
('profile-photos', 'profile-photos', true),
('partnership-documents', 'partnership-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 16. Create storage policies
CREATE POLICY "Users can upload their own KYC documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own KYC documents" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own profile photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their own profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all KYC documents" ON storage.objects FOR SELECT USING (bucket_id = 'kyc-documents' AND auth.role() = 'authenticated');
CREATE POLICY "Admins can view all profile photos" ON storage.objects FOR SELECT USING (bucket_id = 'profile-photos' AND auth.role() = 'authenticated');

-- Success message
SELECT 'Database setup completed successfully!' as status; 