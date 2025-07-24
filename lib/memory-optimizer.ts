// Memory optimization utilities
export class MemoryOptimizer {
  private static instance: MemoryOptimizer;
  private memoryThreshold = 0.9; // 90% (increased threshold)
  private cleanupInterval: NodeJS.Timeout | null = null;
  private lastCleanup = 0;
  private cleanupCooldown = 120000; // 2 minutes (increased cooldown)
  private isProcessingOperation = false; // Flag to prevent cleanup during operations
  private emergencyMode = false; // Emergency mode for critical memory usage
  private operationTimeout: NodeJS.Timeout | null = null; // Timeout for operation protection

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
    
    // Set a timeout to automatically end operation protection after 30 seconds
    if (this.operationTimeout) {
      clearTimeout(this.operationTimeout);
    }
    
    this.operationTimeout = setTimeout(() => {
      this.isProcessingOperation = false;
      console.log('[MEMORY] Operation protection timeout - cleanup allowed again');
    }, 30000); // 30 seconds timeout
  }

  // End operation - allows cleanup again
  endOperation(): void {
    this.isProcessingOperation = false;
    
    if (this.operationTimeout) {
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

  // Conservative memory cleanup
  async conservativeCleanup(): Promise<void> {
    console.log('[MEMORY] Starting conservative cleanup...');
    
    // Only force garbage collection
    this.forceGarbageCollection();
    
    // Don't clear any caches during operations
    if (!this.isProcessingOperation) {
      this.clearOldTokens();
    }
    
    // Log memory usage after cleanup
    const usage = this.getMemoryUsage();
    console.log(`[MEMORY] Conservative cleanup completed. Usage: ${usage.percentage.toFixed(1)}%`);
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
    
    // Use conservative cleanup for all cases
    console.log(`[MEMORY] Memory usage: ${usage.percentage.toFixed(1)}% - using conservative cleanup`);
    this.lastCleanup = now;
    
    await this.conservativeCleanup();
  }

  // Clear only old CSRF tokens
  private clearOldTokens(): void {
    if (typeof global !== 'undefined') {
      if (global.csrfTokens && global.csrfTokens.clear) {
        // Keep only tokens from last 1 minute (very conservative)
        const oneMinuteAgo = Date.now() - 60000;
        const tokensToKeep = new Map();
        
        for (const [token, data] of global.csrfTokens.entries()) {
          if (data.createdAt > oneMinuteAgo) {
            tokensToKeep.set(token, data);
          }
        }
        
        const originalSize = global.csrfTokens.size;
        global.csrfTokens.clear();
        for (const [token, data] of tokensToKeep.entries()) {
          global.csrfTokens.set(token, data);
        }
        
        const newSize = global.csrfTokens.size;
        if (originalSize !== newSize) {
          console.log(`[MEMORY] Cleaned old CSRF tokens: ${originalSize} -> ${newSize}`);
        }
      }
    }
  }

  // Start automatic memory monitoring
  startMonitoring(intervalMs: number = 60000): void { // Increased to 60s
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      const usage = this.getMemoryUsage();
      
      if (usage.percentage > 98) {
        console.warn(`[MEMORY] CRITICAL: ${usage.percentage.toFixed(1)}% usage - EMERGENCY MODE`);
        this.emergencyMode = true;
        this.cleanup(); // This will use conservative cleanup
        this.emergencyMode = false;
      } else if (usage.percentage > 95) {
        console.warn(`[MEMORY] HIGH: ${usage.percentage.toFixed(1)}% usage`);
        this.cleanup();
      } else if (usage.percentage > 90) {
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