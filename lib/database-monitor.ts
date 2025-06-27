interface DatabaseQuery {
  id: string;
  sql: string;
  params?: any[];
  duration: number; // in milliseconds
  timestamp: Date;
  userId?: string;
  table?: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UNKNOWN';
  success: boolean;
  error?: string;
  rowsAffected?: number;
  executionPlan?: any;
}

interface DatabaseStats {
  totalQueries: number;
  averageQueryTime: number;
  slowQueries: number;
  failedQueries: number;
  queriesByOperation: Record<string, number>;
  queriesByTable: Record<string, number>;
  slowestQueries: DatabaseQuery[];
  mostFrequentQueries: Array<{
    sql: string;
    count: number;
    averageTime: number;
  }>;
}

interface DatabaseAlert {
  id: string;
  type: 'slow_query' | 'high_error_rate' | 'connection_pool_exhausted' | 'deadlock' | 'timeout';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  resolved: boolean;
}

class DatabaseMonitor {
  private queries: DatabaseQuery[] = [];
  private alerts: DatabaseAlert[] = [];
  private slowQueryThreshold: number = 1000; // 1 second
  private maxQueries: number = 10000;
  private isMonitoring: boolean = false;

  constructor() {
    this.initializeMonitoring();
  }

  // Initialize database monitoring
  private initializeMonitoring(): void {
    if (this.isMonitoring) return;

    // Start monitoring interval
    setInterval(() => {
      this.analyzePerformance();
    }, 30000); // Analyze every 30 seconds

    this.isMonitoring = true;
    console.log('✅ Database monitoring initialized');
  }

