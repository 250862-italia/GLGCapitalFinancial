import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createAuditTrailService } from '@/lib/audit-trail';

const supabase = supabaseAdmin;

export async function POST(request: NextRequest) {
  const auditTrail = createAuditTrailService(supabase);
  
  try {
    const body = await request.json();
    const { kycId, action, message, adminEmail } = body;

    if (!kycId || !action || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get KYC record with client info
    const { data: kycRecord, error: kycError } = await supabase
      .from('kyc_records')
      .select(`
        *,
        clients (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', kycId)
      .single();

    if (kycError || !kycRecord) {
      return NextResponse.json(
        { error: 'KYC record not found' },
        { status: 404 }
      );
    }

    const client = kycRecord.clients;
    if (!client?.email) {
      return NextResponse.json(
        { error: 'Client email not found' },
        { status: 400 }
      );
    }

    // Prepare email content based on action
    let subject = '';
    let emailContent = '';

    switch (action) {
      case 'approved':
        subject = 'KYC Verification Approved - GLG Capital Group';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">KYC Verification Approved</h1>
            </div>
            <div style="padding: 2rem; background: white;">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              <p>We are pleased to inform you that your KYC (Know Your Customer) verification has been <strong>approved</strong>.</p>
              <p>Your account is now fully verified and you can proceed with your investment activities.</p>
              ${message ? `<p><strong>Additional Notes:</strong> ${message}</p>` : ''}
              <div style="background: #f0f9ff; padding: 1rem; border-radius: 8; margin: 1rem 0;">
                <h3 style="margin: 0 0 0.5rem 0; color: #1e40af;">Next Steps:</h3>
                <ul style="margin: 0; padding-left: 1.5rem;">
                  <li>Access your dashboard to view available investment opportunities</li>
                  <li>Complete your investment profile</li>
                  <li>Start investing in our carefully selected portfolios</li>
                </ul>
              </div>
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              <p>Best regards,<br>GLG Capital Group Team</p>
            </div>
          </div>
        `;
        break;

      case 'rejected':
        subject = 'KYC Verification Update - GLG Capital Group';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; padding: 2rem; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">KYC Verification Update</h1>
            </div>
            <div style="padding: 2rem; background: white;">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              <p>We regret to inform you that your KYC (Know Your Customer) verification has been <strong>rejected</strong>.</p>
              ${message ? `<p><strong>Reason:</strong> ${message}</p>` : '<p>Please review your submitted documents and ensure they meet our requirements.</p>'}
              <div style="background: #fef2f2; padding: 1rem; border-radius: 8; margin: 1rem 0;">
                <h3 style="margin: 0 0 0.5rem 0; color: #dc2626;">Required Actions:</h3>
                <ul style="margin: 0; padding-left: 1.5rem;">
                  <li>Review the rejection reason provided above</li>
                  <li>Update your KYC information if necessary</li>
                  <li>Resubmit your verification request</li>
                  <li>Contact support if you need assistance</li>
                </ul>
              </div>
              <p>You can resubmit your KYC verification through your dashboard.</p>
              <p>If you have any questions, please contact our support team.</p>
              <p>Best regards,<br>GLG Capital Group Team</p>
            </div>
          </div>
        `;
        break;

      case 'pending_review':
        subject = 'KYC Verification Under Review - GLG Capital Group';
        emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f59e0b; padding: 2rem; color: white; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">KYC Verification Under Review</h1>
            </div>
            <div style="padding: 2rem; background: white;">
              <p>Dear ${client.first_name} ${client.last_name},</p>
              <p>We have received your KYC (Know Your Customer) verification request and it is currently <strong>under review</strong>.</p>
              <p>Our compliance team is carefully reviewing your submitted documents and information.</p>
              <div style="background: #fffbeb; padding: 1rem; border-radius: 8; margin: 1rem 0;">
                <h3 style="margin: 0 0 0.5rem 0; color: #b45309;">What happens next:</h3>
                <ul style="margin: 0; padding-left: 1.5rem;">
                  <li>Our team will review your submitted documents</li>
                  <li>We may contact you if additional information is needed</li>
                  <li>You will receive a notification once the review is complete</li>
                  <li>Typical review time: 1-3 business days</li>
                </ul>
              </div>
              <p>You will receive another email once the review is complete.</p>
              <p>Thank you for your patience.</p>
              <p>Best regards,<br>GLG Capital Group Team</p>
            </div>
          </div>
        `;
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Send email using the existing email service
    const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: client.email,
        subject: subject,
        html: emailContent,
        from: adminEmail
      })
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.json();
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    // Get current KYC record status for audit trail
    const { data: currentKYC } = await supabase
      .from('kyc_records')
      .select('status')
      .eq('id', kycId)
      .single();

    const oldStatus = currentKYC?.status || 'unknown';

    // Update KYC record with notification sent
    const { error: updateError } = await supabase
      .from('kyc_records')
      .update({ 
        status: action === 'pending_review' ? 'pending' : action,
        verified_at: action !== 'pending_review' ? new Date().toISOString() : null
      })
      .eq('id', kycId);

    if (updateError) {
      console.error('Failed to update KYC record:', updateError);
    } else {
      // Log KYC status change
      await auditTrail.logKYCStatusChange(
        adminEmail,
        kycId,
        oldStatus,
        action === 'pending_review' ? 'pending' : action,
        message,
        client.email
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email notification sent successfully',
      action: action,
      clientEmail: client.email
    });

  } catch (error) {
    console.error('KYC notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kycId = searchParams.get('kycId');

    if (!kycId) {
      return NextResponse.json(
        { error: 'Missing kycId parameter' },
        { status: 400 }
      );
    }

    // Get KYC record with client info
    const { data: kycRecord, error: kycError } = await supabase
      .from('kyc_records')
      .select(`
        *,
        clients (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', kycId)
      .single();

    if (kycError || !kycRecord) {
      return NextResponse.json(
        { error: 'KYC record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      kycRecord,
      client: kycRecord.clients
    });

  } catch (error) {
    console.error('KYC notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 