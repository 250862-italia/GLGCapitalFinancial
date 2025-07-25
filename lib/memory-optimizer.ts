// Memory optimization utilities
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private memoryThreshold = 0.85; // Reduced to 85% (more conservative)
  private criticalThreshold = 0.95; // Critical threshold at 95%
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastCleanup = 0;
  private cleanupCooldown = 60000; // Reduced to 1 minute (more frequent cleanup)
  private isProcessingOperation = false; // Flag to prevent cleanup during operations
  private emergencyMode = false; // Emergency mode for critical memory usage
  private operationTimeout: NodeJS.Timeout | null = null; // Timeout for operation protection
  private operationCount = 0; // Track active operations
  private aggressiveCleanupMode = false; // New aggressive cleanup mode

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

  // Check if memory usage is extremely critical
  isMemoryExtremelyCritical(): boolean {
    const usage = this.getMemoryUsage();
    return usage.percentage > (this.criticalThreshold * 100);
  }

  // Check if in emergency mode
  isEmergencyMode(): boolean {
    return this.emergencyMode;
  }

  // Start operation - prevents cleanup during critical operations
  startOperation(): void {
    this.operationCount++;
    this.isProcessingOperation = true;
    
    // Set a timeout to automatically end operation protection after 30 seconds (reduced)
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
    }
    
    this.operationTimeout = setTimeout(() => {
      this.endOperation();
      console.log('[MEMORY] Operation protection timeout - cleanup allowed again');
    }, 30000); // 30 seconds timeout (reduced)
  }

  // End operation - allows cleanup again
  endOperation(): void {
    this.operationCount = Math.max(0, this.operationCount - 1);
    this.isProcessingOperation = this.operationCount > 0;
    
    if (this.operationCount === 0 && this.operationTimeout) {
      clearTimeout(this.operationTimeout);
      this.operationTimeout = null;
    }
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

  // Aggressive memory cleanup for critical situations
  async aggressiveCleanup(): Promise<void> {
    console.log('[MEMORY] Starting aggressive cleanup...');
    this.aggressiveCleanupMode = true;
    
    // Force garbage collection multiple times
    for (let i = 0; i < 3; i++) {
      this.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between GC calls
    }
    
    // Clear all caches regardless of operations
    this.clearAllCaches();
    this.clearVeryOldTokens();
    
    // Log memory usage after cleanup
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Aggressive cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
    
    this.aggressiveCleanupMode = false;
  }

  // Ultra-conservative memory cleanup
  async ultraConservativeCleanup(): Promise<void> {
    console.log('[MEMORY] Starting ultra-conservative cleanup...');
    
    // Force garbage collection
    this.forceGarbageCollection();
    
    // Only clear very old tokens if not in aggressive mode
    if (!this.aggressiveCleanupMode && !this.isProcessingOperation) {
      this.clearVeryOldTokens();
    }
    
    // Log memory usage after cleanup
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Ultra-conservative cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
  }

  // Clean up memory
  async cleanup(): Promise<void> {
    // NEVER cleanup if operation is in progress
    if (this.isProcessingOperation) {
      console.log('[MEMORY] Skipping cleanup - operation in progress');
      return;
    }

    const now = Date.now();
    if (now - this.lastCleanup < this.cleanupCooldown) {
      return; // Too soon for another cleanup
    }

    const usage = this.getMemoryUsage();
    
    // Use ultra-conservative cleanup for all cases
    console.log(`[MEMORY] Memory usage: ${usage.percentage.toFixed(1)}% - using ultra-conservative cleanup`);
    this.lastCleanup = now;
    
    await this.ultraConservativeCleanup();
  }

  // Clear only very old CSRF tokens (5 minutes) - respect protected tokens
  private clearVeryOldTokens(): void {
    if (typeof global !== 'undefined') {
      if (global.__csrfTokens && global.__csrfTokens.clear) {
        // Keep only tokens from last 5 minutes (very conservative) and protected tokens
        const fiveMinutesAgo = Date.now() - 300000;
        const tokensToKeep = new Map();
        
        for (const [token, data] of global.__csrfTokens.entries()) {
          // Keep protected tokens regardless of age (unless very old - 2 hours)
          if (data.protected && (Date.now() - data.createdAt) < 2 * 60 * 60 * 1000) {
            tokensToKeep.set(token, data);
          }
          // Keep recent tokens
          else if (data.createdAt > fiveMinutesAgo) {
            tokensToKeep.set(token, data);
          }
        }
        
        const originalSize = global.__csrfTokens.size;
        global.__csrfTokens.clear();
        for (const [token, data] of tokensToKeep.entries()) {
          global.__csrfTokens.set(token, data);
        }
        
        const newSize = global.__csrfTokens.size;
        if (originalSize !== newSize) {
          console.log(`[MEMORY] Cleaned very old CSRF tokens: ${originalSize} -> ${newSize} (preserved protected tokens)`);
        }
      }
    }
  }

  // Clear all caches (placeholder - implementation needed)
  private clearAllCaches(): void {
    console.log('[MEMORY] Clearing all caches (placeholder)');
    // Implement actual cache clearing logic here
  }

  // Start automatic memory monitoring
  startMonitoring(intervalMs: number = 60000): void { // Reduced to 1 minute for more frequent checks
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      const usage = this.getMemoryUsage();
      const now = Date.now();
      
      // Log memory usage
      if (usage.percentage > 95) {
        console.log(`[MEMORY] CRITICAL: ${usage.percentage.toFixed(1)}% usage - emergency cleanup needed`);
      } else if (usage.percentage > 85) {
        console.log(`[MEMORY] HIGH: ${usage.percentage.toFixed(1)}% usage - monitoring closely`);
      } else {
        console.log(`[MEMORY] NORMAL: ${usage.percentage.toFixed(1)}% usage`);
      }
      
      // Check if cleanup is needed and allowed
      if (usage.percentage > (this.memoryThreshold * 100) && 
          now - this.lastCleanup > this.cleanupCooldown) {
        
        console.log(`[MEMORY] Memory cleanup triggered: ${usage.percentage.toFixed(1)}%`);
        
        if (usage.percentage > (this.criticalThreshold * 100)) {
          // Emergency mode - aggressive cleanup regardless of operations
          this.emergencyMode = true;
          console.log('[MEMORY] CRITICAL: Performing emergency cleanup');
          await this.aggressiveCleanup();
          this.emergencyMode = false;
        } else if (!this.isProcessingOperation) {
          // Normal critical cleanup only if no operations are running
          await this.ultraConservativeCleanup();
        } else {
          console.log('[MEMORY] Cleanup skipped - operation in progress');
        }
        
        this.lastCleanup = now;
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
    
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
      this.operationTimeout = null;
    }
  }

  // Emergency memory cleanup (minimal)
  emergencyCleanup(): void {
    console.warn('[MEMORY] EMERGENCY CLEANUP TRIGGERED');
    
    // Only force garbage collection
    this.forceGarbageCollection();
    
    // Log final memory usage
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Emergency cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
  }

  // Get memory status
  getStatus(): { usage: number; critical: boolean; emergencyMode: boolean; processingOperation: boolean; operationCount: number } {
    const usage = this.getMemoryUsage();
    return {
      usage: usage.percentage,
      critical: this.isMemoryCritical(),
      emergencyMode: this.emergencyMode,
      processingOperation: this.isProcessingOperation,
      operationCount: this.operationCount
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