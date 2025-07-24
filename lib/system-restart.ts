import { MemoryOptimizer } from './memory-optimizer';

// System restart manager
export class SystemRestartManager {
  private static instance: SystemRestartManager;
  private restartCount = 0;
  private maxRestarts = 3;
  private lastRestart = 0;
  private restartCooldown = 300000; // 5 minutes
  private criticalMemoryThreshold = 98; // 98% memory usage triggers restart

  static getInstance(): SystemRestartManager {
    if (!SystemRestartManager.instance) {
      SystemRestartManager.instance = new SystemRestartManager();
    }
    return SystemRestartManager.instance;
  }

  // Check if restart is needed
  async checkRestartNeeded(): Promise<boolean> {
    const memoryOptimizer = MemoryOptimizer.getInstance();
    const status = memoryOptimizer.getStatus();
    
    // Check if memory usage is critically high
    if (status.usage > this.criticalMemoryThreshold) {
      console.warn(`[RESTART] Critical memory usage detected: ${status.usage.toFixed(1)}%`);
      
      // Check restart limits
      if (this.restartCount >= this.maxRestarts) {
        console.error('[RESTART] Maximum restart attempts reached');
        return false;
      }
      
      const now = Date.now();
      if (now - this.lastRestart < this.restartCooldown) {
        console.warn('[RESTART] Restart cooldown active');
        return false;
      }
      
      return true;
    }
    
    return false;
  }

  // Perform graceful restart
  async performRestart(): Promise<void> {
    console.warn('[RESTART] Initiating system restart...');
    
    try {
      // Stop memory monitoring
      const memoryOptimizer = MemoryOptimizer.getInstance();
      memoryOptimizer.stopMonitoring();
      
      // Perform final cleanup
      await memoryOptimizer.emergencyCleanup();
      
      // Log restart attempt
      this.restartCount++;
      this.lastRestart = Date.now();
      
      console.warn(`[RESTART] Restart attempt ${this.restartCount}/${this.maxRestarts}`);
      
      // In production, this would trigger a restart
      // For development, we'll just log and continue
      if (process.env.NODE_ENV === 'production') {
        console.warn('[RESTART] Production restart would be triggered here');
        // process.exit(1); // Uncomment for actual restart
      } else {
        console.warn('[RESTART] Development mode - simulating restart');
        // Restart memory monitoring
        memoryOptimizer.startMonitoring();
      }
      
    } catch (error) {
      console.error('[RESTART] Restart failed:', error);
    }
  }

  // Get restart status
  getStatus(): { restartCount: number; maxRestarts: number; lastRestart: number; cooldownActive: boolean } {
    const now = Date.now();
    return {
      restartCount: this.restartCount,
      maxRestarts: this.maxRestarts,
      lastRestart: this.lastRestart,
      cooldownActive: (now - this.lastRestart) < this.restartCooldown
    };
  }

  // Reset restart counter
  resetRestartCount(): void {
    this.restartCount = 0;
    console.log('[RESTART] Restart counter reset');
  }
}

// Initialize restart monitoring
export function initializeRestartMonitoring(): void {
  const restartManager = SystemRestartManager.getInstance();
  const memoryOptimizer = MemoryOptimizer.getInstance();
  
  // Check for restart every 30 seconds
  setInterval(async () => {
    const needsRestart = await restartManager.checkRestartNeeded();
    if (needsRestart) {
      await restartManager.performRestart();
    }
  }, 30000);
  
  console.log('[RESTART] Restart monitoring initialized');
} 