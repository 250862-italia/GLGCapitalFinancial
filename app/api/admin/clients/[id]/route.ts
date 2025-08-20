import { NextRequest, NextResponse } from 'next/server';
import { getClient, updateClient, deleteClient } from '@/lib/data-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Recupera un cliente specifico per ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await getClient(params.id);
    
    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      client: client
    });
  } catch (error) {
    console.error('Errore nel recupero cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nel recupero del cliente' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un cliente specifico
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validazione dati
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Nome ed email sono campi obbligatori' },
        { status: 400 }
      );
    }

    // Aggiorna il cliente
    const updatedClient = await updateClient(params.id, {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      status: body.status || 'active'
    });

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente aggiornato con successo',
      client: updatedClient
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'aggiornamento del cliente' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un cliente specifico
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Elimina il cliente
    const deleted = await deleteClient(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente eliminato con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nell\'eliminazione del cliente' },
      { status: 500 }
    );
  }
}
