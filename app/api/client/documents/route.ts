import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsByClient, createDocument } from '../../../../lib/data-manager';

// GET - Recupera i documenti di un cliente specifico
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const clientEmail = searchParams.get('clientEmail');
    
    if (!clientId && !clientEmail) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'clientId o clientEmail sono richiesti' 
        },
        { status: 400 }
      );
    }

    // TODO: Implementare autenticazione cliente per sicurezza
    // Per ora accettiamo qualsiasi clientId/email per testing
    
    let documents = [];
    if (clientId) {
      documents = await getDocumentsByClient(clientId);
    } else if (clientEmail) {
      // TODO: Prima recuperare clientId da email, poi documenti
      // Per ora restituiamo array vuoto
      documents = [];
    }
    
    return NextResponse.json({
      success: true,
      message: 'Documenti cliente caricati con successo dal database',
      data: {
        documents,
        total: documents.length
      }
    });
  } catch (error) {
    console.error('Errore nel caricamento documenti cliente:', error);
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

// POST - Crea un nuovo documento per un cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validazione input
    if (!body.client_id || !body.name || !body.file_type || !body.file_size || !body.file_path) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Dati mancanti: client_id, name, file_type, file_size, file_path sono obbligatori' 
        },
        { status: 400 }
      );
    }

    const documentData = {
      client_id: body.client_id,
      name: body.name,
      file_type: body.file_type,
      file_size: body.file_size,
      file_path: body.file_path,
      status: 'pending', // I documenti dei clienti iniziano sempre in pending
      notes: body.notes || ''
    };

    const newDocument = await createDocument(documentData);
    
    return NextResponse.json({
      success: true,
      message: 'Documento caricato con successo e in attesa di approvazione',
      data: newDocument
    }, { status: 201 });
    
  } catch (error) {
    console.error('Errore nel caricamento documento:', error);
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
