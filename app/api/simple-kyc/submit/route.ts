import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';
import { validateSimpleKYC, generateEmailVerificationCode, getEmailVerificationExpiry } from '@/lib/simple-kyc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ...kycData } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate KYC data
    const validation = validateSimpleKYC(kycData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Invalid KYC data', details: validation.errors },
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
      const existingKYC = await db.getSimpleKYCByUserId(user_id);
      if (existingKYC) {
        return NextResponse.json(
          { error: 'KYC record already exists for this user' },
          { status: 409 }
        );
      }

      // Generate email verification code
      const verificationCode = generateEmailVerificationCode();
      const verificationExpiry = getEmailVerificationExpiry();

      // Create KYC record
      const kycRecord = await db.createSimpleKYC({
        user_id,
        ...kycData,
        status: 'pending',
        email_verified: false,
        email_verification_code: verificationCode,
        email_verification_expires: verificationExpiry,
        submitted_at: new Date().toISOString()
      });

      // Send verification email
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: kycData.email,
            subject: 'Verifica Email - GLG Capital Group',
            template: 'kyc-verification',
            data: {
              firstName: kycData.first_name,
              verificationCode,
              expiryHours: 24
            }
          })
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send verification email, but KYC record was created');
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue even if email fails - user can request resend
      }

      return NextResponse.json({
        success: true,
        message: 'KYC submitted successfully. Please check your email for verification code.',
        data: {
          id: kycRecord.id,
          status: kycRecord.status,
          email_verified: kycRecord.email_verified,
          created_at: kycRecord.submitted_at
        }
      });
    } else {
      // Mock response for non-local database
      return NextResponse.json({
        success: true,
        message: 'KYC submitted successfully (mock)',
        data: {
          id: 'mock_kyc_' + Date.now(),
          status: 'pending',
          email_verified: false,
          created_at: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Simple KYC submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 