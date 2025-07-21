import { NextRequest, NextResponse } from 'next/server';
import { supabaseEmailService } from '@/lib/supabase-email-service';
import { supabaseAdmin } from '@/lib/supabase';
import { validateCSRFToken } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`🔍 [${requestId}] Password reset request started`);
  
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const body = await request.json();
    const { email } = body;

    console.log(`📧 [${requestId}] Email requested for reset:`, email);

    if (!email) {
      console.log(`❌ [${requestId}] Missing email parameter`);
      return NextResponse.json(
        { error: 'Email è obbligatoria' },
        { status: 400 }
      );
    }

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ [${requestId}] Invalid email format:`, email);
      return NextResponse.json(
        { error: 'Formato email non valido' },
        { status: 400 }
      );
    }

    console.log(`🔍 [${requestId}] Step 1: Checking if user exists in Supabase Auth...`);
    
    // Verifica se l'utente esiste in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin!.auth.admin.listUsers();
    
    if (authError) {
      console.error(`❌ [${requestId}] Error listing users:`, authError);
    } else {
      const userExists = authUser.users.some(user => user.email === email);
      console.log(`✅ [${requestId}] User exists in Supabase Auth:`, userExists);
      
      if (!userExists) {
        console.log(`⚠️ [${requestId}] User not found in Supabase Auth, checking custom users table...`);
        
        // Verifica nella tabella users custom
        const { data: customUser, error: customError } = await supabaseAdmin
          .from('users')
          .select('id, email, email_confirmed')
          .eq('email', email)
          .single();
          
        if (customError) {
          console.log(`❌ [${requestId}] User not found in custom table:`, customError.message);
        } else {
          console.log(`✅ [${requestId}] User found in custom table:`, {
            id: customUser.id,
            email: customUser.email,
            emailConfirmed: customUser.email_confirmed
          });
        }
      }
    }

    console.log(`🔍 [${requestId}] Step 2: Attempting password reset via Supabase Auth...`);
    
    // Prova prima con Supabase Auth diretto
    try {
      const { data: resetData, error: resetError } = await supabaseAdmin!.auth.admin.generateLink({
        type: 'recovery',
        email: email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.glgcapitalgroup.com'}/reset-password`
        }
      });

      if (resetError) {
        console.error(`❌ [${requestId}] Supabase Auth reset error:`, resetError);
        console.log(`📋 [${requestId}] Error details:`, {
          message: resetError.message,
          status: resetError.status,
          name: resetError.name
        });
      } else {
        console.log(`✅ [${requestId}] Supabase Auth reset successful:`, {
          userId: resetData.user?.id,
          hasActionLink: !!resetData.properties.action_link,
          actionLink: resetData.properties.action_link ? 'Available' : 'Missing'
        });
        
        // Salva nella coda email per tracking
        await supabaseAdmin
          .from('email_queue')
          .insert({
            to_email: email,
            from_email: 'noreply@glgcapitalgroupllc.com',
            subject: 'Password Reset - GLG Capital Group',
            html_content: generateResetEmailHTML(resetData.properties.action_link),
            text_content: generateResetEmailText(resetData.properties.action_link),
            status: 'sent',
            sent_at: new Date().toISOString(),
            metadata: {
              requestId,
              userId: resetData.user?.id,
              method: 'supabase-auth-direct'
            }
          });
        
        console.log(`✅ [${requestId}] Reset email queued for tracking`);
        
        const duration = Date.now() - startTime;
        console.log(`✅ [${requestId}] Password reset completed successfully in ${duration}ms`);
        
        return NextResponse.json({
          success: true,
          message: 'Email di reset password inviata. Controlla la tua casella email.',
          requestId,
          duration
        });
      }
    } catch (directError) {
      console.error(`❌ [${requestId}] Direct Supabase Auth call failed:`, directError);
    }

    console.log(`🔍 [${requestId}] Step 3: Fallback to email service...`);
    
    // Fallback al servizio email personalizzato
    const emailResult = await supabaseEmailService.sendEmail({
      to: email,
      subject: 'Reset Your Password - GLG Capital Group',
      template: 'reset-password'
    });

    console.log(`📧 [${requestId}] Email service result:`, {
      success: emailResult.success,
      message: emailResult.message,
      service: emailResult.service,
      emailId: emailResult.emailId
    });

    if (emailResult.success) {
      const duration = Date.now() - startTime;
      console.log(`✅ [${requestId}] Password reset completed via email service in ${duration}ms`);
      
      return NextResponse.json({
        success: true,
        message: 'Email di reset password inviata. Controlla la tua casella email.',
        requestId,
        duration,
        method: 'email-service'
      });
    } else {
      console.error(`❌ [${requestId}] Email service failed:`, emailResult.message);
      
      const duration = Date.now() - startTime;
      return NextResponse.json({
        success: false,
        error: 'Errore nell\'invio dell\'email di reset. Riprova più tardi.',
        details: emailResult.message,
        requestId,
        duration
      }, { status: 500 });
    }

  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`💥 [${requestId}] Unexpected error:`, error);
    console.error(`📋 [${requestId}] Error details:`, {
      message: error.message,
      stack: error.stack,
      duration
    });
    
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        requestId,
        duration
      },
      { status: 500 }
    );
  }
}

function generateResetEmailHTML(resetLink: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">GLG Capital Group</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
        
        <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
          You requested to reset your password for your GLG Capital Group account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink || '#'}" style="background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0;">Important:</h3>
          <ul style="color: #374151; line-height: 1.6;">
            <li>This link will expire in 1 hour</li>
            <li>If you didn't request this, ignore this email</li>
            <li>For security, this link can only be used once</li>
          </ul>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetLink || '#'}" style="color: #3b82f6;">${resetLink || 'Reset link'}</a>
        </p>
        
        <p style="color: #374151; margin-top: 30px;">
          Best regards,<br>
          <strong>GLG Capital Group Team</strong>
        </p>
      </div>
    </div>
  `;
}

function generateResetEmailText(resetLink: string): string {
  return `
Password Reset - GLG Capital Group

You requested to reset your password for your GLG Capital Group account.

Click the link below to set a new password:
${resetLink || 'Reset link will be provided'}

Important:
- This link will expire in 1 hour
- If you didn't request this, ignore this email
- For security, this link can only be used once

If the link doesn't work, copy and paste it into your browser.

Best regards,
GLG Capital Group Team
  `;
} 