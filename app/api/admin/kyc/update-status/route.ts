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

    // Get current client data
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('kyc_documents')
      .eq('id', client_id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!clientData.kyc_documents || !Array.isArray(clientData.kyc_documents)) {
      return NextResponse.json(
        { error: 'No KYC documents found for this client' },
        { status: 404 }
      );
    }

    // Update the specific document status
    const updatedDocuments = clientData.kyc_documents.map((doc: any) => {
      if (doc.id === document_id) {
        return {
          ...doc,
          status: status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: authResult.user.id
        };
      }
      return doc;
    });

    // Check if document was found
    const documentExists = updatedDocuments.some((doc: any) => doc.id === document_id);
    if (!documentExists) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Update the client's KYC documents
    const { error: updateError } = await supabase
      .from('clients')
      .update({
        kyc_documents: updatedDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('id', client_id);

    if (updateError) {
      console.error('Error updating KYC document status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document status' },
        { status: 500 }
      );
    }

    // Send notification email to client (optional)
    try {
      const { data: clientInfo } = await supabase
        .from('clients')
        .select('email, first_name, last_name')
        .eq('id', client_id)
        .single();

      if (clientInfo) {
        // Here you would send an email notification to the client
        console.log(`KYC document ${status} for client ${clientInfo.email}`);
        
        // Example email notification (implement your email service)
        // await sendEmail({
        //   to: clientInfo.email,
        //   subject: `KYC Document ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        //   template: 'kyc-status-update',
        //   data: {
        //     name: `${clientInfo.first_name} ${clientInfo.last_name}`,
        //     status: status,
        //     documentId: document_id
        //   }
        // });
      }
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Document ${status} successfully`,
      document_id: document_id,
      status: status
    });

  } catch (error) {
    console.error('Error in KYC update status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 