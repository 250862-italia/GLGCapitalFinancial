import { NextRequest, NextResponse } from 'next/server';
import { getDocumentsByClient } from '@/lib/data-manager';

interface ClientDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'other';
  size: string;
  uploadedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientEmail = searchParams.get('clientEmail');
    const clientId = searchParams.get('clientId');

    if (!clientEmail && !clientId) {
      return NextResponse.json(
        { success: false, error: 'Email o ID cliente richiesti' },
        { status: 400 }
      );
    }

    // Recupera i documenti del cliente dal database
    const documents = await getDocumentsByClient(clientId || clientEmail || '');

    // Mappa i documenti al formato dell'interfaccia
    const clientDocuments: ClientDocument[] = documents.map((doc: any) => ({
      id: doc.id,
      name: doc.name,
      type: doc.file_type as 'pdf' | 'doc' | 'image' | 'other',
      size: formatFileSize(doc.file_size),
      uploadedAt: new Date(doc.uploaded_at).toLocaleDateString('it-IT'),
      status: doc.status,
      notes: doc.notes || ''
    }));

    // Se non ci sono documenti nel database, crea documenti di esempio basati sui dati del cliente
    if (clientDocuments.length === 0) {
      const exampleDocuments: ClientDocument[] = [
        {
          id: 'example-1',
          name: 'Documento_Identita.pdf',
          type: 'pdf',
          size: '2.5 MB',
          uploadedAt: new Date().toLocaleDateString('it-IT'),
          status: 'pending',
          notes: 'Documento di identità richiesto per KYC'
        },
        {
          id: 'example-2',
          name: 'Certificato_Residenza.pdf',
          type: 'pdf',
          size: '1.8 MB',
          uploadedAt: new Date().toLocaleDateString('it-IT'),
          status: 'pending',
          notes: 'Certificato di residenza per verifica indirizzo'
        }
      ];
      
      return NextResponse.json({
        success: true,
        message: 'Documenti del cliente recuperati (esempi)',
        data: {
          documents: exampleDocuments,
          total: exampleDocuments.length,
          note: 'Questi sono documenti di esempio. Carica i tuoi documenti reali per iniziare.'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Documenti del cliente recuperati con successo',
      data: {
        documents: clientDocuments,
        total: clientDocuments.length
      }
    });

  } catch (error) {
    console.error('Errore nel recupero dei documenti del cliente:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore di connessione al database',
        message: 'Impossibile recuperare i documenti'
      },
      { status: 500 }
    );
  }
}

// POST - Carica un nuovo documento
export async function POST(request: NextRequest) {
  try {
    const documentData = await request.json();
    
    // Validazione dei dati richiesti
    if (!documentData.name || !documentData.client_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nome documento e ID cliente sono richiesti' 
        },
        { status: 400 }
      );
    }

    // In un sistema reale, qui gestiresti l'upload del file
    // Per ora, simuliamo la creazione del documento
    const newDocument = {
      id: Date.now().toString(),
      name: documentData.name,
      type: documentData.type || 'pdf',
      size: documentData.size || '1.0 MB',
      uploadedAt: new Date().toLocaleDateString('it-IT'),
      status: 'pending' as const,
      notes: documentData.notes || 'Documento caricato dal cliente'
    };

    return NextResponse.json({
      success: true,
      message: 'Documento caricato con successo! Sarà revisionato dall\'amministrazione.',
      data: newDocument
    }, { status: 201 });

  } catch (error) {
    console.error('Errore nel caricamento del documento:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore interno del server',
        message: 'Impossibile caricare il documento. Riprova più tardi.'
      },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
