import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface RealtimeEvent {
  id: string;
  type: 'investment' | 'user_registration' | 'payment' | 'notification' | 'system_alert';
  data: any;
  timestamp: Date;
  userId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  callback: (event: RealtimeEvent) => void;
  unsubscribe: () => void;
}

class RealtimeManager {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private eventQueue: RealtimeEvent[] = [];
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isInitialized = false;

  constructor() {
    // Only initialize on client side and avoid SSR issues
    if (typeof window !== 'undefined' && !process.env.NODE_ENV?.includes('test')) {
      // Delay initialization to avoid blocking the main thread
      setTimeout(() => {
        this.initializeConnection();
      }, 100);
    }
  }

  private async initializeConnection() {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      this.isInitialized = true;
      
      // Check if we have valid environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables not configured');
        this.isConnected = false;
        return;
      }
      
      // Test connection with timeout
      const connectionPromise = supabase.from('clients').select('count').limit(1);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
      
      if (error) {
        console.warn('Supabase connection test failed:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        this.isConnected = false;
      } else {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        console.log('Realtime manager connected to Supabase');
      }
    } catch (error: any) {
      console.warn('Failed to initialize realtime connection:', {
        message: error.message,
        details: error.stack,
        hint: 'Check your environment variables and network connection',
        code: 'CONNECTION_ERROR'
      });
      this.isConnected = false;
    }
  }

  // Subscribe to real-time updates
  subscribe(
    channel: string,
    event: string,
    callback: (payload: any) => void,
    userId?: string
  ): RealtimeSubscription {
    // Initialize connection if not already done
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.initializeConnection();
    }
    
    if (!this.isConnected) {
      console.warn('Realtime not connected, using polling fallback');
      return this.createPollingSubscription(channel, event, callback, userId);
    }

    try {
      const subscription = supabase
        .channel(channel)
        .on('postgres_changes', { 
          event: event as any, 
          schema: 'public', 
          table: channel 
        }, (payload) => {
          const realtimeEvent: RealtimeEvent = {
            id: crypto.randomUUID(),
            type: this.mapTableToEventType(channel),
            data: payload,
            timestamp: new Date(),
            userId: (payload.new as any)?.user_id || (payload.old as any)?.user_id,
            priority: this.calculatePriority(channel, payload)
          };

          callback(realtimeEvent);
          this.broadcastEvent(realtimeEvent);
        })
        .subscribe();

      const subscriptionId = crypto.randomUUID();
      const realtimeSubscription: RealtimeSubscription = {
        id: subscriptionId,
        channel,
        callback,
        unsubscribe: () => {
          supabase.removeChannel(subscription);
          this.subscriptions.delete(subscriptionId);
        }
      };

      this.subscriptions.set(subscriptionId, realtimeSubscription);
      return realtimeSubscription;
    } catch (error) {
      console.error('Failed to create realtime subscription:', error);
      return this.createPollingSubscription(channel, event, callback, userId);
    }
  }

  // Fallback polling subscription
  private createPollingSubscription(
    channel: string,
    event: string,
    callback: (payload: any) => void,
    userId?: string
  ): RealtimeSubscription {
    const subscriptionId = crypto.randomUUID();
    let intervalId: NodeJS.Timeout;

    const startPolling = () => {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from(channel)
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

          if (!error && data) {
            data.forEach(item => {
              const realtimeEvent: RealtimeEvent = {
                id: crypto.randomUUID(),
                type: this.mapTableToEventType(channel),
                data: { new: item, eventType: event },
                timestamp: new Date(item.created_at || new Date()),
                userId: item.user_id,
                priority: this.calculatePriority(channel, { new: item })
              };

              callback(realtimeEvent);
            });
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, 10000); // Poll every 10 seconds
    };

    startPolling();

    const realtimeSubscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      callback,
      unsubscribe: () => {
        if (intervalId) {
          clearInterval(intervalId);
        }
        this.subscriptions.delete(subscriptionId);
      }
    };

    this.subscriptions.set(subscriptionId, realtimeSubscription);
    return realtimeSubscription;
  }

  // Subscribe to specific user events
  subscribeToUserEvents(userId: string, callback: (event: RealtimeEvent) => void): RealtimeSubscription {
    return this.subscribe('user_events', 'INSERT', (payload) => {
      if (payload.new?.user_id === userId) {
        callback(payload);
      }
    }, userId);
  }

  // Subscribe to investment updates
  subscribeToInvestments(userId: string, callback: (event: RealtimeEvent) => void): RealtimeSubscription {
    return this.subscribe('investments', '*', (payload) => {
      if (payload.new?.user_id === userId || payload.old?.user_id === userId) {
        callback(payload);
      }
    }, userId);
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (event: RealtimeEvent) => void): RealtimeSubscription {
    return this.subscribe('notifications', 'INSERT', (payload) => {
      if (payload.new?.user_id === userId) {
        callback(payload);
      }
    }, userId);
  }

  // Admin subscriptions
  subscribeToAdminEvents(adminId: string, callback: (event: RealtimeEvent) => void): RealtimeSubscription[] {
    const subscriptions: RealtimeSubscription[] = [];

    // New user registrations
    subscriptions.push(
      this.subscribe('clients', 'INSERT', (payload) => {
        const event: RealtimeEvent = {
          id: crypto.randomUUID(),
          type: 'user_registration',
          data: payload,
          timestamp: new Date(),
          priority: 'medium'
        };
        callback(event);
      })
    );

    // New investments
    subscriptions.push(
      this.subscribe('investments', 'INSERT', (payload) => {
        const event: RealtimeEvent = {
          id: crypto.randomUUID(),
          type: 'investment',
          data: payload,
          timestamp: new Date(),
          priority: 'high'
        };
        callback(event);
      })
    );

    // Payment updates
    subscriptions.push(
      this.subscribe('payments', '*', (payload) => {
        const event: RealtimeEvent = {
          id: crypto.randomUUID(),
          type: 'payment',
          data: payload,
          timestamp: new Date(),
          priority: 'high'
        };
        callback(event);
      })
    );

    return subscriptions;
  }

  // Broadcast event to all subscribers
  private broadcastEvent(event: RealtimeEvent) {
    this.eventQueue.push(event);
    
    // Keep only last 100 events
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }

    // Notify all subscribers
    this.subscriptions.forEach(subscription => {
      try {
        subscription.callback(event);
      } catch (error) {
        console.error('Error in subscription callback:', error);
      }
    });
  }

  // Get recent events
  getRecentEvents(limit: number = 50): RealtimeEvent[] {
    return this.eventQueue.slice(-limit);
  }

  // Get events by type
  getEventsByType(type: RealtimeEvent['type']): RealtimeEvent[] {
    return this.eventQueue.filter(event => event.type === type);
  }

  // Get events by user
  getEventsByUser(userId: string): RealtimeEvent[] {
    return this.eventQueue.filter(event => event.userId === userId);
  }

  // Send custom event
  async sendEvent(event: Omit<RealtimeEvent, 'id' | 'timestamp'>) {
    const realtimeEvent: RealtimeEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };

    this.broadcastEvent(realtimeEvent);

    // Store in database if connected
    if (this.isConnected) {
      try {
        await supabase
          .from('notifications')
          .insert({
            user_id: event.userId,
            type: event.type,
            title: `Realtime ${event.type}`,
            message: JSON.stringify(event.data),
            status: 'sent',
            metadata: event.data
          });
      } catch (error) {
        console.error('Failed to store realtime event:', error);
      }
    }
  }

  // Map database table to event type
  private mapTableToEventType(table: string): RealtimeEvent['type'] {
    switch (table) {
      case 'clients':
        return 'user_registration';
      case 'investments':
        return 'investment';
      case 'payments':
        return 'payment';
      case 'notifications':
        return 'notification';
      default:
        return 'system_alert';
    }
  }

  // Calculate event priority
  private calculatePriority(table: string, payload: any): RealtimeEvent['priority'] {
    switch (table) {
      case 'investments':
        const amount = payload.new?.amount || 0;
        if (amount > 50000) return 'critical';
        if (amount > 10000) return 'high';
        return 'medium';
      case 'payments':
        return payload.new?.status === 'failed' ? 'critical' : 'high';
      case 'clients':
        return 'medium';
      default:
        return 'low';
    }
  }

  // Cleanup all subscriptions
  cleanup() {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.eventQueue = [];
  }

  // Get connection status
  getConnectionStatus(): { connected: boolean; subscriptions: number; events: number } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      events: this.eventQueue.length
    };
  }
}

