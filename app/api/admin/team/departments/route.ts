import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('team_departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in departments GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, manager_id, color } = body;

    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('team_departments')
      .insert({ name, description, manager_id, color })
      .select()
      .single();

    if (error) {
      console.error('Error creating department:', error);
      return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in departments POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 