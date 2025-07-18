import { performanceMonitor } from './api-optimizer';

// Interfacce per le metriche
interface PerformanceMetric {
  count: number;
  totalTime: number;
  avgTime: number;
  minTime: number;
  maxTime: number;
  lastCall: number;
  errors: number;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    load: number;
    cores: number;
  };
  uptime: number;
  requests: {
    total: number;
    success: number;
    error: number;
    rate: number; // requests per secondo
  };
}

// Classe per il monitoraggio globale delle performance
class GlobalPerformanceMonitor {
  private metrics: Record<string, PerformanceMetric> = {};
  private systemMetrics: SystemMetrics = {
    memory: { used: 0, total: 0, percentage: 0 },
    cpu: { load: 0, cores: 0 },
    uptime: 0,
    requests: { total: 0, success: 0, error: 0, rate: 0 }
  };
  private startTime = Date.now();
  private requestCount = 0;
  private lastRequestTime = Date.now();

  // Registra una chiamata API
  recordAPICall(operation: string, duration: number, success: boolean = true) {
    if (!this.metrics[operation]) {
      this.metrics[operation] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: duration,
        maxTime: duration,
        lastCall: Date.now(),
        errors: 0
      };
    }

    const metric = this.metrics[operation];
    metric.count++;
    metric.totalTime += duration;
    metric.avgTime = metric.totalTime / metric.count;
    metric.minTime = Math.min(metric.minTime, duration);
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.lastCall = Date.now();

    if (!success) {
      metric.errors++;
    }

    // Aggiorna metriche globali
    this.requestCount++;
    this.lastRequestTime = Date.now();
    
    if (success) {
      this.systemMetrics.requests.success++;
    } else {
      this.systemMetrics.requests.error++;
    }
    
    this.systemMetrics.requests.total = this.requestCount;
  }

  // Ottieni metriche per operazione
  getMetrics(operation?: string): Record<string, PerformanceMetric> | PerformanceMetric | null {
    if (operation) {
      return this.metrics[operation] || null;
    }
    return { ...this.metrics };
  }

  // Ottieni metriche di sistema
  getSystemMetrics(): SystemMetrics {
    const now = Date.now();
    const uptime = now - this.startTime;
    
    // Calcola rate delle richieste (ultimi 60 secondi)
    const timeWindow = 60000; // 60 secondi
    const recentRequests = Object.values(this.metrics)
      .filter(metric => now - metric.lastCall < timeWindow)
      .reduce((sum, metric) => sum + metric.count, 0);
    
    this.systemMetrics.uptime = uptime;
    this.systemMetrics.requests.rate = recentRequests / (timeWindow / 1000);

    // Aggiorna metriche di memoria (se disponibile)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const memUsage = process.memoryUsage();
      this.systemMetrics.memory.used = memUsage.heapUsed;
      this.systemMetrics.memory.total = memUsage.heapTotal;
      this.systemMetrics.memory.percentage = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    }

    return { ...this.systemMetrics };
  }

  // Ottieni report completo
  getFullReport(): {
    operations: Record<string, PerformanceMetric>;
    system: SystemMetrics;
    summary: {
      totalOperations: number;
      totalErrors: number;
      avgResponseTime: number;
      slowestOperation: string;
      fastestOperation: string;
      mostCalledOperation: string;
    };
  } {
    const operations = this.getMetrics() as Record<string, PerformanceMetric>;
    const system = this.getSystemMetrics();

    // Calcola statistiche
    const operationNames = Object.keys(operations);
    const totalOperations = operationNames.reduce((sum, op) => sum + operations[op].count, 0);
    const totalErrors = operationNames.reduce((sum, op) => sum + operations[op].errors, 0);
    const avgResponseTime = totalOperations > 0 
      ? operationNames.reduce((sum, op) => sum + operations[op].totalTime, 0) / totalOperations 
      : 0;

    const slowestOperation = operationNames.reduce((slowest, op) => 
      operations[op].avgTime > operations[slowest]?.avgTime ? op : slowest, '');
    
    const fastestOperation = operationNames.reduce((fastest, op) => 
      operations[op].avgTime < operations[fastest]?.avgTime ? op : fastest, '');
    
    const mostCalledOperation = operationNames.reduce((most, op) => 
      operations[op].count > operations[most]?.count ? op : most, '');

    return {
      operations,
      system,
      summary: {
        totalOperations,
        totalErrors,
        avgResponseTime,
        slowestOperation,
        fastestOperation,
        mostCalledOperation
      }
    };
  }

  // Resetta tutte le metriche
  reset(): void {
    this.metrics = {};
    this.requestCount = 0;
    this.startTime = Date.now();
    this.lastRequestTime = Date.now();
  }

  // Ottieni metriche in formato JSON per logging
  toJSON(): string {
    return JSON.stringify(this.getFullReport(), null, 2);
  }

  // Log delle metriche
  logMetrics(): void {
    const report = this.getFullReport();
    console.log('📊 PERFORMANCE REPORT');
    console.log('====================');
    console.log(`⏱️  Uptime: ${Math.floor(report.system.uptime / 1000)}s`);
    console.log(`📈 Requests: ${report.system.requests.total} (${report.system.requests.rate.toFixed(2)}/s)`);
    console.log(`✅ Success Rate: ${((report.system.requests.success / report.system.requests.total) * 100).toFixed(1)}%`);
    console.log(`💾 Memory: ${(report.system.memory.percentage).toFixed(1)}%`);
    console.log(`🐌 Slowest: ${report.summary.slowestOperation} (${report.operations[report.summary.slowestOperation]?.avgTime.toFixed(0)}ms)`);
    console.log(`⚡ Fastest: ${report.summary.fastestOperation} (${report.operations[report.summary.fastestOperation]?.avgTime.toFixed(0)}ms)`);
    console.log(`🔄 Most Called: ${report.summary.mostCalledOperation} (${report.operations[report.summary.mostCalledOperation]?.count} calls)`);
  }
}

