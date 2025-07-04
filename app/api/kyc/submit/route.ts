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

    // Get client_id from user_id
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (clientError || !clientData) {
      console.error('Client lookup error:', clientError);
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Save KYC records for each document type
    const kycRecords = [];

    // Personal Information KYC Record
    if (personalInfo.idDocument) {
      kycRecords.push({
        client_id: clientData.id,
        document_type: 'ID_DOCUMENT',
        document_number: personalInfo.idDocument,
        document_image_url: personalInfo.idDocument, // For now, using the filename as URL
        status: 'pending',
        notes: `Personal Info: ${personalInfo.firstName} ${personalInfo.lastName}, DOB: ${personalInfo.dateOfBirth}, Nationality: ${personalInfo.nationality}`
      });
    }

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

    // Insert KYC records
    if (kycRecords.length > 0) {
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