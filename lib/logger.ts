interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error' | 'critical';
  category: 'auth' | 'user' | 'investment' | 'payment' | 'security' | 'system' | 'admin';
  message: string;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  stackTrace?: string;
}

interface LogFilter {
  level?: LogEntry['level'];
  category?: LogEntry['category'];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 10000; // Keep last 10,000 logs in memory
  private isProduction: boolean = process.env.NODE_ENV === 'production';

  // Log methods for different levels
  debug(message: string, category: LogEntry['category'], metadata?: Record<string, any>): void {
    this.log('debug', category, message, metadata);
  }

  info(message: string, category: LogEntry['category'], metadata?: Record<string, any>): void {
    this.log('info', category, message, metadata);
  }

  warn(message: string, category: LogEntry['category'], metadata?: Record<string, any>): void {
    this.log('warn', category, message, metadata);
  }

  error(message: string, category: LogEntry['category'], error?: Error, metadata?: Record<string, any>): void {
    this.log('error', category, message, metadata, error?.stack);
  }

  critical(message: string, category: LogEntry['category'], error?: Error, metadata?: Record<string, any>): void {
    this.log('critical', category, message, metadata, error?.stack);
  }

  // Main logging method
  private log(
    level: LogEntry['level'],
    category: LogEntry['category'],
    message: string,
    metadata?: Record<string, any>,
    stackTrace?: string
  ): void {
    const logEntry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      metadata,
      stackTrace
    };

    // Add to logs array
    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output based on level
    this.outputToConsole(logEntry);

