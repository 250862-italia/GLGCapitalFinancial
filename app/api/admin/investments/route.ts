import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Mock data fallback
const mockInvestments = [
  {
    id: '1',
    client_id: 'client1',
    package_id: 'package1',
    amount: 5000,
    status: 'active',
    start_date: '2024-01-15',
    end_date: '2024-02-15',
    total_returns: 250,
    daily_returns: 8.33,
    payment_method: 'bank',
    transaction_id: 'TXN001',
    notes: 'Standard investment package',
    created_at: new Date().toISOString(),
    clients: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    }
  },
  {
    id: '2',
    client_id: 'client2',
    package_id: 'package2',
    amount: 10000,
    status: 'completed',
    start_date: '2024-01-01',
    end_date: '2024-02-01',
    total_returns: 500,
    daily_returns: 16.67,
    payment_method: 'usdt',
    transaction_id: 'TXN002',
    notes: 'Premium investment package',
    created_at: new Date().toISOString(),
    clients: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321'
    }
  }
];

export async function GET() {
  try {
    // Try to connect to Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('investments')
        .select(`
          *,
          clients!inner(
            "firstName",
            "lastName",
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error, using mock data:', error);
        return NextResponse.json(mockInvestments);
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      console.error('Supabase connection failed, using mock data:', supabaseError);
      return NextResponse.json(mockInvestments);
    }
  } catch (error) {
    console.error('Error in investments GET:', error);
    return NextResponse.json(mockInvestments);
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
      const { data, error } = await supabaseAdmin
        .from('investments')
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
    console.error('Error in investments PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 