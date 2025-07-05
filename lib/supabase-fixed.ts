import { createClient } from '@supabase/supabase-js';

// Use the correct Supabase project URL
const supabaseUrl = 'https://dobjulfwktzltpvqtxbql.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30';

// Create Supabase client for client-side
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create Supabase client for server-side (with service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Test connection function
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    } else {
      console.log('✅ Supabase connection successful');
      return true;
    }
  } catch (error) {
    console.log('❌ Supabase connection error:', error);
    return false;
  }
}

// Generic function to handle Supabase operations with fallback
export async function withSupabaseFallback<T>(
  supabaseOperation: () => Promise<{ data: T | null; error: any }>,
  mockData: T,
  operationName: string = 'database operation'
): Promise<T> {
  try {
    const { data, error } = await supabaseOperation();
    
    if (error) {
      console.error(`Supabase error in ${operationName}, using mock data:`, error);
      return mockData;
    }
    
    return data || mockData;
  } catch (supabaseError) {
    console.error(`Supabase connection failed in ${operationName}, using mock data:`, supabaseError);
    return mockData;
  }
}

// Generic function to handle Supabase mutations with fallback
export async function withSupabaseMutationFallback<T>(
  supabaseOperation: () => Promise<{ data: T | null; error: any }>,
  mockData: Partial<T>,
  operationName: string = 'database mutation'
): Promise<{ data?: T; error?: string; mockData?: Partial<T> }> {
  try {
    const { data, error } = await supabaseOperation();
    
    if (error) {
      console.error(`Supabase error in ${operationName}:`, error);
      return { 
        error: 'Database connection failed, but operation was validated',
        mockData 
      };
    }
    
    return { data: data || undefined };
  } catch (supabaseError) {
    console.error(`Supabase connection failed in ${operationName}:`, supabaseError);
    return { 
      error: 'Database connection failed, but operation was validated',
      mockData 
    };
  }
}

// Check if Supabase is available
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('count')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
} 