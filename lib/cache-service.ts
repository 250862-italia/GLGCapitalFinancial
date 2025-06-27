interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: Date;
}

interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
  evictedEntries: number;
  averageAccessCount: number;
}

interface CacheOptions {
  ttl?: number; // Default TTL in milliseconds
  maxSize?: number; // Maximum number of entries
  maxMemory?: number; // Maximum memory usage in bytes
  enableStats?: boolean; // Enable cache statistics
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private options: Required<CacheOptions>;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalMemory: 0
  };

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: options.maxSize || 1000,
      maxMemory: options.maxMemory || 50 * 1024 * 1024, // 50MB default
      enableStats: options.enableStats ?? true
    };

    // Start cleanup interval
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  // Set a value in cache
  set<T>(key: string, value: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: new Date(),
      ttl: ttl || this.options.ttl,
      accessCount: 0,
      lastAccessed: new Date()
    };

    // Check if we need to evict entries
    if (this.cache.size >= this.options.maxSize) {
      this.evictEntries();
    }

    // Check memory usage
    const entrySize = this.estimateSize(entry);
    if (this.stats.totalMemory + entrySize > this.options.maxMemory) {
      this.evictEntries();
    }

    this.cache.set(key, entry);
    this.stats.totalMemory += entrySize;

    if (this.options.enableStats) {
      console.log(`💾 Cached: ${key} (TTL: ${ttl || this.options.ttl}ms)`);
    }
  }

  // Get a value from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();
    this.cache.set(key, entry);

    this.stats.hits++;

    if (this.options.enableStats) {
      console.log(`🎯 Cache hit: ${key} (access count: ${entry.accessCount})`);
    }

    return entry.value;
  }

  // Get or set a value (cache-aside pattern)
  async getOrSet<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const value = await fetchFunction();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      console.error(`❌ Cache fetch failed for key: ${key}`, error);
      throw error;
    }
  }

  // Delete a value from cache
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.totalMemory -= this.estimateSize(entry);
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.stats.totalMemory = 0;
    console.log('🧹 Cache cleared');
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (this.isExpired(entry)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  // Get cache statistics
  getStats(): CacheStats {
    const totalEntries = this.cache.size;
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    const totalAccessCount = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    const averageAccessCount = totalEntries > 0 ? totalAccessCount / totalEntries : 0;

    return {
      totalEntries,
      hitRate,
      memoryUsage: this.stats.totalMemory,
      evictedEntries: this.stats.evictions,
      averageAccessCount
    };
  }

  // Get cache keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Warm up cache with multiple entries
  async warmup<T>(
    keys: string[],
    fetchFunction: (key: string) => Promise<T>,
    ttl?: number
  ): Promise<void> {
    console.log(`🔥 Warming up cache with ${keys.length} entries...`);
    
    const promises = keys.map(async (key) => {
      try {
        const value = await fetchFunction(key);
        this.set(key, value, ttl);
      } catch (error) {
        console.error(`Failed to warm up cache for key: ${key}`, error);
      }
    });

    await Promise.all(promises);
    console.log('✅ Cache warmup completed');
  }

  // Preload cache with data
  preload<T>(data: Record<string, T>, ttl?: number): void {
    console.log(`📦 Preloading cache with ${Object.keys(data).length} entries...`);
    
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value, ttl);
    });
    
    console.log('✅ Cache preload completed');
  }

  // Cache decorator for methods
  static cache<T extends (...args: any[]) => any>(
    keyGenerator: (...args: any[]) => string,
    ttl?: number
  ) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const cacheService = new CacheService();

      descriptor.value = async function (...args: any[]) {
        const key = keyGenerator(...args);
        const cached = cacheService.get(key);
        
        if (cached !== null) {
          return cached;
        }

        const result = await originalMethod.apply(this, args);
        cacheService.set(key, result, ttl);
        return result;
      };

      return descriptor;
    };
  }

  // Private methods
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const entryAge = now - entry.timestamp.getTime();
    return entryAge > entry.ttl;
  }

  private evictEntries(): void {
    // LRU (Least Recently Used) eviction
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time
    entries.sort((a, b) => a[1].lastAccessed.getTime() - b[1].lastAccessed.getTime());
    
    // Remove oldest entries until we're under the limit
    const entriesToRemove = Math.ceil(entries.length * 0.2); // Remove 20% of entries
    
    for (let i = 0; i < entriesToRemove && i < entries.length; i++) {
      const [key, entry] = entries[i];
      this.stats.totalMemory -= this.estimateSize(entry);
      this.cache.delete(key);
      this.stats.evictions++;
    }

    if (this.options.enableStats) {
      console.log(`🗑️ Evicted ${entriesToRemove} cache entries`);
    }
  }

  private cleanup(): void {
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => this.delete(key));

    if (expiredKeys.length > 0 && this.options.enableStats) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  private estimateSize(entry: CacheEntry): number {
    // Rough estimation of memory usage
    const keySize = entry.key.length * 2; // UTF-16 characters
    const valueSize = JSON.stringify(entry.value).length * 2;
    const metadataSize = 100; // Rough estimate for timestamp, ttl, etc.
    
    return keySize + valueSize + metadataSize;
  }
}

// Specialized cache services
class UserCache extends CacheService {
  constructor() {
    super({
      ttl: 10 * 60 * 1000, // 10 minutes for user data
      maxSize: 500,
      enableStats: true
    });
  }

  // Cache user profile
  async getUserProfile(userId: string): Promise<any> {
    return this.getOrSet(
      `user:profile:${userId}`,
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          id: userId,
          name: `User ${userId}`,
          email: `user${userId}@example.com`,
          role: 'user'
        };
      }
    );
  }

  // Cache user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    return this.getOrSet(
      `user:permissions:${userId}`,
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 50));
        return ['read', 'write', 'invest'];
      }
    );
  }
}

class InvestmentCache extends CacheService {
  constructor() {
    super({
      ttl: 5 * 60 * 1000, // 5 minutes for investment data
      maxSize: 200,
      enableStats: true
    });
  }

  // Cache investment packages
  async getInvestmentPackages(): Promise<any[]> {
    return this.getOrSet(
      'investment:packages',
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 200));
        return [
          { id: '1', name: 'Conservative Growth', type: 'conservative' },
          { id: '2', name: 'Balanced Portfolio', type: 'balanced' },
          { id: '3', name: 'Aggressive Growth', type: 'aggressive' }
        ];
      }
    );
  }

  // Cache user portfolio
  async getUserPortfolio(userId: string): Promise<any> {
    return this.getOrSet(
      `portfolio:${userId}`,
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 150));
        return {
          userId,
          totalValue: 50000,
          investments: [
            { id: '1', amount: 25000, package: 'Conservative Growth' },
            { id: '2', amount: 25000, package: 'Balanced Portfolio' }
          ]
        };
      }
    );
  }
}

class KYCCache extends CacheService {
  constructor() {
    super({
      ttl: 30 * 60 * 1000, // 30 minutes for KYC data
      maxSize: 100,
      enableStats: true
    });
  }

  // Cache KYC status
  async getKYCStatus(userId: string): Promise<any> {
    return this.getOrSet(
      `kyc:status:${userId}`,
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          userId,
          status: 'approved',
          documents: ['id', 'address'],
          lastUpdated: new Date()
        };
      }
    );
  }
}

// Export instances
export const userCache = new UserCache();
export const investmentCache = new InvestmentCache();
export const kycCache = new KYCCache();
export const generalCache = new CacheService();

// Export types and class
export type { CacheEntry, CacheStats, CacheOptions };
export { CacheService }; 