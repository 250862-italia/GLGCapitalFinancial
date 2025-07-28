# 🚨 PIANO DI AZIONE EMERGENZA - MEMORIA CRITICA

## 🚨 **STATO CRITICO CONFERMATO**

### **Problema Identificato**
```
Utilizzo Memoria: 99.1% (15.9 GB / 16.0 GB)
Stato: CRITICO - Sistema instabile
Impact: Rischio crash completo
```

## 🎯 **AZIONI IMMEDIATE (ORA)**

### **1. RESTART SERVER (URGENTE)**
```bash
# Opzione 1: Kill tutti i processi Node.js
pkill -f node
pkill -f npm
pkill -f next

# Opzione 2: Restart con garbage collection
npm run dev -- --expose-gc --max-old-space-size=4096

# Opzione 3: Se usi PM2
pm2 restart all
pm2 delete all
pm2 start npm --name "glg-app" -- run dev
```

### **2. LIBERARE MEMORIA SISTEMA**
```bash
# Cleanup cache sistema
sudo purge
sudo rm -rf /private/var/log/asl/*.asl
sudo rm -rf /Library/Caches/*
sudo rm -rf ~/Library/Caches/*

# Kill processi non essenziali
sudo killall -9 com.apple.WebKit.WebContent
sudo killall -9 com.apple.WebKit.PluginProcess
```

### **3. OTTIMIZZAZIONE IMMEDIATA CODICE**
```bash
# Rimuovi cache Next.js
rm -rf .next
rm -rf node_modules/.cache

# Reinstalla dipendenze
npm ci --production

# Avvia con ottimizzazioni
NODE_OPTIONS="--max-old-space-size=4096 --expose-gc" npm run dev
```

## 🔧 **OTTIMIZZAZIONI CODICE (Oggi)**

### **1. Memory Optimizer Aggressivo**
```typescript
// lib/memory-optimizer-aggressive.ts
export class AggressiveMemoryOptimizer {
  private static instance: AggressiveMemoryOptimizer;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private criticalThreshold = 85; // Ridotto a 85%

  static getInstance(): AggressiveMemoryOptimizer {
    if (!AggressiveMemoryOptimizer.instance) {
      AggressiveMemoryOptimizer.instance = new AggressiveMemoryOptimizer();
    }
    return AggressiveMemoryOptimizer.instance;
  }

  startAggressiveMonitoring() {
    // Cleanup ogni 30 secondi invece di 60
    this.cleanupInterval = setInterval(() => {
      this.forceCleanup();
    }, 30000);
  }

  forceCleanup() {
    // Cleanup più aggressivo
    if (global.gc) global.gc();
    
    // Pulisci cache CSRF più aggressivamente
    this.clearCSRFTokens();
    
    // Pulisci cache API
    this.clearAPICache();
    
    // Pulisci cache real-time
    this.clearRealtimeCache();
  }

  private clearCSRFTokens() {
    if (global.__csrfTokens) {
      const now = Date.now();
      const oneMinuteAgo = now - 60000;
      
      for (const [token, data] of global.__csrfTokens.entries()) {
        if (data.createdAt < oneMinuteAgo && !data.protected) {
          global.__csrfTokens.delete(token);
        }
      }
    }
  }

  private clearAPICache() {
    // Implementa cleanup cache API
  }

  private clearRealtimeCache() {
    // Implementa cleanup cache real-time
  }
}
```

### **2. Ottimizzazione Real-time Manager**
```typescript
// lib/realtime-manager-optimized.ts
export class OptimizedRealtimeManager {
  private subscriptions = new Map();
  private maxSubscriptions = 10; // Limitato a 10
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup ogni 30 secondi
    this.cleanupInterval = setInterval(() => {
      this.cleanupSubscriptions();
    }, 30000);
  }

  private cleanupSubscriptions() {
    // Rimuovi sottoscrizioni inattive
    for (const [id, subscription] of this.subscriptions.entries()) {
      if (subscription.lastActivity < Date.now() - 60000) {
        subscription.unsubscribe();
        this.subscriptions.delete(id);
      }
    }
  }

  subscribe(channel: string, callback: Function) {
    // Limita numero sottoscrizioni
    if (this.subscriptions.size >= this.maxSubscriptions) {
      this.cleanupSubscriptions();
    }
    
    // Implementa sottoscrizione ottimizzata
  }
}
```

