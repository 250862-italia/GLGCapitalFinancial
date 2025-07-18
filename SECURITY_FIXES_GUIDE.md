# Security Fixes Guide

## Issues Identified by Supabase Database Linter

### 1. Function Search Path Mutable
**Issue**: Function `public.update_updated_at_column` has a role mutable search_path
**Risk**: Potential security vulnerability in database functions
**Fix**: Recreate function with explicit search_path

### 2. Leaked Password Protection Disabled
**Issue**: Supabase Auth prevents the use of compromised passwords by checking against HaveIBeenPwned.org
**Risk**: Users can use known compromised passwords
**Fix**: Enable leaked password protection in Supabase Dashboard

### 3. Insufficient MFA Options
**Issue**: Too few multi-factor authentication options enabled
**Risk**: Weakened account security
**Fix**: Enable more MFA methods in Supabase Dashboard

## Step-by-Step Fixes

### Step 1: Fix Function Search Path (Database)

**Option A: Using Supabase Dashboard SQL Editor**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
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
```

**Option B: Using Supabase CLI**

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

4. Run the SQL:
   ```bash
   supabase db reset --linked
   ```

### Step 2: Enable Leaked Password Protection

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Click on **Password Security**
4. Enable **"Leaked password protection"**
5. Save changes

### Step 3: Enable MFA Options

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Settings**
3. Click on **Multi-factor Authentication**
4. Enable the following options:
   - ✅ **TOTP (Time-based One-Time Password)**
   - ✅ **SMS** (if available for your plan)
   - ✅ **Email**

### Step 4: Additional Security Improvements

Run the following SQL in the Supabase SQL Editor for enhanced security:

```sql
-- Create audit_logs table for security monitoring
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
```

### Step 5: Update Application Code

Add security monitoring to your application:

```typescript
// lib/security-monitor.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function logSecurityEvent(
  eventType: string,
  eventDetails?: any,
  severity: 'info' | 'warning' | 'error' = 'info'
) {
  try {
    await supabase.from('audit_logs').insert({
      table_name: 'security_events',
      operation: eventType,
      new_data: eventDetails,
      user_id: (await supabase.auth.getUser()).data.user?.id,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Usage examples:
// await logSecurityEvent('login_attempt', { email, success: true });
// await logSecurityEvent('password_change', { user_id }, 'warning');
// await logSecurityEvent('suspicious_activity', { ip, action }, 'error');
```

### Step 6: Test Security Improvements

1. **Test Leaked Password Protection**:
   - Try to register with a known compromised password (e.g., "password123")
   - Should be rejected with an error message

2. **Test MFA Setup**:
   - Go to user profile settings
   - Set up TOTP authentication
   - Verify MFA is working during login

3. **Test Audit Logging**:
   - Perform some actions in the application
   - Check the audit_logs table in Supabase
   - Verify events are being logged

## Verification Commands

### Check Function Search Path
```sql
SELECT 
    proname,
    prosrc,
    proconfig
FROM pg_proc 
WHERE proname = 'update_updated_at_column' 
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
```

### Check Audit Logs Table
```sql
SELECT COUNT(*) FROM public.audit_logs;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Security Best Practices

### 1. Regular Security Audits
- Run Supabase Database Linter monthly
- Review audit logs for suspicious activity
- Monitor failed login attempts

### 2. Password Policies
- Enforce strong password requirements
- Enable leaked password protection
- Implement password expiration policies

### 3. MFA Enforcement
- Require MFA for admin accounts
- Consider requiring MFA for all users
- Provide multiple MFA options

### 4. Monitoring and Alerting
- Set up alerts for suspicious activity
- Monitor audit logs regularly
- Implement rate limiting on sensitive endpoints

## Troubleshooting

### Common Issues

1. **Function recreation fails**:
   - Check if function is being used by triggers
   - Drop and recreate triggers after function fix

2. **MFA not working**:
   - Verify MFA is enabled in Supabase Dashboard
   - Check if user has completed MFA setup
   - Test with different MFA methods

3. **Audit logs not working**:
   - Check RLS policies
   - Verify user has proper permissions
   - Check for SQL errors in logs

### Support Resources

- [Supabase Security Documentation](https://supabase.com/docs/guides/security)
- [Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-security)

## Completion Checklist

- [ ] Function search_path fixed
- [ ] Leaked password protection enabled
- [ ] MFA options enabled
- [ ] Audit logging implemented
- [ ] Security monitoring added
- [ ] Tests completed
- [ ] Documentation updated

## Next Steps

1. **Monitor**: Watch for any security-related issues
2. **Educate**: Train users on MFA setup
3. **Review**: Regular security audits
4. **Update**: Keep security measures current 