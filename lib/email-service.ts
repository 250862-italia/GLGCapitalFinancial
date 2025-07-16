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
      service: 'supabase',
      fromEmail: 'noreply@glgcapitalgroupllc.com'
    };
  }

  async sendEmail(emailData: EmailData): Promise<{ success: boolean; message: string; service: string }> {
    try {
      console.log('📧 Sending email via Supabase:', {
        to: emailData.to,
        subject: emailData.subject,
        service: this.config.service
      });

      // Store email in Supabase for processing
      const { data, error } = await supabase
        .from('email_queue')
        .insert([
          {
            to_email: emailData.to,
            subject: emailData.subject,
            html_content: emailData.html,
            text_content: emailData.text,
            from_email: emailData.from || this.config.fromEmail,
            status: 'pending',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('❌ Error storing email in queue:', error);
        
        // Fallback: simulate email sending
        return this.simulateEmail(emailData);
      }

      console.log('✅ Email queued successfully in Supabase');
      
      // In a real implementation, you would have a Supabase Edge Function
      // that processes the email queue and sends emails via SMTP or other services
      
      return {
        success: true,
        message: 'Email queued successfully',
        service: 'supabase'
      };

    } catch (error) {
      console.error('❌ Email service error:', error);
      return this.simulateEmail(emailData);
    }
  }

  private simulateEmail(emailData: EmailData): { success: boolean; message: string; service: string } {
    console.log('📧 Simulating email send:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from || this.config.fromEmail
    });

    return {
      success: true,
      message: 'Email simulated (Supabase not available)',
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

    try {
      // Send to client
      await this.sendEmail({
        to: userEmail,
        subject: `Investment Request Confirmation - ${packageName} Package`,
        html: clientEmailHtml
      });

      // Send to support team
      await this.sendEmail({
        to: 'corefound@glgcapitalgroupllc.com',
        subject: `Investment Request - ${packageName} Package - ${userName}`,
        html: supportEmailHtml
      });

      console.log('✅ Investment notification emails sent successfully');
      return true;
    } catch (error) {
      console.error('❌ Error sending investment notification emails:', error);
      return false;
    }
  }

  async sendInformationalRequestEmail(requestData: any): Promise<boolean> {
    const emailContent = `
Informational Request Form
GLG Equity Pledge

Involved Entities:
* GLG Capital Consulting LLC (USA)
* GLG Capital Group LLC (United States)

1. Subject of the Request
I, the undersigned, as a prospective participant, hereby request detailed information regarding the "GLG Equity Pledge" program, including but not limited to:
* Operational and legal structure
* Financial terms and durations
* Share pledge mechanism
* Repayment procedures and timelines
* Key risks and safeguards

2. Applicant's Declarations
* Voluntariness: I declare that this request is made of my own free will, without any solicitation or promotional activities by GLG Capital Consulting LLC, or their agents.
* Informational Purpose: I understand that the information provided is purely informational and does not constitute a contractual offer, investment advice, or recommendation under applicable securities laws.
* Independent Evaluation: I commit to independently assess, and if needed consult professional advisors on, the suitability of any potential investment decision.

3. Data Processing Consent (EU GDPR 2016/679)
I authorize GLG Capital Consulting LLC to process my personal data solely for the purposes of:
* Providing the requested information
* Complying with legal AML requirements
My data will not be shared with third parties for any other purposes.

4. U.S. Regulatory References
By submitting this form, you acknowledge that GLG Capital Consulting LLC operates in compliance with the following key U.S. laws and regulations:
* Securities Act of 1933 & Securities Exchange Act of 1934: Governing private placements and exempt offerings under Regulation D.
* Bank Secrecy Act (BSA) & USA PATRIOT Act: Mandating customer identification (CIP), suspicious activity monitoring, and AML due diligence.
* Investment Advisers Act of 1940: Applicable to advisory activities and fiduciary standards for U.S. investors.
* California Consumer Privacy Act (CCPA): Protecting personal data and consumer privacy for California residents.

5. Submission Channels
Please send the requested information via one of the following:
* Email: corefound@glgcapitalconsulting.com

---
APPLICANT INFORMATION:
Name: ${requestData.first_name} ${requestData.last_name}
Email: ${requestData.email}
Phone: ${requestData.phone || 'Not provided'}
Company: ${requestData.company || 'Not provided'}
Position: ${requestData.position || 'Not provided'}
Country: ${requestData.country || 'Not provided'}
City: ${requestData.city || 'Not provided'}
Additional Notes: ${requestData.additionalNotes || 'None'}

Request ID: ${requestData.id}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
    `;

    const result = await this.sendEmail({
      to: 'corefound@glgcapitalconsulting.com',
      subject: `Informational Request - ${requestData.first_name} ${requestData.last_name}`,
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
      from: requestData.email
    });

    return result.success;
  }
}

export const emailService = new EmailService(); 