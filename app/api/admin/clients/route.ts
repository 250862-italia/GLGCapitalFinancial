import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select(`
        *,
        users!inner(email, first_name, last_name, role, isActive, lastLogin)
      `)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
    }

    // Transform data to match expected format
    const transformedData = data?.map(client => ({
      id: client.id,
      first_name: client.first_name || client.users?.first_name,
      last_name: client.last_name || client.users?.last_name,
      email: client.email,
      phone: client.phone,
      dateOfBirth: client.dateOfBirth,
      nationality: client.nationality,
      kycStatus: client.kycStatus,
      status: client.status,
      createdAt: client.createdAt,
      user: client.users
    })) || [];

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in GET /api/admin/clients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
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

    const { error } = await supabase
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