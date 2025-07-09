import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;
    const userId = formData.get('userId') as string;
    const documentType = formData.get('documentType') as string;

    if (!file || !userId || !documentType) {
      return NextResponse.json(
        { error: 'File, user ID, and document type are required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload JPEG, PNG, or PDF files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Get client ID
    let { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (clientError || !clientData) {
      // Try to create client if not found
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          email: '',
          first_name: '',
          last_name: '',
          phone: '',
          date_of_birth: null,
          nationality: '',
          status: 'active',
          kyc_status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();
      if (createError || !newClient) {
        return NextResponse.json(
          { error: 'Failed to create client record. Please try registering again.' },
          { status: 500 }
        );
      }
      clientData = newClient;
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${clientData.id}/${documentType}/${Date.now()}_${file.name}`;
    const filePath = `kyc-documents/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(filePath);

    // Create or update KYC record
    const kycRecord = {
      "client_id": clientData.id,
      "document_type": documentType,
      "document_number": `${documentType}_${Date.now()}`,
      "document_image_url": urlData.publicUrl,
      status: 'pending',
      notes: `Document uploaded: ${file.name}`
    };

    // Check if KYC record already exists for this document type
    const { data: existingRecord } = await supabase
      .from('kyc_records')
      .select('id')
      .eq('client_id', clientData.id)
      .eq('document_type', documentType)
      .single();

    let result;
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from('kyc_records')
        .update({
          "document_image_url": urlData.publicUrl,
          "document_number": `${documentType}_${Date.now()}`,
          status: 'pending',
          notes: `Document updated: ${file.name}`,
          "updated_at": new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (error) {
        console.error('KYC record update error:', error);
        return NextResponse.json(
          { error: 'Failed to update KYC record' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new record
      const { data, error } = await supabase
        .from('kyc_records')
        .insert(kycRecord)
        .select()
        .single();

      if (error) {
        console.error('KYC record creation error:', error);
        return NextResponse.json(
          { error: 'Failed to create KYC record' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
      documentUrl: urlData.publicUrl,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 