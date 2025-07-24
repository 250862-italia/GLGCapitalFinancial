// Memory optimization utilities
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private memoryThreshold = 0.8; // 80%
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastCleanup = 0;
  private cleanupCooldown = 60000; // 1 minute (reduced for critical situations)
  private isProcessingOperation = false; // Flag to prevent cleanup during operations
  private emergencyMode = false; // Emergency mode for critical memory usage

  static getInstance(): MemoryOptimizer {
    if (!MemoryOptimizer.instance) {
      MemoryOptimizer.instance = new MemoryOptimizer();
    }
    return MemoryOptimizer.instance;
  }

  // Get current memory usage
  getMemoryUsage(): { used: number; total: number; percentage: number } {
    if (typeof process !== 'undefined') {
      const used = process.memoryUsage();
      const total = used.heapTotal;
      const percentage = (used.heapUsed / total) * 100;
      
      return {
        used: used.heapUsed,
        total,
        percentage
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  }

  // Check if memory usage is critical
  isMemoryCritical(): boolean {
    const usage = this.getMemoryUsage();
    return usage.percentage > (this.memoryThreshold * 100);
  }

  // Check if in emergency mode
  isEmergencyMode(): boolean {
    return this.emergencyMode;
  }

  // Start operation - prevents cleanup during critical operations
  startOperation(): void {
    this.isProcessingOperation = true;
  }

  // End operation - allows cleanup again
  endOperation(): void {
    this.isProcessingOperation = false;
  }

  // Force garbage collection if available
  forceGarbageCollection(): void {
    if (typeof global.gc === 'function') {
      try {
        global.gc();
        console.log('[MEMORY] Forced garbage collection');
      } catch (error) {
        console.warn('[MEMORY] Failed to force garbage collection:', error);
      }
    }
  }

  // Aggressive memory cleanup
  async aggressiveCleanup(): Promise<void> {
    console.warn('[MEMORY] AGGRESSIVE CLEANUP TRIGGERED');
    
    // Force multiple garbage collections
    for (let i = 0; i < 5; i++) {
      this.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between GC calls
    }
    
    // Clear ALL caches aggressively
    this.clearAllCaches();
    
    // Log final memory usage
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Aggressive cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
  }

  // Clean up memory
  async cleanup(): Promise<void> {
    // Don't cleanup if operation is in progress
    if (this.isProcessingOperation) {
      console.log('[MEMORY] Skipping cleanup - operation in progress');
      return;
    }

    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupCooldown) {
      return; // Too soon for another cleanup
    }

    const usage = this.getMemoryUsage();
    
    // If memory usage is extremely critical (>95%), use aggressive cleanup
    if (usage.percentage > 95) {
      this.emergencyMode = true;
      console.warn(`[MEMORY] EMERGENCY MODE: ${usage.percentage.toFixed(1)}% usage`);
      await this.aggressiveCleanup();
      this.emergencyMode = false;
    } else {
      console.log('[MEMORY] Starting standard memory cleanup...');
      this.lastCleanup = now;

      // Force garbage collection
      this.forceGarbageCollection();

      // Clear caches
      this.clearCaches();

      // Log memory usage after cleanup
      const newUsage = this.getMemoryUsage();
      console.log(`[MEMORY] Cleanup completed. Usage: ${newUsage.percentage.toFixed(1)}%`);
    }
  }

  // Clear various caches
  private clearCaches(): void {
    // Clear module cache if in development (but be more selective)
    if (process.env.NODE_ENV === 'development' && typeof require !== 'undefined') {
      try {
        const cache = require.cache;
        // Only clear non-critical modules
        Object.keys(cache).forEach(key => {
          // Don't clear critical modules
          if (!key.includes('supabase') && 
              !key.includes('csrf') && 
              !key.includes('profile') &&
              !key.includes('auth')) {
            delete cache[key];
          }
        });
        console.log('[MEMORY] Cleared non-critical module cache');
      } catch (error) {
        console.warn('[MEMORY] Failed to clear module cache:', error);
      }
    }

    // Clear any global caches (but preserve CSRF tokens)
    if (typeof global !== 'undefined') {
      // Don't clear CSRF tokens during operations
      if (!this.isProcessingOperation) {
        // Only clear old tokens, keep recent ones
        if (global.csrfTokens && global.csrfTokens.clear) {
          // Keep only tokens from last 2 minutes (reduced from 5)
          const twoMinutesAgo = Date.now() - 120000;
          const tokensToKeep = new Map();
          
          for (const [token, data] of global.csrfTokens.entries()) {
            if (data.createdAt > twoMinutesAgo) {
              tokensToKeep.set(token, data);
            }
          }
          
          global.csrfTokens.clear();
          for (const [token, data] of tokensToKeep.entries()) {
            global.csrfTokens.set(token, data);
          }
          
          console.log('[MEMORY] Cleaned old CSRF tokens');
        }
      }
    }
  }

  // Clear ALL caches (for emergency mode)
  private clearAllCaches(): void {
    // Clear ALL module cache
    if (typeof require !== 'undefined') {
      try {
        const cache = require.cache;
        Object.keys(cache).forEach(key => {
          delete cache[key];
        });
        console.log('[MEMORY] Cleared ALL module cache');
      } catch (error) {
        console.warn('[MEMORY] Failed to clear all module cache:', error);
      }
    }

    // Clear ALL global caches
    if (typeof global !== 'undefined') {
      if (global.csrfTokens && global.csrfTokens.clear) {
        global.csrfTokens.clear();
        console.log('[MEMORY] Cleared ALL CSRF tokens');
      }
    }
  }

  // Start automatic memory monitoring
  startMonitoring(intervalMs: number = 30000): void { // Reduced to 30s for critical situations
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      const usage = this.getMemoryUsage();
      
      if (usage.percentage > 95) {
        console.warn(`[MEMORY] CRITICAL: ${usage.percentage.toFixed(1)}% usage - EMERGENCY CLEANUP`);
        this.cleanup(); // This will trigger aggressive cleanup
      } else if (usage.percentage > 85) {
        console.warn(`[MEMORY] HIGH: ${usage.percentage.toFixed(1)}% usage`);
        this.cleanup();
      } else if (usage.percentage > 75) {
        console.info(`[MEMORY] MODERATE: ${usage.percentage.toFixed(1)}% usage`);
        // Don't cleanup for moderate usage
      }
    }, intervalMs);

    console.log(`[MEMORY] Monitoring started (interval: ${intervalMs}ms)`);
  }

  // Stop memory monitoring
  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[MEMORY] Monitoring stopped');
    }
  }

  // Emergency memory cleanup
  emergencyCleanup(): void {
    console.warn('[MEMORY] EMERGENCY CLEANUP TRIGGERED');
    
    // Force multiple garbage collections
    for (let i = 0; i < 3; i++) {
      this.forceGarbageCollection();
    }
    
    // Clear all caches (even during operations)
    this.clearAllCaches();
    
    // Log final memory usage
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Emergency cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
  }

  // Get memory status
  getStatus(): { usage: number; critical: boolean; emergencyMode: boolean; processingOperation: boolean } {
    const usage = this.getMemoryUsage();
    return {
      usage: usage.percentage,
      critical: this.isMemoryCritical(),
      emergencyMode: this.emergencyMode,
      processingOperation: this.isProcessingOperation
    };
  }
}

