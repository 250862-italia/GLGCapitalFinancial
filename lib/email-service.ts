"use client";

import { supabase } from '@/lib/supabase';

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

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailData {
  to: string;
  template: string;
  data: Record<string, any>;
  subject?: string;
  html?: string;
  text?: string;
}

class EmailNotificationService {
  private surveillanceEmail = 'push@glgcapitalgroupllc.com';
  private notifications: NotificationData[] = [];
  private config: EmailConfig | null = null;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  // Initialize email templates
  private initializeTemplates(): void {
    // Welcome email template
    this.templates.set('welcome', {
      subject: 'Benvenuto in GLG Capital Group - Il tuo account è attivo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a2540 0%, #1a3556 100%); padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
            <img src='https://glgcapitalgroupllc.com/logo.png' alt='GLG Capital Group LLC' style='width: 80px; margin-bottom: 1rem;'/>
            <h1 style="color: white; margin: 0; font-size: 2rem;">Benvenuto in GLG Capital Group</h1>
          </div>
          <div style="padding: 2rem; background: white; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0a2540; font-size: 1.5rem;">Gentile {{name}},</h2>
            <p style="color: #1a3556; font-size: 1.1rem; line-height: 1.7;">
              Siamo lieti di confermare la creazione del tuo account presso <b>GLG Capital Group LLC</b>.<br/>
              Da questo momento puoi accedere alla tua area riservata e iniziare il tuo percorso di investimento con noi.
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
              <h3 style="color: #0a2540; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Prossimi Passi:</h3>
              <ul style="color: #1a3556; margin: 0; padding-left: 1.5rem; font-size: 1rem;">
                <li>Completa la verifica KYC nella tua area riservata</li>
                <li>Esplora e scegli i pacchetti di investimento più adatti a te</li>
                <li>Gestisci i tuoi dati e documenti in totale sicurezza</li>
                <li>Ricevi supporto dedicato dal nostro team in ogni fase</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="{{loginUrl}}" style="background: #f59e0b; color: #0a2540; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; display: inline-block;">Accedi alla tua Area Riservata</a>
            </div>
            <p style="color: #64748b; font-size: 1rem; margin-bottom: 1.5rem;">
              Per qualsiasi domanda o necessità, il nostro team di supporto è a tua disposizione:<br/>
              <b>Email:</b> <a href="mailto:support@glgcapitalgroupllc.com" style="color: #2563eb;">support@glgcapitalgroupllc.com</a><br/>
              <b>Telefono:</b> +1 307 263 0876
            </p>
            <p style="color: #6b7280; font-size: 0.95rem;">
              Ti ricordiamo che l'accesso all'area riservata è personale e protetto. Conserva con cura le tue credenziali.<br/>
              Grazie per aver scelto GLG Capital Group LLC.<br/>
              <b>Il Team GLG Capital Group</b>
            </p>
          </div>
          <div style="background: #f8fafc; padding: 1rem; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 12px 12px;">
            © 2024 GLG Capital Group LLC. Tutti i diritti riservati.
          </div>
        </div>
      `,
      text: `Benvenuto in GLG Capital Group\n\nGentile {{name}},\n\nSiamo lieti di confermare la creazione del tuo account presso GLG Capital Group LLC. Da questo momento puoi accedere alla tua area riservata e iniziare il tuo percorso di investimento con noi.\n\nProssimi Passi:\n- Completa la verifica KYC nella tua area riservata\n- Esplora e scegli i pacchetti di investimento più adatti a te\n- Gestisci i tuoi dati e documenti in totale sicurezza\n- Ricevi supporto dedicato dal nostro team in ogni fase\n\nAccedi alla tua area riservata: {{loginUrl}}\n\nPer qualsiasi domanda o necessità, il nostro team di supporto è a tua disposizione:\nEmail: support@glgcapitalgroupllc.com\nTelefono: +1 307 263 0876\n\nTi ricordiamo che l'accesso all'area riservata è personale e protetto. Conserva con cura le tue credenziali.\nGrazie per aver scelto GLG Capital Group LLC.\n\nIl Team GLG Capital Group\n\n© 2024 GLG Capital Group LLC. Tutti i diritti riservati.`
    });

    // Security alert template
    this.templates.set('security_alert', {
      subject: 'Security Alert - GLG Capital Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 2rem; text-align: center;">
            <h1 style="color: white; margin: 0;">Security Alert</h1>
          </div>
          <div style="padding: 2rem; background: white;">
            <h2 style="color: #1f2937;">Hello {{name}},</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              We detected unusual activity on your account that requires your attention.
            </p>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
              <h3 style="color: #dc2626; margin: 0 0 0.5rem 0;">Activity Details:</h3>
              <p style="color: #dc2626; margin: 0;"><strong>Type:</strong> {{alertType}}</p>
              <p style="color: #dc2626; margin: 0;"><strong>Time:</strong> {{timestamp}}</p>
              <p style="color: #dc2626; margin: 0;"><strong>IP Address:</strong> {{ipAddress}}</p>
            </div>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="{{accountUrl}}" style="background: #dc2626; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                Review Account Activity
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14;">
              If this activity was not performed by you, please contact our security team immediately.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 1rem; text-align: center; color: #6b7280; font-size: 12;">
            © 2024 GLG Capital Group. All rights reserved.
          </div>
        </div>
      `,
      text: `
Security Alert - GLG Capital Group

Hello {{name}},

We detected unusual activity on your account that requires your attention.

Activity Details:
- Type: {{alertType}}
- Time: {{timestamp}}
- IP Address: {{ipAddress}}

Review your account activity: {{accountUrl}}

If this activity was not performed by you, please contact our security team immediately.

© 2024 GLG Capital Group. All rights reserved.
      `
    });

    // Investment confirmation template
    this.templates.set('investment_confirmation', {
      subject: 'Conferma Investimento - GLG Capital Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0a2540 0%, #1a3556 100%); padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
            <img src='https://glgcapitalgroupllc.com/logo.png' alt='GLG Capital Group LLC' style='width: 80px; margin-bottom: 1rem;'/>
            <h1 style="color: white; margin: 0; font-size: 2rem;">Investimento Confermato</h1>
          </div>
          <div style="padding: 2rem; background: white; border-radius: 0 0 12px 12px;">
            <h2 style="color: #0a2540; font-size: 1.5rem;">Gentile {{name}},</h2>
            <p style="color: #1a3556; font-size: 1.1rem; line-height: 1.7;">
              Siamo lieti di confermare che il tuo investimento nel pacchetto <b>{{packageName}}</b> è stato <b>confermato</b>.<br/>
              <b>Importo:</b> {{amount}} EUR<br/>
              <b>Data:</b> {{date}}
            </p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
              <h3 style="color: #0a2540; margin: 0 0 0.5rem 0; font-size: 1.1rem;">Cosa succede ora?</h3>
              <ul style="color: #1a3556; margin: 0; padding-left: 1.5rem; font-size: 1rem;">
                <li>Riceverai aggiornamenti sull'andamento del tuo investimento nella tua area riservata</li>
                <li>Per qualsiasi domanda, il nostro team è a tua disposizione</li>
              </ul>
            </div>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="{{portfolioUrl}}" style="background: #f59e0b; color: #0a2540; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; display: inline-block;">Vai al tuo portafoglio</a>
            </div>
            <p style="color: #64748b; font-size: 1rem; margin-bottom: 1.5rem;">
              Per assistenza: <b>Email:</b> <a href="mailto:support@glgcapitalgroupllc.com" style="color: #2563eb;">support@glgcapitalgroupllc.com</a>
            </p>
            <p style="color: #6b7280; font-size: 0.95rem;">
              Grazie per aver scelto GLG Capital Group LLC.<br/>
              <b>Il Team GLG Capital Group</b>
            </p>
          </div>
          <div style="background: #f8fafc; padding: 1rem; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 12px 12px;">
            © 2024 GLG Capital Group LLC. Tutti i diritti riservati.
          </div>
        </div>
      `,
      text: `Gentile {{name}},\n\nIl tuo investimento nel pacchetto {{packageName}} è stato confermato.\nImporto: {{amount}} EUR\nData: {{date}}\n\nAccedi al tuo portafoglio: {{portfolioUrl}}\n\nGrazie per aver scelto GLG Capital Group LLC.`
    });

    // Email rifiuto investimento
    this.templates.set('investment_rejected', {
      subject: 'Investimento Rifiutato - GLG Capital Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; padding: 2rem; text-align: center; border-radius: 12px 12px 0 0;">
            <img src='https://glgcapitalgroupllc.com/logo.png' alt='GLG Capital Group LLC' style='width: 80px; margin-bottom: 1rem;'/>
            <h1 style="color: white; margin: 0; font-size: 2rem;">Investimento Rifiutato</h1>
          </div>
          <div style="padding: 2rem; background: white; border-radius: 0 0 12px 12px;">
            <h2 style="color: #dc2626; font-size: 1.5rem;">Gentile {{name}},</h2>
            <p style="color: #1a3556; font-size: 1.1rem; line-height: 1.7;">
              Siamo spiacenti di comunicarti che la tua richiesta di investimento nel pacchetto <b>{{packageName}}</b> è stata <b>rifiutata</b>.<br/>
              Per maggiori informazioni o chiarimenti, contatta il nostro supporto.
            </p>
            <div style="text-align: center; margin: 2rem 0;">
              <a href="mailto:support@glgcapitalgroupllc.com" style="background: #dc2626; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 1.1rem; display: inline-block;">Contatta il supporto</a>
            </div>
            <p style="color: #6b7280; font-size: 0.95rem;">
              Ci auguriamo di poterti aiutare in futuro.<br/>
              <b>Il Team GLG Capital Group</b>
            </p>
          </div>
          <div style="background: #f8fafc; padding: 1rem; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 12px 12px;">
            © 2024 GLG Capital Group LLC. Tutti i diritti riservati.
          </div>
        </div>
      `,
      text: `Gentile {{name}},\n\nLa tua richiesta di investimento nel pacchetto {{packageName}} è stata rifiutata.\nPer assistenza scrivi a support@glgcapitalgroupllc.com\n\nIl Team GLG Capital Group.`
    });

    // KYC status update template
    this.templates.set('kyc_status', {
      subject: 'KYC Status Update - GLG Capital Group',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: {{statusColor}}; padding: 2rem; text-align: center;">
            <h1 style="color: white; margin: 0;">KYC Status Update</h1>
          </div>
          <div style="padding: 2rem; background: white;">
            <h2 style="color: #1f2937;">Hello {{name}},</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              Your KYC verification status has been updated.
            </p>
            <div style="background: {{statusBgColor}}; border: 1px solid {{statusBorderColor}}; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
              <h3 style="color: {{statusTextColor}}; margin: 0 0 0.5rem 0;">Status: {{status}}</h3>
              <p style="color: {{statusTextColor}}; margin: 0;">{{message}}</p>
            </div>
            {{#if actionRequired}}
            <div style="text-align: center; margin: 2rem 0;">
              <a href="{{kycUrl}}" style="background: #059669; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; display: inline-block;">
                Complete KYC
              </a>
            </div>
            {{/if}}
            <p style="color: #6b7280; font-size: 14;">
              If you have any questions about your KYC status, please contact our support team.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 1rem; text-align: center; color: #6b7280; font-size: 12;">
            © 2024 GLG Capital Group. All rights reserved.
          </div>
        </div>
      `,
      text: `
KYC Status Update - GLG Capital Group

Hello {{name}},

Your KYC verification status has been updated.

Status: {{status}}
{{message}}

{{#if actionRequired}}
Complete your KYC: {{kycUrl}}
{{/if}}

If you have any questions about your KYC status, please contact our support team.

© 2024 GLG Capital Group. All rights reserved.
      `
    });
  }

  // Configure email service
  configure(config: EmailConfig): void {
    this.config = config;
  }

  // Send email
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = this.templates.get(emailData.template);
      if (!template) {
        console.error(`Email template '${emailData.template}' not found`);
        return false;
      }

      // Replace template variables
      let html = template.html;
      let text = template.text;
      let subject = template.subject;

      for (const [key, value] of Object.entries(emailData.data)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value);
        text = text.replace(regex, value);
        subject = subject.replace(regex, value);
      }

      // In a real implementation, you would use a proper email service like SendGrid, AWS SES, or Nodemailer
      console.log('📧 Email sent:', {
        to: emailData.to,
        subject,
        template: emailData.template
      });

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 100));

      let emailSent = true;
      let logStatus = 'sent';
      let logError = null;

      if (emailSent) {
        // ... existing code ...
      } else {
        // ... existing code ...
        logStatus = 'simulated';
      }

      // Log in tabella notifications
      try {
        await supabase.from('notifications').insert({
          email: emailData.to,
          type: emailData.template || emailData.subject || 'custom',
          title: emailData.subject || emailData.template,
          message: emailData.html || emailData.text || '',
          status: logStatus,
          sent_at: new Date().toISOString(),
          details: emailData.data ? emailData.data : null
        });
      } catch (err) {
        // Log error logging notification (non blocca invio email)
        console.error('Errore logging notification:', err);
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(userEmail: string, userName: string, loginUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'welcome',
      data: {
        name: userName,
        loginUrl
      }
    });
  }

  // Send security alert email
  async sendSecurityAlert(userEmail: string, userName: string, alertType: string, ipAddress: string, accountUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'security_alert',
      data: {
        name: userName,
        alertType,
        timestamp: new Date().toLocaleString(),
        ipAddress,
        accountUrl
      }
    });
  }

  // Send investment confirmation email
  async sendInvestmentConfirmation(userEmail: string, userName: string, packageName: string, amount: number, transactionId: string, portfolioUrl: string): Promise<boolean> {
    return this.sendEmail({
      to: userEmail,
      template: 'investment_confirmation',
      data: {
        name: userName,
        packageName,
        amount: amount != null ? amount.toLocaleString() : '-',
        transactionId,
        date: new Date().toLocaleDateString(),
        portfolioUrl
      }
    });
  }

  // Send KYC status update email
  async sendKYCStatusUpdate(userEmail: string, userName: string, status: string, message: string, actionRequired: boolean = false, kycUrl?: string): Promise<boolean> {
    const statusConfig = {
      approved: {
        color: '#059669',
        bgColor: '#f0fdf4',
        borderColor: '#bbf7d0',
        textColor: '#166534'
      },
      rejected: {
        color: '#dc2626',
        bgColor: '#fef2f2',
        borderColor: '#fecaca',
        textColor: '#dc2626'
      },
      pending: {
        color: '#d97706',
        bgColor: '#fef3c7',
        borderColor: '#fed7aa',
        textColor: '#92400e'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return this.sendEmail({
      to: userEmail,
      template: 'kyc_status',
      data: {
        name: userName,
        status,
        message,
        actionRequired,
        kycUrl: kycUrl || '',
        statusColor: config.color,
        statusBgColor: config.bgColor,
        statusBorderColor: config.borderColor,
        statusTextColor: config.textColor
      }
    });
  }

  // Send notification to surveillance email
  async sendNotification(notification: NotificationData): Promise<void> {
    try {
      // Add to notifications array
      this.notifications.push(notification);
      
      // Store in localStorage for persistence
      const existingNotifications = JSON.parse(localStorage.getItem('emailNotifications') || '[]');
      existingNotifications.push(notification);
      localStorage.setItem('emailNotifications', JSON.stringify(existingNotifications));
      
      // Format email content
      const emailBody = this.formatEmailBody(notification);
      const emailHtml = this.formatEmailHtml(notification);
      
      // Send email via API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: this.surveillanceEmail,
          subject: `[GLG SURVEILLANCE] ${notification.title}`,
          body: emailBody,
          html: emailHtml
        })
      });

      if (response.ok) {
        console.log('✅ SURVEILLANCE NOTIFICATION SENT:', {
          to: this.surveillanceEmail,
          subject: `[GLG SURVEILLANCE] ${notification.title}`,
          type: notification.type,
          severity: notification.severity
        });
      } else {
        console.error('❌ Failed to send email notification');
      }
      
    } catch (error) {
      console.error('Failed to send surveillance notification:', error);
    }
  }

  private formatEmailBody(notification: NotificationData): string {
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

  private formatEmailHtml(notification: NotificationData): string {
    const severityColors = {
      low: '#10b981',
      medium: '#f59e0b', 
      high: '#ef4444',
      critical: '#dc2626'
    };

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background: #1f2937; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .alert { background: #fef3c7; border-left: 4px solid ${severityColors[notification.severity]}; padding: 15px; margin: 15px 0; }
        .details { background: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        .severity-${notification.severity} { color: ${severityColors[notification.severity]}; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚨 GLG CAPITAL GROUP - SURVEILLANCE ALERT</h1>
    </div>
    
    <div class="content">
        <div class="alert">
            <h2>${notification.title}</h2>
            <p><strong>Type:</strong> ${notification.type.toUpperCase()}</p>
            <p><strong>Severity:</strong> <span class="severity-${notification.severity}">${notification.severity.toUpperCase()}</span></p>
            <p><strong>Timestamp:</strong> ${new Date(notification.timestamp).toLocaleString()}</p>
            <p><strong>User:</strong> ${notification.userName || 'System'}</p>
            <p><strong>User ID:</strong> ${notification.userId || 'N/A'}</p>
        </div>
        
        <div class="details">
            <h3>Message:</h3>
            <p>${notification.message}</p>
            
            <h3>Details:</h3>
            <pre>${JSON.stringify(notification.details, null, 2)}</pre>
        </div>
    </div>
    
    <div class="footer">
        <p>This is an automated surveillance notification from GLG Capital Group LLC.</p>
        <p>For immediate attention, contact the security team.</p>
    </div>
</body>
</html>
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
      message: `${userData.firstName} ${userData.lastName} purchased ${packageData.name} for $${amount != null ? amount.toLocaleString() : '-'}`,
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

// Export types
export type { EmailConfig, EmailTemplate, EmailData }; 