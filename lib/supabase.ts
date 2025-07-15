import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Disable session persistence during build
    autoRefreshToken: false, // Disable auto refresh during build
  },
  global: {
    headers: {
      'X-Client-Info': 'glg-dashboard'
    }
  }
});

// Admin client for server-side operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30';

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'glg-dashboard-admin'
    }
  }
});

// Test connection function with better error handling
export async function testSupabaseConnection() {
  try {
    // Check if we're in a build environment
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.log('Build environment detected, skipping Supabase connection test');
      return {
        success: true,
        message: 'Build environment - connection test skipped',
        data: null
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.warn('Supabase connection test failed:', error.message);
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
    console.warn('Supabase connection test error:', error.message);
    return {
      success: false,
      message: error.message,
      details: error.stack,
      hint: 'Check your environment variables and network connection',
      code: 'CONNECTION_ERROR'
    };
  }
}

// Safe Supabase query wrapper
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T | null = null
): Promise<{ data: T | null; error: any }> {
  try {
    // Skip queries during build time
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
      console.log('Build environment detected, returning fallback data');
      return { data: fallbackData, error: null };
    }

    return await queryFn();
  } catch (error: any) {
    console.warn('Supabase query failed, using fallback data:', error.message);
    return { data: fallbackData, error };
  }
}
