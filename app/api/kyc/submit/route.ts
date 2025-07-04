import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const body = await request.json()
    const {
      userId,
      personalInfo,
      financialProfile,
      documents,
      verification
    } = body

    // Validation
    if (!userId || !personalInfo || !financialProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get client_id from user_id or email
    let clientData = null;
    let clientError = null;

    // First try to find by user_id
    const { data: clientByUserId, error: errorByUserId } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (clientByUserId) {
      clientData = clientByUserId;
    } else {
      // If not found by user_id, try to find by email
      const { data: clientByEmail, error: errorByEmail } = await supabase
        .from('clients')
        .select('id')
        .eq('email', personalInfo.email)
        .single();

      if (clientByEmail) {
        clientData = clientByEmail;
      } else {
        clientError = errorByEmail || errorByUserId;
      }
    }

    if (clientError || !clientData) {
      console.error('Client lookup error:', clientError);
      console.error('Tried to find client with userId:', userId, 'and email:', personalInfo.email);
      
      // Try to create a client if not found
      console.log('Attempting to create client for email:', personalInfo.email);
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          user_id: userId,
          email: personalInfo.email,
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          phone: personalInfo.phone,
          date_of_birth: personalInfo.dateOfBirth,
          nationality: personalInfo.nationality,
          status: 'active',
          kycStatus: 'pending'
        })
        .select('id')
        .single();

      if (createError || !newClient) {
        console.error('Client creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create client record. Please try registering again.' },
          { status: 500 }
        )
      }

      clientData = newClient;
      console.log('Created new client with ID:', newClient.id);
    }

    // Save KYC records for each document type
    const kycRecords = [];

    // Personal Information KYC Record (always create this one)
    kycRecords.push({
      client_id: clientData.id,
      document_type: 'PERSONAL_INFO',
      document_number: `ID: ${personalInfo.idDocument || 'Not provided'}`,
      document_image_url: personalInfo.idDocument || null,
      status: 'pending',
      notes: `Personal Info: ${personalInfo.firstName} ${personalInfo.lastName}, DOB: ${personalInfo.dateOfBirth}, Nationality: ${personalInfo.nationality}, Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
    });

    // Proof of Address KYC Record
    if (documents.proofOfAddress) {
      kycRecords.push({
        client_id: clientData.id,
        document_type: 'PROOF_OF_ADDRESS',
        document_number: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
        document_image_url: documents.proofOfAddress,
        status: 'pending',
        notes: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
      });
    }

    // Bank Statement KYC Record
    if (documents.bankStatement) {
      kycRecords.push({
        client_id: clientData.id,
        document_type: 'BANK_STATEMENT',
        document_number: 'Bank Statement',
        document_image_url: documents.bankStatement,
        status: 'pending',
        notes: `Financial Profile: Employment: ${financialProfile.employmentStatus}, Income: ${financialProfile.annualIncome}, Source: ${financialProfile.sourceOfFunds}`
      });
    }

    // Insert KYC records (we always have at least the personal info record)
    console.log('Inserting KYC records:', kycRecords.length, 'records');
    const { error: kycError } = await supabase
      .from('kyc_records')
      .insert(kycRecords);

    if (kycError) {
      console.error('KYC records creation error:', kycError);
      return NextResponse.json(
        { error: 'Error saving KYC records', details: kycError.message },
        { status: 500 }
      )
    }

    // Update client KYC status
    const { error: updateError } = await supabase
      .from('clients')
      .update({ 
        kycStatus: 'pending',
        date_of_birth: personalInfo.dateOfBirth,
        nationality: personalInfo.nationality
      })
      .eq('id', clientData.id);

    if (updateError) {
      console.error('Client update error:', updateError);
      return NextResponse.json(
        { error: 'Error updating client KYC status', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'KYC data submitted successfully',
      client_id: clientData.id,
      kyc_status: 'pending'
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 