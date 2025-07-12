import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export async function GET(request: NextRequest) {
  try {
    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      const investments = await db.getAllInvestments();
      
      // Get user and client details for each investment
      const investmentsWithDetails = await Promise.all(
        investments.map(async (investment) => {
          const user = await db.getUserById(investment.user_id);
          const client = await db.getClientByUserId(investment.user_id);
          
          return {
            id: investment.id,
            user_id: investment.user_id,
            amount: investment.amount,
            currency: investment.currency,
            status: investment.status,
            investment_type: investment.investment_type,
            created_at: investment.created_at,
            updated_at: investment.updated_at,
            user: user ? {
              id: user.id,
              email: user.email,
              first_name: user.first_name,
              last_name: user.last_name,
              phone: user.phone
            } : null,
            client: client ? {
              id: client.id,
              company_name: client.company_name,
              country: client.country
            } : null
          };
        })
      );
      
      return NextResponse.json({
        success: true,
        data: investmentsWithDetails
      });
    } else {
      // Mock data for when Supabase is not available
      const mockInvestments = [
        {
          id: 'inv_001',
          user_id: 'user_001',
          amount: 50000,
          currency: 'EUR',
          status: 'pending',
          investment_type: 'equity',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          user: {
            id: 'user_001',
            email: 'user@example.com',
            first_name: 'Test',
            last_name: 'User',
            phone: '+39 098 765 4321'
          },
          client: {
            id: 'client_001',
            company_name: 'Test User',
            country: 'Italy'
          }
        },
        {
          id: 'inv_002',
          user_id: 'user_002',
          amount: 100000,
          currency: 'EUR',
          status: 'approved',
          investment_type: 'bonds',
          created_at: '2024-01-03T00:00:00Z',
          updated_at: '2024-01-03T00:00:00Z',
          user: {
            id: 'user_002',
            email: 'client@example.com',
            first_name: 'Client',
            last_name: 'Example',
            phone: '+39 555 123 4567'
          },
          client: {
            id: 'client_002',
            company_name: 'Client Example',
            country: 'Italy'
          }
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockInvestments
      });
    }

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

    // Check if using local database
    const useLocalDatabase = process.env.USE_LOCAL_DATABASE === 'true';

    if (useLocalDatabase) {
      // Use local database
      const db = await getLocalDatabase();
      
      // Update investment status
      await db.updateInvestmentStatus(investment_id, status);
      
      // Get updated investment
      const updatedInvestment = await db.getInvestmentById(investment_id);
      
      // Send notification to user
      const { notificationService } = await import('@/lib/notification-service');
      await notificationService.notifyInvestmentStatusUpdate(
        updatedInvestment.user_id, 
        investment_id, 
        status, 
        updatedInvestment.amount, 
        updatedInvestment.currency
      );
      
      if (!updatedInvestment) {
        return NextResponse.json(
          { error: 'Investment not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Investment status updated successfully',
        data: updatedInvestment
      });
    } else {
      // Mock update
      return NextResponse.json({
        success: true,
        message: 'Investment status updated successfully (mock)',
        data: {
          id: investment_id,
          status: status,
          updated_at: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error updating investment status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 