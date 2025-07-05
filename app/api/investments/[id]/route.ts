import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        users!inner(name, email),
        investment_packages!inner(name, type)
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching investment:', error);
      return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
    }

    // Transform data to match expected format
    const investmentDetail = {
      id: data.id,
      user: {
        id: data.user_id,
        name: data.users.name,
        email: data.users.email
      },
      type: data.investment_packages.type,
      amount: data.amount,
      status: data.status,
      createdAt: data.created_at,
      maturity: data.maturity_date || '2026-01-10', // Default if not set
      yield: data.expected_yield || 0.12, // Default if not set
      history: [
        // Mock history data for now
        { date: data.created_at, value: data.amount },
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), value: data.amount * 1.01 },
        { date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), value: data.amount * 1.02 },
        { date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), value: data.amount * 1.03 },
      ],
      notes: [
        { date: data.created_at, text: 'Investment created' },
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), text: 'Quarterly yield credited' },
      ]
    };

    return NextResponse.json(investmentDetail);
  } catch (error) {
    console.error('Error in GET /api/investments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 