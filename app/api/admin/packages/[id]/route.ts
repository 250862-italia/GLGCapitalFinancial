import { NextRequest, NextResponse } from 'next/server';
import { getPackage, updatePackage, deletePackage } from '@/lib/data-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Funzione per verificare il token admin
function verifyAdminToken(request: NextRequest): boolean {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    
    const token = authHeader.substring(7);
    // In produzione, dovresti verificare il JWT token
    // Per ora, accettiamo qualsiasi token valido
    return token.length > 10;
  } catch (error) {
    return false;
  }
}

// GET - Recupera un pacchetto specifico per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera il pacchetto dal database reale
    const pkg = await getPackage(params.id);
    
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg
    });
  } catch (error) {
    console.error('Errore nel recupero pacchetto dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare il pacchetto dal database'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un pacchetto specifico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validazione dati
    if (!body.name || !body.description || !body.min_investment || !body.expected_return) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti per l\'aggiornamento del pacchetto' },
        { status: 400 }
      );
    }

    // Aggiorna il pacchetto nel database reale
    const updatedPackage = await updatePackage(params.id, {
      name: body.name,
      description: body.description,
      min_investment: body.min_investment,
      max_investment: body.max_investment || null,
      expected_return: body.expected_return,
      risk_level: body.risk_level || 'moderate',
      duration_months: body.duration_months || 12,
      status: body.status || 'active'
    });

    if (!updatedPackage) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato nel database' },
        { status: 404 }
      );
    }

    // Crea una notifica per informare i clienti dell'aggiornamento
    try {
      const notificationResponse = await fetch(`${request.nextUrl.origin}/api/admin/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('authorization') || ''
        },
        body: JSON.stringify({
          type: 'package_update',
          title: 'Pacchetto Aggiornato',
          message: `Il pacchetto "${body.name}" è stato aggiornato dall'amministratore`,
          data: {
            package_id: params.id,
            package_name: body.name,
            changes: {
              expected_return: body.expected_return,
              risk_level: body.risk_level,
              duration_months: body.duration_months,
              status: body.status
            }
          }
        })
      });

      if (notificationResponse.ok) {
        console.log('✅ Notifica creata per aggiornamento pacchetto');
      }
    } catch (error) {
      console.log('⚠️ Errore nella creazione notifica (non critico):', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Pacchetto aggiornato con successo nel database',
      package: updatedPackage
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento del pacchetto nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile aggiornare il pacchetto nel database'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un pacchetto specifico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Elimina il pacchetto dal database reale
    const success = await deletePackage(params.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pacchetto eliminato con successo dal database'
    });

  } catch (error) {
    console.error('Errore nell\'eliminazione del pacchetto dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile eliminare il pacchetto dal database'
      },
      { status: 500 }
    );
  }
}
