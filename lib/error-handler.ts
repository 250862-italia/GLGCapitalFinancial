interface ErrorInfo {
  id: string;
  timestamp: Date;
  type: 'client' | 'server' | 'network' | 'validation' | 'auth' | 'unknown';
  message: string;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  enableUserNotifications: boolean;
  maxErrors: number;
  reportToServer: boolean;
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private config: ErrorHandlerConfig;
  private isInitialized: boolean = false;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: config.enableLogging ?? true,
      enableReporting: config.enableReporting ?? true,
      enableUserNotifications: config.enableUserNotifications ?? true,
      maxErrors: config.maxErrors ?? 1000,
      reportToServer: config.reportToServer ?? true
    };

    this.initialize();
  }

  // Initialize error handling
  private initialize(): void {
    if (this.isInitialized) return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'client', 'unhandled_promise');
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || new Error(event.message), 'client', 'javascript_error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle React errors (if in React environment)
    if (typeof window !== 'undefined' && (window as any).React) {
      this.setupReactErrorBoundary();
    }

    this.isInitialized = true;
    console.log('✅ Error handler initialized');
  }

  // Handle different types of errors
  handleError(
    error: Error | string,
    type: ErrorInfo['type'] = 'unknown',
    context?: string,
    metadata?: Record<string, any>
  ): void {
    const errorInfo: ErrorInfo = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      metadata: {
        context,
        ...metadata
      },
      severity: this.determineSeverity(error, type),
      handled: false
    };

    // Add to errors array
    this.errors.push(errorInfo);

    // Keep only the last maxErrors entries
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(-this.config.maxErrors);
    }

    // Log error
    if (this.config.enableLogging) {
      this.logError(errorInfo);
    }

    // Report to server
    if (this.config.reportToServer) {
      this.reportToServer(errorInfo);
    }

    // Show user notification for critical errors
    if (this.config.enableUserNotifications && errorInfo.severity === 'critical') {
      this.showUserNotification(errorInfo);
    }

    // Handle specific error types
    this.handleSpecificError(errorInfo);
  }

  // Handle specific error types
  private handleSpecificError(errorInfo: ErrorInfo): void {
    switch (errorInfo.type) {
      case 'auth':
        this.handleAuthError(errorInfo);
        break;
      case 'network':
        this.handleNetworkError(errorInfo);
        break;
      case 'validation':
        this.handleValidationError(errorInfo);
        break;
      case 'server':
        this.handleServerError(errorInfo);
        break;
      default:
        this.handleGenericError(errorInfo);
    }
  }

  // Handle authentication errors
  private handleAuthError(errorInfo: ErrorInfo): void {
    console.warn('🔐 Authentication error:', errorInfo.message);
    
    // Redirect to login if token is invalid
    if (errorInfo.message.includes('token') || errorInfo.message.includes('unauthorized')) {
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    }
  }

  // Handle network errors
  private handleNetworkError(errorInfo: ErrorInfo): void {
    console.warn('🌐 Network error:', errorInfo.message);
    
    // Show offline notification
    this.showUserNotification({
      ...errorInfo,
      message: 'Network connection lost. Please check your internet connection.',
      severity: 'medium'
    });
  }

  // Handle validation errors
  private handleValidationError(errorInfo: ErrorInfo): void {
    console.warn('✅ Validation error:', errorInfo.message);
    
    // Show user-friendly validation message
    this.showUserNotification({
      ...errorInfo,
      message: 'Please check your input and try again.',
      severity: 'low'
    });
  }

  // Handle server errors
  private handleServerError(errorInfo: ErrorInfo): void {
    console.error('🖥️ Server error:', errorInfo.message);
    
    // Show maintenance notification
    this.showUserNotification({
      ...errorInfo,
      message: 'Server is temporarily unavailable. Please try again later.',
      severity: 'high'
    });
  }

  // Handle generic errors
  private handleGenericError(errorInfo: ErrorInfo): void {
    console.error('❌ Generic error:', errorInfo.message);
  }

  // Determine error severity
  private determineSeverity(error: Error | string, type: ErrorInfo['type']): ErrorInfo['severity'] {
    const message = typeof error === 'string' ? error : error.message.toLowerCase();

    // Critical errors
    if (message.includes('out of memory') || 
        message.includes('stack overflow') ||
        message.includes('fatal')) {
      return 'critical';
    }

    // High severity errors
    if (type === 'server' || 
        message.includes('database') ||
        message.includes('payment') ||
        message.includes('security')) {
      return 'high';
    }

    // Medium severity errors
    if (type === 'network' || 
        message.includes('timeout') ||
        message.includes('connection')) {
      return 'medium';
    }

    // Low severity errors
    return 'low';
  }

  // Log error
  private logError(errorInfo: ErrorInfo): void {
    const logMessage = `[${errorInfo.severity.toUpperCase()}] ${errorInfo.type}: ${errorInfo.message}`;
    
    switch (errorInfo.severity) {
      case 'critical':
        console.error(logMessage, errorInfo);
        break;
      case 'high':
        console.error(logMessage, errorInfo);
        break;
      case 'medium':
        console.warn(logMessage, errorInfo);
        break;
      case 'low':
        console.info(logMessage, errorInfo);
        break;
    }
  }

  // Report error to server
  private async reportToServer(errorInfo: ErrorInfo): Promise<void> {
    try {
      const response = await fetch('/api/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo)
      });

      if (response.ok) {
        console.log('📤 Error reported to server');
      }
    } catch (error) {
      console.error('❌ Failed to report error to server:', error);
    }
  }

  // Show user notification
  private showUserNotification(errorInfo: ErrorInfo): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${this.getSeverityColor(errorInfo.severity)};
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, sans-serif;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
        <span style="font-weight: 600;">${this.getSeverityIcon(errorInfo.severity)} ${errorInfo.severity.toUpperCase()}</span>
        <button onclick="this.parentElement.parentElement.remove()" style="margin-left: auto; background: none; border: none; color: white; cursor: pointer;">×</button>
      </div>
      <div>${errorInfo.message}</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Get severity color
  private getSeverityColor(severity: ErrorInfo['severity']): string {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'high':
        return '#d97706';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#059669';
      default:
        return '#6b7280';
    }
  }

  // Get severity icon
  private getSeverityIcon(severity: ErrorInfo['severity']): string {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return 'ℹ️';
      case 'low':
        return '💡';
      default:
        return '❓';
    }
  }

  // Setup React error boundary
  private setupReactErrorBoundary(): void {
    // This would be implemented in a React Error Boundary component
    console.log('⚛️ React error boundary setup (implement in ErrorBoundary component)');
  }

  // Get error statistics
  getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<ErrorInfo['type'], number>;
    errorsBySeverity: Record<ErrorInfo['severity'], number>;
    recentErrors: ErrorInfo[];
    errorRate: number; // errors per hour
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    
    const recentErrors = this.errors.filter(error => 
      error.timestamp.getTime() > oneHourAgo
    );

    const errorsByType: Record<ErrorInfo['type'], number> = {
      client: 0,
      server: 0,
      network: 0,
      validation: 0,
      auth: 0,
      unknown: 0
    };

    const errorsBySeverity: Record<ErrorInfo['severity'], number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.errors.forEach(error => {
      errorsByType[error.type]++;
      errorsBySeverity[error.severity]++;
    });

    return {
      totalErrors: this.errors.length,
      errorsByType,
      errorsBySeverity,
      recentErrors: recentErrors.slice(-10), // Last 10 errors
      errorRate: recentErrors.length
    };
  }

  // Clear old errors
  clearOldErrors(daysToKeep: number = 7): void {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const initialCount = this.errors.length;
    
    this.errors = this.errors.filter(error => error.timestamp > cutoffDate);
    
    const removedCount = initialCount - this.errors.length;
    console.log(`🧹 Cleared ${removedCount} old errors (older than ${daysToKeep} days)`);
  }

  // Get recent errors
  getRecentErrors(limit: number = 50): ErrorInfo[] {
    return this.errors
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Update configuration
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('⚙️ Error handler configuration updated');
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Export types
export type { ErrorInfo, ErrorHandlerConfig }; 