-- Fix Security Issues Identified by Supabase Database Linter
-- ========================================================

-- 1. Fix Function Search Path Mutable Issue
-- =========================================

-- Drop the existing function
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- 2. Enable Leaked Password Protection
-- ===================================
-- This needs to be done through Supabase Dashboard or CLI
-- Go to: Authentication > Settings > Password Security
-- Enable "Leaked password protection"

-- 3. Enable MFA Options
-- =====================
-- This needs to be done through Supabase Dashboard
-- Go to: Authentication > Settings > Multi-factor Authentication
-- Enable: TOTP, SMS, Email

-- 4. Additional Security Improvements
-- ==================================

-- Create a secure function for updating timestamps
CREATE OR REPLACE FUNCTION public.secure_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Create a secure function for audit logging
CREATE OR REPLACE FUNCTION public.audit_log_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log changes to audit table (if exists)
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id', true), NOW());
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), NULL, current_setting('app.current_user_id', true), NOW());
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, TG_OP, NULL, row_to_json(NEW), current_setting('app.current_user_id', true), NOW());
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- 5. Create audit_logs table if it doesn't exist
-- ==============================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Add RLS to audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- 6. Update existing triggers to use secure functions
-- ===================================================

-- Example: Update users table trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.profiles;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_update_timestamp();

-- Example: Update notes table trigger
DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_update_timestamp();

-- Example: Update investments table trigger
DROP TRIGGER IF EXISTS update_investments_updated_at ON public.investments;
CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON public.investments
    FOR EACH ROW
    EXECUTE FUNCTION public.secure_update_timestamp();

-- 7. Security Function to Set Current User Context
-- ================================================
CREATE OR REPLACE FUNCTION public.set_current_user_context(user_id TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id, false);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- 8. Grant necessary permissions
-- =============================
GRANT EXECUTE ON FUNCTION public.secure_update_timestamp() TO authenticated;
GRANT EXECUTE ON FUNCTION public.audit_log_change() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_user_context(TEXT) TO authenticated;

-- Grant permissions on audit_logs table
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT INSERT ON public.audit_logs TO authenticated;

-- 9. Create indexes for better performance
-- =======================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);

-- 10. Add security headers function
-- =================================
CREATE OR REPLACE FUNCTION public.get_security_headers()
RETURNS JSONB AS $$
BEGIN
    RETURN jsonb_build_object(
        'strict-transport-security', 'max-age=31536000; includeSubDomains',
        'x-content-type-options', 'nosniff',
        'x-frame-options', 'DENY',
        'x-xss-protection', '1; mode=block',
        'referrer-policy', 'strict-origin-when-cross-origin',
        'content-security-policy', 'default-src ''self''; script-src ''self'' ''unsafe-inline''; style-src ''self'' ''unsafe-inline''; img-src ''self'' data: https:; font-src ''self''; connect-src ''self'' https://api.supabase.co;'
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_security_headers() TO authenticated;

-- 11. Create security monitoring function
-- ======================================
CREATE OR REPLACE FUNCTION public.log_security_event(
    event_type TEXT,
    event_details JSONB DEFAULT NULL,
    severity TEXT DEFAULT 'info'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        table_name,
        operation,
        new_data,
        user_id,
        timestamp
    ) VALUES (
        'security_events',
        event_type,
        event_details,
        current_setting('app.current_user_id', true),
        NOW()
    );
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.log_security_event(TEXT, JSONB, TEXT) TO authenticated;

-- 12. Final verification
-- ======================
-- Check if the function was created with proper search_path
SELECT 
    proname,
    prosrc,
    proconfig
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- Show all security functions
SELECT 
    proname as function_name,
    proconfig as security_settings
FROM pg_proc 
WHERE proname IN ('secure_update_timestamp', 'audit_log_change', 'set_current_user_context')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 