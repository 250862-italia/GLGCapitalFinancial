import { ActivityCreateData } from '@/types/activity';

class ActivityLogger {
  private static instance: ActivityLogger;
  private adminToken: string | null = null;

  private constructor() {}

  static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  setAdminToken(token: string) {
    this.adminToken = token;
  }

  private async logActivity(activityData: ActivityCreateData): Promise<void> {
    try {
      if (!this.adminToken) {
        console.warn('No admin token available for activity logging');
        return;
      }

      const response = await fetch('/api/admin/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': this.adminToken
        },
        body: JSON.stringify(activityData)
      });

      if (!response.ok) {
        console.error('Failed to log activity:', await response.text());
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  // User-related activities
  async logUserRegistration(userId: string, email: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `New user registration: ${email}`,
      type: 'user',
      details: { email, action: 'registration' }
    });
  }

  async logUserLogin(userId: string, email: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `User login: ${email}`,
      type: 'user',
      details: { email, action: 'login' }
    });
  }

  async logProfileUpdate(userId: string, field: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `Profile updated: ${field}`,
      type: 'user',
      details: { field, action: 'profile_update' }
    });
  }

  // Investment-related activities
  async logInvestmentCreated(userId: string, investmentId: string, amount: number): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `New investment created: €${amount.toLocaleString()}`,
      type: 'investment',
      details: { investment_id: investmentId, amount, action: 'investment_created' }
    });
  }

  async logInvestmentStatusChange(investmentId: string, oldStatus: string, newStatus: string): Promise<void> {
    await this.logActivity({
      action: `Investment status changed: ${oldStatus} → ${newStatus}`,
      type: 'investment',
      details: { investment_id: investmentId, old_status: oldStatus, new_status: newStatus, action: 'status_change' }
    });
  }

  // KYC-related activities
  async logKYCDocumentUpload(userId: string, documentType: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `KYC document uploaded: ${documentType}`,
      type: 'kyc',
      details: { document_type: documentType, action: 'document_upload' }
    });
  }

  async logKYCStatusChange(userId: string, oldStatus: string, newStatus: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `KYC status changed: ${oldStatus} → ${newStatus}`,
      type: 'kyc',
      details: { old_status: oldStatus, new_status: newStatus, action: 'status_change' }
    });
  }

  // Admin activities
  async logAdminAction(adminId: string, action: string, details?: Record<string, any>): Promise<void> {
    await this.logActivity({
      admin_id: adminId,
      action,
      type: 'system',
      details: { ...details, action: 'admin_action' }
    });
  }

  // Content activities
  async logContentPublished(contentType: string, title: string): Promise<void> {
    await this.logActivity({
      action: `${contentType} published: ${title}`,
      type: 'content',
      details: { content_type: contentType, title, action: 'content_published' }
    });
  }

  // Payment activities
  async logPaymentProcessed(userId: string, amount: number, method: string): Promise<void> {
    await this.logActivity({
      user_id: userId,
      action: `Payment processed: €${amount.toLocaleString()} via ${method}`,
      type: 'payment',
      details: { amount, payment_method: method, action: 'payment_processed' }
    });
  }

  // Generic activity logging
  async logCustomActivity(data: ActivityCreateData): Promise<void> {
    await this.logActivity(data);
  }
}

export const activityLogger = ActivityLogger.getInstance(); 