import { NextRequest, NextResponse } from 'next/server';
import { getInvestments, createInvestment, updateInvestment, deleteInvestment } from '@/lib/data-manager';

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

// GET - Recupera tutti gli investimenti
export async function GET(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Recupera gli investimenti dal database reale
    const investments = await getInvestments();
    
    return NextResponse.json({ 
      success: true, 
      data: investments 
    });
  } catch (error) {
    console.error('Errore nel recupero investimenti dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare gli investimenti dal database'
      },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo investimento
export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    if (!verifyAdminToken(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const investmentData = await request.json();
    
    // Validazione dati
    if (!investmentData.client_id || !investmentData.package_id || !investmentData.amount) {
      return NextResponse.json(
        { success: false, error: 'Dati mancanti per la creazione dell\'investimento' },
        { status: 400 }
      );
    }

    // Crea l'investimento nel database reale
    const newInvestment = await createInvestment(investmentData);

    return NextResponse.json({
      success: true,
      message: 'Investimento creato con successo nel database',
      data: newInvestment
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nella creazione dell\'investimento nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile creare l\'investimento nel database'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un investimento
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
        { success: false, error: 'ID investimento mancante' },
        { status: 400 }
      );
    }

    // Aggiorna l'investimento nel database reale
    const updatedInvestment = await updateInvestment(updateData.id, updateData);

    if (!updatedInvestment) {
      return NextResponse.json(
        { success: false, error: 'Investimento non trovato nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investimento aggiornato con successo nel database',
      data: updatedInvestment
    });

  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'investimento nel database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile aggiornare l\'investimento nel database'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un investimento
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
        { success: false, error: 'ID investimento mancante' },
        { status: 400 }
      );
    }

    // Elimina l'investimento dal database reale
    const success = await deleteInvestment(deleteData.id);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Investimento non trovato nel database' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investimento eliminato con successo dal database'
    });

  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'investimento dal database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile eliminare l\'investimento dal database'
      },
      { status: 500 }
    );
  }
} 