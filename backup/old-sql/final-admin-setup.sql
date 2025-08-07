-- Final Admin Dashboard Setup - Complete Solution
-- Run this script in Supabase SQL Editor to make admin dashboard fully operational

-- 1. Create team_members table (without user_id constraint initially)
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(50),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create partnerships table
CREATE TABLE IF NOT EXISTS public.partnerships (
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

-- 3. Create content table
CREATE TABLE IF NOT EXISTS public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('news', 'article', 'announcement', 'policy')),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    author_id UUID REFERENCES auth.users(id),
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    page_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add missing columns to clients table if they don't exist
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS account_holder VARCHAR(255),
ADD COLUMN IF NOT EXISTS account_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS swift_code VARCHAR(20),
ADD COLUMN IF NOT EXISTS iban VARCHAR(50),
ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality VARCHAR(100),
ADD COLUMN IF NOT EXISTS occupation VARCHAR(255),
ADD COLUMN IF NOT EXISTS annual_income DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS investment_experience VARCHAR(50),
ADD COLUMN IF NOT EXISTS risk_tolerance VARCHAR(50),
ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON public.team_members(status);
CREATE INDEX IF NOT EXISTS idx_partnerships_status ON public.partnerships(status);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON public.content(status);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON public.analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics(created_at);

-- 7. Enable RLS on all tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for team_members
DROP POLICY IF EXISTS "Team members are viewable by admins" ON public.team_members;
CREATE POLICY "Team members are viewable by admins" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can insert team members" ON public.team_members;
CREATE POLICY "Only admins can insert team members" ON public.team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can update team members" ON public.team_members;
CREATE POLICY "Only admins can update team members" ON public.team_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete team members" ON public.team_members;
CREATE POLICY "Only admins can delete team members" ON public.team_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 9. Create RLS policies for partnerships
DROP POLICY IF EXISTS "Partnerships are viewable by admins" ON public.partnerships;
CREATE POLICY "Partnerships are viewable by admins" ON public.partnerships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can insert partnerships" ON public.partnerships;
CREATE POLICY "Only admins can insert partnerships" ON public.partnerships
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can update partnerships" ON public.partnerships;
CREATE POLICY "Only admins can update partnerships" ON public.partnerships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete partnerships" ON public.partnerships;
CREATE POLICY "Only admins can delete partnerships" ON public.partnerships
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 10. Create RLS policies for content
DROP POLICY IF EXISTS "Content is viewable by everyone" ON public.content;
CREATE POLICY "Content is viewable by everyone" ON public.content
    FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Only admins can insert content" ON public.content;
CREATE POLICY "Only admins can insert content" ON public.content
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can update content" ON public.content;
CREATE POLICY "Only admins can update content" ON public.content
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Only admins can delete content" ON public.content;
CREATE POLICY "Only admins can delete content" ON public.content
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 11. Create RLS policies for analytics
DROP POLICY IF EXISTS "Analytics are viewable by admins" ON public.analytics;
CREATE POLICY "Analytics are viewable by admins" ON public.analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics;
CREATE POLICY "Anyone can insert analytics" ON public.analytics
    FOR INSERT WITH CHECK (true);

-- 12. Fix packages RLS policy to allow admin to create packages
DROP POLICY IF EXISTS "Only admins can insert packages" ON public.packages;
CREATE POLICY "Only admins can insert packages" ON public.packages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.email = 'admin@glgcapital.com'
        )
    );

-- 13. Insert sample data (without user_id to avoid foreign key issues)
INSERT INTO public.team_members (first_name, last_name, email, role, department, status) VALUES
('John', 'Doe', 'john.doe@glgcapital.com', 'Senior Manager', 'Operations', 'active'),
('Jane', 'Smith', 'jane.smith@glgcapital.com', 'Analyst', 'Research', 'active'),
('Mike', 'Johnson', 'mike.johnson@glgcapital.com', 'Director', 'Sales', 'active')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.partnerships (name, description, partner_type, contact_person, contact_email, status) VALUES
('TechCorp Solutions', 'Technology partnership for digital transformation', 'Technology', 'Sarah Wilson', 'sarah@techcorp.com', 'active'),
('Global Finance Ltd', 'Financial services partnership', 'Finance', 'David Brown', 'david@globalfinance.com', 'active'),
('Innovation Labs', 'Research and development partnership', 'R&D', 'Lisa Chen', 'lisa@innovationlabs.com', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO public.content (title, content, type, status, author_id) VALUES
('Welcome to GLG Capital', 'Welcome to our new platform...', 'announcement', 'published', NULL),
('Investment Guidelines', 'Our investment guidelines and policies...', 'policy', 'published', NULL),
('Market Update Q1 2024', 'Latest market insights and analysis...', 'news', 'published', NULL)
ON CONFLICT DO NOTHING;

-- 14. Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partnerships_updated_at ON public.partnerships;
CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON public.partnerships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_content_updated_at ON public.content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Verification queries
SELECT 'Admin Dashboard Setup Complete!' as message;

SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests', 'team_members', 'partnerships', 'content', 'analytics') 
        THEN '✅ Created' 
        ELSE '❌ Missing' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('packages', 'investments', 'payments', 'kyc_requests', 'informational_requests', 'team_members', 'partnerships', 'content', 'analytics')
ORDER BY table_name;

-- 16. Show sample data
SELECT 'Team Members:' as info;
SELECT first_name, last_name, email, role, status FROM public.team_members;

SELECT 'Partnerships:' as info;
SELECT name, partner_type, status FROM public.partnerships;

SELECT 'Content:' as info;
SELECT title, type, status FROM public.content; 