import { MemoryOptimizer } from './memory-optimizer';

/**
 * AGGRESSIVE MEMORY OPTIMIZER
 * Ottimizzatore di memoria aggressivo per situazioni critiche
 * Riduce drasticamente l'utilizzo di memoria
 */

export class AggressiveMemoryOptimizer {
  private static instance: AggressiveMemoryOptimizer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private criticalThreshold = 85; // Ridotto a 85%
  private highThreshold = 75; // Ridotto a 75%
  private cleanupCooldown = 15000; // 15 secondi invece di 60
  private lastCleanup = 0;
  private emergencyMode = false;

  static getInstance(): AggressiveMemoryOptimizer {
    if (!AggressiveMemoryOptimizer.instance) {
      AggressiveMemoryOptimizer.instance = new AggressiveMemoryOptimizer();
    }
    return AggressiveMemoryOptimizer.instance;
  }

  // Ottieni utilizzo memoria
  getMemoryUsage(): number {
    if (typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      const totalMem = require('os').totalmem();
      return (usage.heapUsed / totalMem) * 100;
    }
    return 0;
  }

  // Forza garbage collection
  forceGarbageCollection(): void {
    if (global.gc) {
      try {
        global.gc();
        console.log('[AGGRESSIVE-MEMORY] Garbage collection forzato');
      } catch (error) {
        console.warn('[AGGRESSIVE-MEMORY] Errore garbage collection:', error);
      }
    }
  }

  // Cleanup CSRF tokens aggressivo
  clearCSRFTokens(): void {
    if (typeof global !== 'undefined' && global.__csrfTokens) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000; // Solo 1 minuto
      let cleanedCount = 0;
      
      for (const [token, data] of global.__csrfTokens.entries()) {
        // Rimuovi tutti i token non protetti più vecchi di 1 minuto
        if (data.createdAt < oneMinuteAgo && !data.protected) {
          global.__csrfTokens.delete(token);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
        console.log(`[AGGRESSIVE-MEMORY] Rimossi ${cleanedCount} CSRF tokens`);
      }
    }
  }

  // Cleanup cache API
  clearAPICache(): void {
    // Pulisci cache API se esiste
    if (global.__apiCache) {
      global.__apiCache.clear();
      console.log('[AGGRESSIVE-MEMORY] Cache API pulita');
    }
  }

  // Cleanup cache real-time
  clearRealtimeCache(): void {
    // Pulisci cache real-time se esiste
    if (global.__realtimeCache) {
      global.__realtimeCache.clear();
      console.log('[AGGRESSIVE-MEMORY] Cache real-time pulita');
    }
  }

  // Cleanup cache Supabase
  clearSupabaseCache(): void {
    // Pulisci cache Supabase se esiste
    if (global.__supabaseCache) {
      global.__supabaseCache.clear();
      console.log('[AGGRESSIVE-MEMORY] Cache Supabase pulita');
    }
  }

  // Cleanup completo aggressivo
  async aggressiveCleanup(): Promise<void> {
    console.log('[AGGRESSIVE-MEMORY] Avvio cleanup aggressivo...');
    
    // Forza garbage collection multiplo
    for (let i = 0; i < 5; i++) {
      this.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Pulisci tutte le cache
    this.clearCSRFTokens();
    this.clearAPICache();
    this.clearRealtimeCache();
    this.clearSupabaseCache();
    
    // Pulisci cache moduli se possibile
    if (require.cache) {
      const cacheSize = Object.keys(require.cache).length;
      console.log(`[AGGRESSIVE-MEMORY] Cache moduli: ${cacheSize} moduli`);
    }
    
    const usage = this.getMemoryUsage();
    console.log(`[AGGRESSIVE-MEMORY] Cleanup aggressivo completato. Memoria: ${usage.toFixed(1)}%`);
  }

  // Cleanup ultra-aggressivo per emergenze
  async emergencyCleanup(): Promise<void> {
    console.log('[AGGRESSIVE-MEMORY] 🚨 CLEANUP EMERGENZA...');
    this.emergencyMode = true;
    
    // Garbage collection multiplo intensivo
    for (let i = 0; i < 10; i++) {
      this.forceGarbageCollection();
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Pulisci tutto
    this.clearCSRFTokens();
    this.clearAPICache();
    this.clearRealtimeCache();
    this.clearSupabaseCache();
    
    // Rimuovi cache moduli non essenziali
    if (require.cache) {
      const essentialModules = ['fs', 'path', 'os', 'crypto'];
      for (const moduleName in require.cache) {
        if (!essentialModules.some(essential => moduleName.includes(essential))) {
          delete require.cache[moduleName];
        }
      }
    }
    
    const usage = this.getMemoryUsage();
    console.log(`[AGGRESSIVE-MEMORY] 🚨 Cleanup emergenza completato. Memoria: ${usage.toFixed(1)}%`);
    this.emergencyMode = false;
  }

  // Monitoraggio aggressivo
  startAggressiveMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    console.log('[AGGRESSIVE-MEMORY] Avvio monitoraggio aggressivo (15s)');
    
    this.cleanupInterval = setInterval(async () => {
      const usage = this.getMemoryUsage();
      const now = Date.now();
      
      // Log stato memoria
      if (usage > this.criticalThreshold) {
        console.log(`[AGGRESSIVE-MEMORY] 🚨 CRITICO: ${usage.toFixed(1)}% - Cleanup emergenza`);
        await this.emergencyCleanup();
      } else if (usage > this.highThreshold) {
        console.log(`[AGGRESSIVE-MEMORY] ⚠️ ALTO: ${usage.toFixed(1)}% - Cleanup aggressivo`);
        await this.aggressiveCleanup();
      } else {
        console.log(`[AGGRESSIVE-MEMORY] ✅ NORMALE: ${usage.toFixed(1)}%`);
      }
      
      // Cleanup periodico se non in emergenza
      if (!this.emergencyMode && now - this.lastCleanup > this.cleanupCooldown) {
        await this.aggressiveCleanup();
        this.lastCleanup = now;
      }
    }, 15000); // Ogni 15 secondi
  }

  // Stop monitoraggio
  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      console.log('[AGGRESSIVE-MEMORY] Monitoraggio fermato');
    }
  }

  // Ottieni status
  getStatus() {
    return {
      usage: this.getMemoryUsage(),
      emergencyMode: this.emergencyMode,
      isMonitoring: !!this.cleanupInterval
    };
  }
}

// Inizializza ottimizzatore aggressivo
export function initializeAggressiveMemoryOptimization(): void {
  const optimizer = AggressiveMemoryOptimizer.getInstance();
  
  // Avvia monitoraggio aggressivo
  optimizer.startAggressiveMonitoring();
  
  // Cleanup emergenza su errori non gestiti
  process.on('uncaughtException', (error) => {
    console.error('[AGGRESSIVE-MEMORY] Errore non gestito, cleanup emergenza:', error);
    optimizer.emergencyCleanup();
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[AGGRESSIVE-MEMORY] Promise rifiutata, cleanup emergenza:', reason);
    optimizer.emergencyCleanup();
  });

  console.log('[AGGRESSIVE-MEMORY] Ottimizzatore aggressivo inizializzato');
} 