import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';
import { generateEmailVerificationCode, getEmailVerificationExpiry } from '@/lib/simple-kyc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

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
      
      // Get KYC record
      const kycRecord = await db.getSimpleKYCByUserId(user_id);
      if (!kycRecord) {
        return NextResponse.json(
          { error: 'KYC record not found' },
          { status: 404 }
        );
      }

      // Check if email is already verified
      if (kycRecord.email_verified) {
        return NextResponse.json(
          { error: 'Email already verified' },
          { status: 400 }
        );
      }

      // Generate new verification code
      const newVerificationCode = generateEmailVerificationCode();
      const newVerificationExpiry = getEmailVerificationExpiry();

      // Update verification code
      await db.updateSimpleKYCVerificationCode(kycRecord.id, newVerificationCode, newVerificationExpiry);

      // Send new verification email
      try {
        const emailResponse = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: kycRecord.email,
            subject: 'Nuovo Codice di Verifica - GLG Capital Group',
            template: 'kyc-verification',
            data: {
              firstName: kycRecord.first_name,
              verificationCode: newVerificationCode,
              expiryHours: 24
            }
          })
        });

        if (!emailResponse.ok) {
          console.warn('Failed to send verification email');
          return NextResponse.json(
            { error: 'Failed to send verification email' },
            { status: 500 }
          );
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json(
          { error: 'Failed to send verification email' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'New verification code sent successfully. Please check your email.',
        data: {
          id: kycRecord.id,
          email: kycRecord.email
        }
      });
    } else {
      // Mock response for non-local database
      return NextResponse.json({
        success: true,
        message: 'New verification code sent successfully (mock)',
        data: {
          id: 'mock_kyc_' + Date.now(),
          email: 'mock@example.com'
        }
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 