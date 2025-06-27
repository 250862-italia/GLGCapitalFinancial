interface PerformanceMetric {
  id: string;
  timestamp: Date;
  type: 'api_call' | 'page_load' | 'database_query' | 'external_service' | 'user_action';
  name: string;
  duration: number; // in milliseconds
  status: 'success' | 'error' | 'timeout';
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

interface PerformanceAlert {
  id: string;
  type: 'slow_response' | 'high_error_rate' | 'timeout' | 'memory_usage' | 'cpu_usage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  averageResponseTime: number;
  errorRate: number;
  throughput: number; // requests per minute
  slowQueries: number;
  timeouts: number;
  memoryUsage: number;
  cpuUsage: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds = {
    slowResponse: 2000, // 2 seconds
    errorRate: 0.05, // 5%
    timeout: 10000, // 10 seconds
    memoryUsage: 0.8, // 80%
    cpuUsage: 0.7 // 70%
  };
  private maxMetrics: number = 10000;

  // Track API call performance
  async trackAPICall(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    userId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: PerformanceMetric = {
      id: `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'api_call',
      name: `${method} ${endpoint}`,
      duration,
      status: status >= 400 ? 'error' : 'success',
      metadata: {
        endpoint,
        method,
        statusCode: status,
        ...metadata
      },
      userId
    };

    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  // Track page load performance
  trackPageLoad(
    page: string,
    loadTime: number,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'page_load',
      name: page,
      duration: loadTime,
      status: loadTime > this.thresholds.slowResponse ? 'error' : 'success',
      metadata: {
        page,
        ...metadata
      },
      userId
    };

    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  // Track database query performance
  trackDatabaseQuery(
    query: string,
    duration: number,
    table?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `db_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'database_query',
      name: query.substring(0, 50) + (query.length > 50 ? '...' : ''),
      duration,
      status: duration > this.thresholds.slowResponse ? 'error' : 'success',
      metadata: {
        query,
        table,
        ...metadata
      }
    };

    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  // Track external service call
  async trackExternalService(
    service: string,
    endpoint: string,
    duration: number,
    status: 'success' | 'error' | 'timeout',
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: PerformanceMetric = {
      id: `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'external_service',
      name: `${service}:${endpoint}`,
      duration,
      status,
      metadata: {
        service,
        endpoint,
        ...metadata
      }
    };

    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  // Track user action performance
  trackUserAction(
    action: string,
    duration: number,
    userId?: string,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type: 'user_action',
      name: action,
      duration,
      status: duration > this.thresholds.slowResponse ? 'error' : 'success',
      metadata: {
        action,
        ...metadata
      },
      userId
    };

    this.addMetric(metric);
    this.checkPerformanceThresholds(metric);
  }

  // Add metric to storage
  private addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Check performance thresholds and create alerts
  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    // Check for slow response
    if (metric.duration > this.thresholds.slowResponse) {
      this.createAlert({
        type: 'slow_response',
        severity: metric.duration > this.thresholds.timeout ? 'critical' : 'high',
        message: `Slow response detected: ${metric.name} took ${metric.duration}ms`,
        metadata: {
          metricId: metric.id,
          duration: metric.duration,
          threshold: this.thresholds.slowResponse
        }
      });
    }

    // Check for timeouts
    if (metric.duration > this.thresholds.timeout) {
      this.createAlert({
        type: 'timeout',
        severity: 'critical',
        message: `Timeout detected: ${metric.name} took ${metric.duration}ms`,
        metadata: {
          metricId: metric.id,
          duration: metric.duration,
          threshold: this.thresholds.timeout
        }
      });
    }

    // Check error rate periodically
    this.checkErrorRate();
  }

  // Check error rate and create alerts
  private checkErrorRate(): void {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    if (recentMetrics.length > 10) {
      const errorCount = recentMetrics.filter(m => m.status === 'error').length;
      const errorRate = errorCount / recentMetrics.length;

      if (errorRate > this.thresholds.errorRate) {
        this.createAlert({
          type: 'high_error_rate',
          severity: errorRate > 0.1 ? 'critical' : 'high',
          message: `High error rate detected: ${(errorRate * 100).toFixed(1)}%`,
          metadata: {
            errorRate,
            totalRequests: recentMetrics.length,
            errorCount
          }
        });
      }
    }
  }

  // Create performance alert
  private createAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const performanceAlert: PerformanceAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(performanceAlert);
    console.warn(`🚨 Performance Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  // Get performance statistics
  getPerformanceStats(timeRange: number = 60 * 60 * 1000): PerformanceStats { // Default: 1 hour
    const cutoffTime = Date.now() - timeRange;
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > cutoffTime);

    if (recentMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        errorRate: 0,
        throughput: 0,
        slowQueries: 0,
        timeouts: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };
    }

    const totalDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0);
    const errorCount = recentMetrics.filter(m => m.status === 'error').length;
    const slowQueries = recentMetrics.filter(m => m.duration > this.thresholds.slowResponse).length;
    const timeouts = recentMetrics.filter(m => m.duration > this.thresholds.timeout).length;
    const minutesInRange = timeRange / (60 * 1000);

    return {
      averageResponseTime: totalDuration / recentMetrics.length,
      errorRate: errorCount / recentMetrics.length,
      throughput: recentMetrics.length / minutesInRange,
      slowQueries,
      timeouts,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage()
    };
  }

  // Get recent metrics
  getRecentMetrics(limit: number = 100): PerformanceMetric[] {
    return this.metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get active alerts
  getActiveAlerts(): PerformanceAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Performance alert resolved: ${alert.message}`);
    }
  }

  // Get slowest operations
  getSlowestOperations(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get error-prone operations
  getErrorProneOperations(limit: number = 10): Array<{
    name: string;
    totalCalls: number;
    errorCount: number;
    errorRate: number;
    averageDuration: number;
  }> {
    const operationStats = new Map<string, {
      totalCalls: number;
      errorCount: number;
      totalDuration: number;
    }>();

    this.metrics.forEach(metric => {
      const existing = operationStats.get(metric.name) || {
        totalCalls: 0,
        errorCount: 0,
        totalDuration: 0
      };

      existing.totalCalls++;
      existing.totalDuration += metric.duration;
      if (metric.status === 'error') {
        existing.errorCount++;
      }

      operationStats.set(metric.name, existing);
    });

    return Array.from(operationStats.entries())
      .map(([name, stats]) => ({
        name,
        totalCalls: stats.totalCalls,
        errorCount: stats.errorCount,
        errorRate: stats.errorCount / stats.totalCalls,
        averageDuration: stats.totalDuration / stats.totalCalls
      }))
      .filter(op => op.errorCount > 0)
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, limit);
  }

  // Set performance thresholds
  setThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('📊 Performance thresholds updated:', this.thresholds);
  }

  // Clear old metrics
  clearOldMetrics(daysToKeep: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.metrics.length;
    
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffDate);
    
    const removedCount = initialCount - this.metrics.length;
    console.log(`🧹 Cleared ${removedCount} old performance metrics (older than ${daysToKeep} days)`);
  }

  // Simulate memory usage (in real implementation, use actual system metrics)
  private getMemoryUsage(): number {
    // Simulate memory usage between 30% and 90%
    return 0.3 + Math.random() * 0.6;
  }

  // Simulate CPU usage (in real implementation, use actual system metrics)
  private getCPUUsage(): number {
    // Simulate CPU usage between 20% and 80%
    return 0.2 + Math.random() * 0.6;
  }

  // Performance decorator for functions
  static track<T extends (...args: any[]) => any>(
    name: string,
    type: PerformanceMetric['type'] = 'user_action'
  ) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        let status: PerformanceMetric['status'] = 'success';

        try {
          const result = await originalMethod.apply(this, args);
          return result;
        } catch (error) {
          status = 'error';
          throw error;
        } finally {
          const duration = Date.now() - startTime;
          performanceMonitor.trackUserAction(name, duration, undefined, {
            method: propertyKey,
            args: args.length
          });
        }
      };

      return descriptor;
    };
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export types
export type { PerformanceMetric, PerformanceAlert, PerformanceStats }; 