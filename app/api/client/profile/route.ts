import { NextRequest, NextResponse } from 'next/server';
import { getClient, updateClient, createClient } from '../../../../lib/data-manager';

// GET - Recupera il profilo del cliente
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!clientId && !email) {
      return NextResponse.json(
        { success: false, message: 'ID cliente o email richiesti' },
        { status: 400 }
      );
    }

    let client;
    if (clientId) {
      client = await getClient(clientId);
    } else if (email) {
      // Cerca per email (implementazione semplificata)
      client = await getClient(email);
    }

    if (!client) {
      return NextResponse.json(
        { success: false, message: 'Cliente non trovato' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        firstName: client.first_name,
        lastName: client.last_name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        position: client.position,
        address: client.address,
        city: client.city,
        country: client.country,
        postalCode: client.postal_code,
        riskProfile: client.risk_profile,
        status: client.status,
        createdAt: client.created_at,
        updatedAt: client.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nel recupero del profilo' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna il profilo del cliente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, profileData } = body;

    if (!clientId) {
      return NextResponse.json(
        { success: false, message: 'ID cliente richiesto' },
        { status: 400 }
      );
    }

    // Mappa i dati del frontend al formato del database
    const updateData = {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone,
      company: profileData.company,
      position: profileData.position,
      address: profileData.address,
      city: profileData.city,
      country: profileData.country,
      postal_code: profileData.postalCode,
      risk_profile: profileData.riskProfile,
      updated_at: new Date().toISOString()
    };

    const updatedClient = await updateClient(clientId, updateData);

    if (!updatedClient) {
      return NextResponse.json(
        { success: false, message: 'Errore nell\'aggiornamento del profilo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profilo aggiornato con successo',
      client: {
        id: updatedClient.id,
        firstName: updatedClient.first_name,
        lastName: updatedClient.last_name,
        email: updatedClient.email,
        phone: updatedClient.phone,
        company: updatedClient.company,
        position: updatedClient.position,
        address: updatedClient.address,
        city: updatedClient.city,
        country: updatedClient.country,
        postalCode: updatedClient.postal_code,
        riskProfile: updatedClient.risk_profile,
        status: updatedClient.status,
        createdAt: updatedClient.created_at,
        updatedAt: updatedClient.updated_at
      }
    });
  } catch (error) {
    console.error('Error updating client profile:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nell\'aggiornamento del profilo' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo profilo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profileData } = body;

    // Mappa i dati del frontend al formato del database
    const newClientData = {
      first_name: profileData.firstName,
      last_name: profileData.lastName,
      email: profileData.email,
      phone: profileData.phone || null,
      company: profileData.company || null,
      position: profileData.position || null,
      address: profileData.address || null,
      city: profileData.city || null,
      country: profileData.country || null,
      postal_code: profileData.postalCode || null,
      risk_profile: profileData.riskProfile || 'moderate',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newClient = await createClient(newClientData);

    return NextResponse.json({
      success: true,
      message: 'Profilo cliente creato con successo',
      client: {
        id: newClient.id,
        firstName: newClient.first_name,
        lastName: newClient.last_name,
        email: newClient.email,
        phone: newClient.phone,
        company: newClient.company,
        position: newClient.position,
        address: newClient.address,
        city: newClient.city,
        country: newClient.country,
        postalCode: newClient.postal_code,
        riskProfile: newClient.risk_profile,
        status: newClient.status,
        createdAt: newClient.created_at,
        updatedAt: newClient.updated_at
      }
    });
  } catch (error) {
    console.error('Error creating client profile:', error);
    return NextResponse.json(
      { success: false, message: 'Errore nella creazione del profilo' },
      { status: 500 }
    );
  }
}
