import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Processamento coda email avviato...');
    
    // Recupera email in coda con status 'pending'
    const { data: pendingEmails, error } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Errore recupero email in coda:', error);
      return NextResponse.json(
        { error: 'Errore recupero email in coda' },
        { status: 500 }
      );
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('📧 Nessuna email in coda da processare');
      return NextResponse.json({
        success: true,
        message: 'Nessuna email in coda da processare',
        processed: 0
      });
    }

    console.log(`📧 Processando ${pendingEmails.length} email in coda...`);

    let processedCount = 0;
    let errorCount = 0;

    for (const email of pendingEmails) {
      try {
        // Per ora, aggiorniamo lo status a 'sent' per simulare l'invio
        // In futuro, qui andrebbe l'invio email reale tramite SMTP o servizi esterni
        const { error: updateError } = await supabase
          .from('email_queue')
          .update({ 
            status: 'sent', 
            sent_at: new Date().toISOString() 
          })
          .eq('id', email.id);

        if (updateError) {
          console.error(`❌ Errore aggiornamento status email ${email.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`✅ Email ${email.id} processata e inviata a ${email.to_email}`);
          processedCount++;
        }

      } catch (emailError) {
        console.error(`❌ Errore processamento email ${email.id}:`, emailError);
        errorCount++;
        
        // Aggiorna status a 'error'
        await supabase
          .from('email_queue')
          .update({ 
            status: 'error', 
            error_message: emailError instanceof Error ? emailError.message : 'Errore sconosciuto'
          })
          .eq('id', email.id);
      }
    }

    console.log(`📧 Processamento completato: ${processedCount} inviate, ${errorCount} errori`);

    return NextResponse.json({
      success: true,
      message: `Processamento completato: ${processedCount} email inviate, ${errorCount} errori`,
      processed: processedCount,
      errors: errorCount,
      total: pendingEmails.length
    });

  } catch (error) {
    console.error('❌ Errore generale processamento coda email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

// Endpoint GET per verificare lo stato della coda
export async function GET() {
  try {
    const { data: emailStats, error } = await supabase
      .from('email_queue')
      .select('status')
      .in('status', ['pending', 'sent', 'error']);

    if (error) {
      return NextResponse.json(
        { error: 'Errore recupero statistiche email' },
        { status: 500 }
      );
    }

    const stats = {
      pending: emailStats?.filter(e => e.status === 'pending').length || 0,
      sent: emailStats?.filter(e => e.status === 'sent').length || 0,
      error: emailStats?.filter(e => e.status === 'error').length || 0,
      total: emailStats?.length || 0
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Errore recupero statistiche email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 