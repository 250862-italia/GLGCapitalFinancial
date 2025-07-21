import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Admin create investment API called');
    
    // Verify admin authentication
    const authResult = await verifyAdmin(request);
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body = await request.json();
    const { 
      client_id, 
      package_id, 
      amount, 
      currency = 'EUR',
      start_date,
      end_date,
      status = 'active',
      total_returns = 0,
      daily_returns = 0,
      payment_method = 'bank',
      notes = ''
    } = body;

    if (!client_id || !package_id || !amount) {
      return NextResponse.json(
        { error: 'Client ID, package ID, and amount are required' },
        { status: 400 }
      );
    }

    console.log('Creating investment for client:', client_id, 'package:', package_id, 'amount:', amount);

    // Verify client exists
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('user_id', client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify package exists
    const { data: packageData, error: packageError } = await supabaseAdmin
      .from('packages')
      .select('*')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      );
    }

    // Create investment record
    const { data: investment, error: investmentError } = await supabaseAdmin
      .from('investments')
      .insert({
        user_id: client_id, // Use client_id as user_id
        package_id: package_id,
        amount: parseFloat(amount),
        currency: currency,
        start_date: start_date || new Date().toISOString(),
        end_date: end_date || null,
        status: status,
        total_returns: parseFloat(total_returns),
        daily_returns: parseFloat(daily_returns),
        payment_method: payment_method,
        notes: notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (investmentError) {
      console.error('Error creating investment:', investmentError);
      return NextResponse.json(
        { error: 'Failed to create investment' },
        { status: 500 }
      );
    }

    console.log('✅ Investment created successfully:', investment.id);

    return NextResponse.json({
      success: true,
      data: investment,
      message: 'Investment created successfully'
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 