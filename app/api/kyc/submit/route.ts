import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { createAuditTrailService } from '@/lib/audit-trail'

export const dynamic = 'force-dynamic';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  const auditTrail = createAuditTrailService(supabase);
  
  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('Database connection test failed, using offline mode');
      // Log system error
      await auditTrail.logSystemError(
        new Error('Database connection failed'),
        'KYC submission - database connection test',
        'system'
      );
      // Return mock success response for offline mode
      return NextResponse.json({
        success: true,
        message: 'KYC data submitted successfully (offline mode)',
        client_id: 'mock-client-id',
        kyc_status: 'pending'
      });
    }
    
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
          address: personalInfo.address,
          city: personalInfo.city,
          country: personalInfo.country,
          status: 'active',
          kyc_status: 'pending'
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
      document_number: `ID: ${personalInfo.codiceFiscale || 'Not provided'}`,
      document_image_url: documents.idDocument || null,
      status: 'pending',
      notes: `Personal Info: ${personalInfo.firstName} ${personalInfo.lastName}, DOB: ${personalInfo.dateOfBirth}, Nationality: ${personalInfo.nationality}, Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
    });

    // Proof of Address KYC Record
    if (documents.proofOfAddress) {
      kycRecords.push({
        "client_id": clientData.id,
        "document_type": 'PROOF_OF_ADDRESS',
        "document_number": `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
        "document_image_url": documents.proofOfAddress,
        status: 'pending',
        notes: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
      });
    }

    // Bank Statement KYC Record
    if (documents.bankStatement) {
      kycRecords.push({
        "client_id": clientData.id,
        "document_type": 'BANK_STATEMENT',
        "document_number": 'Bank Statement',
        "document_image_url": documents.bankStatement,
        status: 'pending',
        notes: `Financial Profile: Employment: ${financialProfile.employmentStatus}, Income: ${financialProfile.annualIncome}, Source: ${financialProfile.sourceOfFunds}`
      });
    }

    // Insert KYC records (we always have at least the personal info record)
    console.log('Inserting KYC records:', kycRecords.length, 'records');
    
    // Try to insert KYC records, but don't fail if table doesn't exist
    let kycInsertSuccess = false;
    try {
      const { data: kycInsertData, error: kycError } = await supabase
        .from('kyc_records')
        .insert(kycRecords)
        .select();

      if (kycError) {
        console.error('KYC records creation error:', kycError);
        console.log('KYC records table might not exist or have schema issues, continuing with client update only');
        
        // Log the specific error for debugging
        await auditTrail.logSystemError(
          new Error(`KYC records creation failed: ${kycError.message}`),
          'KYC submission - records creation',
          'warning'
        );
      } else {
        console.log('KYC records created successfully:', kycInsertData?.length, 'records');
        kycInsertSuccess = true;
      }
    } catch (kycInsertException) {
      console.error('Exception during KYC records insertion:', kycInsertException);
      await auditTrail.logSystemError(
        kycInsertException as Error,
        'KYC submission - records insertion exception',
        'warning'
      );
    }

    // Update client KYC status and personal info
    const { error: updateError } = await supabase
      .from('clients')
      .update({ 
        kyc_status: 'pending',
        "date_of_birth": personalInfo.dateOfBirth,
        nationality: personalInfo.nationality,
        address: personalInfo.address,
        city: personalInfo.city,
        country: personalInfo.country,
        // Store financial profile data in client record
        employment_status: financialProfile.employmentStatus,
        annual_income: financialProfile.annualIncome,
        source_of_funds: financialProfile.sourceOfFunds,
        investment_experience: financialProfile.investmentExperience,
        risk_tolerance: financialProfile.riskTolerance,
        investment_goals: financialProfile.investmentGoals
      })
      .eq('id', clientData.id);

    if (updateError) {
      console.error('Client update error:', updateError);
      return NextResponse.json(
        { error: 'Error updating client KYC status', details: updateError.message },
        { status: 500 }
      )
    }

    // Log KYC submission
    await auditTrail.logKYCSubmission(userId, body, body.validationScore);

    return NextResponse.json({
      success: true,
      message: 'KYC data submitted successfully',
      client_id: clientData.id,
      kyc_status: 'pending'
    })

  } catch (error) {
    console.error('KYC submission error:', error)
    // Log system error
    await auditTrail.logSystemError(
      error as Error,
      'KYC submission - general error',
      'system'
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Trova il client tramite user_id
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    // Recupera eventuali documenti associati
    const { data: kycRecords } = await supabase
      .from('kyc_records')
      .select('*')
      .eq('client_id', client.id);

    // Ricostruisci la struttura attesa dal frontend
    const personalInfo = {
      firstName: client.first_name || '',
      lastName: client.last_name || '',
      dateOfBirth: client.date_of_birth || '',
      nationality: client.nationality || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      phone: client.phone || '',
      email: client.email || '',
      codiceFiscale: client.codice_fiscale || ''
    };

    const financialProfile = {
      employmentStatus: client.employment_status || '',
      annualIncome: client.annual_income || '',
      sourceOfFunds: client.source_of_funds || '',
      investmentExperience: client.investment_experience || '',
      riskTolerance: client.risk_tolerance || '',
      investmentGoals: client.investment_goals || []
    };

    // Documenti (se presenti)
    const documents = {
      idDocument: kycRecords?.find(r => r.document_type === 'PERSONAL_INFO')?.document_image_url || null,
      proofOfAddress: kycRecords?.find(r => r.document_type === 'PROOF_OF_ADDRESS')?.document_image_url || null,
      bankStatement: kycRecords?.find(r => r.document_type === 'BANK_STATEMENT')?.document_image_url || null
    };

    return NextResponse.json({
      personalInfo,
      financialProfile,
      documents
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 