  // Track a database query
  trackQuery(
    sql: string,
    duration: number,
    params?: any[],
    userId?: string,
    success: boolean = true,
    error?: string,
    rowsAffected?: number
  ): void {
    const query: DatabaseQuery = {
      id: `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sql: this.normalizeSQL(sql),
      params,
      duration,
      timestamp: new Date(),
      userId,
      table: this.extractTableFromSQL(sql),
      operation: this.extractOperationFromSQL(sql),
      success,
      error,
      rowsAffected
    };

    this.queries.push(query);

    // Keep only the last maxQueries entries
    if (this.queries.length > this.maxQueries) {
      this.queries = this.queries.slice(-this.maxQueries);
    }

    // Check for slow queries
    if (duration > this.slowQueryThreshold) {
      this.createAlert({
        type: 'slow_query',
        severity: duration > 5000 ? 'critical' : duration > 2000 ? 'high' : 'medium',
        message: `Slow query detected: ${duration}ms - ${sql.substring(0, 100)}...`,
        metadata: {
          queryId: query.id,
          duration,
          threshold: this.slowQueryThreshold,
          sql: query.sql
        }
      });
    }

    // Check for failed queries
    if (!success) {
      this.createAlert({
        type: 'high_error_rate',
        severity: 'high',
        message: `Database query failed: ${error}`,
        metadata: {
          queryId: query.id,
          error,
          sql: query.sql
        }
      });
    }
  }

  // Get database statistics
  getStats(timeRange: number = 60 * 60 * 1000): DatabaseStats { // Default: 1 hour
    const cutoffTime = Date.now() - timeRange;
    const recentQueries = this.queries.filter(query => 
      query.timestamp.getTime() > cutoffTime
    );

    if (recentQueries.length === 0) {
      return {
        totalQueries: 0,
        averageQueryTime: 0,
        slowQueries: 0,
        failedQueries: 0,
        queriesByOperation: {},
        queriesByTable: {},
        slowestQueries: [],
        mostFrequentQueries: []
      };
    }

    const totalDuration = recentQueries.reduce((sum, query) => sum + query.duration, 0);
    const slowQueries = recentQueries.filter(query => query.duration > this.slowQueryThreshold);
    const failedQueries = recentQueries.filter(query => !query.success);

    const queriesByOperation: Record<string, number> = {};
    const queriesByTable: Record<string, number> = {};

    recentQueries.forEach(query => {
      queriesByOperation[query.operation] = (queriesByOperation[query.operation] || 0) + 1;
      if (query.table) {
        queriesByTable[query.table] = (queriesByTable[query.table] || 0) + 1;
      }
    });

    // Get slowest queries
    const slowestQueries = recentQueries
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    // Get most frequent queries
    const queryFrequency = new Map<string, { count: number; totalTime: number }>();
    
    recentQueries.forEach(query => {
      const key = query.sql;
      const existing = queryFrequency.get(key) || { count: 0, totalTime: 0 };
      existing.count++;
      existing.totalTime += query.duration;
      queryFrequency.set(key, existing);
    });

    const mostFrequentQueries = Array.from(queryFrequency.entries())
      .map(([sql, stats]) => ({
        sql,
        count: stats.count,
        averageTime: stats.totalTime / stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalQueries: recentQueries.length,
      averageQueryTime: totalDuration / recentQueries.length,
      slowQueries: slowQueries.length,
      failedQueries: failedQueries.length,
      queriesByOperation,
      queriesByTable,
      slowestQueries,
      mostFrequentQueries
    };
  }

  // Analyze database performance
  private analyzePerformance(): void {
    const stats = this.getStats(5 * 60 * 1000); // Last 5 minutes

    // Check for high error rate
    if (stats.totalQueries > 0) {
      const errorRate = stats.failedQueries / stats.totalQueries;
      if (errorRate > 0.1) { // 10% error rate
        this.createAlert({
          type: 'high_error_rate',
          severity: 'critical',
          message: `High database error rate: ${(errorRate * 100).toFixed(1)}%`,
          metadata: {
            errorRate,
            totalQueries: stats.totalQueries,
            failedQueries: stats.failedQueries
          }
        });
      }
    }

    // Check for slow average query time
    if (stats.averageQueryTime > 500) { // 500ms average
      this.createAlert({
        type: 'slow_query',
        severity: 'medium',
        message: `High average query time: ${stats.averageQueryTime.toFixed(2)}ms`,
        metadata: {
          averageQueryTime: stats.averageQueryTime,
          totalQueries: stats.totalQueries
        }
      });
    }

    // Check for too many slow queries
    if (stats.slowQueries > 10) {
      this.createAlert({
        type: 'slow_query',
        severity: 'high',
        message: `Multiple slow queries detected: ${stats.slowQueries} in the last 5 minutes`,
        metadata: {
          slowQueries: stats.slowQueries,
          timeRange: '5 minutes'
        }
      });
    }
  }

  // Create database alert
  private createAlert(alert: Omit<DatabaseAlert, 'id' | 'timestamp' | 'resolved'>): void {
    const databaseAlert: DatabaseAlert = {
      ...alert,
      id: `db_alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(databaseAlert);
    console.warn(`🚨 Database Alert [${alert.severity.toUpperCase()}]: ${alert.message}`);
  }

  // Get active alerts
  getActiveAlerts(): DatabaseAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      console.log(`✅ Database alert resolved: ${alert.message}`);
    }
  }

  // Get recent queries
  getRecentQueries(limit: number = 100): DatabaseQuery[] {
    return this.queries
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get slow queries
  getSlowQueries(limit: number = 50): DatabaseQuery[] {
    return this.queries
      .filter(query => query.duration > this.slowQueryThreshold)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Get failed queries
  getFailedQueries(limit: number = 50): DatabaseQuery[] {
    return this.queries
      .filter(query => !query.success)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Set slow query threshold
  setSlowQueryThreshold(threshold: number): void {
    this.slowQueryThreshold = threshold;
    console.log(`⚙️ Slow query threshold updated: ${threshold}ms`);
  }

  // Clear old queries
  clearOldQueries(daysToKeep: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.queries.length;
    
    this.queries = this.queries.filter(query => query.timestamp > cutoffDate);
    
    const removedCount = initialCount - this.queries.length;
    console.log(`🧹 Cleared ${removedCount} old database queries (older than ${daysToKeep} days)`);
  }

  // Private helper methods
  private normalizeSQL(sql: string): string {
    // Remove extra whitespace and normalize
    return sql.replace(/\s+/g, ' ').trim();
  }

  private extractTableFromSQL(sql: string): string | undefined {
    const upperSQL = sql.toUpperCase();
    
    // Extract table name from SELECT, INSERT, UPDATE, DELETE statements
    const patterns = [
      /FROM\s+(\w+)/i,
      /INSERT\s+INTO\s+(\w+)/i,
      /UPDATE\s+(\w+)/i,
      /DELETE\s+FROM\s+(\w+)/i
    ];

    for (const pattern of patterns) {
      const match = sql.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return undefined;
  }

  private extractOperationFromSQL(sql: string): DatabaseQuery['operation'] {
    const upperSQL = sql.toUpperCase().trim();
    
    if (upperSQL.startsWith('SELECT')) return 'SELECT';
    if (upperSQL.startsWith('INSERT')) return 'INSERT';
    if (upperSQL.startsWith('UPDATE')) return 'UPDATE';
    if (upperSQL.startsWith('DELETE')) return 'DELETE';
    
    return 'UNKNOWN';
  }

  // Database connection monitoring
  trackConnection(operation: 'connect' | 'disconnect' | 'acquire' | 'release', duration?: number): void {
    console.log(`🔗 Database connection: ${operation}${duration ? ` (${duration}ms)` : ''}`);
    
    if (duration && duration > 1000) {
      this.createAlert({
        type: 'connection_pool_exhausted',
        severity: 'medium',
        message: `Slow database connection: ${operation} took ${duration}ms`,
        metadata: {
          operation,
          duration
        }
      });
    }
  }

  // Track deadlock
  trackDeadlock(table1: string, table2: string, query1: string, query2: string): void {
    this.createAlert({
      type: 'deadlock',
      severity: 'critical',
      message: `Database deadlock detected between ${table1} and ${table2}`,
      metadata: {
        table1,
        table2,
        query1: query1.substring(0, 100),
        query2: query2.substring(0, 100)
      }
    });
  }

  // Track timeout
  trackTimeout(sql: string, timeout: number): void {
    this.createAlert({
      type: 'timeout',
      severity: 'high',
      message: `Database query timeout after ${timeout}ms`,
      metadata: {
        sql: sql.substring(0, 100),
        timeout
      }
    });
  }

  // Get query performance recommendations
  getPerformanceRecommendations(): Array<{
    type: 'index' | 'query_optimization' | 'connection_pool' | 'caching';
    priority: 'low' | 'medium' | 'high';
    message: string;
    impact: string;
  }> {
    const recommendations: Array<{
      type: 'index' | 'query_optimization' | 'connection_pool' | 'caching';
      priority: 'low' | 'medium' | 'high';
      message: string;
      impact: string;
    }> = [];

    const stats = this.getStats(24 * 60 * 60 * 1000); // Last 24 hours

    // Check for slow queries that might need indexing
    const slowQueries = this.getSlowQueries(20);
    const tableSlowQueries = new Map<string, number>();

    slowQueries.forEach(query => {
      if (query.table) {
        tableSlowQueries.set(query.table, (tableSlowQueries.get(query.table) || 0) + 1);
      }
    });

    tableSlowQueries.forEach((count, table) => {
      if (count > 5) {
        recommendations.push({
          type: 'index',
          priority: 'high',
          message: `Consider adding indexes to table '${table}' - ${count} slow queries detected`,
          impact: 'High - Can reduce query time by 50-90%'
        });
      }
    });

    // Check for frequently executed queries that could benefit from caching
    stats.mostFrequentQueries.forEach(query => {
      if (query.count > 100 && query.averageTime > 100) {
        recommendations.push({
          type: 'caching',
          priority: 'medium',
          message: `Consider caching query executed ${query.count} times with ${query.averageTime.toFixed(2)}ms average time`,
          impact: 'Medium - Can reduce database load and improve response time'
        });
      }
    });

    // Check for connection pool issues
    if (stats.totalQueries > 1000) {
      recommendations.push({
        type: 'connection_pool',
        priority: 'low',
        message: 'Consider optimizing connection pool settings for high query volume',
        impact: 'Low - Can improve connection management'
      });
    }

    return recommendations;
  }
}

// Export singleton instance
export const databaseMonitor = new DatabaseMonitor();

// Export types
export type { DatabaseQuery, DatabaseStats, DatabaseAlert }; 