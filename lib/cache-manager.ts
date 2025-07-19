// Cache Manager Avanzato per GLG Capital Financial
// Sistema di cache con TTL, invalidation, monitoring e performance tracking

import { performance } from 'perf_hooks';

// Tipi per il cache manager
export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
  tags?: string[];
}

export interface CacheConfig {
  maxSize: number; // Numero massimo di entry
  maxMemory: number; // Memoria massima in bytes
  defaultTTL: number; // TTL di default in millisecondi
  cleanupInterval: number; // Intervallo di cleanup in millisecondi
  enableStats: boolean; // Abilita statistiche
  enableCompression: boolean; // Abilita compressione
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
  averageAccessTime: number;
}

// Classe principale del cache manager
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private config: CacheConfig;
  private stats: CacheStats;
  private cleanupInterval: NodeJS.Timeout;
  private compressionWorker?: Worker;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 1000,
      maxMemory: 100 * 1024 * 1024, // 100MB
      defaultTTL: 5 * 60 * 1000, // 5 minuti
      cleanupInterval: 60 * 1000, // 1 minuto
      enableStats: true,
      enableCompression: false,
      ...config,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: 0,
      memoryUsage: 0,
      hitRate: 0,
      averageAccessTime: 0,
    };

    // Avvia cleanup automatico
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);

    // Inizializza compression worker se abilitato
    if (this.config.enableCompression && typeof Worker !== 'undefined') {
      this.initCompressionWorker();
    }
  }

  // Inizializza compression worker
  private initCompressionWorker() {
    try {
      // Worker per compressione asincrona
      this.compressionWorker = new Worker(`
        const { gzip, gunzip } = require('zlib');
        const { promisify } = require('util');
        
        const gzipAsync = promisify(gzip);
        const gunzipAsync = promisify(gunzip);
        
        self.onmessage = async function(e) {
          const { type, data, id } = e.data;
          
          try {
            if (type === 'compress') {
              const compressed = await gzipAsync(JSON.stringify(data));
              self.postMessage({ id, result: compressed, error: null });
            } else if (type === 'decompress') {
              const decompressed = await gunzipAsync(data);
              self.postMessage({ id, result: JSON.parse(decompressed), error: null });
            }
          } catch (error) {
            self.postMessage({ id, result: null, error: error.message });
          }
        };
      `);
    } catch (error) {
      console.warn('Compression worker not available:', error);
      this.config.enableCompression = false;
    }
  }

  // Calcola dimensione di un oggetto
  private calculateSize(obj: any): number {
    try {
      return new Blob([JSON.stringify(obj)]).size;
    } catch {
      return JSON.stringify(obj).length;
    }
  }

  // Comprime dati se abilitato
  private async compress(data: any): Promise<any> {
    if (!this.config.enableCompression || !this.compressionWorker) {
      return data;
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handler = (e: MessageEvent) => {
        if (e.data.id === id) {
          this.compressionWorker!.removeEventListener('message', handler);
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };

      this.compressionWorker!.addEventListener('message', handler);
      this.compressionWorker!.postMessage({ type: 'compress', data, id });
    });
  }

  // Decomprime dati se abilitato
  private async decompress(data: any): Promise<any> {
    if (!this.config.enableCompression || !this.compressionWorker) {
      return data;
    }

    return new Promise((resolve, reject) => {
      const id = Math.random().toString(36);
      
      const handler = (e: MessageEvent) => {
        if (e.data.id === id) {
          this.compressionWorker!.removeEventListener('message', handler);
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result);
          }
        }
      };

      this.compressionWorker!.addEventListener('message', handler);
      this.compressionWorker!.postMessage({ type: 'decompress', data, id });
    });
  }

  // Imposta un valore nella cache
  async set<T>(key: string, data: T, options: {
    ttl?: number;
    tags?: string[];
    compress?: boolean;
  } = {}): Promise<void> {
    const startTime = performance.now();

    try {
      // Rimuovi entry esistenti se necessario
      if (this.cache.has(key)) {
        this.delete(key);
      }

      // Controlla limiti di memoria
      if (this.stats.memoryUsage >= this.config.maxMemory) {
        this.evictOldest();
      }

      // Controlla limite di dimensione
      if (this.cache.size >= this.config.maxSize) {
        this.evictOldest();
      }

      // Comprimi se richiesto
      let processedData = data;
      if (options.compress || this.config.enableCompression) {
        processedData = await this.compress(data);
      }

      const entry: CacheEntry<T> = {
        data: processedData,
        timestamp: Date.now(),
        ttl: options.ttl || this.config.defaultTTL,
        accessCount: 0,
        lastAccessed: Date.now(),
        size: this.calculateSize(processedData),
        tags: options.tags,
      };

      this.cache.set(key, entry);
      this.stats.sets++;
      this.stats.size = this.cache.size;
      this.stats.memoryUsage += entry.size;

      // Aggiorna statistiche
      if (this.config.enableStats) {
        const accessTime = performance.now() - startTime;
        this.updateAverageAccessTime(accessTime);
      }

    } catch (error) {
      console.error('Cache set error:', error);
      throw error;
    }
  }

  // Ottiene un valore dalla cache
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();

    try {
      const entry = this.cache.get(key) as CacheEntry<T>;

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Controlla se è scaduto
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.delete(key);
        this.stats.misses++;
        return null;
      }

      // Aggiorna statistiche di accesso
      entry.accessCount++;
      entry.lastAccessed = Date.now();

      // Decomprimi se necessario
      let data = entry.data;
      if (this.config.enableCompression && typeof data === 'object' && data.type === 'compressed') {
        data = await this.decompress(data);
      }

      this.stats.hits++;
      this.updateHitRate();

      // Aggiorna tempo medio di accesso
      if (this.config.enableStats) {
        const accessTime = performance.now() - startTime;
        this.updateAverageAccessTime(accessTime);
      }

      return data;

    } catch (error) {
      console.error('Cache get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  // Elimina un valore dalla cache
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.memoryUsage -= entry.size;
      this.cache.delete(key);
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      return true;
    }
    return false;
  }

  // Elimina valori per tag
  deleteByTag(tag: string): number {
    let deletedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  // Elimina valori per pattern
  deleteByPattern(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  // Pulisce la cache
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.memoryUsage = 0;
  }

  // Controlla se una chiave esiste
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Controlla se è scaduto
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Ottiene le dimensioni della cache
  size(): number {
    return this.cache.size;
  }

  // Ottiene le statistiche
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Resetta le statistiche
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      size: this.cache.size,
      memoryUsage: this.stats.memoryUsage,
      hitRate: 0,
      averageAccessTime: 0,
    };
  }

  // Evicta le entry più vecchie
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  // Aggiorna il hit rate
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  // Aggiorna il tempo medio di accesso
  private updateAverageAccessTime(newTime: number): void {
    const totalAccesses = this.stats.hits + this.stats.misses;
    this.stats.averageAccessTime = 
      (this.stats.averageAccessTime * (totalAccesses - 1) + newTime) / totalAccesses;
  }

  // Cleanup automatico
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[CACHE] Cleaned up ${cleanedCount} expired entries`);
    }
  }

  // Distrugge il cache manager
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.compressionWorker) {
      this.compressionWorker.terminate();
    }
    
    this.clear();
  }

  // Esporta la cache (per debugging)
  export(): Record<string, any> {
    const exported: Record<string, any> = {};
    
    for (const [key, entry] of this.cache.entries()) {
      exported[key] = {
        data: entry.data,
        timestamp: entry.timestamp,
        ttl: entry.ttl,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
        size: entry.size,
        tags: entry.tags,
      };
    }
    
    return exported;
  }

  // Importa la cache (per debugging)
  import(data: Record<string, any>): void {
    this.clear();
    
    for (const [key, entry] of Object.entries(data)) {
      this.cache.set(key, entry as CacheEntry);
    }
    
    this.stats.size = this.cache.size;
    this.stats.memoryUsage = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.size, 0);
  }
}

// Istanza globale del cache manager
export const cacheManager = new CacheManager({
  maxSize: 1000,
  maxMemory: 100 * 1024 * 1024, // 100MB
  defaultTTL: 5 * 60 * 1000, // 5 minuti
  enableStats: true,
  enableCompression: false,
});

// Utility functions
export const cache = {
  // Wrapper per set con logging
  async set<T>(key: string, data: T, options?: any): Promise<void> {
    try {
      await cacheManager.set(key, data, options);
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  // Wrapper per get con logging
  async get<T>(key: string): Promise<T | null> {
    try {
      return await cacheManager.get<T>(key);
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  // Wrapper per delete con logging
  delete(key: string): boolean {
    try {
      return cacheManager.delete(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  // Wrapper per has con logging
  has(key: string): boolean {
    try {
      return cacheManager.has(key);
    } catch (error) {
      console.error(`Cache has error for key ${key}:`, error);
      return false;
    }
  },

  // Utility per cache con TTL specifico
  async setWithTTL<T>(key: string, data: T, ttl: number): Promise<void> {
    await cache.set(key, data, { ttl });
  },

  // Utility per cache con tag
  async setWithTag<T>(key: string, data: T, tag: string): Promise<void> {
    await cache.set(key, data, { tags: [tag] });
  },

  // Utility per invalidare per tag
  invalidateByTag(tag: string): number {
    return cacheManager.deleteByTag(tag);
  },

  // Utility per invalidare per pattern
  invalidateByPattern(pattern: string | RegExp): number {
    return cacheManager.deleteByPattern(pattern);
  },

  // Utility per ottenere statistiche
  getStats(): CacheStats {
    return cacheManager.getStats();
  },

  // Utility per resettare statistiche
  resetStats(): void {
    cacheManager.resetStats();
  },

  // Utility per pulire cache
  clear(): void {
    cacheManager.clear();
  },
};

// Export types
export type { CacheEntry, CacheConfig, CacheStats }; 