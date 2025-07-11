import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/database-manager';

export const dynamic = 'force-dynamic';

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

    const data = await dbManager.get('analytics', {
      orderBy: { field: 'created_at', ascending: false },
      filters: [
        ...(category && category !== 'all' ? [{ field: 'category', value: category }] : []),
        ...(status && status !== 'all' ? [{ field: 'status', value: status }] : [])
      ]
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in analytics GET:', error);
    return NextResponse.json([]);
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

    const result = await dbManager.post('analytics', {
      metric,
      value,
      change_percentage: change_percentage || 0,
      period,
      category,
      status: status || 'active',
      description
    });
    
    if (result.error) {
      return NextResponse.json(result, { status: 503 });
    }
    
    return NextResponse.json(result, { status: 201 });
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
    
    const result = await dbManager.put('analytics', id, updateData);
    
    if (result.error) {
      return NextResponse.json(result, { status: 503 });
    }
    
    return NextResponse.json(result);
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
    
    const result = await dbManager.delete('analytics', id);
    
    if (result.error) {
      return NextResponse.json(result, { status: 503 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in analytics DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 