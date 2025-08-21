import { NextRequest, NextResponse } from 'next/server';
import { getAnalytics, createAnalytics, updateAnalytics, deleteAnalytics } from '@/lib/data-manager';

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

// GET - Recupera tutte le analytics
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera le analytics dal database reale
    const analytics = await getAnalytics();
    
    return NextResponse.json({ 
      success: true, 
      data: analytics 
    });
  } catch (error) {
    console.error('Errore nel recupero analytics dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare le analytics dal database'
      },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova analytics
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const analyticsData = await request.json();
    
    // Validazione dati
    if (!analyticsData.date || !analyticsData.total_investments || !analyticsData.total_amount) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti per la creazione delle analytics' },
        { status: 400 }
      );
    }

    // Crea le analytics nel database reale
    const newAnalytics = await createAnalytics(analyticsData);

    return NextResponse.json({
      success: true,
      message: 'Analytics create con successo nel database',
      data: newAnalytics
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione delle analytics nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile creare le analytics nel database'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna le analytics
export async function PUT(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updateData = await request.json();
    
    if (!updateData.id) {
      return NextResponse.json(
        { success: false, error: 'ID analytics mancante' },
        { status: 400 }
      );
    }

    // Aggiorna le analytics nel database reale
    const updatedAnalytics = await updateAnalytics(updateData.id, updateData);

    if (!updatedAnalytics) {
      return NextResponse.json(
        { success: false, error: 'Analytics non trovate nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics aggiornate con successo nel database',
      data: updatedAnalytics
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento delle analytics nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile aggiornare le analytics nel database'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina le analytics
export async function DELETE(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deleteData = await request.json();
    
    if (!deleteData.id) {
      return NextResponse.json(
        { success: false, error: 'ID analytics mancante' },
        { status: 400 }
      );
    }

    // Elimina le analytics dal database reale
    const success = await deleteAnalytics(deleteData.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Analytics non trovate nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Analytics eliminate con successo dal database'
    });

  } catch (error) {
    console.error('Errore nell\'eliminazione delle analytics dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile eliminare le analytics dal database'
      },
      { status: 500 }
    );
  }
} 