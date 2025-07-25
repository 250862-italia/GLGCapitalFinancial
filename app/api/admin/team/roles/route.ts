import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_roles')
      .select('*')
      .order('level');

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in roles GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, permissions, level } = body;

    if (!name) {
      return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('team_roles')
      .insert({ name, description, permissions, level })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in roles POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 