import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export async function GET(
  request: NextRequest,
  { params }: { params: { user_id: string } }
) {
  try {
    const { user_id } = params;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      
      // Check if user exists
      const user = await db.getUserById(user_id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get KYC record for user
      const kycRecord = await db.getKYCRecordByUserId(user_id);
      
      if (!kycRecord) {
        return NextResponse.json({
          success: true,
          data: {
            status: 'not_submitted',
            message: 'KYC not submitted yet'
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          id: kycRecord.id,
          status: kycRecord.status,
          document_type: kycRecord.document_type,
          created_at: kycRecord.created_at,
          updated_at: kycRecord.updated_at,
          verification_data: kycRecord.verification_data ? JSON.parse(kycRecord.verification_data) : null
        }
      });
    } else {
      // Mock KYC status
      return NextResponse.json({
        success: true,
        data: {
          id: 'mock_kyc_001',
          status: 'pending',
          document_type: 'id_document',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          verification_data: {
            personal_info: {
              firstName: 'Test',
              lastName: 'User'
            }
          }
        }
      });
    }

  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 