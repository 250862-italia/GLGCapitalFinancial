import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { offlineDataManager } from '@/lib/offline-data';

export async function GET(request: NextRequest) {
  try {
    // Test Supabase connection first
    const connectionPromise = supabaseAdmin
      .from('investments')
      .select('count')
      .limit(1);
    
    const connectionTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );
    
    let connectionTest, connectionError;
    try {
      const result = await Promise.race([connectionPromise, connectionTimeout]) as any;
      connectionTest = result.data;
      connectionError = result.error;
    } catch (timeoutError) {
      connectionError = timeoutError;
    }

    if (connectionError) {
      console.log('Supabase connection failed, using offline data:', connectionError.message);
      
      // Use offline data
      const investments = offlineDataManager.getInvestments();
      const users = offlineDataManager.getUsers();
      const clients = offlineDataManager.getClients();
      
      // Combine offline data
      const investmentsWithDetails = investments.map(investment => {
        const user = users.find(u => u.id === investment.client_id);
        const client = clients.find(c => c.id === investment.client_id);
        
        return {
          id: investment.id,
          user_id: investment.client_id,
          amount: investment.amount,
          currency: investment.currency,
          status: investment.status,
          investment_type: 'package',
          created_at: investment.created_at,
          updated_at: investment.updated_at,
          user: user || null,
          client: client || null
        };
      });
      
      return NextResponse.json({
        success: true,
        data: investmentsWithDetails,
        warning: 'Database connection unavailable - using offline mode'
      });
    }

    // Fetch investments from Supabase
    const { data: investments, error } = await supabaseAdmin
      .from('investments')
      .select('*');

    if (error) {
      console.log('Supabase error, using offline data:', error.message);
      
      // Fallback to offline data
      const offlineInvestments = offlineDataManager.getInvestments();
      const users = offlineDataManager.getUsers();
      const clients = offlineDataManager.getClients();
      
      const investmentsWithDetails = offlineInvestments.map(investment => {
        const user = users.find(u => u.id === investment.client_id);
        const client = clients.find(c => c.id === investment.client_id);
        
        return {
          id: investment.id,
          user_id: investment.client_id,
          amount: investment.amount,
          currency: investment.currency,
          status: investment.status,
          investment_type: 'package',
          created_at: investment.created_at,
          updated_at: investment.updated_at,
          user: user || null,
          client: client || null
        };
      });
      
      return NextResponse.json({
        success: true,
        data: investmentsWithDetails,
        warning: 'Database error - using offline mode'
      });
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
    console.log('Using offline data due to exception');
    
    // Final fallback to offline data
    const investments = offlineDataManager.getInvestments();
    const users = offlineDataManager.getUsers();
    const clients = offlineDataManager.getClients();
    
    const investmentsWithDetails = investments.map(investment => {
      const user = users.find(u => u.id === investment.client_id);
      const client = clients.find(c => c.id === investment.client_id);
      
      return {
        id: investment.id,
        user_id: investment.client_id,
        amount: investment.amount,
        currency: investment.currency,
        status: investment.status,
        investment_type: 'package',
        created_at: investment.created_at,
        updated_at: investment.updated_at,
        user: user || null,
        client: client || null
      };
    });
    
    return NextResponse.json({
      success: true,
      data: investmentsWithDetails,
      warning: 'System error - using offline mode'
    });
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