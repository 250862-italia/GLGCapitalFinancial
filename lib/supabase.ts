// Re-export del client Supabase unificato
export { 
  supabase, 
  supabaseAdmin, 
  createSupabaseClient, 
  createSupabaseAdminClient,
  getSupabaseClient 
} from './supabase-client';

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
