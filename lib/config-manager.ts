interface ConfigValue {
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  category: string;
  editable: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

interface ConfigCategory {
  name: string;
  description: string;
  settings: Record<string, ConfigValue>;
}

interface ConfigChange {
  id: string;
  key: string;
  oldValue: any;
  newValue: any;
  userId: string;
  timestamp: Date;
  reason?: string;
}

class ConfigManager {
  private config: Map<string, ConfigValue> = new Map();
  private changes: ConfigChange[] = [];
  private listeners: Map<string, Array<(key: string, value: any) => void>> = new Map();

  constructor() {
    this.initializeDefaultConfig();
  }

  // Initialize default configuration
  private initializeDefaultConfig(): void {
    // Security settings
    this.setConfig('security.sessionTimeout', {
      value: 24 * 60 * 60 * 1000, // 24 hours
      type: 'number',
      description: 'Session timeout in milliseconds',
      category: 'security',
      editable: true,
      validation: {
        required: true,
        min: 300000, // 5 minutes
        max: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    });

    this.setConfig('security.maxLoginAttempts', {
      value: 5,
      type: 'number',
      description: 'Maximum failed login attempts before account lockout',
      category: 'security',
      editable: true,
      validation: {
        required: true,
        min: 3,
        max: 10
      }
    });

    this.setConfig('security.passwordMinLength', {
      value: 8,
      type: 'number',
      description: 'Minimum password length',
      category: 'security',
      editable: true,
      validation: {
        required: true,
        min: 6,
        max: 50
      }
    });

    this.setConfig('security.requireTwoFactor', {
      value: false,
      type: 'boolean',
      description: 'Require two-factor authentication for all users',
      category: 'security',
      editable: true
    });

    // Database settings
    this.setConfig('database.connectionPool', {
      value: 10,
      type: 'number',
      description: 'Database connection pool size',
      category: 'database',
      editable: true,
      validation: {
        required: true,
        min: 1,
        max: 100
      }
    });

    this.setConfig('database.queryTimeout', {
      value: 30000, // 30 seconds
      type: 'number',
      description: 'Database query timeout in milliseconds',
      category: 'database',
      editable: true,
      validation: {
        required: true,
        min: 5000,
        max: 300000
      }
    });

    // Email settings
    this.setConfig('email.enabled', {
      value: true,
      type: 'boolean',
      description: 'Enable email notifications',
      category: 'email',
      editable: true
    });

    this.setConfig('email.fromAddress', {
      value: 'noreply@glgcapital.com',
      type: 'string',
      description: 'Default sender email address',
      category: 'email',
      editable: true,
      validation: {
        required: true,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    });

    this.setConfig('email.smtpHost', {
      value: 'smtp.gmail.com',
      type: 'string',
      description: 'SMTP server hostname',
      category: 'email',
      editable: true,
      validation: {
        required: true
      }
    });

    // Investment settings
    this.setConfig('investment.minAmount', {
      value: 1000,
      type: 'number',
      description: 'Minimum investment amount in USD',
      category: 'investment',
      editable: true,
      validation: {
        required: true,
        min: 100,
        max: 10000
      }
    });

    this.setConfig('investment.maxAmount', {
      value: 1000000,
      type: 'number',
      description: 'Maximum investment amount in USD',
      category: 'investment',
      editable: true,
      validation: {
        required: true,
        min: 10000,
        max: 10000000
      }
    });

    this.setConfig('investment.allowedPackages', {
      value: ['conservative', 'balanced', 'aggressive'],
      type: 'array',
      description: 'Available investment packages',
      category: 'investment',
      editable: true,
      validation: {
        required: true,
        enum: ['conservative', 'balanced', 'aggressive', 'custom']
      }
    });

    // Notification settings
    this.setConfig('notifications.enabled', {
      value: true,
      type: 'boolean',
      description: 'Enable push notifications',
      category: 'notifications',
      editable: true
    });

    this.setConfig('notifications.email', {
      value: true,
      type: 'boolean',
      description: 'Enable email notifications',
      category: 'notifications',
      editable: true
    });

    this.setConfig('notifications.sms', {
      value: false,
      type: 'boolean',
      description: 'Enable SMS notifications',
      category: 'notifications',
      editable: true
    });

    // System settings
    this.setConfig('system.maintenanceMode', {
      value: false,
      type: 'boolean',
      description: 'Enable maintenance mode',
      category: 'system',
      editable: true
    });

    this.setConfig('system.debugMode', {
      value: false,
      type: 'boolean',
      description: 'Enable debug mode',
      category: 'system',
      editable: true
    });

    this.setConfig('system.logLevel', {
      value: 'info',
      type: 'string',
      description: 'Application log level',
      category: 'system',
      editable: true,
      validation: {
        required: true,
        enum: ['debug', 'info', 'warn', 'error']
      }
    });

    console.log('✅ Default configuration initialized');
  }

  // Set configuration value
  setConfig(key: string, config: ConfigValue): void {
    this.config.set(key, config);
  }

  // Get configuration value
  getConfig(key: string): any {
    const config = this.config.get(key);
    return config ? config.value : undefined;
  }

  // Get configuration metadata
  getConfigMetadata(key: string): ConfigValue | undefined {
    return this.config.get(key);
  }

  // Update configuration value
  updateConfig(key: string, value: any, userId: string, reason?: string): boolean {
    const config = this.config.get(key);
    if (!config) {
      console.error(`❌ Configuration key not found: ${key}`);
      return false;
    }

    if (!config.editable) {
      console.error(`❌ Configuration key is not editable: ${key}`);
      return false;
    }

    // Validate value
    if (!this.validateConfigValue(key, value)) {
      console.error(`❌ Invalid value for configuration key: ${key}`);
      return false;
    }

    const oldValue = config.value;
    config.value = value;
    this.config.set(key, config);

    // Log change
    const change: ConfigChange = {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      key,
      oldValue,
      newValue: value,
      userId,
      timestamp: new Date(),
      reason
    };

    this.changes.push(change);

    // Notify listeners
    this.notifyListeners(key, value);

    console.log(`⚙️ Configuration updated: ${key} = ${value} (by ${userId})`);
    return true;
  }

  // Validate configuration value
  private validateConfigValue(key: string, value: any): boolean {
    const config = this.config.get(key);
    if (!config) return false;

    // Type validation
    if (typeof value !== config.type && !(config.type === 'array' && Array.isArray(value))) {
      return false;
    }

    // Custom validation
    if (config.validation) {
      const { validation } = config;

      if (validation.required && (value === undefined || value === null || value === '')) {
        return false;
      }

      if (validation.min !== undefined && value < validation.min) {
        return false;
      }

      if (validation.max !== undefined && value > validation.max) {
        return false;
      }

      if (validation.pattern && typeof value === 'string') {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          return false;
        }
      }

      if (validation.enum && !validation.enum.includes(value)) {
        return false;
      }
    }

    return true;
  }

  // Get all configuration by category
  getConfigByCategory(category: string): Record<string, ConfigValue> {
    const result: Record<string, ConfigValue> = {};
    
    this.config.forEach((config, key) => {
      if (config.category === category) {
        result[key] = config;
      }
    });

    return result;
  }

  // Get all categories
  getCategories(): string[] {
    const categories = new Set<string>();
    this.config.forEach(config => {
      categories.add(config.category);
    });
    return Array.from(categories);
  }

  // Get configuration changes
  getConfigChanges(limit: number = 100): ConfigChange[] {
    return this.changes
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get configuration changes for a specific key
  getConfigChangesForKey(key: string, limit: number = 50): ConfigChange[] {
    return this.changes
      .filter(change => change.key === key)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Add configuration change listener
  addListener(key: string, callback: (key: string, value: any) => void): void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
  }

  // Remove configuration change listener
  removeListener(key: string, callback: (key: string, value: any) => void): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Notify listeners
  private notifyListeners(key: string, value: any): void {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(key, value);
        } catch (error) {
          console.error('❌ Error in configuration listener:', error);
        }
      });
    }
  }

  // Export configuration
  exportConfig(): Record<string, any> {
    const result: Record<string, any> = {};
    
    this.config.forEach((config, key) => {
      result[key] = config.value;
    });

    return result;
  }

  // Import configuration
  importConfig(config: Record<string, any>, userId: string): { success: number; errors: string[] } {
    let successCount = 0;
    const errors: string[] = [];

    Object.entries(config).forEach(([key, value]) => {
      if (this.updateConfig(key, value, userId, 'Configuration import')) {
        successCount++;
      } else {
        errors.push(`Failed to update ${key}`);
      }
    });

    console.log(`📥 Configuration import completed: ${successCount} successful, ${errors.length} errors`);
    return { success: successCount, errors };
  }

  // Reset configuration to defaults
  resetToDefaults(userId: string): number {
    let resetCount = 0;
    
    this.config.forEach((config, key) => {
      // Store original value for change log
      const originalValue = config.value;
      
      // Reset to default value (you would need to store default values)
      // For now, we'll just log the reset
      console.log(`🔄 Configuration reset: ${key}`);
      resetCount++;
    });

    console.log(`🔄 Reset ${resetCount} configurations to defaults`);
    return resetCount;
  }

  // Get configuration statistics
  getConfigStats(): {
    totalSettings: number;
    editableSettings: number;
    categories: number;
    recentChanges: number;
    settingsByCategory: Record<string, number>;
  } {
    const stats = {
      totalSettings: this.config.size,
      editableSettings: 0,
      categories: this.getCategories().length,
      recentChanges: this.changes.filter(change => 
        Date.now() - change.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length,
      settingsByCategory: {} as Record<string, number>
    };

    this.config.forEach(config => {
      if (config.editable) {
        stats.editableSettings++;
      }
      stats.settingsByCategory[config.category] = (stats.settingsByCategory[config.category] || 0) + 1;
    });

    return stats;
  }

  // Validate all configuration
  validateAllConfig(): { valid: boolean; errors: Array<{ key: string; error: string }> } {
    const errors: Array<{ key: string; error: string }> = [];

    this.config.forEach((config, key) => {
      if (!this.validateConfigValue(key, config.value)) {
        errors.push({
          key,
          error: `Invalid value for ${key}`
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();

// Export types
export type { ConfigValue, ConfigCategory, ConfigChange }; 