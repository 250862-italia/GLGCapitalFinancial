import { NextRequest, NextResponse } from 'next/server';
import { getPackages, createPackage, updatePackage, deletePackage } from '@/lib/data-manager';
import { 
  getAllSessionPackages, 
  addSessionPackage, 
  getSessionPackagesCount 
} from '@/lib/session-data';

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

    let packages;
    try {
      // Prova prima a recuperare dal database
      packages = await getPackages();
    } catch (dbError) {
      console.log('Database non disponibile, uso dati mock:', dbError);
      // Se il database non è disponibile, usa i dati della sessione
      packages = getAllSessionPackages();
    }
    
    return NextResponse.json({
      success: true,
      packages: packages,
      total: packages.length
    });
  } catch (error) {
    console.error('Errore nel recupero pacchetti:', error);
    // Fallback ai dati mock in caso di errore
    return NextResponse.json({
      success: true,
      packages: getAllSessionPackages(),
      total: getSessionPackagesCount()
    });
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

    // Crea sempre un pacchetto mock per ora
    const newPackage = addSessionPackage({
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

    console.log('Pacchetto creato con successo:', newPackage);

    return NextResponse.json({
      success: true,
      message: 'Pacchetto creato con successo',
      package: newPackage
    });
  } catch (error) {
    console.error('Errore nella creazione pacchetto:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione del pacchetto' },
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

 