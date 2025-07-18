import { supabaseAdmin } from './supabase';

export interface SupabaseEmailData {
  to: string;
  subject: string;
  template?: 'confirm-signup' | 'magic-link' | 'reset-password' | 'custom';
  html?: string;
  text?: string;
  data?: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  message: string;
  service: 'supabase-auth' | 'fallback';
  emailId?: string;
}

class SupabaseEmailService {
  private fromEmail = 'noreply@glgcapitalgroupllc.com';
  private fromName = 'GLG Capital Group';

  async sendEmail(emailData: SupabaseEmailData): Promise<EmailResult> {
    try {
      // Check if supabaseAdmin is available (server-side only)
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available - server-side only');
      }

      console.log('📧 Sending email via Supabase Auth:', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template
      });

      if (emailData.template === 'confirm-signup') {
        return await this.sendConfirmationEmail(emailData.to, emailData.data);
      }

      if (emailData.template === 'magic-link') {
        return await this.sendMagicLink(emailData.to);
      }

      if (emailData.template === 'reset-password') {
        return await this.sendPasswordReset(emailData.to);
      }

      if (emailData.template === 'custom' || emailData.html) {
        return await this.sendCustomEmail(emailData);
      }

      throw new Error('Template non supportato');

    } catch (error: any) {
      console.error('❌ Supabase email error:', error);
      return {
        success: false,
        message: error.message || 'Errore invio email',
        service: 'supabase-auth'
      };
    }
  }

  private async sendConfirmationEmail(email: string, data?: Record<string, any>): Promise<EmailResult> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      // Per Supabase, dobbiamo prima creare l'utente e poi inviare l'email di conferma
      // Generiamo una password temporanea
      const tempPassword = this.generateTempPassword();
      
      const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: false,
        user_metadata: data || {}
      });

      if (error) {
        throw error;
      }

      // Ora inviamo l'email di conferma
      const { error: emailError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: email,
        password: tempPassword,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/confirm`
        }
      });

      if (emailError) {
        throw emailError;
      }

      await this.saveEmailToQueue({
        to_email: email,
        from_email: this.fromEmail,
        subject: 'Welcome to GLG Capital Group - Confirm Your Email',
        html_content: this.generateWelcomeEmailHTML('', data),
        text_content: this.generateWelcomeEmailText('', data),
        status: 'sent',
        sent_at: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Email di conferma inviata con successo',
        service: 'supabase-auth',
        emailId: user.user?.id
      };

    } catch (error: any) {
      throw new Error(`Errore invio email conferma: ${error.message}`);
    }
  }

  private async sendMagicLink(email: string): Promise<EmailResult> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Magic link inviato con successo',
        service: 'supabase-auth',
        emailId: data.user?.id
      };

    } catch (error: any) {
      throw new Error(`Errore invio magic link: ${error.message}`);
    }
  }

  private async sendPasswordReset(email: string): Promise<EmailResult> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const { data, error } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
        }
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Email reset password inviata con successo',
        service: 'supabase-auth',
        emailId: data.user?.id
      };

    } catch (error: any) {
      throw new Error(`Errore invio reset password: ${error.message}`);
    }
  }

  private async sendCustomEmail(emailData: SupabaseEmailData): Promise<EmailResult> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const { data, error } = await supabaseAdmin
        .from('email_queue')
        .insert({
          to_email: emailData.to,
          from_email: this.fromEmail,
          subject: emailData.subject,
          html_content: emailData.html,
          text_content: emailData.text,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Email personalizzata accodata con successo',
        service: 'supabase-auth',
        emailId: data.id
      };

    } catch (error: any) {
      throw new Error(`Errore invio email personalizzata: ${error.message}`);
    }
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private async saveEmailToQueue(emailData: any): Promise<void> {
    try {
      if (!supabaseAdmin) {
        console.warn('⚠️ Supabase admin client not available, skipping email queue save');
        return;
      }

      await supabaseAdmin
        .from('email_queue')
        .insert(emailData);
    } catch (error) {
      console.warn('⚠️ Errore salvataggio email in coda:', error);
    }
  }

  private generateWelcomeEmailHTML(confirmationLink: string, data?: Record<string, any>): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">GLG Capital Group</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to Your Investment Journey</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to GLG Capital Group!</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for choosing GLG Capital Group for your investment needs. 
            We're excited to have you on board!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink || '#'}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
              Confirm Your Email Address
            </a>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">What's Next?</h3>
            <ul style="color: #374151; line-height: 1.6;">
              <li>✅ Confirm your email address</li>
              <li>✅ Complete your profile</li>
              <li>✅ Explore investment opportunities</li>
              <li>✅ Start your investment journey</li>
            </ul>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you didn't create this account, you can safely ignore this email.
          </p>
          
          <p style="color: #374151; margin-top: 30px;">
            Best regards,<br>
            <strong>GLG Capital Group Team</strong>
          </p>
        </div>
      </div>
    `;
  }

  private generateWelcomeEmailText(confirmationLink: string, data?: Record<string, any>): string {
    return `
Welcome to GLG Capital Group!

Thank you for choosing GLG Capital Group for your investment needs. We're excited to have you on board!

Please confirm your email address by clicking the link below:
${confirmationLink || 'Link will be provided in the email'}

What's Next?
- Confirm your email address
- Complete your profile
- Explore investment opportunities
- Start your investment journey

If you didn't create this account, you can safely ignore this email.

Best regards,
GLG Capital Group Team
    `;
  }

  async checkEmailStatus(emailId: string): Promise<{ status: string; delivered: boolean }> {
    try {
      if (!supabaseAdmin) {
        console.warn('⚠️ Supabase admin client not available, cannot check email status');
        return { status: 'unknown', delivered: false };
      }

      const { data, error } = await supabaseAdmin
        .from('email_queue')
        .select('status, sent_at')
        .eq('id', emailId)
        .single();

      if (error) {
        throw error;
      }

      return {
        status: data.status,
        delivered: data.status === 'sent' && !!data.sent_at
      };

    } catch (error) {
      console.error('❌ Errore verifica status email:', error);
      return { status: 'unknown', delivered: false };
    }
  }
}

export const supabaseEmailService = new SupabaseEmailService(); 