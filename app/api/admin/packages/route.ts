import { NextRequest, NextResponse } from 'next/server';
import { getPackages, createPackage, updatePackage, deletePackage } from '@/lib/data-manager';

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

// GET - Recupera tutti i pacchetti
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera i pacchetti dal database reale
    const packages = await getPackages();
    
    return NextResponse.json({
      success: true,
      packages: packages,
      total: packages.length
    });
  } catch (error) {
    console.error('Errore nel recupero pacchetti dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare i pacchetti dal database'
      },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo pacchetto
export async function POST(request: NextRequest) {
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
        { success: false, error: 'Dati mancanti per la creazione del pacchetto' },
        { status: 400 }
      );
    }

    // Crea il pacchetto nel database reale
    const newPackage = await createPackage({
      name: body.name,
      description: body.description,
      min_investment: body.min_investment,
      max_investment: body.max_investment || null,
      expected_return: body.expected_return,
      risk_level: body.risk_level || 'moderate',
      duration_months: body.duration_months || 12,
      status: 'active',
      total_investors: 0,
      total_amount: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Pacchetto creato con successo nel database',
      package: newPackage
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione del pacchetto nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile creare il pacchetto nel database'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un pacchetto esistente
export async function PUT(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID pacchetto è richiesto' },
        { status: 400 }
      );
    }

    // Aggiorna il pacchetto
    const updatedPackage = await updatePackage(body.id, {
      name: body.name,
      description: body.description,
      min_investment: body.min_investment,
      max_investment: body.max_investment || null,
      expected_return: body.expected_return,
      risk_level: body.risk_level || 'medium',
      duration_months: body.duration_months || 12
    });

    if (!updatedPackage) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pacchetto aggiornato con successo',
      package: updatedPackage
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento pacchetto:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento del pacchetto' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un pacchetto
export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID pacchetto è richiesto' },
        { status: 400 }
      );
    }

    // Elimina il pacchetto
    const deleted = await deletePackage(body.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pacchetto eliminato con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione pacchetto:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione del pacchetto' },
      { status: 500 }
    );
  }
}

 