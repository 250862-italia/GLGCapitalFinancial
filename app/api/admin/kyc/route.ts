import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('kyc_records')
      .select(`
        *,
        clients!inner(
          "firstName",
          "lastName",
          email,
          phone,
          "dateOfBirth",
          nationality
        )
      `)
      .order('"createdAt"', { ascending: false });

    if (error) {
      console.error('Error fetching KYC records:', error);
      return NextResponse.json({ error: 'Failed to fetch KYC records' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in KYC GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    if (status === 'approved') {
      updateData.verifiedAt = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('kyc_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating KYC record:', error);
      return NextResponse.json({ error: 'Failed to update KYC record' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in KYC PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 