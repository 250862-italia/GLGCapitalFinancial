// Configurazione database con fallback sicuri
export const DATABASE_CONFIG = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
  },
  
  // Database Connection
  connection: {
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    },
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  },
  
  // Health Check Configuration
  health: {
    timeout: 5000,
    retries: 3,
    interval: 30000
  }
};

// Funzione per testare la connessione database
export async function testDatabaseConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      DATABASE_CONFIG.supabase.url,
      DATABASE_CONFIG.supabase.anonKey
    );
    
    // Test semplice con SELECT 1
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'healthy'
    };
    
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

// Funzione per ottenere lo stato del database
export async function getDatabaseStatus() {
  const startTime = Date.now();
  const result = await testDatabaseConnection();
  const responseTime = Date.now() - startTime;
  
  return {
    ...result,
    responseTime
  };
} 