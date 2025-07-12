import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createClientProfile(userId: string, firstName: string, lastName: string, country: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} to create client profile for user:`, userId);
      
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          first_name: firstName || '',
          last_name: lastName || '',
          country: country || ''
        })
        .select()
        .single();

      if (clientError) {
        console.error(`Client creation error (attempt ${i + 1}):`, clientError);
        
        if (clientError.message.includes('foreign key constraint')) {
          if (i < retries - 1) {
            console.log('Foreign key constraint error, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            continue;
          } else {
            throw new Error('User account was created but profile creation failed after multiple attempts. Please try logging in and updating your profile.');
          }
        }
        
        throw clientError;
      }

      console.log('Client profile created successfully:', client);
      return client;
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

async function sendWelcomeEmail(email: string, firstName: string, lastName: string) {
  try {
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@glgcapitalgroupllc.com'
    };

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

    // Try Resend first
    if (emailConfig.service === 'resend' && emailConfig.apiKey) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: emailConfig.fromEmail,
          to: [email],
          subject: 'Welcome to GLG Capital Group - Account Created Successfully',
          html: welcomeEmailHtml,
        }),
      });

      if (resendResponse.ok) {
        console.log('Welcome email sent via Resend');
        return true;
      }
    }

    // Try SendGrid as fallback
    if (emailConfig.service === 'sendgrid' && emailConfig.apiKey) {
      const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${emailConfig.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: email }] }],
          from: { email: emailConfig.fromEmail },
          subject: 'Welcome to GLG Capital Group - Account Created Successfully',
          content: [{ type: 'text/html', value: welcomeEmailHtml }],
        }),
      });

      if (sendgridResponse.ok) {
        console.log('Welcome email sent via SendGrid');
        return true;
      }
    }

    // If no email service configured, log the email content
    console.log('No email service configured. Welcome email content:', {
      to: email,
      subject: 'Welcome to GLG Capital Group - Account Created Successfully',
      html: welcomeEmailHtml
    });

    return true; // Return true even if email service is not configured
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false; // Don't fail registration if email fails
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, firstName, lastName, country } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Starting registration for:', email);

    // Register user in Supabase
    const { data: user, error: registerError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: 'user'
        }
      }
    });

    if (registerError) {
      console.error('User registration error:', registerError);
      return NextResponse.json(
        { error: registerError.message },
        { status: 500 }
      );
    }

    if (!user.user?.id) {
      console.error('No user ID returned from registration');
      return NextResponse.json(
        { error: 'User registration failed - no user ID returned' },
        { status: 500 }
      );
    }

    console.log('User registered successfully with ID:', user.user.id);

    // Wait a moment to ensure the user is fully created in auth.users
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create client profile with retry mechanism
    const client = await createClientProfile(user.user.id, firstName, lastName, country);

    // Send welcome email (don't fail if email fails)
    await sendWelcomeEmail(email, firstName, lastName);

    return NextResponse.json({
      success: true,
      user: user.user,
      client,
      message: 'Registration successful! Please check your email for confirmation.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 