// Memory-efficient connection pool
export class ConnectionPool {
  private connections: Map<string, any> = new Map();
  private maxConnections = 10;
  private connectionTimeout = 30000; // 30 seconds

  async getConnection(key: string, createFn: () => Promise<any>): Promise<any> {
    // Check if connection exists and is still valid
    const existing = this.connections.get(key);
    if (existing) {
      try {
        // Test if connection is still alive
        await this.testConnection(existing);
        return existing;
      } catch (error) {
        // Connection is dead, remove it
        this.connections.delete(key);
      }
    }

    // Create new connection if pool is not full
    if (this.connections.size < this.maxConnections) {
      try {
        const connection = await createFn();
        this.connections.set(key, connection);
        return connection;
      } catch (error) {
        console.error(`[CONNECTION-POOL] Failed to create connection for ${key}:`, error);
        throw error;
      }
    }

    // Pool is full, wait for a connection to become available
    return this.waitForConnection(key, createFn);
  }

  private async testConnection(connection: any): Promise<boolean> {
    // Implement connection testing logic here
    return true;
  }

  private async waitForConnection(key: string, createFn: () => Promise<any>): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for ${key}`));
      }, this.connectionTimeout);

      const checkInterval = setInterval(() => {
        if (this.connections.size < this.maxConnections) {
          clearTimeout(timeout);
          clearInterval(checkInterval);
          this.getConnection(key, createFn).then(resolve).catch(reject);
        }
      }, 1000);
    });
  }

  releaseConnection(key: string): void {
    this.connections.delete(key);
  }

  clearAll(): void {
    this.connections.clear();
  }
}

// Memory-efficient image processing
export class ImageOptimizer {
  static async optimizeImage(file: File, maxSize: number = 1024): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxSize / img.width, maxSize / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          0.8 // 80% quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Initialize memory optimization
export function initializeMemoryOptimization(): void {
  const optimizer = MemoryOptimizer.getInstance();
  
  // Start monitoring
  optimizer.startMonitoring();
  
  // Set up emergency cleanup on unhandled errors
  process.on('uncaughtException', (error) => {
    console.error('[MEMORY] Uncaught exception, triggering emergency cleanup:', error);
    optimizer.emergencyCleanup();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[MEMORY] Unhandled rejection, triggering emergency cleanup:', reason);
    optimizer.emergencyCleanup();
  });

  console.log('[MEMORY] Memory optimization initialized');
} 