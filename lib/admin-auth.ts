import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphZWFrd2JwaXF6aHl3aGxxcXNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU5NzI5MCwiZXhwIjoyMDUwMTczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin';
  created_at: string;
}

export const verifyAdminToken = async (token: string): Promise<boolean> => {
  try {
    // Token di test per sviluppo
    if (token === 'admin_test_token_123') {
      return true;
    }
    
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;
    
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    return profile?.role === 'admin';
  } catch (error) {
    console.error('Admin verification error:', error);
    return false;
  }
};

export const createAdminUser = async (email: string, password: string): Promise<boolean> => {
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });
    
    if (error || !user) return false;
    
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email,
        role: 'admin',
        created_at: new Date().toISOString()
      });
    
    return !profileError;
  } catch (error) {
    console.error('Create admin error:', error);
    return false;
  }
}; 