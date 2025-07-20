import { NextRequest, NextResponse } from 'next/server';
import { emailService } from '@/lib/email-service';
import { validateCSRFToken } from '@/lib/csrf';

export async function POST(request: NextRequest) {
  try {
    // Validazione CSRF
    const csrfValidation = validateCSRFToken(request);
    if (!csrfValidation.valid) {
      return NextResponse.json({ 
        error: 'CSRF validation failed',
        details: csrfValidation.error 
      }, { status: 403 });
    }

    const { to, subject, body, html, from } = await request.json();

    // Validazione
    if (!to || !subject || (!body && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body/html' },
        { status: 400 }
      );
    }

    console.log('📧 Sending email via Supabase service:', {
      to,
      subject,
      hasHtml: !!html,
      hasBody: !!body
    });

    // Usa il nuovo servizio email basato su Supabase
    const result = await emailService.sendEmail({
      to,
      subject,
      html: html || body,
      text: body,
      from
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      service: result.service
    });

  } catch (error) {
    console.error('❌ Email service error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 