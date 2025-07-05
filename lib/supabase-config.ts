// Supabase Configuration - NEW PROJECT
export const SUPABASE_CONFIG = {
  url: 'https://dobjulfwktzltpvqtxbql.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTI2MjYsImV4cCI6MjA2NjUyODYyNn0.wW9zZe9gD2ARxUpbCu0kgBZfujUnuq6XkXZz42RW0zY',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvYmp1bGZ3a3psdHB2cXR4YnFsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDk1MjYyNiwiZXhwIjoyMDY2NTI4NjI2fQ.wUZnwzSQcVoIYw5f4p-gc4I0jHzxN2VSIUkXfWn0V30'
};

// Environment variables fallback
export const getSupabaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_CONFIG.url;
};

export const getSupabaseAnonKey = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_CONFIG.anonKey;
};

export const getSupabaseServiceKey = () => {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_CONFIG.serviceKey;
}; 