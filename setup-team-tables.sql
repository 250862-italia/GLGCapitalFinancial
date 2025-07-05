-- Team Management Tables Setup
-- Run this script in your Supabase SQL editor

-- 1. Team members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'analyst', 'support')),
    department VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending')),
    join_date DATE NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    permissions TEXT[] DEFAULT '{}',
    avatar_url VARCHAR(500),
    bio TEXT,
    skills TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Team departments table
CREATE TABLE IF NOT EXISTS team_departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    manager_id UUID REFERENCES team_members(id),
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Team roles table
CREATE TABLE IF NOT EXISTS team_roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions TEXT[] DEFAULT '{}',
    level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Team activity log table
CREATE TABLE IF NOT EXISTS team_activity_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Team permissions table
CREATE TABLE IF NOT EXISTS team_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample departments
INSERT INTO team_departments (name, description, color) VALUES
('Management', 'Executive and senior management team', '#10B981'),
('Operations', 'Day-to-day operations and administration', '#F59E0B'),
('Analytics', 'Data analysis and reporting', '#8B5CF6'),
('Customer Service', 'Client support and service', '#EF4444'),
('IT & Development', 'Technology and development team', '#3B82F6'),
('Finance', 'Financial operations and accounting', '#06B6D4'),
('Marketing', 'Marketing and communications', '#EC4899')
ON CONFLICT (name) DO NOTHING;

-- Insert sample roles
INSERT INTO team_roles (name, description, permissions, level) VALUES
('admin', 'Full system administrator with all permissions', 
 ARRAY['full_access', 'user_management', 'analytics', 'content', 'team_management', 'settings', 'payments'], 1),
('manager', 'Department manager with limited administrative access', 
 ARRAY['analytics', 'content', 'team_view', 'reports', 'user_view'], 2),
('analyst', 'Data analyst with analytics and reporting access', 
 ARRAY['analytics', 'reports', 'data_export'], 3),
('support', 'Customer support with limited access', 
 ARRAY['support', 'user_view', 'ticket_management'], 4)
ON CONFLICT (name) DO NOTHING;

-- Insert sample permissions
INSERT INTO team_permissions (name, description, category) VALUES
('full_access', 'Full system access', 'system'),
('user_management', 'Manage users and accounts', 'users'),
('analytics', 'Access to analytics and reports', 'analytics'),
('content', 'Manage content and media', 'content'),
('team_management', 'Manage team members', 'team'),
('settings', 'Access to system settings', 'system'),
('payments', 'Manage payments and transactions', 'finance'),
('reports', 'Generate and view reports', 'analytics'),
('data_export', 'Export data and reports', 'analytics'),
('support', 'Access to support tools', 'support'),
('user_view', 'View user information', 'users'),
('ticket_management', 'Manage support tickets', 'support'),
('team_view', 'View team information', 'team')
ON CONFLICT (name) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (name, email, phone, role, department, status, join_date, permissions, bio, skills) VALUES
(
    'John Smith',
    'john.smith@glgcapitalgroupllc.com',
    '+1 786 798 8311',
    'admin',
    'Management',
    'active',
    '2023-01-15',
    ARRAY['full_access', 'user_management', 'analytics', 'content'],
    'Senior executive with over 15 years of experience in financial services and investment management.',
    ARRAY['Leadership', 'Strategic Planning', 'Financial Analysis', 'Team Management']
),
(
    'Maria Garcia',
    'maria.garcia@glgcapitalgroupllc.com',
    '+1 786 798 8312',
    'manager',
    'Operations',
    'active',
    '2023-03-20',
    ARRAY['analytics', 'content', 'team_view'],
    'Operations manager specializing in process optimization and team coordination.',
    ARRAY['Operations Management', 'Process Optimization', 'Team Leadership', 'Project Management']
),
(
    'David Chen',
    'david.chen@glgcapitalgroupllc.com',
    '+1 786 798 8313',
    'analyst',
    'Analytics',
    'active',
    '2023-06-10',
    ARRAY['analytics', 'reports'],
    'Data analyst with expertise in financial modeling and market analysis.',
    ARRAY['Data Analysis', 'Financial Modeling', 'Market Research', 'Statistical Analysis']
),
(
    'Sarah Johnson',
    'sarah.johnson@glgcapitalgroupllc.com',
    '+1 786 798 8314',
    'support',
    'Customer Service',
    'inactive',
    '2023-02-28',
    ARRAY['support', 'user_view'],
    'Customer service specialist with strong communication skills.',
    ARRAY['Customer Service', 'Communication', 'Problem Solving', 'Client Relations']
),
(
    'Michael Brown',
    'michael.brown@glgcapitalgroupllc.com',
    '+1 786 798 8315',
    'manager',
    'IT & Development',
    'active',
    '2023-04-15',
    ARRAY['analytics', 'content', 'team_view', 'settings'],
    'IT manager with expertise in system administration and development.',
    ARRAY['System Administration', 'Software Development', 'IT Management', 'Cybersecurity']
),
(
    'Lisa Wang',
    'lisa.wang@glgcapitalgroupllc.com',
    '+1 786 798 8316',
    'analyst',
    'Finance',
    'active',
    '2023-07-01',
    ARRAY['analytics', 'reports', 'data_export'],
    'Financial analyst specializing in investment analysis and portfolio management.',
    ARRAY['Financial Analysis', 'Portfolio Management', 'Investment Research', 'Risk Assessment']
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);
CREATE INDEX IF NOT EXISTS idx_team_members_department ON team_members(department);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_join_date ON team_members(join_date);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_member_id ON team_activity_log(member_id);
CREATE INDEX IF NOT EXISTS idx_team_activity_log_created_at ON team_activity_log(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members table
CREATE POLICY "Team members are viewable by authenticated users" ON team_members
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Team members can be managed by admins" ON team_members
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for other tables
CREATE POLICY "Departments are viewable by everyone" ON team_departments
    FOR SELECT USING (true);

CREATE POLICY "Roles are viewable by everyone" ON team_roles
    FOR SELECT USING (true);

CREATE POLICY "Activity log is viewable by authenticated users" ON team_activity_log
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permissions are viewable by everyone" ON team_permissions
    FOR SELECT USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for team_members table
CREATE TRIGGER update_team_members_updated_at 
    BEFORE UPDATE ON team_members 
    FOR EACH ROW 
    EXECUTE FUNCTION update_team_updated_at_column();

-- Create function to log team activity
CREATE OR REPLACE FUNCTION log_team_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO team_activity_log (member_id, action, description)
        VALUES (NEW.id, 'created', 'Team member created');
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO team_activity_log (member_id, action, description)
        VALUES (NEW.id, 'updated', 'Team member updated');
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO team_activity_log (member_id, action, description)
        VALUES (OLD.id, 'deleted', 'Team member deleted');
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for team activity logging
CREATE TRIGGER team_activity_log_trigger
    AFTER INSERT OR UPDATE OR DELETE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION log_team_activity();

-- Grant necessary permissions
GRANT ALL ON team_members TO authenticated;
GRANT ALL ON team_departments TO authenticated;
GRANT ALL ON team_roles TO authenticated;
GRANT ALL ON team_activity_log TO authenticated;
GRANT ALL ON team_permissions TO authenticated;

GRANT SELECT ON team_members TO anon;
GRANT SELECT ON team_departments TO anon;
GRANT SELECT ON team_roles TO anon;
GRANT SELECT ON team_permissions TO anon; 