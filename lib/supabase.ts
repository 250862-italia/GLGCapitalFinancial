import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        success: false,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      };
    }
    
    return {
      success: true,
      message: 'Connection successful',
      data
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
      details: error.stack,
      hint: 'Check your environment variables and network connection',
      code: 'CONNECTION_ERROR'
    };
  }
}
