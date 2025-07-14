import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface InformationalRequest {
  id: string;
  client_name: string;
  client_email: string;
  document_type: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('informational_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch informational requests: ${error.message}`);
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error('Error in informational requests GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch informational requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_name, client_email, document_type, notes } = body;

    if (!client_name || !client_email || !document_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('informational_requests')
      .insert([{
        client_name,
        client_email,
        document_type,
        status: 'pending',
        notes: notes || ''
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create informational request: ${error.message}`);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in informational requests POST:', error);
    return NextResponse.json(
      { error: 'Failed to create informational request' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing request ID' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('informational_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update informational request: ${error.message}`);
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in informational requests PUT:', error);
    return NextResponse.json(
      { error: 'Failed to update informational request' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing request ID' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('informational_requests')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete informational request: ${error.message}`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in informational requests DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete informational request' },
      { status: 500 }
    );
  }
} 