import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { document_id, user_id } = body;

    if (!document_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: document_id, user_id' },
        { status: 400 }
      );
    }

    // Get current client profile
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('kyc_documents')
      .eq('user_id', user_id)
      .single();

    if (clientError) {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Failed to fetch client profile' },
        { status: 500 }
      );
    }

    if (!clientData?.kyc_documents) {
      return NextResponse.json(
        { error: 'No KYC documents found' },
        { status: 404 }
      );
    }

    // Find the document to delete
    const documentToDelete = clientData.kyc_documents.find(
      (doc: any) => doc.id === document_id
    );

    if (!documentToDelete) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Remove document from storage
    try {
      // Extract file path from URL
      const urlParts = documentToDelete.url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `kyc-documents/${user_id}/${fileName}`;

      const { error: storageError } = await supabase.storage
        .from('kyc-documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database update even if storage delete fails
      }
    } catch (storageError) {
      console.error('Error deleting from storage:', storageError);
      // Continue with database update
    }

    // Remove document from database
    const updatedDocuments = clientData.kyc_documents.filter(
      (doc: any) => doc.id !== document_id
    );

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        kyc_documents: updatedDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating client KYC documents:', updateError);
      return NextResponse.json(
        { error: 'Failed to update client profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error in KYC document deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 