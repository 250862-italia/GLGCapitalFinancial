import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getClients, createClient as createClientLocal, updateClient, deleteClient, syncClients } from '@/lib/clients-storage';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zaeakwbpiqzhywhlqqse.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key'
);

// Semplificata verifica admin
async function verifyAdminAuth(request: NextRequest) {
  const adminToken = request.headers.get('x-admin-token');
  
  // Token semplificato per accesso admin
  if (adminToken === 'admin-access') {
    return { success: true, adminId: 'admin' };
  }
  
  return { success: false, error: 'Admin access required' };
}

// GET - Fetch all clients
export async function GET(request: NextRequest) {
  console.log('🔍 Admin clients API called');
  
  try {
    // Usa il sistema di storage locale
    const clients = getClients();
    console.log('✅ Clients fetched from local storage:', clients.length);
    
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    return NextResponse.json({ 
      error: 'Errore nel recupero dei clienti',
      clients: []
    }, { status: 500 });
  }
}

// POST - Create new client
export async function POST(request: NextRequest) {
  console.log('🔍 Admin create client API called');
  
  try {
    const body = await request.json();
    const { 
      first_name, last_name, email, phone, company, position, 
      date_of_birth, nationality, address, city, country, 
      postal_code, iban, bic, account_holder, usdt_wallet, 
      status, risk_profile 
    } = body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json({ 
        error: 'Nome, cognome e email sono obbligatori' 
      }, { status: 400 });
    }

    const clientData = {
      user_id: `user_${Date.now()}`,
      profile_id: `profile_${Date.now()}`,
      first_name,
      last_name,
      email,
      phone: phone || '',
      company: company || '',
      position: position || '',
      date_of_birth: date_of_birth || '',
      nationality: nationality || '',
      profile_photo: '',
      address: address || '',
      city: city || '',
      country: country || '',
      postal_code: postal_code || '',
      iban: iban || '',
      bic: bic || '',
      account_holder: account_holder || '',
      usdt_wallet: usdt_wallet || '',
      client_code: `CLI${Date.now()}`,
      status: status || 'active',
      risk_profile: risk_profile || 'moderate',
      investment_preferences: { type: 'balanced', sectors: ['general'] },
      total_invested: 0
    };

    // Crea il cliente nel storage locale
    const newClient = createClientLocal(clientData);
    
    console.log('✅ Client created successfully in local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Cliente creato con successo',
      client: newClient 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// PUT - Update client
export async function PUT(request: NextRequest) {
  console.log('🔍 Admin update client API called');
  
  try {
    const body = await request.json();
    const { 
      id, first_name, last_name, email, phone, company, position, 
      date_of_birth, nationality, address, city, country, 
      postal_code, iban, bic, account_holder, usdt_wallet, 
      status, risk_profile 
    } = body;

    if (!id) {
      return NextResponse.json({ 
        error: 'ID cliente richiesto' 
      }, { status: 400 });
    }

    const clientData = {
      first_name,
      last_name,
      email,
      phone: phone || '',
      company: company || '',
      position: position || '',
      date_of_birth: date_of_birth || '',
      nationality: nationality || '',
      address: address || '',
      city: city || '',
      country: country || '',
      postal_code: postal_code || '',
      iban: iban || '',
      bic: bic || '',
      account_holder: account_holder || '',
      usdt_wallet: usdt_wallet || '',
      status: status || 'active',
      risk_profile: risk_profile || 'moderate'
    };

    // Aggiorna il cliente nel storage locale
    const updatedClient = updateClient(id, clientData);
    
    if (!updatedClient) {
      return NextResponse.json({ 
        error: 'Cliente non trovato' 
      }, { status: 404 });
    }

    console.log('✅ Client updated successfully in local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Cliente aggiornato con successo',
      client: updatedClient 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
}

// DELETE - Delete client
export async function DELETE(request: NextRequest) {
  console.log('🔍 Admin delete client API called');
  
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ 
        error: 'ID cliente richiesto' 
      }, { status: 400 });
    }

    // Elimina il cliente dal storage locale
    const success = deleteClient(id);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Cliente non trovato' 
      }, { status: 404 });
    }

    console.log('✅ Client deleted successfully from local storage');
    return NextResponse.json({ 
      success: true, 
      message: 'Cliente eliminato con successo' 
    });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Errore interno del server' 
    }, { status: 500 });
  }
} 