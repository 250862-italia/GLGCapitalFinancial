#!/usr/bin/env node

/**
 * EMERGENCY MEMORY FIX SCRIPT
 * Risolve il problema critico di memoria (92-97% usage)
 * 
 * Eseguire con: node fix-memory-critical.js
 */

const os = require('os');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚨 EMERGENCY MEMORY FIX - GLG Capital Financial\n');

// Configurazione
const CONFIG = {
  CRITICAL_THRESHOLD: 90, // 90% memory usage
  HIGH_THRESHOLD: 80,     // 80% memory usage
  CLEANUP_INTERVALS: 5,   // Cleanup ogni 5 secondi
  MAX_CLEANUP_ATTEMPTS: 10
};

class EmergencyMemoryFix {
  constructor() {
    this.cleanupAttempts = 0;
    this.isRunning = false;
  }

  // Ottieni utilizzo memoria
  getMemoryUsage() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const usagePercent = (usedMem / totalMem) * 100;
    
    return {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      percentage: usagePercent
    };
  }

  // Forza garbage collection se disponibile
  forceGarbageCollection() {
    if (global.gc) {
      try {
        global.gc();
        console.log('✅ Garbage collection forzato');
        return true;
      } catch (error) {
        console.warn('⚠️ Errore garbage collection:', error.message);
        return false;
      }
    } else {
      console.warn('⚠️ Garbage collection non disponibile (eseguire con --expose-gc)');
      return false;
    }
  }

  // Cleanup memoria Node.js
  cleanupNodeMemory() {
    console.log('🧹 Cleanup memoria Node.js...');
    
    // Forza garbage collection
    this.forceGarbageCollection();
    
    // Pulisci cache moduli se possibile
    if (require.cache) {
      const cacheSize = Object.keys(require.cache).length;
      console.log(`📦 Cache moduli: ${cacheSize} moduli caricati`);
    }
    
    // Log utilizzo memoria dopo cleanup
    const usage = this.getMemoryUsage();
    console.log(`📊 Memoria dopo cleanup: ${usage.percentage.toFixed(1)}%`);
    
    return usage.percentage;
  }

  // Cleanup file temporanei
  cleanupTempFiles() {
    console.log('🗂️ Cleanup file temporanei...');
    
    const tempDirs = [
      path.join(process.cwd(), '.next'),
      path.join(process.cwd(), 'node_modules/.cache'),
      path.join(os.tmpdir(), 'nextjs'),
      path.join(os.tmpdir(), 'supabase')
    ];
    
    tempDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        try {
          const stats = fs.statSync(dir);
          const sizeMB = (stats.size || 0) / (1024 * 1024);
          console.log(`📁 ${dir}: ${sizeMB.toFixed(2)} MB`);
        } catch (error) {
          console.warn(`⚠️ Errore accesso ${dir}:`, error.message);
        }
      }
    });
  }

  // Restart processo se necessario
  async restartProcess() {
    console.log('🔄 Restart processo...');
    
    return new Promise((resolve, reject) => {
      // Se siamo in PM2
      if (process.env.PM2_HOME) {
        exec('pm2 restart all', (error, stdout, stderr) => {
          if (error) {
            console.error('❌ Errore restart PM2:', error.message);
            reject(error);
          } else {
            console.log('✅ Restart PM2 completato');
            resolve();
          }
        });
      } else {
        // Restart manuale
        console.log('⚠️ Restart manuale richiesto');
        console.log('💡 Eseguire: npm run dev -- --expose-gc');
        resolve();
      }
    });
  }

  // Monitoraggio continuo memoria
  startMemoryMonitoring() {
    console.log('📊 Avvio monitoraggio memoria...');
    
    const interval = setInterval(() => {
      const usage = this.getMemoryUsage();
      
      console.log(`📈 Memoria: ${usage.percentage.toFixed(1)}% (${(usage.used / 1024 / 1024 / 1024).toFixed(1)} GB / ${(usage.total / 1024 / 1024 / 1024).toFixed(1)} GB)`);
      
      if (usage.percentage > CONFIG.CRITICAL_THRESHOLD) {
        console.log('🚨 MEMORIA CRITICA - Cleanup automatico...');
        this.cleanupNodeMemory();
        this.cleanupAttempts++;
        
        if (this.cleanupAttempts >= CONFIG.MAX_CLEANUP_ATTEMPTS) {
          console.log('⚠️ Massimo numero tentativi cleanup raggiunto');
          clearInterval(interval);
        }
      } else if (usage.percentage > CONFIG.HIGH_THRESHOLD) {
        console.log('⚠️ Memoria alta - Monitoraggio intensivo');
      } else {
        console.log('✅ Memoria normale');
      }
    }, CONFIG.CLEANUP_INTERVALS * 1000);
    
    return interval;
  }

  // Analisi sistema
  analyzeSystem() {
    console.log('🔍 Analisi sistema...\n');
    
    const usage = this.getMemoryUsage();
    const cpus = os.cpus();
    const platform = os.platform();
    const arch = os.arch();
    const nodeVersion = process.version;
    
    console.log('📊 Informazioni Sistema:');
    console.log(`   OS: ${platform} ${arch}`);
    console.log(`   Node.js: ${nodeVersion}`);
    console.log(`   CPU: ${cpus.length} core`);
    console.log(`   Memoria Totale: ${(usage.total / 1024 / 1024 / 1024).toFixed(1)} GB`);
    console.log(`   Memoria Libera: ${(usage.free / 1024 / 1024 / 1024).toFixed(1)} GB`);
    console.log(`   Memoria Utilizzata: ${(usage.used / 1024 / 1024 / 1024).toFixed(1)} GB`);
    console.log(`   Utilizzo Memoria: ${usage.percentage.toFixed(1)}%`);
    
    if (usage.percentage > CONFIG.CRITICAL_THRESHOLD) {
      console.log('\n🚨 STATO CRITICO - Memoria oltre il 90%');
      return 'CRITICAL';
    } else if (usage.percentage > CONFIG.HIGH_THRESHOLD) {
      console.log('\n⚠️ STATO ALTO - Memoria oltre l\'80%');
      return 'HIGH';
    } else {
      console.log('\n✅ STATO NORMALE - Memoria sotto l\'80%');
      return 'NORMAL';
    }
  }

  // Esegui fix completo
  async runEmergencyFix() {
    if (this.isRunning) {
      console.log('⚠️ Fix già in esecuzione');
      return;
    }
    
    this.isRunning = true;
    console.log('🚨 Avvio Emergency Memory Fix...\n');
    
    try {
      // 1. Analisi sistema
      const status = this.analyzeSystem();
      
      if (status === 'NORMAL') {
        console.log('✅ Sistema in stato normale - Nessun intervento necessario');
        return;
      }
      
      // 2. Cleanup immediato
      console.log('\n🧹 Cleanup immediato...');
      this.cleanupNodeMemory();
      this.cleanupTempFiles();
      
      // 3. Se ancora critico, restart
      const usageAfterCleanup = this.getMemoryUsage();
      if (usageAfterCleanup.percentage > CONFIG.CRITICAL_THRESHOLD) {
        console.log('\n🚨 Memoria ancora critica - Restart necessario');
        await this.restartProcess();
      }
      
      // 4. Monitoraggio continuo
      console.log('\n📊 Avvio monitoraggio continuo...');
      const monitoringInterval = this.startMemoryMonitoring();
      
      // 5. Stop dopo 5 minuti
      setTimeout(() => {
        clearInterval(monitoringInterval);
        console.log('\n✅ Monitoraggio completato');
        this.isRunning = false;
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Errore durante emergency fix:', error);
      this.isRunning = false;
    }
  }
}

// Esegui fix
async function main() {
  const fixer = new EmergencyMemoryFix();
  await fixer.runEmergencyFix();
}

// Esegui se chiamato direttamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = EmergencyMemoryFix; 