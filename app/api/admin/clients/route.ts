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
    if (!body.first_name || !body.last_name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Nome, cognome ed email sono campi obbligatori' },
        { status: 400 }
      );
    }

    // Crea il nuovo cliente
    const newClient = await createClient({
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      position: body.position || '',
      address: body.address || '',
      city: body.city || '',
      country: body.country || '',
      postal_code: body.postal_code || '',
      risk_profile: body.risk_profile || 'moderate',
      status: body.status || 'active',
      date_of_birth: body.date_of_birth || '',
      nationality: body.nationality || '',
      iban: body.iban || '',
      bic: body.bic || '',
      account_holder: body.account_holder || '',
      usdt_wallet: body.usdt_wallet || ''
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
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone || '',
      company: body.company || '',
      position: body.position || '',
      address: body.address || '',
      city: body.city || '',
      country: body.country || '',
      postal_code: body.postal_code || '',
      risk_profile: body.risk_profile || 'moderate',
      status: body.status || 'active',
      date_of_birth: body.date_of_birth || '',
      nationality: body.nationality || '',
      iban: body.iban || '',
      bic: body.bic || '',
      account_holder: body.account_holder || '',
      usdt_wallet: body.usdt_wallet || ''
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID cliente è richiesto' },
        { status: 400 }
      );
    }

    const success = await deleteClient(id);
    
    if (!success) {
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

 