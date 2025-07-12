import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export async function GET(request: NextRequest) {
  try {
    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      const kycRecords = await db.getAllKYCRecords();
      
      // Get user details for each KYC record
      const kycWithUserDetails = await Promise.all(
        kycRecords.map(async (kyc) => {
          const user = await db.getUserById(kyc.user_id);
          const client = await db.getClientByUserId(kyc.user_id);
          
          return {
            id: kyc.id,
            user_id: kyc.user_id,
            status: kyc.status,
            document_type: kyc.document_type,
            document_url: kyc.document_url,
            verification_data: kyc.verification_data ? JSON.parse(kyc.verification_data) : null,
            created_at: kyc.created_at,
            updated_at: kyc.updated_at,
            user: user ? {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone
            } : null,
            client: client ? {
              id: client.id,
              company_name: client.company_name,
              country: client.country
            } : null
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: kycWithUserDetails
      });
    } else {
      // Mock data for when Supabase is not available
      const mockKYC = [
        {
          id: 'kyc_001',
          user_id: 'user_001',
          status: 'pending',
          document_type: 'passport',
          document_url: '/uploads/passport_001.pdf',
          verification_data: { verified: false, notes: 'Documento in revisione' },
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          user: {
            id: 'user_001',
            email: 'user@example.com',
            first_name: 'Test',
            last_name: 'User',
            phone: '+39 098 765 4321'
          },
          client: {
            id: 'client_001',
            company_name: 'Test User',
            country: 'Italy'
          }
        },
        {
          id: 'kyc_002',
          user_id: 'user_002',
          status: 'approved',
          document_type: 'id_card',
          document_url: '/uploads/id_card_002.pdf',
          verification_data: { verified: true, notes: 'Documento approvato' },
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
          user: {
            id: 'user_002',
            email: 'client@example.com',
            first_name: 'Client',
            last_name: 'Example',
            phone: '+39 555 123 4567'
          },
          client: {
            id: 'client_002',
            company_name: 'Client Example',
            country: 'Italy'
          }
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockKYC
      });
    }

  } catch (error) {
    console.error('Error fetching KYC records:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { kyc_id, status, notes } = body;

    if (!kyc_id || !status) {
      return NextResponse.json(
        { error: 'KYC ID and status are required' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      
      // Update KYC status
      await db.updateKYCStatus(kyc_id, status);
      
      // Get updated KYC record
      const updatedKYC = await db.getKYCRecordById(kyc_id);
      
      if (!updatedKYC) {
        return NextResponse.json(
          { error: 'KYC record not found' },
          { status: 404 }
        );
      }
      
      // Send notification to user
      const { notificationService } = await import('@/lib/notification-service');
      await notificationService.notifyKYCStatusUpdate(updatedKYC.user_id, status);

      return NextResponse.json({
        success: true,
        message: 'KYC status updated successfully',
        data: updatedKYC
      });
    } else {
      // Mock update
      return NextResponse.json({
        success: true,
        message: 'KYC status updated successfully (mock)',
        data: {
          id: kyc_id,
          status: status,
          updated_at: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 