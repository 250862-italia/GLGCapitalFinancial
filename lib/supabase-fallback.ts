import { createClient } from '@supabase/supabase-js';

// Fallback data for when database is degraded
const FALLBACK_DATA = {
  profiles: [],
  clients: [],
  investments: [],
  packages: [],
  activities: []
};

// Fallback client that returns cached/mock data
class FallbackSupabaseClient {
  constructor(private originalClient: any) {}
  
  from(table: string) {
    return {
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: () => this.getFallbackSingle(table, column, value),
          limit: (count: number) => this.getFallbackData(table, count)
        }),
        limit: (count: number) => this.getFallbackData(table, count),
        order: (column: string, options: any) => ({
          limit: (count: number) => this.getFallbackData(table, count)
        })
      }),
      insert: (data: any) => ({
        select: () => Promise.resolve({ data: null, error: null })
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => Promise.resolve({ data: null, error: null })
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => 
          Promise.resolve({ data: null, error: null })
      })
    };
  }
  
  auth = {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Database degraded - using fallback mode' } }),
    signUp: () => Promise.resolve({ data: null, error: { message: 'Database degraded - using fallback mode' } })
  };
  
  storage = {
    from: (bucket: string) => ({
      upload: () => Promise.resolve({ data: null, error: { message: 'Storage unavailable in fallback mode' } }),
      download: () => Promise.resolve({ data: null, error: { message: 'Storage unavailable in fallback mode' } }),
      remove: () => Promise.resolve({ data: null, error: { message: 'Storage unavailable in fallback mode' } })
    })
  };
  
  functions = {
    invoke: (name: string, options: any) => 
      Promise.resolve({ data: null, error: { message: `Function ${name} unavailable in fallback mode` } })
  };
  
  private getFallbackData(table: string, limit: number = 10) {
    console.log(`[FALLBACK] Returning fallback data for ${table} (${limit} records)`);
    return Promise.resolve({
      data: FALLBACK_DATA[table as keyof typeof FALLBACK_DATA]?.slice(0, limit) || [],
      error: null
    });
  }
  
  private getFallbackSingle(table: string, column: string, value: any) {
    console.log(`[FALLBACK] Returning fallback single record for ${table}.${column} = ${value}`);
    return Promise.resolve({
      data: null,
      error: { message: 'Record not found in fallback mode' }
    });
  }
}

// Enhanced client with fallback support
export function createFallbackClient(url: string, key: string) {
  const originalClient = createClient(url, key);
  
  return new Proxy(originalClient, {
    get(target, prop) {
      if (prop === 'from' || prop === 'auth' || prop === 'storage' || prop === 'functions') {
        return new FallbackSupabaseClient(target)[prop as keyof FallbackSupabaseClient];
      }
      return target[prop as keyof typeof target];
    }
  });
}

// Health check with retry logic
export async function checkDatabaseHealth(client: any, maxRetries: number = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const { data, error } = await client
        .from('profiles')
        .select('count')
        .limit(1);
      
      const responseTime = Date.now() - startTime;
      
      if (error) {
        console.log(`[HEALTH-CHECK] Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
        if (attempt === maxRetries) return false;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }
      
      console.log(`[HEALTH-CHECK] Success on attempt ${attempt}/${maxRetries} (${responseTime}ms)`);
      return true;
      
    } catch (error) {
      console.log(`[HEALTH-CHECK] Attempt ${attempt}/${maxRetries} error: ${error}`);
      if (attempt === maxRetries) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
  
  return false;
}

// Smart client factory
export async function createSmartClient(url: string, key: string) {
  const originalClient = createClient(url, key);
  
  // Check health first
  const isHealthy = await checkDatabaseHealth(originalClient);
  
  if (isHealthy) {
    console.log('[SMART-CLIENT] Using primary client - database is healthy');
    return originalClient;
  } else {
    console.log('[SMART-CLIENT] Using fallback client - database is degraded');
    return createFallbackClient(url, key);
  }
} 