import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getMockData } from '@/lib/fallback-data';

export const dynamic = 'force-dynamic';



export async function GET() {
  try {
    // First get all clients without join to avoid RLS recursion
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (clientsError) {
      console.log('Supabase error, using fallback data:', clientsError.message);
      return NextResponse.json(getMockData('clients'));
    }

    // Then get users separately
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, last_login, created_at, updated_at')
      .in('id', clients?.map(c => c.user_id) || []);

    if (usersError) {
      console.log('Supabase error, using fallback data:', usersError.message);
      return NextResponse.json(getMockData('clients'));
    }

    // Combine the data
    const userMap = new Map(users?.map(u => [u.id, u]) || []);
    const data = clients?.map(client => ({
      ...client,
      user: userMap.get(client.user_id)
    })) || [];

    // Trasformo i dati per includere tutti i campi
    const transformedData = data?.map(client => ({
      // Campi da clients
      id: client.id,
      user_id: client.user_id,
      first_name: client.first_name,
      last_name: client.last_name,
      phone: client.phone,
      date_of_birth: client.date_of_birth,
      nationality: client.nationality,
      address: client.address,
      city: client.city,
      country: client.country,
      postal_code: client.postal_code,
      profile_photo: client.profile_photo,
      banking_details: client.banking_details,
      created_at: client.created_at,
      updated_at: client.updated_at,
      status: client.status,
      // Campi da users
      email: client.user?.email,
      user_role: client.user?.role,
      is_active: client.user?.is_active,
      last_login: client.user?.last_login,
      user_created_at: client.user?.created_at,
      user_updated_at: client.user?.updated_at
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error);
    console.log('Using fallback data due to exception');
    return NextResponse.json(getMockData('clients'));
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('clients')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating client:', error);
      return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/admin/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting client:', error);
      return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 