import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Analytics not implemented in Supabase yet
  return NextResponse.json({
    error: 'Analytics not implemented in Supabase yet.'
  }, { status: 501 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metric, value, change_percentage, period, category, status, description } = body;

    // Validation
    if (!metric || !value || !period || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // For now, just return success since we don't have analytics table in local database
    const newAnalytics = {
      id: `analytics_${Date.now()}`,
      metric,
      value,
      change_percentage: change_percentage || 0,
      period,
      category,
      status: status || 'active',
      description,
      created_at: new Date().toISOString()
    };
    
    return NextResponse.json(newAnalytics, { status: 201 });
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

    // For now, just return success since we don't have analytics table in local database
    const updatedAnalytics = {
      id,
      metric: metric || 'Updated Metric',
      value: value || 0,
      change_percentage: change_percentage || 0,
      period: period || 'monthly',
      category: category || 'financial',
      status: status || 'active',
      description: description || 'Updated description',
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(updatedAnalytics);
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
    
    // For now, just return success since we don't have analytics table in local database
    return NextResponse.json({ success: true, message: 'Analytics deleted successfully' });
  } catch (error) {
    console.error('Error in analytics DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 