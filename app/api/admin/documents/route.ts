import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, createDocument } from '../../../../lib/data-manager';

// GET - Recupera tutti i documenti
export async function GET(request: NextRequest) {
  try {
    const documents = await getDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Documenti caricati con successo dal database',
      data: {
        documents,
        total: documents.length
      }
    });
  } catch (error) {
    console.error('Errore nel caricamento documenti:', error);
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

// POST - Crea un nuovo documento
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
      status: body.status || 'pending',
      notes: body.notes || ''
    };

    const newDocument = await createDocument(documentData);
    
    return NextResponse.json({
      success: true,
      message: 'Documento creato con successo',
      data: newDocument
    }, { status: 201 });
    
  } catch (error) {
    console.error('Errore nella creazione documento:', error);
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
