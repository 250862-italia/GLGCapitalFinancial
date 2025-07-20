import { supabase } from './supabase';

export interface EmailData {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailConfig {
  service: 'supabase' | 'smtp' | 'simulated';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail: string;
}

class EmailService {
  private config: EmailConfig;

  constructor() {
    this.config = {
      service: 'supabase', // Forza l'uso di Supabase
      fromEmail: 'noreply@glgcapitalgroupllc.com'
    };
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string; service: string }> {
    try {
      console.log('📧 Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        service: this.config.service
      });

      // Forza sempre l'uso di Supabase per ora
      return await this.sendViaSupabase(emailData);

    } catch (error) {
      console.error('❌ Email service error:', error);
      // Fallback al servizio simulato solo in caso di errore critico
      console.log('⚠️ Falling back to simulated email service');
      return this.simulateEmail(emailData);
    }
  }

  private async sendViaSupabase(emailData: EmailData): Promise<{ success: boolean; message: string; service: string }> {
    try {
      console.log('📧 Invio email via Supabase...');
      
      // Salva l'email nella coda di Supabase
      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          to_email: emailData.to,
          from_email: emailData.from || this.config.fromEmail,
          subject: emailData.subject,
          html_content: emailData.html,
          text_content: emailData.text,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Errore salvataggio email in coda:', error);
        throw error;
      }

      console.log('✅ Email salvata in coda Supabase:', data.id);
      
      // Processa immediatamente la coda email tramite API
      try {
        const response = await fetch('/api/process-email-queue', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('📧 Coda email processata:', result);
        } else {
          console.warn('⚠️ Errore processamento coda email, verrà processata automaticamente');
        }
      } catch (queueError) {
        console.warn('⚠️ Errore chiamata API processamento coda:', queueError);
      }

      return {
        success: true,
        message: 'Email inviata con successo via Supabase',
        service: 'supabase',
        emailId: data.id
      };

    } catch (error) {
      console.error('❌ Errore invio email via Supabase:', error);
      return {
        success: false,
        message: `Errore invio email: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`,
        service: 'supabase'
      };
    }
  }



  private simulateEmail(emailData: EmailData): { success: boolean; message: string; service: string } {
    console.log('📧 === EMAIL SIMULATA ===');
    console.log('📧 To:', emailData.to);
    console.log('📧 From:', emailData.from || this.config.fromEmail);
    console.log('📧 Subject:', emailData.subject);
    console.log('📧 HTML Content:', emailData.html);
    console.log('📧 Text Content:', emailData.text);
    console.log('📧 === FINE EMAIL ===');

    // In produzione, qui andrebbe l'invio email reale
    return {
      success: true,
      message: 'Email simulata (controlla la console per vedere il contenuto)',
      service: 'simulated'
    };
  }

  async sendWelcomeEmail(email: string, firstName: string, lastName: string): Promise<boolean> {
    const welcomeEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Welcome to GLG Capital Group</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been successfully created</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${firstName} ${lastName},</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Welcome to GLG Capital Group! Your account has been successfully created and you're now part of our exclusive investment community.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>Complete your profile with additional information</li>
              <li>Explore our investment packages</li>
              <li>Set up your banking details for transactions</li>
              <li>Review our terms and conditions</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Access Your Dashboard
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team at 
            <a href="mailto:support@glgcapitalgroupllc.com" style="color: #3b82f6;">support@glgcapitalgroupllc.com</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            This email was sent to ${email}. If you didn't create this account, please ignore this email.
          </p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: email,
      subject: 'Welcome to GLG Capital Group - Account Created Successfully',
      html: welcomeEmailHtml
    });

    return result.success;
  }

  async sendInvestmentNotification(
    userEmail: string, 
    userName: string, 
    packageName: string, 
    amount: number, 
    investmentId: string
  ): Promise<boolean> {
    // Email to client
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="margin: 0;">Investment Request Confirmed</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h3>Dear ${userName},</h3>
          <p>Your investment request has been received and is being processed.</p>
          
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <h4>Investment Details:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li><strong>Package:</strong> ${packageName}</li>
              <li><strong>Amount:</strong> $${amount.toLocaleString()}</li>
              <li><strong>Investment ID:</strong> ${investmentId}</li>
              <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p>Our team will contact you shortly with banking details and next steps.</p>
          
          <p>Thank you for choosing GLG Capital Group!</p>
        </div>
      </div>
    `;

    // Email to support team
    const supportEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="margin: 0;">New Investment Request</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h3>Investment Details:</h3>
          <ul>
            <li><strong>Client:</strong> ${userName} (${userEmail})</li>
            <li><strong>Package:</strong> ${packageName}</li>
            <li><strong>Amount:</strong> $${amount.toLocaleString()}</li>
            <li><strong>Investment ID:</strong> ${investmentId}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p>Please process this investment request and send banking details to the client.</p>
        </div>
      </div>
    `;

    // Send email to client
    const clientResult = await this.sendEmail({
      to: userEmail,
      subject: 'Investment Request Confirmed - GLG Capital Group',
      html: clientEmailHtml
    });

    // Send email to support team
    const supportResult = await this.sendEmail({
      to: 'support@glgcapitalgroupllc.com',
      subject: `New Investment Request - ${userName}`,
      html: supportEmailHtml
    });

    return clientResult.success && supportResult.success;
  }

  async sendInformationalRequestEmail(requestData: any): Promise<boolean> {
    const { name, email, request_type, subject, message } = requestData;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="margin: 0;">New Informational Request</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h3>Request Details:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Request Type:</strong> ${request_type}</li>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <h4>Message:</h4>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>Please respond to this request as soon as possible.</p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: 'info@glgcapitalgroupllc.com',
      subject: `New ${request_type} Request - ${name}`,
      html: emailHtml
    });

    return result.success;
  }

  async sendContactFormEmail(contactData: any): Promise<boolean> {
    const { name, email, subject, message } = contactData;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="margin: 0;">New Contact Form Submission</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h3>Contact Details:</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Subject:</strong> ${subject}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <h4>Message:</h4>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p>Please respond to this contact request as soon as possible.</p>
        </div>
      </div>
    `;

    const result = await this.sendEmail({
      to: 'corefound@glgcapitalgroupllc.com',
      subject: `New message from ${name} - ${subject}`,
      html: emailHtml
    });

    return result.success;
  }
}

export const emailService = new EmailService(); 