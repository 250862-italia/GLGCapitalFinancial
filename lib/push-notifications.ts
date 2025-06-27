interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  silent?: boolean;
  timestamp: Date;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

class PushNotificationService {
  private isSupported: boolean;
  private permission: NotificationPermission;
  private subscriptions: PushSubscription[] = [];

  constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.permission = this.getPermissionStatus();
    this.initialize();
  }

  // Initialize the service
  private async initialize(): Promise<void> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported in this browser');
      return;
    }

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);

      // Check for existing subscriptions
      await this.loadExistingSubscriptions();
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = this.getPermissionStatus();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted');
        return true;
      } else {
        console.warn('❌ Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || this.permission.denied) {
      console.warn('Cannot subscribe: notifications not supported or permission denied');
      return null;
    }

    if (this.permission.default) {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
      });

      // Save subscription
      const customSubscription: PushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
          auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!))))
        }
      };
      
      await this.saveSubscription(customSubscription);
      this.subscriptions.push(customSubscription);

      console.log('✅ Push subscription created:', customSubscription);
      return customSubscription;
    } catch (error) {
      console.error('❌ Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        const customSubscription: PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!))))
          }
        };
        
        await this.removeSubscription(customSubscription);
        
        // Remove from local array
        this.subscriptions = this.subscriptions.filter(sub => 
          sub.endpoint !== customSubscription.endpoint
        );

        console.log('✅ Push subscription removed');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Send local notification
  async sendLocalNotification(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isSupported || this.permission.denied) {
      console.warn('Cannot send notification: not supported or permission denied');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      await registration.showNotification(notification.title, {
        body: notification.body,
        icon: notification.icon || '/icon-192x192.png',
        badge: notification.badge || '/badge-72x72.png',
        tag: notification.tag,
        data: notification.data
      });

      console.log('✅ Local notification sent:', notification.title);
    } catch (error) {
      console.error('❌ Failed to send local notification:', error);
    }
  }

  // Send notification to all subscribers
  async sendToAllSubscribers(notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    if (this.subscriptions.length === 0) {
      console.warn('No subscribers to send notification to');
      return;
    }

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptions: this.subscriptions,
          notification: {
            ...notification,
            id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
          }
        })
      });

      if (response.ok) {
        console.log('✅ Push notification sent to all subscribers');
      } else {
        console.error('❌ Failed to send push notification');
      }
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  // Send notification to specific user
  async sendToUser(userId: string, notification: Omit<PushNotification, 'id' | 'timestamp'>): Promise<void> {
    try {
      const response = await fetch('/api/push/send-to-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          notification: {
            ...notification,
            id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date()
          }
        })
      });

      if (response.ok) {
        console.log(`✅ Push notification sent to user ${userId}`);
      } else {
        console.error('❌ Failed to send push notification to user');
      }
    } catch (error) {
      console.error('❌ Error sending push notification to user:', error);
    }
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return { granted: false, denied: false, default: false };
    }

    const permission = Notification.permission;
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    };
  }

  // Check if notifications are supported
  isNotificationsSupported(): boolean {
    return this.isSupported;
  }

  // Check if permission is granted
  isPermissionGranted(): boolean {
    return this.permission.granted;
  }

  // Get current subscriptions
  getSubscriptions(): PushSubscription[] {
    return [...this.subscriptions];
  }

  // Load existing subscriptions
  private async loadExistingSubscriptions(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const customSubscription: PushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh')!)))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth')!))))
          }
        };
        this.subscriptions.push(customSubscription);
        console.log('📱 Loaded existing push subscription');
      }
    } catch (error) {
      console.error('❌ Error loading existing subscriptions:', error);
    }
  }

  // Save subscription to server
  private async saveSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
    } catch (error) {
      console.error('❌ Error saving subscription:', error);
    }
  }

  // Remove subscription from server
  private async removeSubscription(subscription: PushSubscription): Promise<void> {
    try {
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription })
      });

      if (!response.ok) {
        throw new Error('Failed to remove subscription');
      }
    } catch (error) {
      console.error('❌ Error removing subscription:', error);
    }
  }

  // Convert VAPID public key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Notification templates
  static createInvestmentNotification(amount: number, packageName: string): Omit<PushNotification, 'id' | 'timestamp'> {
    return {
      title: 'Investment Successful',
      body: `Your investment of $${amount.toLocaleString()} in ${packageName} has been processed successfully.`,
      icon: '/icon-192x192.png',
      tag: 'investment',
      data: { type: 'investment', amount, package: packageName },
      actions: [
        {
          action: 'view',
          title: 'View Portfolio',
          icon: '/icon-72x72.png'
        }
      ]
    };
  }

  static createSecurityAlertNotification(alertType: string, details: string): Omit<PushNotification, 'id' | 'timestamp'> {
    return {
      title: 'Security Alert',
      body: `${alertType}: ${details}`,
      icon: '/security-icon.png',
      tag: 'security',
      data: { type: 'security', alertType, details },
      requireInteraction: true,
      actions: [
        {
          action: 'review',
          title: 'Review',
          icon: '/icon-72x72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icon-72x72.png'
        }
      ]
    };
  }

  static createKYCNotification(status: string): Omit<PushNotification, 'id' | 'timestamp'> {
    const messages = {
      approved: 'Your KYC verification has been approved! You can now start investing.',
      rejected: 'Your KYC verification was rejected. Please review and resubmit your documents.',
      pending: 'Your KYC documents are under review. We\'ll notify you once the process is complete.'
    };

    return {
      title: 'KYC Status Update',
      body: messages[status as keyof typeof messages] || 'Your KYC status has been updated.',
      icon: '/kyc-icon.png',
      tag: 'kyc',
      data: { type: 'kyc', status },
      actions: [
        {
          action: 'view',
          title: 'View Details',
          icon: '/icon-72x72.png'
        }
      ]
    };
  }

  static createMarketUpdateNotification(update: string): Omit<PushNotification, 'id' | 'timestamp'> {
    return {
      title: 'Market Update',
      body: update,
      icon: '/market-icon.png',
      tag: 'market',
      data: { type: 'market', update },
      actions: [
        {
          action: 'view',
          title: 'View Markets',
          icon: '/icon-72x72.png'
        }
      ]
    };
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Export types
export type { PushNotification, PushSubscription, NotificationPermission }; 