import { NextRequest, NextResponse } from 'next/server';
import { getLocalDatabase } from '@/lib/local-database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

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
      
      // Check if user exists
      const user = await db.getUserById(user_id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get investments for user
      const investments = await db.getInvestmentsByUserId(user_id);
      
      return NextResponse.json({
        success: true,
        data: investments
      });
    } else {
      // Mock data for when Supabase is not available
      const mockInvestments = [
        {
          id: 'inv_001',
          user_id: user_id,
          amount: 50000,
          currency: 'EUR',
          status: 'pending',
          investment_type: 'equity',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      return NextResponse.json({
        success: true,
        data: mockInvestments
      });
    }

  } catch (error) {
    console.error('Error fetching user investments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, amount, currency, investment_type } = body;

    if (!user_id || !amount || !currency || !investment_type) {
      return NextResponse.json(
        { error: 'User ID, amount, currency, and investment type are required' },
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

      // Create investment
      const investment = await db.createInvestment({
        user_id,
        amount,
        currency,
        status: 'pending',
        investment_type
      });

      return NextResponse.json({
        success: true,
        message: 'Investment created successfully',
        data: {
          id: investment.id,
          amount: investment.amount,
          currency: investment.currency,
          status: investment.status,
          investment_type: investment.investment_type,
          created_at: investment.created_at
        }
      });
    } else {
      // Mock investment creation
      const mockInvestmentId = 'mock_inv_' + Date.now();
      
      return NextResponse.json({
        success: true,
        message: 'Investment created successfully (mock)',
        data: {
          id: mockInvestmentId,
          amount: amount,
          currency: currency,
          status: 'pending',
          investment_type: investment_type,
          created_at: new Date().toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: aggiorna investimento
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabase.from('investments').update(fields).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Se lo stato è stato aggiornato, invia email al cliente
  if (fields.status === 'active' || fields.status === 'cancelled') {
    // Recupera dati cliente e pacchetto
    const { data: inv, error: errInv } = await supabase
      .from('investments')
      .select('*, client:client_id (first_name, last_name, email), package:package_id (name)')
      .eq('id', id)
      .single();
    if (!errInv && inv && inv.client && inv.package) {
      const userData = {
        first_name: inv.client.first_name?.split(' ')[0] || '',
        last_name: inv.client.last_name?.split(' ').join(' ') || '',
        email: inv.client.email,
        id: inv.client_id
      };
      const packageData = {
        name: inv.package.name
      };
      if (fields.status === 'active') {
        await emailNotificationService.sendEmail({
          to: userData.email,
          template: 'investment_confirmation',
          data: {
            name: userData.first_name,
            packageName: packageData.name,
            amount: inv.amount,
            transactionId: inv.id,
            date: new Date().toLocaleDateString(),
            portfolioUrl: 'https://glg-capital-financial.vercel.app/investments'
          }
        });
      } else if (fields.status === 'cancelled') {
        await emailNotificationService.sendEmail({
          to: userData.email,
          template: 'investment_rejected',
          data: {
            name: userData.first_name,
            packageName: packageData.name
          }
        });
      }
    }
  }

  return NextResponse.json(data);
}

// DELETE: elimina investimento
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase.from('investments').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
} 