import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const document = formData.get('document') as File;
    const documentType = formData.get('document_type') as string;
    const userId = formData.get('user_id') as string;

    if (!document || !documentType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: document, document_type, user_id' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(document.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (document.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = document.name.split('.').pop();
    const fileName = `kyc-documents/${userId}/${documentType}_${uuidv4()}.${fileExtension}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, document, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload document to storage' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    // Create document record
    const documentId = uuidv4();
    const documentRecord = {
      id: documentId,
      type: documentType,
      filename: document.name,
      url: urlData.publicUrl,
      uploaded_at: new Date().toISOString(),
      status: 'pending'
    };

    // Get current client profile
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('kyc_documents')
      .eq('user_id', userId)
      .single();

    if (clientError && clientError.code !== 'PGRST116') {
      console.error('Error fetching client:', clientError);
      return NextResponse.json(
        { error: 'Failed to fetch client profile' },
        { status: 500 }
      );
    }

    // Update or create kyc_documents field
    const currentDocuments = clientData?.kyc_documents || [];
    const updatedDocuments = [...currentDocuments, documentRecord];

    const { error: updateError } = await supabase
      .from('clients')
      .update({
        kyc_documents: updatedDocuments,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating client KYC documents:', updateError);
      return NextResponse.json(
        { error: 'Failed to update client profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document_id: documentId,
      document_url: urlData.publicUrl,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Error in KYC document upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 