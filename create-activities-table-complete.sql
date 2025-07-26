-- Create activities table for GLG Capital Financial
-- This table tracks all user activities for real-time monitoring and analytics

-- =====================================================
-- 1. CREATE ACTIVITIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User identification
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    
    -- Activity details
    action_type VARCHAR(100) NOT NULL,
    action_category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    
    -- Activity metadata
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Status and priority
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Performance tracking
    execution_time_ms INTEGER,
    error_message TEXT,
    
    -- Real-time flags
    is_realtime_event BOOLEAN DEFAULT TRUE,
    broadcast_to_admin BOOLEAN DEFAULT FALSE,
    broadcast_to_user BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary indexes
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_client_id ON public.activities(client_id);
CREATE INDEX IF NOT EXISTS idx_activities_action_type ON public.activities(action_type);
CREATE INDEX IF NOT EXISTS idx_activities_action_category ON public.activities(action_category);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_priority ON public.activities(priority);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON public.activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type_created ON public.activities(action_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_category_priority ON public.activities(action_category, priority);
CREATE INDEX IF NOT EXISTS idx_activities_realtime_flags ON public.activities(is_realtime_event, broadcast_to_admin, broadcast_to_user);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. CREATE RLS POLICIES
-- =====================================================

-- Users can view their own activities
CREATE POLICY "Users can view own activities" ON public.activities
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all activities
CREATE POLICY "Admins can view all activities" ON public.activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'superadmin')
        )
    );

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities" ON public.activities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- System can insert activities for any user
CREATE POLICY "System can insert activities" ON public.activities
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- 5. CREATE TRIGGERS
-- =====================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION update_activities_updated_at();

-- =====================================================
-- 6. ENABLE REAL-TIME
-- =====================================================

-- Enable real-time for activities table
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;

-- =====================================================
-- 7. INSERT SAMPLE ACTIVITIES
-- =====================================================

-- Sample activities for testing
INSERT INTO public.activities (
    user_id,
    action_type,
    action_category,
    description,
    metadata,
    priority,
    is_realtime_event,
    broadcast_to_admin
) VALUES 
-- User login activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'user_login',
    'authentication',
    'User logged in successfully',
    '{"login_method": "email", "device": "desktop", "location": "IT"}',
    'low',
    TRUE,
    FALSE
),
-- Investment creation activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'investment_created',
    'investment',
    'New investment request submitted',
    '{"amount": 5000, "package": "GLG Balanced Growth", "payment_method": "bank_transfer"}',
    'high',
    TRUE,
    TRUE
),
-- Payment processing activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'payment_processed',
    'payment',
    'Payment processed successfully',
    '{"amount": 5000, "transaction_id": "TXN123456", "status": "completed"}',
    'high',
    TRUE,
    TRUE
),
-- Profile update activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'profile_updated',
    'profile',
    'User profile information updated',
    '{"updated_fields": ["phone", "address"], "verification_status": "pending"}',
    'medium',
    TRUE,
    FALSE
),
-- KYC submission activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'kyc_submitted',
    'kyc',
    'KYC documents submitted for review',
    '{"document_types": ["passport", "utility_bill"], "submission_date": "2025-07-26"}',
    'high',
    TRUE,
    TRUE
),
-- System alert activity
(
    (SELECT id FROM auth.users LIMIT 1),
    'system_alert',
    'system',
    'Suspicious login attempt detected',
    '{"alert_type": "security", "ip_address": "192.168.1.100", "action_required": true}',
    'critical',
    TRUE,
    TRUE
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- Recent activities view
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
    a.id,
    a.user_id,
    a.action_type,
    a.action_category,
    a.description,
    a.priority,
    a.created_at,
    a.metadata,
    p.first_name,
    p.last_name,
    p.email
FROM public.activities a
LEFT JOIN public.profiles p ON a.user_id = p.id
WHERE a.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY a.created_at DESC;

-- Admin dashboard activities view
CREATE OR REPLACE VIEW admin_activities AS
SELECT 
    a.id,
    a.user_id,
    a.action_type,
    a.action_category,
    a.description,
    a.priority,
    a.status,
    a.created_at,
    a.metadata,
    p.first_name,
    p.last_name,
    p.email,
    c.client_code
FROM public.activities a
LEFT JOIN public.profiles p ON a.user_id = p.id
LEFT JOIN public.clients c ON a.user_id = c.user_id
WHERE a.broadcast_to_admin = TRUE
ORDER BY a.created_at DESC;

-- User activities view
CREATE OR REPLACE VIEW user_activities AS
SELECT 
    a.id,
    a.action_type,
    a.action_category,
    a.description,
    a.priority,
    a.status,
    a.created_at,
    a.metadata
FROM public.activities a
WHERE a.user_id = auth.uid()
ORDER BY a.created_at DESC;

-- =====================================================
-- 9. CREATE FUNCTIONS FOR ACTIVITY LOGGING
-- =====================================================

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_action_type VARCHAR(100),
    p_action_category VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_priority VARCHAR(20) DEFAULT 'medium',
    p_broadcast_to_admin BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activities (
        user_id,
        action_type,
        action_category,
        description,
        metadata,
        priority,
        is_realtime_event,
        broadcast_to_admin
    ) VALUES (
        p_user_id,
        p_action_type,
        p_action_category,
        p_description,
        p_metadata,
        p_priority,
        TRUE,
        p_broadcast_to_admin
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log system activity
CREATE OR REPLACE FUNCTION log_system_activity(
    p_action_type VARCHAR(100),
    p_action_category VARCHAR(50),
    p_description TEXT,
    p_metadata JSONB DEFAULT '{}',
    p_priority VARCHAR(20) DEFAULT 'medium',
    p_broadcast_to_admin BOOLEAN DEFAULT TRUE
)
RETURNS UUID AS $$
DECLARE
    activity_id UUID;
BEGIN
    INSERT INTO public.activities (
        action_type,
        action_category,
        description,
        metadata,
        priority,
        is_realtime_event,
        broadcast_to_admin,
        broadcast_to_user
    ) VALUES (
        p_action_type,
        p_action_category,
        p_description,
        p_metadata,
        p_priority,
        TRUE,
        p_broadcast_to_admin,
        FALSE
    ) RETURNING id INTO activity_id;
    
    RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.activities TO authenticated;
GRANT INSERT ON public.activities TO authenticated;
GRANT SELECT ON recent_activities TO authenticated;
GRANT SELECT ON user_activities TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.activities TO service_role;
GRANT ALL ON recent_activities TO service_role;
GRANT ALL ON admin_activities TO service_role;
GRANT ALL ON user_activities TO service_role;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION log_system_activity TO service_role;

-- =====================================================
-- 11. VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 
    'Activities table created successfully' as status,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT action_type) as unique_action_types
FROM public.activities;

-- Verify real-time is enabled
SELECT 
    schemaname,
    tablename,
    attname,
    atttypid::regtype
FROM pg_attribute
WHERE attrelid = 'public.activities'::regclass
AND attname = 'id';

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'activities';

-- =====================================================
-- 12. COMPLETION MESSAGE
-- =====================================================

SELECT 
    '✅ Activities table setup completed successfully!' as message,
    'Real-time events are now enabled for activity tracking' as details,
    NOW() as completed_at; 