    // In production, you might want to send to external logging service
    if (this.isProduction) {
      this.sendToExternalService(logEntry);
    }
  }

  // Console output with colors
  private outputToConsole(logEntry: LogEntry): void {
    const timestamp = logEntry.timestamp.toISOString();
    const levelColor = this.getLevelColor(logEntry.level);
    const categoryColor = this.getCategoryColor(logEntry.category);
    
    const logMessage = `[${timestamp}] ${levelColor}${logEntry.level.toUpperCase()}${this.resetColor} [${categoryColor}${logEntry.category}${this.resetColor}] ${logEntry.message}`;
    
    switch (logEntry.level) {
      case 'debug':
        console.debug(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
      case 'critical':
        console.error(logMessage);
        if (logEntry.stackTrace) {
          console.error(logEntry.stackTrace);
        }
        break;
    }

    // Log metadata if present
    if (logEntry.metadata && Object.keys(logEntry.metadata).length > 0) {
      console.log('  Metadata:', logEntry.metadata);
    }
  }

  // Send to external logging service (simulated)
  private async sendToExternalService(logEntry: LogEntry): Promise<void> {
    try {
      // In a real implementation, this would send to services like:
      // - Sentry for error tracking
      // - LogRocket for session replay
      // - DataDog for monitoring
      // - AWS CloudWatch for AWS environments
      
      if (logEntry.level === 'error' || logEntry.level === 'critical') {
        // Send critical errors immediately
        await this.sendToErrorTracking(logEntry);
      } else if (logEntry.level === 'warn') {
        // Queue warnings for batch processing
        this.queueForBatchProcessing(logEntry);
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  // Simulate sending to error tracking service
  private async sendToErrorTracking(logEntry: LogEntry): Promise<void> {
    // Simulate API call to error tracking service
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`📤 Sent to error tracking: ${logEntry.message}`);
  }

  // Simulate batch processing
  private queueForBatchProcessing(logEntry: LogEntry): void {
    // In real implementation, this would add to a queue for batch processing
    console.log(`📦 Queued for batch processing: ${logEntry.message}`);
  }

  // Get logs with filtering
  getLogs(filter?: LogFilter, limit: number = 100): LogEntry[] {
    let filteredLogs = this.logs;

    if (filter) {
      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }
      
      if (filter.category) {
        filteredLogs = filteredLogs.filter(log => log.category === filter.category);
      }
      
      if (filter.userId) {
        filteredLogs = filteredLogs.filter(log => log.userId === filter.userId);
      }
      
      if (filter.startDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp >= filter.startDate!);
      }
      
      if (filter.endDate) {
        filteredLogs = filteredLogs.filter(log => log.timestamp <= filter.endDate!);
      }
      
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
          log.message.toLowerCase().includes(searchLower) ||
          (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchLower))
        );
      }
    }

    return filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get log statistics
  getLogStats(): {
    totalLogs: number;
    logsByLevel: Record<LogEntry['level'], number>;
    logsByCategory: Record<LogEntry['category'], number>;
    errorRate: number;
    recentErrors: LogEntry[];
  } {
    const logsByLevel: Record<LogEntry['level'], number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0
    };

    const logsByCategory: Record<LogEntry['category'], number> = {
      auth: 0,
      user: 0,
      investment: 0,
      payment: 0,
      security: 0,
      system: 0,
      admin: 0
    };

    this.logs.forEach(log => {
      logsByLevel[log.level]++;
      logsByCategory[log.category]++;
    });

    const totalLogs = this.logs.length;
    const errorLogs = logsByLevel.error + logsByLevel.critical;
    const errorRate = totalLogs > 0 ? (errorLogs / totalLogs) * 100 : 0;

    const recentErrors = this.logs
      .filter(log => log.level === 'error' || log.level === 'critical')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      totalLogs,
      logsByLevel,
      logsByCategory,
      errorRate,
      recentErrors
    };
  }

  // Clear old logs
  clearOldLogs(daysToKeep: number = 30): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.logs.length;
    
    this.logs = this.logs.filter(log => log.timestamp > cutoffDate);
    
    const removedCount = initialCount - this.logs.length;
    console.log(`🧹 Cleared ${removedCount} old log entries (older than ${daysToKeep} days)`);
  }

  // Export logs
  exportLogs(filter?: LogFilter, format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLogs(filter);
    
    if (format === 'csv') {
      return this.exportToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  // Export to CSV format
  private exportToCSV(logs: LogEntry[]): string {
    const headers = ['Timestamp', 'Level', 'Category', 'Message', 'User ID', 'IP Address'];
    const rows = logs.map(log => [
      log.timestamp.toISOString(),
      log.level,
      log.category,
      log.message.replace(/"/g, '""'), // Escape quotes
      log.userId || '',
      log.ipAddress || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // Utility methods for common logging patterns
  logUserAction(userId: string, action: string, metadata?: Record<string, any>): void {
    this.info(`User ${userId} performed action: ${action}`, 'user', {
      userId,
      action,
      ...metadata
    });
  }

  logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>): void {
    const level = severity === 'critical' ? 'critical' : 
                 severity === 'high' ? 'error' : 
                 severity === 'medium' ? 'warn' : 'info';
    
    if (level === 'error' || level === 'critical') {
      this[level](`Security event: ${event}`, 'security', undefined, metadata);
    } else {
      this[level](`Security event: ${event}`, 'security', metadata);
    }
  }

  logPaymentEvent(paymentId: string, status: string, amount: number, metadata?: Record<string, any>): void {
    this.info(`Payment ${paymentId} status: ${status}`, 'payment', {
      paymentId,
      status,
      amount,
      ...metadata
    });
  }

  logInvestmentEvent(userId: string, investmentId: string, action: string, amount: number, metadata?: Record<string, any>): void {
    this.info(`Investment ${investmentId} ${action} by user ${userId}`, 'investment', {
      userId,
      investmentId,
      action,
      amount,
      ...metadata
    });
  }

  // Color codes for console output
  private get resetColor() { return '\x1b[0m'; }
  private getLevelColor(level: LogEntry['level']): string {
    switch (level) {
      case 'debug': return '\x1b[36m'; // Cyan
      case 'info': return '\x1b[32m';  // Green
      case 'warn': return '\x1b[33m';  // Yellow
      case 'error': return '\x1b[31m'; // Red
      case 'critical': return '\x1b[35m'; // Magenta
      default: return '\x1b[0m';
    }
  }

  private getCategoryColor(category: LogEntry['category']): string {
    switch (category) {
      case 'auth': return '\x1b[34m';     // Blue
      case 'user': return '\x1b[36m';     // Cyan
      case 'investment': return '\x1b[32m'; // Green
      case 'payment': return '\x1b[33m';   // Yellow

      case 'security': return '\x1b[31m';  // Red
      case 'system': return '\x1b[37m';    // White
      case 'admin': return '\x1b[30m';     // Black
      default: return '\x1b[0m';
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types
export type { LogEntry, LogFilter }; 