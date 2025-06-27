import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // Validazione
    if (!config.service || !config.apiKey || !config.fromEmail) {
      return NextResponse.json(
        { error: 'Configurazione incompleta' },
        { status: 400 }
      );
    }

    // In produzione, qui salveresti nel database
    // Per ora simuliamo il salvataggio
    console.log('Configurazione email aggiornata:', {
      service: config.service,
      fromEmail: config.fromEmail,
      surveillanceEmail: config.surveillanceEmail,
      // Non logghiamo la chiave API per sicurezza
      apiKeyLength: config.apiKey.length
    });

    return NextResponse.json({
      success: true,
      message: 'Configurazione email aggiornata con successo'
    });

  } catch (error) {
    console.error('Errore aggiornamento configurazione email:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
} 