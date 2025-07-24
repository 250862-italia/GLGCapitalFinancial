import { createClient } from '@supabase/supabase-js';

// Email service configuration
interface EmailConfig {
  provider: 'supabase' | 'resend' | 'register';
  retryAttempts: number;
  retryDelay: number;
  timeout: number;
}

// Email service optimizer
export class EmailOptimizer {
  private static instance: EmailOptimizer;
  private config: EmailConfig;
  private supabase: any;
  private lastHealthCheck = 0;
  private healthCheckInterval = 300000; // 5 minutes
  private isHealthy = true;

  constructor() {
    this.config = {
      provider: 'supabase',
      retryAttempts: 3,
      retryDelay: 1000,
      timeout: 10000
    };
    
    // Initialize Supabase client for email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  static getInstance(): EmailOptimizer {
    if (!EmailOptimizer.instance) {
      EmailOptimizer.instance = new EmailOptimizer();
    }
    return EmailOptimizer.instance;
  }

  // Check email service health
  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastHealthCheck < this.healthCheckInterval) {
      return this.isHealthy; // Return cached result
    }

    this.lastHealthCheck = now;

    try {
      // Test email service with a simple operation
      const { data, error } = await this.supabase
        .from('email_queue')
        .select('count')
        .limit(1);

      if (error) {
        console.warn('[EMAIL] Health check failed:', error.message);
        this.isHealthy = false;
        return false;
      }

      this.isHealthy = true;
      console.log('[EMAIL] Health check passed');
      return true;
    } catch (error) {
      console.warn('[EMAIL] Health check error:', error);
      this.isHealthy = false;
      return false;
    }
  }

  // Send email with retry logic
  async sendEmail(emailData: any): Promise<{ success: boolean; error?: string }> {
    // Check health first
    const isHealthy = await this.checkHealth();
    if (!isHealthy) {
      console.warn('[EMAIL] Service unhealthy, attempting to send anyway');
    }

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        console.log(`[EMAIL] Sending email (attempt ${attempt}/${this.config.retryAttempts})`);
        
        const result = await this.sendEmailWithTimeout(emailData);
        
        if (result.success) {
          console.log('[EMAIL] Email sent successfully');
          return result;
        } else {
          console.warn(`[EMAIL] Attempt ${attempt} failed:`, result.error);
        }
      } catch (error) {
        console.warn(`[EMAIL] Attempt ${attempt} error:`, error);
      }

      // Wait before retry (exponential backoff)
      if (attempt < this.config.retryAttempts) {
        const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
        console.log(`[EMAIL] Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    console.error('[EMAIL] All attempts failed');
    return { success: false, error: 'All email sending attempts failed' };
  }

  // Send email with timeout
  private async sendEmailWithTimeout(emailData: any): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ success: false, error: 'Email sending timeout' });
      }, this.config.timeout);

      // Use Supabase Edge Function for email sending
      this.supabase.functions.invoke('send-email', {
        body: emailData
      }).then(({ data, error }) => {
        clearTimeout(timeout);
        
        if (error) {
          resolve({ success: false, error: error.message });
        } else {
          resolve({ success: true });
        }
      }).catch((error) => {
        clearTimeout(timeout);
        resolve({ success: false, error: error.message });
      });
    });
  }

  // Queue email for later sending
  async queueEmail(emailData: any): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await this.supabase
        .from('email_queue')
        .insert([{
          to: emailData.to,
          subject: emailData.subject,
          content: emailData.content,
          status: 'pending',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('[EMAIL] Failed to queue email:', error);
        return { success: false, error: error.message };
      }

      console.log('[EMAIL] Email queued successfully');
      return { success: true };
    } catch (error) {
      console.error('[EMAIL] Queue error:', error);
      return { success: false, error: 'Failed to queue email' };
    }
  }

  // Process email queue
  async processQueue(): Promise<{ processed: number; failed: number }> {
    try {
      // Get pending emails
      const { data: pendingEmails, error } = await this.supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10);

      if (error) {
        console.error('[EMAIL] Failed to get pending emails:', error);
        return { processed: 0, failed: 0 };
      }

      let processed = 0;
      let failed = 0;

      for (const email of pendingEmails || []) {
        try {
          const result = await this.sendEmail({
            to: email.to,
            subject: email.subject,
            content: email.content
          });

          if (result.success) {
            // Mark as sent
            await this.supabase
              .from('email_queue')
              .update({ status: 'sent', sent_at: new Date().toISOString() })
              .eq('id', email.id);
            processed++;
          } else {
            // Mark as failed
            await this.supabase
              .from('email_queue')
              .update({ 
                status: 'failed', 
                error: result.error,
                failed_at: new Date().toISOString() 
              })
              .eq('id', email.id);
            failed++;
          }
        } catch (error) {
          console.error('[EMAIL] Failed to process email:', error);
          failed++;
        }
      }

      console.log(`[EMAIL] Queue processed: ${processed} sent, ${failed} failed`);
      return { processed, failed };
    } catch (error) {
      console.error('[EMAIL] Queue processing error:', error);
      return { processed: 0, failed: 0 };
    }
  }

  // Get email service status
  getStatus(): { healthy: boolean; lastCheck: number; config: EmailConfig } {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastHealthCheck,
      config: this.config
    };
  }

  // Update configuration
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('[EMAIL] Configuration updated:', this.config);
  }
}

// Initialize email optimization
export function initializeEmailOptimization(): void {
  const optimizer = EmailOptimizer.getInstance();
  
  // Start periodic health checks
  setInterval(() => {
    optimizer.checkHealth();
  }, 300000); // Every 5 minutes

  // Start periodic queue processing
  setInterval(() => {
    optimizer.processQueue();
  }, 60000); // Every minute

  console.log('[EMAIL] Email optimization initialized');
} 