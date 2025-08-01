// Mock Supabase client per compatibilità - Sistema completamente offline
import { createClient } from '@supabase/supabase-js';

// Configurazione mock per Supabase
const MOCK_SUPABASE_CONFIG = {
  url: 'https://mock.supabase.co',
  anonKey: 'mock-anon-key',
  serviceKey: 'mock-service-key'
};

// Client Supabase mock che non fa chiamate reali
export const supabase = createClient(
  MOCK_SUPABASE_CONFIG.url,
  MOCK_SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Client admin mock
export const supabaseAdmin = createClient(
  MOCK_SUPABASE_CONFIG.url,
  MOCK_SUPABASE_CONFIG.serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

// Funzioni mock per compatibilità
export const createSupabaseClient = () => supabase;
export const createSupabaseAdminClient = () => supabaseAdmin;

console.log('🔧 Using mock Supabase client - System running in offline mode');
