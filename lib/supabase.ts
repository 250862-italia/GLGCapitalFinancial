// Supabase client con nuovo progetto
import { createClient } from '@supabase/supabase-js';

// Configurazione per il nuovo progetto Supabase
const SUPABASE_CONFIG = {
  url: 'https://zaeakwbpiqzhywhlqqse.supabase.co',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
};

// Client Supabase per il nuovo progetto
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Client admin per il nuovo progetto
export const supabaseAdmin = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.serviceKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Funzioni per compatibilità
export const createSupabaseClient = () => supabase;
export const createSupabaseAdminClient = () => supabaseAdmin;

// Health check function
export async function getSupabaseHealth() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        error: error.message,
        checkpoints: [],
        checkpoint: null
      };
    }
    
    return {
      status: 'healthy',
      responseTime,
      error: null,
      checkpoints: [{
        name: 'database',
        region: 'fra1',
        status: 'healthy',
        responseTime,
        lastCheck: new Date().toISOString()
      }],
      checkpoint: {
        name: 'database',
        region: 'fra1',
        status: 'healthy'
      }
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'unhealthy',
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      checkpoints: [],
      checkpoint: null
    };
  }
}

console.log('🔧 Using new Supabase project: zaeakwbpiqzhywhlqqse.supabase.co');
