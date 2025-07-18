import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { emailService } from '@/lib/email-service';



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
    return await emailService.sendInvestmentNotification(
      userEmail, 
      userName, 
      packageName, 
      amount, 
      investmentId
    );
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
    const { data: user, error: userError } = await supabaseAdmin!.auth.admin.getUserById(userId);
    if (userError || !user.user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get client profile
    const { data: client, error: clientError } = await supabaseAdmin
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
    const { data: investment, error: investmentError } = await supabaseAdmin
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
    await supabaseAdmin
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

    const { data: investments, error } = await supabaseAdmin
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