import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Banking details for wire transfers
const BANK_DETAILS = {
  beneficiary: 'GLG capital group LLC',
  beneficiaryAddress: '1309 Coffeen Ave, Ste H, Sheridan, WY, 82801-5714, United States',
  accountNumber: '218086576410',
  routingNumber: 'REVOUS31',
  swiftBic: 'REVOUS31',
  intermediaryBank: 'CHASDEFX',
  bankName: 'Lead Bank',
  bankAddress: '1801 Main Street, Kansas City, MO, 64108, United States'
};

async function sendInvestmentNotificationEmails(
  userEmail: string, 
  userName: string, 
  packageName: string, 
  amount: number, 
  investmentId: string
) {
  try {
    const emailConfig = {
      service: process.env.EMAIL_SERVICE || 'resend',
      apiKey: process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY,
      fromEmail: process.env.EMAIL_FROM || 'noreply@glgcapitalgroupllc.com'
    };

    // Email to support team
    const supportEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h2 style="margin: 0;">New Investment Request</h2>
        </div>
        
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
          <h3>Investment Details:</h3>
          <ul>
            <li><strong>Client:</strong> ${userName} (${userEmail})</li>
            <li><strong>Package:</strong> ${packageName}</li>
            <li><strong>Amount:</strong> $${amount.toLocaleString()}</li>
            <li><strong>Investment ID:</strong> ${investmentId}</li>
            <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p>Please process this investment request and send banking details to the client.</p>
        </div>
      </div>
    `;

    // Email to client with banking details
    const clientEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Investment Request Confirmed</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your investment request has been received</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Hello ${userName},</h2>
          
          <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
            Thank you for your investment request for the <strong>${packageName}</strong> package. 
            Your request has been received and is being processed.
          </p>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">Investment Details:</h3>
            <ul style="color: #166534; line-height: 1.6;">
              <li><strong>Package:</strong> ${packageName}</li>
              <li><strong>Investment Amount:</strong> $${amount.toLocaleString()}</li>
              <li><strong>Investment ID:</strong> ${investmentId}</li>
              <li><strong>Status:</strong> Pending Payment</li>
            </ul>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">Banking Details for Wire Transfer:</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 14px;">
              <p><strong>Beneficiary:</strong> ${BANK_DETAILS.beneficiary}</p>
              <p><strong>Account Number:</strong> ${BANK_DETAILS.accountNumber}</p>
              <p><strong>Routing Number:</strong> ${BANK_DETAILS.routingNumber}</p>
              <p><strong>SWIFT/BIC:</strong> ${BANK_DETAILS.swiftBic}</p>
              <p><strong>Bank:</strong> ${BANK_DETAILS.bankName}</p>
              <p><strong>Reference:</strong> Investment ${packageName} - ${userEmail}</p>
            </div>
          </div>
          
          <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
            <ol style="color: #1e40af; line-height: 1.6;">
              <li>Complete the wire transfer using the banking details above</li>
              <li>Include the reference number in your transfer description</li>
              <li>Send the wire transfer receipt to our support team</li>
              <li>Your investment will be activated within 24-48 hours after payment confirmation</li>
            </ol>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact our support team at 
            <a href="mailto:corefound@glgcapitalgroupllc.com" style="color: #3b82f6;">corefound@glgcapitalgroupllc.com</a>
          </p>
        </div>
      </div>
    `;

    // Send to support team
    if (emailConfig.apiKey) {
      if (emailConfig.service === 'resend') {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailConfig.fromEmail,
            to: ['corefound@glgcapitalgroupllc.com'],
            subject: `Investment Request - ${packageName} Package - ${userName}`,
            html: supportEmailHtml,
          }),
        });
      } else if (emailConfig.service === 'sendgrid') {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: 'corefound@glgcapitalgroupllc.com' }] }],
            from: { email: emailConfig.fromEmail },
            subject: `Investment Request - ${packageName} Package - ${userName}`,
            content: [{ type: 'text/html', value: supportEmailHtml }],
          }),
        });
      }
    }

    // Send to client
    if (emailConfig.apiKey) {
      if (emailConfig.service === 'resend') {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: emailConfig.fromEmail,
            to: [userEmail],
            subject: `Investment Request Confirmation - ${packageName} Package`,
            html: clientEmailHtml,
          }),
        });
      } else if (emailConfig.service === 'sendgrid') {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${emailConfig.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: userEmail }] }],
            from: { email: emailConfig.fromEmail },
            subject: `Investment Request Confirmation - ${packageName} Package`,
            content: [{ type: 'text/html', value: clientEmailHtml }],
          }),
        });
      }
    }

    console.log('Investment notification emails sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending investment notification emails:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, packageId, amount, packageName } = body;

    if (!userId || !packageId || !amount) {
      return NextResponse.json(
        { error: 'User ID, package ID, and amount are required' },
        { status: 400 }
      );
    }

    console.log('Processing investment request:', { userId, packageId, amount, packageName });

    // Get user details
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get client profile
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (clientError) {
      console.error('Error fetching client profile:', clientError);
      return NextResponse.json(
        { error: 'Client profile not found' },
        { status: 404 }
      );
    }

    // Create investment record
    const { data: investment, error: investmentError } = await supabase
      .from('investments')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: parseFloat(amount),
        status: 'pending_payment',
        start_date: new Date().toISOString().split('T')[0],
        payment_method: 'wire_transfer',
        notes: `Investment request for ${packageName} package`
      })
      .select()
      .single();

    if (investmentError) {
      console.error('Error creating investment:', investmentError);
      return NextResponse.json(
        { error: 'Failed to create investment record' },
        { status: 500 }
      );
    }

    console.log('Investment record created:', investment);

    // Send notification emails
    await sendInvestmentNotificationEmails(
      user.user.email!,
      client.first_name + ' ' + client.last_name,
      packageName,
      parseFloat(amount),
      investment.id
    );

    // Create notification record
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'investment_request',
        title: 'Investment Request Submitted',
        message: `Your investment request for ${packageName} package has been submitted successfully.`,
        status: 'sent',
        metadata: {
          investment_id: investment.id,
          package_name: packageName,
          amount: amount
        }
      });

    return NextResponse.json({
      success: true,
      investment,
      message: 'Investment request submitted successfully! Check your email for banking details.'
    });

  } catch (error) {
    console.error('Investment processing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data: investments, error } = await supabase
      .from('investments')
      .select(`
        *,
        package:packages(name, description, duration, expected_return, min_investment)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching investments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch investments' },
        { status: 500 }
      );
    }

    return NextResponse.json(investments || []);
  } catch (error) {
    console.error('Error in investments GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 