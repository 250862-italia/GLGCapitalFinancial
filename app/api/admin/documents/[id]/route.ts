import { NextRequest, NextResponse } from 'next/server';
import { getDocument, updateDocument, deleteDocument } from '../../../../../lib/data-manager';

// GET - Recupera un documento specifico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await getDocument(params.id);
    
    if (!document) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Documento non trovato' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documento recuperato con successo',
      data: document
    });
  } catch (error) {
    console.error('Errore nel recupero documento:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore di connessione al database',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un documento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validazione input
    if (!body.status && !body.notes) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dati mancanti: almeno status o notes devono essere forniti' 
        },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (body.status) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;

    const updatedDocument = await updateDocument(params.id, updates);
    
    if (!updatedDocument) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Documento non trovato o errore nell\'aggiornamento' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documento aggiornato con successo',
      data: updatedDocument
    });
    
  } catch (error) {
    console.error('Errore nell\'aggiornamento documento:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore di connessione al database',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteDocument(params.id);
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Documento non trovato o errore nell\'eliminazione' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documento eliminato con successo'
    });
    
  } catch (error) {
    console.error('Errore nell\'eliminazione documento:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Errore di connessione al database',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
