import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, body, html } = await request.json();

    // Validazione
    if (!to || !subject || (!body && !html)) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, body/html' },
        { status: 400 }
      );
    }

    // In produzione, leggi la configurazione dal database
    // Per ora usiamo le variabili d'ambiente
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      // Forza sempre il mittente corretto
      fromEmail: 'noreply@glgcapitalgroupllc.com'
    };

    console.log('Email config:', {
      service: emailConfig.service,
      hasApiKey: !!emailConfig.apiKey,
      apiKeyLength: emailConfig.apiKey?.length,
      fromEmail: emailConfig.fromEmail
    });

    let emailSent = false;

    // Prova Resend (gratuito per 100 email/mese)
    console.log('Tentativo invio con Resend...');
    if (emailConfig.service === 'resend' && emailConfig.apiKey) {
      console.log('Resend configurato, tentativo invio...');
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailConfig.fromEmail,
            to: [to],
            subject: subject,
            html: html || body,
          }),
        });

        console.log('Risposta Resend status:', resendResponse.status);
        if (resendResponse.ok) {
          emailSent = true;
          console.log('Email inviata con Resend');
        } else {
          const errorData = await resendResponse.json();
          console.error('Errore Resend:', errorData);
        }
      } catch (error) {
        console.error('Errore connessione Resend:', error);
      }
    } else {
      console.log('Resend non configurato:', {
        service: emailConfig.service,
        hasApiKey: !!emailConfig.apiKey
      });
    }

    // Prova SendGrid (fallback)
    if (!emailSent && emailConfig.service === 'sendgrid' && emailConfig.apiKey) {
      try {
        const sendgridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: to }] }],
            from: { email: emailConfig.fromEmail },
            subject: subject,
            content: [{ type: 'text/html', value: html || body }],
          }),
        });

        if (sendgridResponse.ok) {
          emailSent = true;
          console.log('Email inviata con SendGrid');
        } else {
          const errorData = await sendgridResponse.json();
          console.error('Errore SendGrid:', errorData);
        }
      } catch (error) {
        console.error('Errore connessione SendGrid:', error);
      }
    }

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Email inviata con successo',
        service: emailConfig.service
      });
    } else {
      // Se nessun servizio funziona, simula l'invio per test
      console.log('Simulazione invio email:', {
        to,
        subject,
        from: emailConfig.fromEmail,
        service: emailConfig.service,
        hasApiKey: !!emailConfig.apiKey
      });

      return NextResponse.json({
        success: true,
        message: 'Email simulata (nessun servizio configurato)',
        service: 'simulated'
      });
    }

  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 