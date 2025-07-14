import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Fetch investments from Supabase
    const { data: investments, error } = await supabaseAdmin
      .from('investments')
      .select('*');

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Get user and client details for each investment
    const investmentsWithDetails = await Promise.all(
      investments.map(async (investment) => {
        // Get user details
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, first_name, last_name, phone')
          .eq('id', investment.user_id)
          .single();

        // Get client details
        const { data: client } = await supabaseAdmin
          .from('clients')
          .select('id, first_name, last_name, country')
          .eq('user_id', investment.user_id)
          .single();

        return {
          id: investment.id,
          user_id: investment.user_id,
          amount: investment.amount,
          currency: investment.currency,
          status: investment.status,
          investment_type: investment.investment_type,
          created_at: investment.created_at,
          updated_at: investment.updated_at,
          user: user || null,
          client: client || null
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: investmentsWithDetails
    });

  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { investment_id, status, notes } = body;

    if (!investment_id || !status) {
      return NextResponse.json(
        { error: 'Investment ID and status are required' },
        { status: 400 }
      );
    }

    // Update investment status in Supabase
    const { data: updatedInvestment, error } = await supabaseAdmin
      .from('investments')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('id', investment_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!updatedInvestment) {
      return NextResponse.json(
        { error: 'Investment not found' },
        { status: 404 }
      );
    }

    // Send notification to user - simplified for now
    console.log(`Investment status updated for user ${updatedInvestment.user_id}: ${status}`);

    return NextResponse.json({
      success: true,
      message: 'Investment status updated successfully',
      data: updatedInvestment
    });

  } catch (error) {
    console.error('Error updating investment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 