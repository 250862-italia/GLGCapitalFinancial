import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json();
    const { document_id, user_id } = body;

    if (!document_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: document_id, user_id' },
        { status: 400 }
      );
    }

    // Verify client exists (without accessing kyc_documents column)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id, first_name, last_name')
      .eq('user_id', user_id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Failed to fetch client profile' },
        { status: 500 }
      );
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // For now, return a message that KYC documents are not yet implemented
    // TODO: Implement proper KYC document management when the column/table is created

    return NextResponse.json({
      success: false,
      message: 'KYC document deletion not yet implemented. The kyc_documents column does not exist in the database.',
      note: 'This feature will be available once the KYC documents system is properly implemented.'
    }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
    console.error('Error in KYC document deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 