import { MemoryOptimizer } from './memory-optimizer';
import { EmailOptimizer } from './email-optimizer';

// System health status
interface SystemHealth {
  memory: {
    usage: number;
    critical: boolean;
    timestamp: number;
  };
  database: {
    healthy: boolean;
    responseTime: number;
    timestamp: number;
  };
  email: {
    healthy: boolean;
    lastCheck: number;
    timestamp: number;
  };
  overall: 'healthy' | 'warning' | 'critical';
}

// Alert configuration
interface AlertConfig {
  memoryThreshold: number;
  databaseTimeout: number;
  emailCheckInterval: number;
  alertCooldown: number;
}

// System monitor
export class SystemMonitor {
  private static instance: SystemMonitor;
  private health: SystemHealth;
  private config: AlertConfig;
  private lastAlert = 0;
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      memoryThreshold: 80,
      databaseTimeout: 30000,
      emailCheckInterval: 300000,
      alertCooldown: 300000 // 5 minutes
    };

    this.health = {
      memory: { usage: 0, critical: false, timestamp: 0 },
      database: { healthy: true, responseTime: 0, timestamp: 0 },
      email: { healthy: true, lastCheck: 0, timestamp: 0 },
      overall: 'healthy'
    };
  }

  static getInstance(): SystemMonitor {
    if (!SystemMonitor.instance) {
      SystemMonitor.instance = new SystemMonitor();
    }
    return SystemMonitor.instance;
  }

  // Start system monitoring
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.checkSystemHealth();
    }, intervalMs);

    console.log(`[MONITOR] System monitoring started (interval: ${intervalMs}ms)`);
  }

  // Stop system monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[MONITOR] System monitoring stopped');
    }
  }

  // Check overall system health
  async checkSystemHealth(): Promise<SystemHealth> {
    console.log('[MONITOR] Checking system health...');

    // Check memory
    const memoryOptimizer = MemoryOptimizer.getInstance();
    const memoryUsage = memoryOptimizer.getMemoryUsage();
    this.health.memory = {
      usage: memoryUsage.percentage,
      critical: memoryUsage.percentage > this.config.memoryThreshold,
      timestamp: Date.now()
    };

    // Check database
    try {
      const startTime = Date.now();
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database timeout')), this.config.databaseTimeout)
        );
        
        const dbPromise = supabase.from('profiles').select('count').limit(1);
        
        await Promise.race([dbPromise, timeoutPromise]);
        
        const responseTime = Date.now() - startTime;
        
        this.health.database = {
          healthy: true,
          responseTime,
          timestamp: Date.now()
        };
      } else {
        this.health.database = {
          healthy: false,
          responseTime: 0,
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.warn('[MONITOR] Database health check failed:', error);
      this.health.database = {
        healthy: false,
        responseTime: 0,
        timestamp: Date.now()
      };
    }

    // Check email service
    try {
      const emailOptimizer = EmailOptimizer.getInstance();
      const isHealthy = await emailOptimizer.checkHealth();
      
      this.health.email = {
        healthy: isHealthy,
        lastCheck: Date.now(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.warn('[MONITOR] Email health check failed:', error);
      this.health.email = {
        healthy: false,
        lastCheck: Date.now(),
        timestamp: Date.now()
      };
    }

    // Determine overall health
    this.health.overall = this.calculateOverallHealth();

    // Send alerts if needed
    await this.sendAlerts();

    console.log(`[MONITOR] Health check completed - Status: ${this.health.overall}`);
    return this.health;
  }

  // Calculate overall system health
  private calculateOverallHealth(): 'healthy' | 'warning' | 'critical' {
    const { memory, database, email } = this.health;

    // Critical conditions
    if (memory.critical || !database.healthy) {
      return 'critical';
    }

    // Warning conditions
    if (memory.usage > 70 || !email.healthy || database.responseTime > 5000) {
      return 'warning';
    }

    return 'healthy';
  }

  // Send alerts based on health status
  private async sendAlerts(): Promise<void> {
    const now = Date.now();
    if (now - this.lastAlert < this.config.alertCooldown) {
      return; // Too soon for another alert
    }

    const { memory, database, email, overall } = this.health;

    let alertMessage = '';
    let alertLevel = '';

    if (overall === 'critical') {
      alertLevel = 'CRITICAL';
      alertMessage = '🚨 CRITICAL SYSTEM ISSUES DETECTED:\n';
      
      if (memory.critical) {
        alertMessage += `• Memory usage: ${memory.usage.toFixed(1)}% (CRITICAL)\n`;
      }
      
      if (!database.healthy) {
        alertMessage += '• Database connection failed\n';
      }
    } else if (overall === 'warning') {
      alertLevel = 'WARNING';
      alertMessage = '⚠️ SYSTEM WARNINGS:\n';
      
      if (memory.usage > 70) {
        alertMessage += `• Memory usage: ${memory.usage.toFixed(1)}% (HIGH)\n`;
      }
      
      if (!email.healthy) {
        alertMessage += '• Email service unavailable\n';
      }
      
      if (database.responseTime > 5000) {
        alertMessage += `• Database slow: ${database.responseTime}ms\n`;
      }
    }

    if (alertMessage) {
      console.error(`[MONITOR] ${alertLevel} ALERT:\n${alertMessage}`);
      this.lastAlert = now;
      
      // Send alert via email if email service is working
      if (email.healthy) {
        try {
          const emailOptimizer = EmailOptimizer.getInstance();
          await emailOptimizer.queueEmail({
            to: 'admin@glgcapital.com',
            subject: `System Alert: ${alertLevel}`,
            content: alertMessage
          });
        } catch (error) {
          console.warn('[MONITOR] Failed to send alert email:', error);
        }
      }
    }
  }

  // Get current health status
  getHealth(): SystemHealth {
    return { ...this.health };
  }

  // Update configuration
  updateConfig(newConfig: Partial<AlertConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[MONITOR] Configuration updated:', this.config);
  }

  // Get system recommendations
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const { memory, database, email } = this.health;

    if (memory.critical) {
      recommendations.push('🔧 IMMEDIATE: Restart application server');
      recommendations.push('🔧 IMMEDIATE: Check for memory leaks');
      recommendations.push('🔧 IMMEDIATE: Optimize database queries');
    } else if (memory.usage > 70) {
      recommendations.push('🔧 OPTIMIZE: Implement connection pooling');
      recommendations.push('🔧 OPTIMIZE: Add caching layer');
      recommendations.push('🔧 OPTIMIZE: Monitor memory usage trends');
    }

    if (!database.healthy) {
      recommendations.push('🔧 DATABASE: Check Supabase dashboard');
      recommendations.push('🔧 DATABASE: Verify connection limits');
      recommendations.push('🔧 DATABASE: Consider upgrading plan');
    }

    if (!email.healthy) {
      recommendations.push('🔧 EMAIL: Check SMTP server status');
      recommendations.push('🔧 EMAIL: Verify email service credentials');
      recommendations.push('🔧 EMAIL: Review email queue processing');
    }

    return recommendations;
  }
}

// Initialize system monitoring
export function initializeSystemMonitoring(): void {
  const monitor = SystemMonitor.getInstance();
  monitor.startMonitoring();
  console.log('[MONITOR] System monitoring initialized');
} 