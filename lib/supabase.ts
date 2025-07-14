import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30';
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
