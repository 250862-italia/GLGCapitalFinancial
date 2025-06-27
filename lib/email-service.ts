"use client";

// Email notification service for system surveillance
export interface NotificationData {
  type: 'user_registration' | 'kyc_submission' | 'package_purchase' | 'investment_cancellation' | 
        'admin_action' | 'payment_processed' | 'client_activity' | 'system_alert';
  title: string;
  message: string;
  details: any;
  timestamp: string;
  userId?: string;
  userName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class EmailNotificationService {
  private surveillanceEmail = 'push@glgcapitalgroupllc.com';
  private notifications: NotificationData[] = [];

  // Send notification to surveillance email
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // In a real implementation, this would use a proper email service like SendGrid, AWS SES, etc.
      // For now, we'll simulate the email sending and store in localStorage for demo purposes
      
      // Add to notifications array
      this.notifications.push(notification);
      
      // Store in localStorage for persistence
      const existingNotifications = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('emailNotifications', JSON.stringify(existingNotifications));
      
      // Log the notification (in production, this would be sent via email API)
      console.log('🔔 SURVEILLANCE NOTIFICATION SENT:', {
        to: this.surveillanceEmail,
        subject: `[GLG SURVEILLANCE] ${notification.title}`,
        body: this.formatEmailBody(notification)
      });
      
      // In production, you would call your email API here:
      // await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: this.surveillanceEmail,
      //     subject: `[GLG SURVEILLANCE] ${notification.title}`,
      //     body: this.formatEmailBody(notification)
      //   })
      // });
      
    } catch (error) {
      console.error('Failed to send surveillance notification:', error);
    }
  }

  private formatEmailBody(notification: NotificationData): string {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#dc2626'
    };

    return `
🚨 GLG CAPITAL GROUP - SURVEILLANCE ALERT 🚨

Type: ${notification.type.toUpperCase()}
Severity: ${notification.severity.toUpperCase()}
Timestamp: ${notification.timestamp}
User: ${notification.userName || 'System'}
User ID: ${notification.userId || 'N/A'}

${notification.title}

${notification.message}

DETAILS:
${JSON.stringify(notification.details, null, 2)}

---
This is an automated surveillance notification from GLG Capital Group LLC.
For immediate attention, contact the security team.
    `.trim();
  }

  // User registration notification
  async notifyUserRegistration(userData: any): Promise<void> {
    await this.sendNotification({
      type: 'user_registration',
      title: 'New User Registration',
      message: `A new user has registered: ${userData.firstName} ${userData.lastName} (${userData.email})`,
      details: {
        user: userData,
        registrationDate: new Date().toISOString(),
        ipAddress: 'N/A', // Would be captured in production
        userAgent: 'N/A'  // Would be captured in production
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'medium'
    });
  }

  // KYC submission notification
  async notifyKYCSubmission(userData: any, kycData: any): Promise<void> {
    await this.sendNotification({
      type: 'kyc_submission',
      title: 'KYC Document Submission',
      message: `KYC documents submitted by ${userData.firstName} ${userData.lastName}`,
      details: {
        user: userData,
        kycData: {
          documentsSubmitted: Object.keys(kycData.documents).filter(key => kycData.documents[key]),
          submissionDate: new Date().toISOString()
        }
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'high'
    });
  }

  // Package purchase notification
  async notifyPackagePurchase(userData: any, packageData: any, amount: number): Promise<void> {
    await this.sendNotification({
      type: 'package_purchase',
      title: 'Investment Package Purchase',
      message: `${userData.firstName} ${userData.lastName} purchased ${packageData.name} for $${amount.toLocaleString()}`,
      details: {
        user: userData,
        package: packageData,
        amount: amount,
        purchaseDate: new Date().toISOString(),
        expectedROI: packageData.expectedROI,
        duration: packageData.duration
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'high'
    });
  }

  // Investment cancellation notification
  async notifyInvestmentCancellation(userData: any, investmentData: any, cancelledBy: string): Promise<void> {
    await this.sendNotification({
      type: 'investment_cancellation',
      title: 'Investment Cancellation',
      message: `Investment cancelled by ${cancelledBy}: ${investmentData.packageName} ($${investmentData.amount.toLocaleString()})`,
      details: {
        user: userData,
        investment: investmentData,
        cancelledBy: cancelledBy,
        cancellationDate: new Date().toISOString(),
        reason: 'Superadmin cancellation'
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'critical'
    });
  }

  // Admin action notification
  async notifyAdminAction(adminData: any, action: string, targetData: any): Promise<void> {
    await this.sendNotification({
      type: 'admin_action',
      title: 'Admin Action Performed',
      message: `Admin ${adminData.name} performed action: ${action}`,
      details: {
        admin: adminData,
        action: action,
        target: targetData,
        actionDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId: adminData.id,
      userName: adminData.name,
      severity: 'medium'
    });
  }

  // Payment processed notification
  async notifyPaymentProcessed(userData: any, paymentData: any): Promise<void> {
    await this.sendNotification({
      type: 'payment_processed',
      title: 'Payment Processed',
      message: `Payment processed for ${userData.firstName} ${userData.lastName}: $${paymentData.amount.toLocaleString()}`,
      details: {
        user: userData,
        payment: paymentData,
        processingDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'high'
    });
  }

  // Client activity notification
  async notifyClientActivity(userData: any, activity: string, details: any): Promise<void> {
    await this.sendNotification({
      type: 'client_activity',
      title: 'Client Activity',
      message: `Client activity: ${userData.firstName} ${userData.lastName} - ${activity}`,
      details: {
        user: userData,
        activity: activity,
        details: details,
        activityDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      userId: userData.id,
      userName: `${userData.firstName} ${userData.lastName}`,
      severity: 'low'
    });
  }

  // System alert notification
  async notifySystemAlert(alert: string, details: any): Promise<void> {
    await this.sendNotification({
      type: 'system_alert',
      title: 'System Alert',
      message: alert,
      details: {
        alert: alert,
        details: details,
        alertDate: new Date().toISOString()
      },
      timestamp: new Date().toISOString(),
      severity: 'critical'
    });
  }

  // Get all notifications (for admin dashboard)
  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  // Get notifications from localStorage
  getStoredNotifications(): NotificationData[] {
    try {
      return JSON.parse(localStorage.getItem('emailNotifications') || '[]');
    } catch {
      return [];
    }
  }

  // Clear notifications (for admin dashboard)
  clearNotifications(): void {
    this.notifications = [];
    localStorage.removeItem('emailNotifications');
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService(); 