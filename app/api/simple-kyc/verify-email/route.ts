import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';
import { isEmailVerificationExpired } from '@/lib/simple-kyc';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, code } = body;

    if (!user_id || !code) {
      return NextResponse.json(
        { error: 'User ID and verification code are required' },
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

      // Check if verification code is expired
      if (kycRecord.email_verification_expires && isEmailVerificationExpired(kycRecord.email_verification_expires)) {
        return NextResponse.json(
          { error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Verify the code
      if (kycRecord.email_verification_code !== code.toUpperCase()) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Mark email as verified
      await db.verifySimpleKYCEmail(kycRecord.id);

      // Send notification to admin
      try {
        await fetch('/api/admin/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'kyc_email_verified',
            title: 'KYC Email Verified',
            message: `User ${kycRecord.first_name} ${kycRecord.last_name} (${kycRecord.email}) has verified their email. KYC ready for review.`,
            user_id: user_id
          })
        });
      } catch (notificationError) {
        console.error('Failed to send admin notification:', notificationError);
      }

      return NextResponse.json({
        success: true,
        message: 'Email verified successfully. Your KYC is now pending admin review.',
        data: {
          id: kycRecord.id,
          status: 'email_verified',
          email_verified: true
        }
      });
    } else {
      // Mock response for non-local database
      return NextResponse.json({
        success: true,
        message: 'Email verified successfully (mock)',
        data: {
          id: 'mock_kyc_' + Date.now(),
          status: 'email_verified',
          email_verified: true
        }
      });
    }

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 