import { NextRequest, NextResponse } from 'next/server';
import { getPackage, updatePackage, deletePackage } from '@/lib/data-manager';
import { 
  findSessionPackage, 
  updateSessionPackage, 
  deleteSessionPackage 
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

    let pkg;
    try {
      // Prova prima a recuperare dal database
      pkg = await getPackage(params.id);
    } catch (dbError) {
      console.log('Database non disponibile, uso dati mock:', dbError);
      // Se il database non è disponibile, usa i dati della sessione
      pkg = findSessionPackage(params.id);
    }
    
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Pacchetto non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      package: pkg
    });
  } catch (error) {
    console.error('Errore nel recupero pacchetto:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero del pacchetto' },
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

    let updatedPackage;
    try {
      // Prova prima ad aggiornare nel database
      updatedPackage = await updatePackage(params.id, {
        name: body.name,
        description: body.description,
        min_investment: body.min_investment,
        max_investment: body.max_investment || null,
        expected_return: body.expected_return,
        risk_level: body.risk_level || 'moderate',
        duration_months: body.duration_months || 12
      });
    } catch (dbError) {
      console.log('Database non disponibile, aggiorno dati mock:', dbError);
      // Se il database non è disponibile, aggiorna i dati della sessione
      updatedPackage = updateSessionPackage(params.id, {
        name: body.name,
        description: body.description,
        min_investment: body.min_investment,
        max_investment: body.max_investment || null,
        expected_return: body.expected_return,
        risk_level: body.risk_level || 'moderate',
        duration_months: body.duration_months || 12
      });
    }

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

    let deleted;
    try {
      // Prova prima ad eliminare dal database
      deleted = await deletePackage(params.id);
    } catch (dbError) {
      console.log('Database non disponibile, elimino dati mock:', dbError);
      // Se il database non è disponibile, elimina i dati della sessione
      deleted = deleteSessionPackage(params.id);
    }

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
