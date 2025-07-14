import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('partnership_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching partnership types:', error);
      return NextResponse.json({ error: 'Failed to fetch partnership types' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in partnership types GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, color, icon } = body;

    if (!name) {
      return NextResponse.json({ error: 'Partnership type name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('partnership_types')
      .insert({ name, description, color, icon })
      .select()
      .single();

    if (error) {
      console.error('Error creating partnership type:', error);
      return NextResponse.json({ error: 'Failed to create partnership type' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in partnership types POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 