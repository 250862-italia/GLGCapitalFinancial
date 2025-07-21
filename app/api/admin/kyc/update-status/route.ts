import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-auth';

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { client_id, document_id, status } = await request.json();

    if (!client_id || !document_id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: client_id, document_id, status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Verify client exists (without accessing kyc_documents column)
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id, user_id, first_name, last_name, email')
      .eq('id', client_id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!clientData) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // For now, return a message that KYC document status updates are not yet implemented
    // TODO: Implement proper KYC document management when the column/table is created

    return NextResponse.json({
      success: false,
      message: 'KYC document status update not yet implemented. The kyc_documents column does not exist in the database.',
      note: 'This feature will be available once the KYC documents system is properly implemented.',
      client_info: {
        id: clientData.id,
        name: `${clientData.first_name} ${clientData.last_name}`,
        email: clientData.email
      }
    }, { status: 501 }); // 501 Not Implemented

  } catch (error) {
    console.error('Error in KYC update status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 