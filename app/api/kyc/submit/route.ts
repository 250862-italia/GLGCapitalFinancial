import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, personal_info, documents, verification_data } = body;

    if (!user_id || !personal_info) {
      return NextResponse.json(
        { error: 'User ID and personal info are required' },
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

      // Check if KYC record already exists
      const existingKYC = await db.getKYCRecordByUserId(user_id);
      if (existingKYC) {
        return NextResponse.json(
          { error: 'KYC record already exists for this user' },
          { status: 409 }
        );
      }

      // Create KYC record
      const kycRecord = await db.createKYCRecord({
        user_id,
        status: 'pending',
        document_type: documents?.idDocument ? 'id_document' : 'personal_info',
        document_url: documents?.idDocument || null,
        verification_data: {
          personal_info,
          documents,
          verification_data,
          submitted_at: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: true,
        message: 'KYC submitted successfully',
        data: {
          id: kycRecord.id,
          status: kycRecord.status,
          created_at: kycRecord.created_at
        }
      });
    } else {
      // Mock KYC submission
      const mockKYCId = 'mock_kyc_' + Date.now();
      
      return NextResponse.json({
        success: true,
        message: 'KYC submitted successfully (mock)',
        data: {
          id: mockKYCId,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error submitting KYC:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Usa solo il database locale
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';
    if (useLocalDatabase) {
      const db = await getLocalDatabase();
      const user = await db.getUserById(userId);
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      const client = await db.getClientByUserId(userId);
      const kycRecord = await db.getKYCRecordByUserId(userId);
      
      // Ricostruisci la struttura attesa dal frontend
      const personalInfo = {
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        dateOfBirth: '', // Non disponibile nel database locale
        nationality: '', // Non disponibile nel database locale
        address: client?.address || '',
        city: client?.city || '',
        country: client?.country || '',
        phone: user.phone || '',
        email: user.email || '',
        codiceFiscale: client?.tax_id || ''
      };
      const financialProfile = {
        employmentStatus: '', // Non disponibile nel database locale
        annualIncome: '', // Non disponibile nel database locale
        sourceOfFunds: '', // Non disponibile nel database locale
        investmentExperience: '', // Non disponibile nel database locale
        riskTolerance: '', // Non disponibile nel database locale
        investmentGoals: [] // Non disponibile nel database locale
      };
      // Documenti (se presenti)
      const documents = {
        idDocument: kycRecord?.document_url || null,
        proofOfAddress: null,
        bankStatement: null
      };
      return NextResponse.json({
        personalInfo,
        financialProfile,
        documents
      });
    } else {
      // Mock response
      return NextResponse.json({
        personalInfo: {},
        financialProfile: {},
        documents: {}
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 