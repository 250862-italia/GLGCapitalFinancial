import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase
      .from('analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, change_percentage, period, category, status, description } = body;

    // Validation
    if (!metric || !value || !period || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('analytics')
      .insert({
        metric,
        value,
        change_percentage: change_percentage || 0,
        period,
        category,
        status: status || 'active',
        description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating analytics:', error);
      return NextResponse.json({ error: 'Failed to create analytics' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in analytics POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, metric, value, change_percentage, period, category, status, description } = body;

    if (!id) {
      return NextResponse.json({ error: 'Analytics ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (metric) updateData.metric = metric;
    if (value !== undefined) updateData.value = value;
    if (change_percentage !== undefined) updateData.change_percentage = change_percentage;
    if (period) updateData.period = period;
    if (category) updateData.category = category;
    if (status) updateData.status = status;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabase
      .from('analytics')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating analytics:', error);
      return NextResponse.json({ error: 'Failed to update analytics' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Analytics ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('analytics')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting analytics:', error);
      return NextResponse.json({ error: 'Failed to delete analytics' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Analytics deleted successfully' });
  } catch (error) {
    console.error('Error in analytics DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 