// Create singleton instance
let realtimeManagerInstance: RealtimeManager | null = null;

export const getRealtimeManager = (): RealtimeManager => {
  if (!realtimeManagerInstance && typeof window !== 'undefined') {
    realtimeManagerInstance = new RealtimeManager();
  }
  return realtimeManagerInstance!;
};

export const realtimeManager = {
  subscribe: (...args: Parameters<RealtimeManager['subscribe']>) => {
    const manager = getRealtimeManager();
    return manager.subscribe(...args);
  },
  subscribeToUserEvents: (...args: Parameters<RealtimeManager['subscribeToUserEvents']>) => {
    const manager = getRealtimeManager();
    return manager.subscribeToUserEvents(...args);
  },
  subscribeToInvestments: (...args: Parameters<RealtimeManager['subscribeToInvestments']>) => {
    const manager = getRealtimeManager();
    return manager.subscribeToInvestments(...args);
  },
  subscribeToNotifications: (...args: Parameters<RealtimeManager['subscribeToNotifications']>) => {
    const manager = getRealtimeManager();
    return manager.subscribeToNotifications(...args);
  },
  subscribeToAdminEvents: (...args: Parameters<RealtimeManager['subscribeToAdminEvents']>) => {
    const manager = getRealtimeManager();
    return manager.subscribeToAdminEvents(...args);
  },
  sendEvent: (...args: Parameters<RealtimeManager['sendEvent']>) => {
    const manager = getRealtimeManager();
    return manager.sendEvent(...args);
  },
  cleanup: () => {
    if (realtimeManagerInstance) {
      realtimeManagerInstance.cleanup();
      realtimeManagerInstance = null;
    }
  },
  getConnectionStatus: () => {
    if (!realtimeManagerInstance) {
      return { connected: false, subscriptions: 0, events: 0 };
    }
    return realtimeManagerInstance.getConnectionStatus();
  }
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeManager.cleanup();
  });
}

export default realtimeManager; 