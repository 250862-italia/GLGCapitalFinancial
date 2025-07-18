import { useEffect, useState, useCallback } from 'react';
import { realtimeManager } from '@/lib/realtime-manager';

export interface RealtimeEvent {
  id: string;
  type: 'investment' | 'user_registration' | 'payment' | 'notification' | 'system_alert';
  data: any;
  timestamp: Date;
  userId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface UseRealtimeOptions {
  userId?: string;
  userRole?: 'user' | 'admin' | 'superadmin';
  enableNotifications?: boolean;
  enableInvestments?: boolean;
  enableAdminEvents?: boolean;
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  const {
    userId,
    userRole = 'user',
    enableNotifications = true,
    enableInvestments = true,
    enableAdminEvents = false
  } = options;

  // Handle new real-time events
  const handleEvent = useCallback((event: RealtimeEvent) => {
    setEvents(prev => {
      const newEvents = [event, ...prev];
      // Keep only last 50 events
      return newEvents.slice(0, 50);
    });

    // Show browser notification for high priority events
    if (event.priority === 'high' || event.priority === 'critical') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`GLG Capital - ${event.type}`, {
          body: `New ${event.type} event`,
          icon: '/favicon.ico'
        });
      }
    }
  }, []);

  // Setup real-time subscriptions
  useEffect(() => {
    if (!userId) return;

    const newSubscriptions: any[] = [];

    // Subscribe to notifications
    if (enableNotifications) {
      const notificationSub = realtimeManager.subscribeToNotifications(userId, handleEvent);
      newSubscriptions.push(notificationSub);
    }

    // Subscribe to investment updates
    if (enableInvestments) {
      const investmentSub = realtimeManager.subscribeToInvestments(userId, handleEvent);
      newSubscriptions.push(investmentSub);
    }

    // Subscribe to admin events
    if (enableAdminEvents && (userRole === 'admin' || userRole === 'superadmin')) {
      const adminSubs = realtimeManager.subscribeToAdminEvents(userId, handleEvent);
      newSubscriptions.push(...adminSubs);
    }

    setSubscriptions(newSubscriptions);

    // Update connection status
    const updateConnectionStatus = () => {
      const status = realtimeManager.getConnectionStatus();
      setIsConnected(status.connected);
    };

    updateConnectionStatus();
    const interval = setInterval(updateConnectionStatus, 5000);

    return () => {
      // Cleanup subscriptions
      newSubscriptions.forEach(sub => sub.unsubscribe());
      clearInterval(interval);
    };
  }, [userId, userRole, enableNotifications, enableInvestments, enableAdminEvents, handleEvent]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Send custom event
  const sendEvent = useCallback(async (event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => {
    await realtimeManager.sendEvent(event);
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Get events by type
  const getEventsByType = useCallback((type: RealtimeEvent['type']) => {
    return events.filter(event => event.type === type);
  }, [events]);

  // Get events by priority
  const getEventsByPriority = useCallback((priority: RealtimeEvent['priority']) => {
    return events.filter(event => event.priority === priority);
  }, [events]);

  return {
    events,
    isConnected,
    requestNotificationPermission,
    sendEvent,
    clearEvents,
    getEventsByType,
    getEventsByPriority,
    connectionStatus: realtimeManager.getConnectionStatus()
  };
} 