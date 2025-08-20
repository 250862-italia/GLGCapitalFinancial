import { NextRequest, NextResponse } from 'next/server';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/data-manager';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET - Recupera tutti i clienti
export async function GET() {
  try {
    const clients = await getClients();
    
    return NextResponse.json({
      success: true,
      clients: clients,
      total: clients.length
    });
  } catch (error) {
    console.error('Errore nel recupero clienti:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Errore nel recupero clienti',
        clients: [],
        total: 0
      },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validazione dati
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Nome ed email sono campi obbligatori' },
        { status: 400 }
      );
    }

    // Crea il nuovo cliente
    const newClient = await createClient({
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      status: body.status || 'active',
      created_at: new Date().toISOString(),
      total_investments: 0
    });

    return NextResponse.json({
      success: true,
      message: 'Cliente creato con successo',
      client: newClient
    });
  } catch (error) {
    console.error('Errore nella creazione cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Errore nella creazione del cliente' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna un cliente esistente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID cliente è richiesto' },
        { status: 400 }
      );
    }

    // Aggiorna il cliente
    const updatedClient = await updateClient(body.id, {
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

// DELETE - Elimina un cliente
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: 'ID cliente è richiesto' },
        { status: 400 }
      );
    }

    // Elimina il cliente
    const deleted = await deleteClient(body.id);

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

 