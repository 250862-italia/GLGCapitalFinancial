import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';



export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
      return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in tags GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Tag name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('content_tags')
      .insert({ name })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in tags POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 