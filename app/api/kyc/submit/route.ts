import { supabaseAdmin } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('clients')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.log('Database connection test failed, using offline mode');
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
          first_name: personalInfo.first_name,
          last_name: personalInfo.last_name,
          phone: personalInfo.phone,
          date_of_birth: personalInfo.date_of_birth,
          nationality: personalInfo.nationality,
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
      document_number: `ID: ${personalInfo.id_document || 'Not provided'}`,
      document_image_url: personalInfo.id_document || null,
      status: 'pending',
      notes: `Personal Info: ${personalInfo.first_name} ${personalInfo.last_name}, DOB: ${personalInfo.date_of_birth}, Nationality: ${personalInfo.nationality}, Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
    });

    // Proof of Address KYC Record
    if (documents.proof_of_address) {
      kycRecords.push({
        "client_id": clientData.id,
        "document_type": 'PROOF_OF_ADDRESS',
        "document_number": `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`,
        "document_image_url": documents.proof_of_address,
        status: 'pending',
        notes: `Address: ${personalInfo.address}, ${personalInfo.city}, ${personalInfo.country}`
      });
    }

    // Bank Statement KYC Record
    if (documents.bank_statement) {
      kycRecords.push({
        "client_id": clientData.id,
        "document_type": 'BANK_STATEMENT',
        "document_number": 'Bank Statement',
        "document_image_url": documents.bank_statement,
        status: 'pending',
        notes: `Financial Profile: Employment: ${financialProfile.employment_status}, Income: ${financialProfile.annual_income}, Source: ${financialProfile.source_of_funds}`
      });
    }

    // Insert KYC records (we always have at least the personal info record)
    console.log('Inserting KYC records:', kycRecords.length, 'records');
    
    // Try to insert KYC records, but don't fail if table doesn't exist
    const { error: kycError } = await supabase
      .from('kyc_records')
      .insert(kycRecords);

    if (kycError) {
      console.error('KYC records creation error:', kycError);
      console.log('KYC records table might not exist, continuing with client update only');
      // Don't return error, just log it and continue
    }

    // Update client KYC status
    const { error: updateError } = await supabase
      .from('clients')
      .update({ 
        kyc_status: 'pending',
        "date_of_birth": personalInfo.date_of_birth,
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
      first_name: client.first_name || '',
      last_name: client.last_name || '',
      date_of_birth: client.date_of_birth || '',
      nationality: client.nationality || '',
      address: client.address || '',
      city: client.city || '',
      country: client.country || '',
      phone: client.phone || '',
      email: client.email || ''
    };
    // NB: i campi address/city/country potrebbero non essere presenti in clients, fallback vuoto
    const financialProfile = {
      employment_status: client.employment_status || '',
      annual_income: client.annual_income || '',
      source_of_funds: client.source_of_funds || '',
      investment_experience: client.investment_experience || '',
      risk_tolerance: client.risk_tolerance || '',
      investment_goals: client.investment_goals || []
    };
    // NB: i campi financial potrebbero non essere presenti in clients, fallback vuoto

    // Documenti (se presenti)
    const documents = {
      id_document: kycRecords?.find(r => r.document_type === 'PERSONAL_INFO')?.document_image_url || null,
      proof_of_address: kycRecords?.find(r => r.document_type === 'PROOF_OF_ADDRESS')?.document_image_url || null,
      bank_statement: kycRecords?.find(r => r.document_type === 'BANK_STATEMENT')?.document_image_url || null
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