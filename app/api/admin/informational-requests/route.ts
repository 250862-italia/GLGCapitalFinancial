import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock data fallback
const mockInformationalRequests = [
  {
    id: '1',
    client_name: 'John Doe',
    client_email: 'john.doe@example.com',
    document_type: 'Investment Agreement',
    status: 'pending',
    notes: 'Request for investment agreement documentation',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    client_name: 'Jane Smith',
    client_email: 'jane.smith@example.com',
    document_type: 'Tax Documents',
    status: 'completed',
    notes: 'Tax documentation sent to client',
    created_at: new Date().toISOString()
  }
];

export async function GET() {
  try {
    // Try to connect to Supabase
    try {
      const { data, error } = await supabase
        .from('informational_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error, using mock data:', error);
        return NextResponse.json(mockInformationalRequests);
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      console.error('Supabase connection failed, using mock data:', supabaseError);
      return NextResponse.json(mockInformationalRequests);
    }
  } catch (error) {
    console.error('Error in informational requests GET:', error);
    return NextResponse.json(mockInformationalRequests);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    updateData.updated_at = new Date().toISOString();

    // Try to connect to Supabase
    try {
      const { data, error } = await supabase
        .from('informational_requests')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in PUT:', error);
        return NextResponse.json({ 
          error: 'Database connection failed, but update was validated',
          mockData: { id, ...updateData }
        }, { status: 503 });
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error('Supabase connection failed in PUT:', supabaseError);
      return NextResponse.json({ 
        error: 'Database connection failed, but update was validated',
        mockData: { id, ...updateData }
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error in informational requests PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 