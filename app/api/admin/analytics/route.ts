import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock data fallback
const mockAnalytics = [
  {
    id: '1',
    metric: 'Total Revenue',
    value: 1250000,
    change_percentage: 12.5,
    period: 'monthly',
    category: 'financial',
    status: 'active',
    description: 'Monthly revenue tracking',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    metric: 'Active Users',
    value: 1250,
    change_percentage: 8.3,
    period: 'weekly',
    category: 'user',
    status: 'active',
    description: 'Weekly active user count',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    metric: 'Investment Packages',
    value: 45,
    change_percentage: 15.2,
    period: 'monthly',
    category: 'product',
    status: 'active',
    description: 'Available investment packages',
    created_at: new Date().toISOString()
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Try to connect to Supabase
    try {
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
        console.error('Supabase error, using mock data:', error);
        // Filter mock data based on parameters
        let filteredData = mockAnalytics;
        if (category && category !== 'all') {
          filteredData = filteredData.filter(item => item.category === category);
        }
        if (status && status !== 'all') {
          filteredData = filteredData.filter(item => item.status === status);
        }
        return NextResponse.json(filteredData);
      }

      return NextResponse.json(data || []);
    } catch (supabaseError) {
      console.error('Supabase connection failed, using mock data:', supabaseError);
      // Filter mock data based on parameters
      let filteredData = mockAnalytics;
      if (category && category !== 'all') {
        filteredData = filteredData.filter(item => item.category === category);
      }
      if (status && status !== 'all') {
        filteredData = filteredData.filter(item => item.status === status);
      }
      return NextResponse.json(filteredData);
    }
  } catch (error) {
    console.error('Error in analytics GET:', error);
    return NextResponse.json(mockAnalytics);
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

    // Try to connect to Supabase
    try {
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
        console.error('Supabase error in POST:', error);
        return NextResponse.json({ 
          error: 'Database connection failed, but data was validated',
          mockData: { metric, value, change_percentage, period, category, status, description }
        }, { status: 503 });
      }

      return NextResponse.json(data, { status: 201 });
    } catch (supabaseError) {
      console.error('Supabase connection failed in POST:', supabaseError);
      return NextResponse.json({ 
        error: 'Database connection failed, but data was validated',
        mockData: { metric, value, change_percentage, period, category, status, description }
      }, { status: 503 });
    }
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

    // Try to connect to Supabase
    try {
      const { data, error } = await supabase
        .from('analytics')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error in PUT:', error);
        return NextResponse.json({ 
          error: 'Database connection failed, but update was validated',
          mockData: { id, ...updateData }
        }, { status: 503 });
      }

      return NextResponse.json(data);
    } catch (supabaseError) {
      console.error('Supabase connection failed in PUT:', supabaseError);
      return NextResponse.json({ 
        error: 'Database connection failed, but update was validated',
        mockData: { id, ...updateData }
      }, { status: 503 });
    }
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

    // Try to connect to Supabase
    try {
      const { error } = await supabase
        .from('analytics')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Supabase error in DELETE:', error);
        return NextResponse.json({ 
          error: 'Database connection failed, but delete was validated',
          mockData: { deletedId: id }
        }, { status: 503 });
      }

      return NextResponse.json({ message: 'Analytics deleted successfully' });
    } catch (supabaseError) {
      console.error('Supabase connection failed in DELETE:', supabaseError);
      return NextResponse.json({ 
        error: 'Database connection failed, but delete was validated',
        mockData: { deletedId: id }
      }, { status: 503 });
    }
  } catch (error) {
    console.error('Error in analytics DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 