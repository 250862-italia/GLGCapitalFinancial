import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Mock data fallback
const mockKYCRecords = [
  {
    id: '1',
    client_id: 'client1',
    document_type: 'PERSONAL_INFO',
    document_url: 'https://example.com/doc1.pdf',
    status: 'pending',
    notes: 'Document submitted for review',
    created_at: new Date().toISOString(),
    clients: {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      date_of_birth: '1990-01-01',
      nationality: 'US'
    }
  },
  {
    id: '2',
    client_id: 'client2',
    document_type: 'PROOF_OF_ADDRESS',
    document_url: 'https://example.com/doc2.pdf',
    status: 'approved',
    notes: 'Address verification completed',
    created_at: new Date().toISOString(),
    clients: {
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      phone: '+0987654321',
      date_of_birth: '1985-05-15',
      nationality: 'UK'
    }
  }
];

export async function GET() {
  try {
    // Try to connect to Supabase
    try {
      // First, get KYC records from kyc_records table
      const { data: kycRecords, error: kycError } = await supabaseAdmin
        .from('kyc_records')
        .select(`
          *,
          clients!inner(
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            nationality
          )
        `)
        .order('"created_at"', { ascending: false });

      // Then, get clients with KYC data in their profile
      const { data: clientsWithKYC, error: clientsError } = await supabaseAdmin
        .from('clients')
        .select('*')
        .not('kyc_data', 'is', null)
        .order('updated_at', { ascending: false });

      if (kycError && clientsError) {
        console.error('Supabase error, using mock data:', { kycError, clientsError });
        return NextResponse.json(mockKYCRecords);
      }

      // Combine and deduplicate data
      const allKYCData = [];

      // Add KYC records from kyc_records table
      if (kycRecords && kycRecords.length > 0) {
        allKYCData.push(...kycRecords);
      }

      // Add KYC data from client profiles
      if (clientsWithKYC && clientsWithKYC.length > 0) {
        for (const client of clientsWithKYC) {
          try {
            const kycData = JSON.parse(client.kyc_data);
            if (kycData.personalInfo) {
              // Create a KYC record from profile data
              allKYCData.push({
                id: `profile-${client.id}`,
                client_id: client.id,
                document_type: 'PROFILE_KYC',
                document_number: 'Complete KYC Profile',
                document_image_url: kycData.documents?.idDocument || null,
                status: client.kyc_status || 'pending',
                notes: `Profile KYC: ${kycData.personalInfo.firstName} ${kycData.personalInfo.lastName}`,
                created_at: kycData.submittedAt || client.created_at,
                updated_at: client.updated_at,
                clients: {
                  first_name: client.first_name,
                  last_name: client.last_name,
                  email: client.email,
                  phone: client.phone,
                  date_of_birth: client.date_of_birth,
                  nationality: client.nationality
                },
                // Add full KYC data for detailed view
                full_kyc_data: kycData
              });
            }
          } catch (parseError) {
            console.error('Error parsing KYC data for client:', client.id, parseError);
          }
        }
      }

      // Remove duplicates (prefer kyc_records over profile data)
      const uniqueData = allKYCData.filter((item, index, self) => 
        index === self.findIndex(t => t.client_id === item.client_id && t.document_type === item.document_type)
      );

      return NextResponse.json(uniqueData || []);
    } catch (supabaseError) {
      console.error('Supabase connection failed, using mock data:', supabaseError);
      return NextResponse.json(mockKYCRecords);
    }
  } catch (error) {
    console.error('Error in KYC GET:', error);
    return NextResponse.json(mockKYCRecords);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'approved') {
      updateData.verified_at = new Date().toISOString();
    }

    // Check if this is a profile-based KYC record
    if (id.startsWith('profile-')) {
      const clientId = id.replace('profile-', '');
      
      // Update client's KYC status
      const { data: clientData, error: clientError } = await supabaseAdmin
        .from('clients')
        .update({ 
          kyc_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (clientError) {
        console.error('Supabase error updating client KYC status:', clientError);
        return NextResponse.json({ 
          error: 'Database connection failed, but update was validated',
          mockData: { id, ...updateData }
        }, { status: 503 });
      }

      return NextResponse.json({ ...clientData, document_type: 'PROFILE_KYC' });
    } else {
      // Regular KYC record update
      const { data, error } = await supabaseAdmin
        .from('kyc_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in PUT:', error);
        return NextResponse.json({ 
          error: 'Database connection failed, but update was validated',
          mockData: { id, ...updateData }
        }, { status: 503 });
      }

      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Error in KYC PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 