// Istanza globale
export const globalPerformanceMonitor = new GlobalPerformanceMonitor();

// Middleware per monitorare automaticamente le richieste
export function createPerformanceMiddleware() {
  return function performanceMiddleware(req: any, res: any, next: any) {
    const startTime = Date.now();
    const originalSend = res.send;

    res.send = function(data: any) {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      globalPerformanceMonitor.recordAPICall(
        `${req.method} ${req.path}`,
        duration,
        success
      );

      return originalSend.call(this, data);
    };

    next();
  };
}

// Funzione per log periodico delle metriche
export function startPeriodicLogging(intervalMs: number = 60000) { // Default: ogni minuto
  setInterval(() => {
    globalPerformanceMonitor.logMetrics();
  }, intervalMs);
}

// Funzione per ottenere metriche in formato prometheus
export function getPrometheusMetrics(): string {
  const report = globalPerformanceMonitor.getFullReport();
  let prometheus = '';

  // Metriche di sistema
  prometheus += `# HELP glg_uptime_seconds Application uptime in seconds\n`;
  prometheus += `# TYPE glg_uptime_seconds gauge\n`;
  prometheus += `glg_uptime_seconds ${report.system.uptime / 1000}\n\n`;

  prometheus += `# HELP glg_requests_total Total number of requests\n`;
  prometheus += `# TYPE glg_requests_total counter\n`;
  prometheus += `glg_requests_total ${report.system.requests.total}\n\n`;

  prometheus += `# HELP glg_requests_success_total Total number of successful requests\n`;
  prometheus += `# TYPE glg_requests_success_total counter\n`;
  prometheus += `glg_requests_success_total ${report.system.requests.success}\n\n`;

  prometheus += `# HELP glg_requests_error_total Total number of failed requests\n`;
  prometheus += `# TYPE glg_requests_error_total counter\n`;
  prometheus += `glg_requests_error_total ${report.system.requests.error}\n\n`;

  prometheus += `# HELP glg_memory_usage_percentage Memory usage percentage\n`;
  prometheus += `# TYPE glg_memory_usage_percentage gauge\n`;
  prometheus += `glg_memory_usage_percentage ${report.system.memory.percentage}\n\n`;

  // Metriche per operazione
  for (const [operation, metric] of Object.entries(report.operations)) {
    const safeOperation = operation.replace(/[^a-zA-Z0-9_]/g, '_');
    
    prometheus += `# HELP glg_operation_duration_seconds Duration of operations\n`;
    prometheus += `# TYPE glg_operation_duration_seconds histogram\n`;
    prometheus += `glg_operation_duration_seconds{operation="${safeOperation}"} ${metric.avgTime / 1000}\n`;
    
    prometheus += `# HELP glg_operation_count_total Total count of operations\n`;
    prometheus += `# TYPE glg_operation_count_total counter\n`;
    prometheus += `glg_operation_count_total{operation="${safeOperation}"} ${metric.count}\n`;
    
    prometheus += `# HELP glg_operation_errors_total Total errors for operations\n`;
    prometheus += `# TYPE glg_operation_errors_total counter\n`;
    prometheus += `glg_operation_errors_total{operation="${safeOperation}"} ${metric.errors}\n\n`;
  }

  return prometheus;
}

// Avvia logging periodico in produzione
if (process.env.NODE_ENV === 'production') {
  startPeriodicLogging();
} 