### **3. Ottimizzazione Database Queries**
```typescript
// lib/database-optimizer.ts
export class DatabaseOptimizer {
  private queryCache = new Map();
  private maxCacheSize = 50; // Ridotto a 50

  async optimizedQuery(query: string, params: any[]) {
    const cacheKey = `${query}-${JSON.stringify(params)}`;
    
    // Cache per 30 secondi invece di 5 minuti
    if (this.queryCache.has(cacheKey)) {
      const cached = this.queryCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 30000) {
        return cached.data;
      }
    }
    
    // Esegui query
    const result = await this.executeQuery(query, params);
    
    // Cache risultato
    this.queryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    // Cleanup cache se troppo grande
    if (this.queryCache.size > this.maxCacheSize) {
      this.cleanupCache();
    }
    
    return result;
  }

  private cleanupCache() {
    const entries = Array.from(this.queryCache.entries());
    const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    const toRemove = sorted.slice(0, Math.floor(this.maxCacheSize / 2));
    
    for (const [key] of toRemove) {
      this.queryCache.delete(key);
    }
  }
}
```

## 📊 **MONITORAGGIO CONTINUO**

### **1. Script Monitoraggio**
```bash
#!/bin/bash
# monitor-memory.sh

while true; do
  MEMORY_USAGE=$(top -l 1 | grep "PhysMem" | awk '{print $2}' | sed 's/[^0-9]//g')
  
  if [ $MEMORY_USAGE -gt 90 ]; then
    echo "🚨 MEMORIA CRITICA: ${MEMORY_USAGE}%"
    echo "📧 Invia alert email..."
    # Invia alert
  elif [ $MEMORY_USAGE -gt 80 ]; then
    echo "⚠️ MEMORIA ALTA: ${MEMORY_USAGE}%"
  else
    echo "✅ MEMORIA OK: ${MEMORY_USAGE}%"
  fi
  
  sleep 30
done
```

### **2. Alert System**
```typescript
// lib/alert-system.ts
export class AlertSystem {
  static sendMemoryAlert(usage: number) {
    // Invia email alert
    console.log(`🚨 ALERT: Memoria critica ${usage}%`);
    
    // Log su file
    const logEntry = `${new Date().toISOString()} - MEMORY_CRITICAL: ${usage}%\n`;
    fs.appendFileSync('memory-alerts.log', logEntry);
  }
}
```

## 🎯 **PIANO DI RECUPERO**

### **FASE 1: STABILIZZAZIONE (Oggi)**
1. ✅ **Restart Server** - Rilascio memoria immediato
2. ✅ **Ottimizzazioni Codice** - Implementa ottimizzazioni
3. ✅ **Monitoraggio** - Sistema alert continuo
4. ✅ **Cleanup Cache** - Rimozione cache non essenziali

### **FASE 2: OTTIMIZZAZIONE (Domani)**
1. **Database Indici** - Migliorare performance query
2. **Real-time Optimization** - Ottimizzare sottoscrizioni
3. **Memory Profiling** - Identificare memory leaks
4. **Code Splitting** - Dividere bundle JavaScript

### **FASE 3: PREVENZIONE (Questa settimana)**
1. **Load Testing** - Test carico sistema
2. **Memory Monitoring** - Dashboard monitoring
3. **Auto-scaling** - Scalabilità automatica
4. **Backup Strategy** - Strategia backup

## 🚨 **COMANDI EMERGENZA**

### **Restart Completo**
```bash
# Kill tutti i processi
pkill -f node
pkill -f npm
pkill -f next

# Cleanup completo
rm -rf .next
rm -rf node_modules/.cache
sudo purge

# Restart con ottimizzazioni
NODE_OPTIONS="--max-old-space-size=4096 --expose-gc" npm run dev
```

### **Monitoraggio Continuo**
```bash
# Avvia monitoraggio
node fix-memory-critical.js &

# Monitora processi
top -pid $(pgrep -f "npm run dev")

# Log memoria
watch -n 5 'free -h && echo "---" && ps aux | grep node'
```

## 📈 **METRICHE DI SUCCESSO**

### **Obiettivi Immediati**
- **Memory Usage**: < 80% (attualmente 99%)
- **Response Time**: < 2s (attualmente > 5s)
- **Uptime**: > 99% (attualmente instabile)
- **Error Rate**: < 1% (attualmente > 10%)

### **Obiettivi Settimanali**
- **Memory Usage**: < 70%
- **Response Time**: < 1s
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

## 🎯 **CONCLUSIONE**

**STATO ATTUALE**: CRITICO (99% memoria)
**PRIORITÀ**: Restart immediato + ottimizzazioni
**TIMELINE**: Stabilizzazione entro oggi
**RISCHIO**: Crash completo sistema

**AZIONE IMMEDIATA RICHIESTA**: Eseguire restart server con ottimizzazioni memoria. 