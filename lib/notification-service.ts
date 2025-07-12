import { getLocalDatabase } from './local-database';

export interface Notification {
  id: string;
  user_id: string;
  type: 'kyc_status' | 'investment_status' | 'system' | 'admin_message';
  title: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
  updated_at: string;
  metadata?: any;
}

export class NotificationService {
  private db: any;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    this.db = await getLocalDatabase();
  }

  async createNotification(data: {
    user_id: string;
    type: Notification['type'];
    title: string;
    message: string;
    metadata?: any;
  }): Promise<Notification> {
    const notification = await this.db.createNotification({
      ...data,
      status: 'unread',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    return notification;
  }

  async getUserNotifications(user_id: string): Promise<Notification[]> {
    return await this.db.getNotificationsByUserId(user_id);
  }

  async markAsRead(notification_id: string): Promise<void> {
    await this.db.updateNotificationStatus(notification_id, 'read');
  }

  async markAllAsRead(user_id: string): Promise<void> {
    await this.db.markAllNotificationsAsRead(user_id);
  }

  async getUnreadCount(user_id: string): Promise<number> {
    const notifications = await this.db.getNotificationsByUserId(user_id);
    return notifications.filter((n: Notification) => n.status === 'unread').length;
  }

  // Specific notification methods
  async notifyKYCStatusUpdate(user_id: string, status: string): Promise<void> {
    const title = 'KYC Status Update';
    let message = '';
    
    switch (status) {
      case 'approved':
        message = 'Your KYC verification has been approved! You can now proceed with investments.';
        break;
      case 'rejected':
        message = 'Your KYC verification has been rejected. Please check the requirements and resubmit.';
        break;
      case 'pending':
        message = 'Your KYC verification is under review. We will notify you once completed.';
        break;
      default:
        message = `Your KYC status has been updated to: ${status}`;
    }

    await this.createNotification({
      user_id,
      type: 'kyc_status',
      title,
      message,
      metadata: { status }
    });
  }

  async notifyInvestmentStatusUpdate(user_id: string, investment_id: string, status: string, amount: number, currency: string): Promise<void> {
    const title = 'Investment Status Update';
    let message = '';
    
    switch (status) {
      case 'approved':
        message = `Your investment of ${amount} ${currency} has been approved and is now active.`;
        break;
      case 'rejected':
        message = `Your investment of ${amount} ${currency} has been rejected. Please contact support for details.`;
        break;
      case 'pending':
        message = `Your investment of ${amount} ${currency} is under review. We will notify you once processed.`;
        break;
      default:
        message = `Your investment status has been updated to: ${status}`;
    }

    await this.createNotification({
      user_id,
      type: 'investment_status',
      title,
      message,
      metadata: { investment_id, status, amount, currency }
    });
  }

  async notifyAdminMessage(user_id: string, message: string): Promise<void> {
    await this.createNotification({
      user_id,
      type: 'admin_message',
      title: 'Message from Admin',
      message,
      metadata: { from: 'admin' }
    });
  }

  async notifySystemMessage(user_id: string, title: string, message: string): Promise<void> {
    await this.createNotification({
      user_id,
      type: 'system',
      title,
      message
    });
  }
}

// Singleton instance
export const notificationService = new NotificationService(); 