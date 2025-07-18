import { createClient } from '@supabase/supabase-js';
import { getSupabaseClient, getCurrentCheckpoint, getAllCheckpoints, refreshCheckpoints, initializeCheckpoints } from './supabase-checkpoints';
import { getSupabaseFunctionRegion } from './supabase-region';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error('❌ Missing required Supabase environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey);
  
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing required Supabase environment variables');
  }
}

// Create Supabase clients
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
export const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!);

// New checkpoint-based client
export async function getSupabase() {
  try {
    return await getSupabaseClient();
  } catch (error) {
    console.warn('[SUPABASE] Checkpoint client failed, falling back to legacy client:', error);
    return supabase;
  }
}

// Enhanced edge function invocation with checkpoint support
export async function invokeEdgeFunction(name: string, body: any) {
  try {
    const client = await getSupabase();
    const region = getSupabaseFunctionRegion();
    
    console.log(`[EDGE-FUNCTION] Invoking ${name} in region ${region || 'default'}`);
    
    return await client.functions.invoke(name, {
      body,
      region,
    });
  } catch (error) {
    console.error(`[EDGE-FUNCTION] Failed to invoke ${name}:`, error);
    throw error;
  }
}

// Health check with checkpoint status
export async function getSupabaseHealth() {
  try {
    const currentCheckpoint = getCurrentCheckpoint();
    const allCheckpoints = getAllCheckpoints();
    
    if (!currentCheckpoint) {
      // Try to initialize checkpoints if none are active
      try {
        const { initializeCheckpoints } = await import('./supabase-checkpoints');
        const newCheckpoint = await initializeCheckpoints();
        
        if (newCheckpoint) {
          return {
            status: 'healthy',
            checkpoint: newCheckpoint,
            responseTime: newCheckpoint.responseTime,
            checkpoints: getAllCheckpoints()
          };
        }
      } catch (initError) {
        console.warn('[SUPABASE] Failed to initialize checkpoints:', initError);
      }
      
      return {
        status: 'unhealthy',
        error: 'No healthy checkpoints available',
        checkpoints: allCheckpoints
      };
    }
    
    // Test the current checkpoint
    try {
      const client = await getSupabase();
      const startTime = Date.now();
      
      await client.auth.getSession();
      const responseTime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        checkpoint: currentCheckpoint,
        responseTime,
        checkpoints: getAllCheckpoints()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        checkpoint: currentCheckpoint,
        checkpoints: getAllCheckpoints()
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      checkpoints: getAllCheckpoints()
    };
  }
}

// Initialize checkpoints on module load
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeCheckpoints().catch(error => {
    console.error('[SUPABASE] Failed to initialize checkpoints:', error);
  });
}

// Export checkpoint management functions
export {
  getCurrentCheckpoint,
  getAllCheckpoints,
  refreshCheckpoints,
  initializeCheckpoints
};
