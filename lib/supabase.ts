// Re-export del client Supabase unificato
export { 
  supabase, 
  supabaseAdmin, 
  createSupabaseClient, 
  createSupabaseAdminClient,
  getSupabaseClient 
} from './supabase-client';

// Funzioni per compatibilità con file esistenti
export const getSupabaseAdmin = () => supabaseAdmin;

// Funzioni per checkpoints (placeholder)
export const getAllCheckpoints = async () => {
  return { data: [], error: null };
};

export const getCurrentCheckpoint = async () => {
  return { data: null, error: null };
};

export const refreshCheckpoints = async () => {
  return { data: [], error: null };
};

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

console.log('🔧 Using unified Supabase client from supabase-client.ts');
