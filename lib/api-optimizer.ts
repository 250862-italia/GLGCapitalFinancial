import { createClient } from '@supabase/supabase-js';

// Configurazione cache globale
const CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minuti
  MAX_SIZE: 100, // Massimo 100 elementi in cache
  CLEANUP_INTERVAL: 10 * 60 * 1000 // Cleanup ogni 10 minuti
};

// Cache globale per tutte le API
class APICache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Avvia cleanup automatico
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  set(key: string, data: any, ttl: number = CACHE_CONFIG.TTL): void {
    // Rimuovi elementi vecchi se la cache è piena
    if (this.cache.size >= CACHE_CONFIG.MAX_SIZE) {
      this.cleanup();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(pattern?: string): void {
    if (pattern) {
      // Invalida cache che corrisponde al pattern
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Invalida tutta la cache
      this.cache.clear();
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Istanza globale della cache
export const apiCache = new APICache();

// Configurazione retry
const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 secondo
  MAX_DELAY: 5000, // 5 secondi
  BACKOFF_MULTIPLIER: 2
};

// Funzione per calcolare delay esponenziale
function calculateDelay(attempt: number): number {
  const delay = RETRY_CONFIG.BASE_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, attempt - 1);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY);
}

// Wrapper per query Supabase con retry logic
export async function supabaseQueryWithRetry<T>(
  queryFn: () => Promise<{ data: T; error: any }>,
  options: {
    maxRetries?: number;
    cacheKey?: string;
    cacheTTL?: number;
    timeout?: number;
  } = {}
): Promise<{ data: T | null; error: any; cacheStatus: 'HIT' | 'MISS' | 'OFFLINE' }> {
  const {
    maxRetries = RETRY_CONFIG.MAX_RETRIES,
    cacheKey,
    cacheTTL = CACHE_CONFIG.TTL,
    timeout = 10000
  } = options;

  // Controlla cache se specificata
  if (cacheKey) {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return { data: cachedData, error: null, cacheStatus: 'HIT' };
    }
  }

  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Timeout wrapper
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout);
      });

      const queryPromise = queryFn();
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        lastError = error;
        
        // Se è l'ultimo tentativo, fallisci
        if (attempt === maxRetries) {
          throw error;
        }

        // Aspetta prima del prossimo tentativo
        const delay = calculateDelay(attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Successo - salva in cache se specificato
      if (cacheKey && data) {
        apiCache.set(cacheKey, data, cacheTTL);
      }

      return { data, error: null, cacheStatus: 'MISS' };

    } catch (error) {
      lastError = error;
      
      // Se è l'ultimo tentativo, fallisci
      if (attempt === maxRetries) {
        break;
      }

      // Aspetta prima del prossimo tentativo
      const delay = calculateDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Tutti i tentativi falliti
  return { data: null, error: lastError, cacheStatus: 'OFFLINE' };
}

// Funzione per validazione input
export function validateInput(data: any, schema: Record<string, (value: any) => boolean>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, validator] of Object.entries(schema)) {
    if (!validator(data[field])) {
      errors.push(`Invalid ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Schema di validazione comuni
export const VALIDATION_SCHEMAS = {
  email: (email: any) => {
    if (!email || typeof email !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  
  password: (password: any) => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 8 && 
           /[A-Z]/.test(password) && 
           /[a-z]/.test(password) && 
           /[0-9]/.test(password) && 
           /[^A-Za-z0-9]/.test(password);
  },
  
  required: (value: any) => {
    return value !== null && value !== undefined && value !== '';
  },
  
  string: (value: any, maxLength: number = 1000) => {
    if (!value || typeof value !== 'string') return false;
    return value.length <= maxLength;
  },
  
  number: (value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER) => {
    if (typeof value !== 'number' || isNaN(value)) return false;
    return value >= min && value <= max;
  }
};

// Funzione per sanitizzazione input
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.trim().substring(0, 1000); // Limite di sicurezza
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Funzione per generare cache key
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  
  return `${prefix}:${sortedParams}`;
}

// Funzione per monitoraggio performance
export function createPerformanceMonitor() {
  const metrics: Record<string, { count: number; totalTime: number; avgTime: number; minTime: number; maxTime: number }> = {};

  return {
    start: (operation: string) => {
      return Date.now();
    },
    
    end: (operation: string, startTime: number) => {
      const duration = Date.now() - startTime;
      
      if (!metrics[operation]) {
        metrics[operation] = { count: 0, totalTime: 0, avgTime: 0, minTime: duration, maxTime: duration };
      }
      
      const metric = metrics[operation];
      metric.count++;
      metric.totalTime += duration;
      metric.avgTime = metric.totalTime / metric.count;
      metric.minTime = Math.min(metric.minTime, duration);
      metric.maxTime = Math.max(metric.maxTime, duration);
    },
    
    getMetrics: () => ({ ...metrics }),
    
    reset: () => {
      Object.keys(metrics).forEach(key => delete metrics[key]);
    }
  };
}

// Istanza globale del monitor
export const performanceMonitor = createPerformanceMonitor();

// Funzione per cleanup automatico
export function setupCleanup() {
  // Cleanup alla chiusura dell'applicazione
  process.on('SIGINT', () => {
    console.log('Cleaning up API cache...');
    apiCache.destroy();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('Cleaning up API cache...');
    apiCache.destroy();
    process.exit(0);
  });
}

// Setup automatico
setupCleanup(); 