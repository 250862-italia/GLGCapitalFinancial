import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('partnership_statuses')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching partnership statuses:', error);
      return NextResponse.json({ error: 'Failed to fetch partnership statuses' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in partnership statuses GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json({ error: 'Partnership status name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('partnership_statuses')
      .insert({ name, description, color, icon })
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership status:', error);
      return NextResponse.json({ error: 'Failed to create partnership status' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in partnership statuses POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 